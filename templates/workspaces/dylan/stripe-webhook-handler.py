#!/usr/bin/env python3
"""
A.L.I.C.E. Stripe Webhook Handler
Runs on: Ubuntu Desktop (alpha@100.106.110.119)
Port: 5001 (FLASK_PORT)

Handles: checkout.session.completed
Actions:
  1. Validate Stripe webhook signature
  2. Generate license key (ALICE-XXXX-XXXX-XXXX)
  3. Write to Supabase licenses + teams + team_tokens tables
  4. Trigger n8n welcome email workflow

Usage:
  python3 stripe-webhook-handler.py

For local testing:
  python3 stripe-webhook-handler.py --test
"""

import os
import sys
import json
import re
import hmac
import hashlib
import logging
import argparse
from datetime import datetime, timezone
from typing import Optional

import stripe
import supabase
import requests
from flask import Flask, request, jsonify

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("stripe-webhook")


# ─── Config ───────────────────────────────────────────────────────────────────

def _require_env(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val


class Config:
    # Stripe
    STRIPE_SECRET_KEY: str = _require_env("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: str = _require_env("STRIPE_WEBHOOK_SECRET")

    # Supabase
    SUPABASE_URL: str = _require_env("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = _require_env("SUPABASE_SERVICE_ROLE_KEY")

    # n8n welcome email trigger
    N8N_WEBHOOK_URL: str = _require_env(
        "N8N_WEBHOOK_URL"
    )  # e.g. http://100.106.110.119:5678/webhook/stripe-checkout-completed

    # Flask
    FLASK_PORT: int = int(os.environ.get("FLASK_PORT", "5001"))
    FLASK_HOST: str = os.environ.get("FLASK_HOST", "0.0.0.0")


# ─── App ──────────────────────────────────────────────────────────────────────

app = Flask(__name__)


# ─── License Key Generation ───────────────────────────────────────────────────

def generate_license_key() -> str:
    """Generate an A.L.I.C.E. license key: ALICE-XXXX-XXXX-XXXX"""
    import secrets
    chunks = [secrets.token_hex(2).upper() for _ in range(3)]
    return "ALICE-" + "-".join(chunks)


# ─── Supabase Helpers ─────────────────────────────────────────────────────────

def get_supabase_client():
    return supabase.create_client(
        Config.SUPABASE_URL,
        Config.SUPABASE_SERVICE_ROLE_KEY,
    )


def find_existing_license(sb, stripe_session_id: str) -> Optional[dict]:
    """Check if license already exists for this Stripe session (deduplication)."""
    resp = (
        sb.table("licenses")
        .select("key, email, plan, stripe_session_id")
        .eq("stripe_session_id", stripe_session_id)
        .maybe_single()
    )
    return resp.data


def insert_license(sb, email: str, plan: str, stripe_session_id: str, stripe_customer_id: Optional[str]):
    """Insert a new license record and return it."""
    import secrets
    license_key = generate_license_key()
    resp = (
        sb.table("licenses")
        .insert({
            "email": email,
            "plan": plan,
            "stripe_session_id": stripe_session_id,
            "stripe_customer_id": stripe_customer_id,
            "metadata": {"source": "stripe-webhook-handler.py"},
        })
        .execute()
    )
    if not resp.data:
        raise RuntimeError("License insert returned no data")
    # Override the auto-generated key with our deterministic one
    created = resp.data[0]
    upd = sb.table("licenses").update({"key": license_key}).eq("id", created["id"]).execute()
    created["key"] = license_key
    return created


def provision_team_and_tokens(sb, license_key: str, email: str):
    """
    Provision a team + ingest/worker tokens for Mission Control.
    Returns (team_id, ingest_token, worker_token) on success, (None, '', '') on failure.
    """
    import secrets

    # Slug from email: normalize and append timestamp
    slug_base = re.sub(r"[^a-z0-9]", "-", email.lower())[:50]
    slug = f"{slug_base}-{int(datetime.now(timezone.utc).timestamp())}"

    team_resp = sb.table("teams").insert({
        "name": f"{email}'s Team",
        "slug": slug,
        "plan": "pro",
        "owner_email": email,
    }).execute()

    if not team_resp.data:
        logger.warning("Team insert failed — continuing without team tokens")
        return None, "", ""

    team_id = team_resp.data[0]["id"]
    ingest_token = "mc_ingest_" + secrets.token_hex(32)
    worker_token = "mc_worker_" + secrets.token_hex(32)

    token_resp = sb.table("team_tokens").insert({
        "team_id": team_id,
        "license_key": license_key,
        "ingest_token": ingest_token,
        "worker_token": worker_token,
    }).execute()

    if not token_resp.data:
        logger.warning("Token insert failed — continuing without tokens")
        return team_id, "", ""

    return team_id, ingest_token, worker_token


# ─── n8n Welcome Email Trigger ───────────────────────────────────────────────

def trigger_n8n_welcome_email(
    license_key: str,
    email: str,
    plan: str,
    ingest_token: str,
    worker_token: str,
    alice_cloud_token: str,
):
    """
    POST to the n8n webhook URL to trigger the welcome email workflow.
    n8n will use the template variables to render the full welcome email.
    """
    payload = {
        "license_key": license_key,
        "email": email,
        "plan": plan,
        "ingest_token": ingest_token,
        "worker_token": worker_token,
        "alice_cloud_token": alice_cloud_token,
        # Timestamp for audit
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        resp = requests.post(
            Config.N8N_WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        logger.info(
            f"n8n welcome email triggered for {email} — status {resp.status_code}"
        )
        return True
    except requests.RequestException as exc:
        logger.error(f"n8n webhook failed: {exc}")
        return False


# ─── Stripe Signature Verification ───────────────────────────────────────────

def verify_stripe_signature(body: bytes, sig_header: str) -> stripe.Event:
    """Verify and construct a Stripe event from the raw request body."""
    try:
        event = stripe.Webhook.construct_event(body, sig_header, Config.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError as exc:
        logger.warning(f"Stripe signature verification failed: {exc}")
        raise
    return event


# ─── Webhook Handler ───────────────────────────────────────────────────────────

@app.route("/webhook/stripe", methods=["POST"])
def handle_stripe_webhook():
    """Main Stripe webhook endpoint. Expects Stripe-Signature header."""

    # Get raw body for signature verification
    body = request.get_data()
    sig_header = request.headers.get("Stripe-Signature", "")

    if not sig_header:
        logger.warning("Missing Stripe-Signature header")
        return jsonify({"error": "Missing Stripe-Signature header"}), 400

    # Verify signature
    try:
        event = verify_stripe_signature(body, sig_header)
    except Exception:
        return jsonify({"error": "Signature verification failed"}), 400

    logger.info(f"Received Stripe event: {event.type} (id={event.id})")

    if event.type != "checkout.session.completed":
        logger.info(f"Ignoring event type: {event.type}")
        return jsonify({"received": True, "ignored": True})

    session = event.data.object

    # Extract email
    email = session.get("customer_details", {}).get("email") or session.get("customer_email")
    if not email:
        logger.warning("No email in checkout session")
        return jsonify({"error": "No email in session"}), 400

    # Extract plan from metadata
    plan = session.metadata.get("plan", "pro") if session.metadata else "pro"
    if plan not in ("pro", "cloud"):
        plan = "pro"

    stripe_session_id = session.id
    stripe_customer_id = session.customer if isinstance(session.customer, str) else None

    logger.info(
        f"Processing checkout.completed — email={email} plan={plan} session={stripe_session_id}"
    )

    sb = get_supabase_client()

    # Deduplication check
    existing = find_existing_license(sb, stripe_session_id)
    if existing:
        logger.info(f"License already exists for session {stripe_session_id} — skipping")
        return jsonify({"received": True, "deduplicated": True})

    # Insert license
    try:
        license_record = insert_license(sb, email, plan, stripe_session_id, stripe_customer_id)
        license_key = license_record["key"]
        logger.info(f"License created: {license_key}")
    except Exception as exc:
        logger.error(f"Failed to create license: {exc}")
        return jsonify({"error": "Failed to create license"}), 500

    # Provision team + tokens
    team_id, ingest_token, worker_token = provision_team_and_tokens(sb, license_key, email)

    # alice_cloud_token is the ingest token (same concept, different name)
    alice_cloud_token = ingest_token

    # Trigger n8n welcome email workflow
    n8n_ok = trigger_n8n_welcome_email(
        license_key=license_key,
        email=email,
        plan=plan,
        ingest_token=ingest_token,
        worker_token=worker_token,
        alice_cloud_token=alice_cloud_token,
    )

    if not n8n_ok:
        logger.warning("n8n trigger failed — email may not be sent")

    return jsonify({
        "received": True,
        "license_key": license_key,
        "email": email,
        "plan": plan,
        "team_provisioned": team_id is not None,
        "n8n_triggered": n8n_ok,
    })


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "stripe-webhook-handler"})


# ─── Test / Mock Mode ──────────────────────────────────────────────────────────

@app.route("/test/mock-webhook", methods=["POST"])
def handle_mock_webhook():
    """
    Internal test endpoint — simulates a checkout.session.completed event
    without Stripe signature validation. DO NOT expose in production.
    """
    body = request.get_json() or {}

    email = body.get("email", "test@example.com")
    plan = body.get("plan", "pro")

    logger.info(f"[MOCK] Processing mock checkout — email={email} plan={plan}")

    import secrets
    license_key = generate_license_key()
    stripe_session_id = "cs_test_mock_" + secrets.token_hex(16)
    stripe_customer_id = None

    sb = get_supabase_client()

    # Check existing
    existing = find_existing_license(sb, stripe_session_id)
    if existing:
        return jsonify({"received": True, "deduplicated": True, "key": existing["key"]})

    # Insert
    resp = (
        sb.table("licenses")
        .insert({
            "email": email,
            "plan": plan,
            "stripe_session_id": stripe_session_id,
            "stripe_customer_id": stripe_customer_id,
            "metadata": {"source": "stripe-webhook-handler.py:test"},
        })
        .execute()
    )
    created = resp.data[0]

    # Update with deterministic key
    sb.table("licenses").update({"key": license_key}).eq("id", created["id"]).execute()
    created["key"] = license_key

    # Provision team + tokens
    team_id, ingest_token, worker_token = provision_team_and_tokens(sb, license_key, email)

    # Trigger n8n
    alice_cloud_token = ingest_token
    n8n_ok = trigger_n8n_welcome_email(
        license_key=license_key,
        email=email,
        plan=plan,
        ingest_token=ingest_token,
        worker_token=worker_token,
        alice_cloud_token=alice_cloud_token,
    )

    return jsonify({
        "received": True,
        "license_key": license_key,
        "email": email,
        "plan": plan,
        "team_provisioned": team_id is not None,
        "ingest_token": ingest_token,
        "worker_token": worker_token,
        "n8n_triggered": n8n_ok,
    })


# ─── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="A.L.I.C.E. Stripe Webhook Handler")
    parser.add_argument("--test", action="store_true", help="Run in test mode (mock endpoint only)")
    args = parser.parse_args()

    if args.test:
        logger.info("Starting in TEST mode (no Stripe signature required)")
        # Override to run a simple test server without loading full config
        # (full config still loaded so we can use it)

    try:
        # Verify config loads before starting server
        _ = Config.STRIPE_SECRET_KEY
        _ = Config.STRIPE_WEBHOOK_SECRET
        _ = Config.SUPABASE_URL
        _ = Config.SUPABASE_SERVICE_ROLE_KEY
        _ = Config.N8N_WEBHOOK_URL
        logger.info("Config validated successfully")
    except RuntimeError as exc:
        logger.error(f"Config error: {exc}")
        logger.error("Copy .env.example to ~/alice-observability/.env and fill in Rob's keys")
        sys.exit(1)

    logger.info(
        f"Starting Flask server on {Config.FLASK_HOST}:{Config.FLASK_PORT}"
    )
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=False,
        threaded=True,
    )


if __name__ == "__main__":
    main()
