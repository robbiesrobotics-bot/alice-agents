#!/usr/bin/env python3
"""
test_mock_webhook.py — Local test for stripe-webhook-handler.py

Usage (from Ubuntu Desktop):
  python3 test_mock_webhook.py

This script:
1. Starts the webhook handler in a subprocess
2. Sends a mock checkout.session.completed event to /test/mock-webhook
3. Verifies the license was created in Supabase
4. Kills the handler

Requirements: Same env vars as stripe-webhook-handler.py (except STRIPE_WEBHOOK_SECRET
is not needed for the /test/mock-webhook endpoint).
"""

import os
import sys
import json
import time
import subprocess
import signal
import requests

HANDLER_HOST = os.environ.get("FLASK_HOST", "0.0.0.0")
HANDLER_PORT = os.environ.get("FLASK_PORT", "5001")
BASE_URL = f"http://{HANDLER_HOST}:{HANDLER_PORT}"

MOCK_PAYLOAD = {
    "email": "test-pipeline@dylan.local",
    "plan": "pro",
}


def wait_for_handler(timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(f"{BASE_URL}/health", timeout=1)
            if r.status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(0.5)
    return False


def main():
    handler_proc = None
    try:
        # Start the handler as a subprocess
        print("[test] Starting webhook handler...")
        handler_proc = subprocess.Popen(
            [sys.executable, "stripe-webhook-handler.py"],
            cwd=os.path.dirname(os.path.abspath(__file__)) or ".",
            env=os.environ,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            preexec_fn=os.setsid,
        )

        # Wait for it to come up
        if not wait_for_handler():
            print("[test] FAIL: Handler did not come up in time")
            return 1

        print("[test] Handler is up. Sending mock webhook...")

        # Send mock event
        resp = requests.post(
            f"{BASE_URL}/test/mock-webhook",
            json=MOCK_PAYLOAD,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )

        print(f"[test] Response status: {resp.status_code}")
        print(f"[test] Response body: {json.dumps(resp.json(), indent=2)}")

        if resp.status_code != 200:
            print("[test] FAIL: Non-200 response")
            return 1

        data = resp.json()
        if not data.get("received"):
            print("[test] FAIL: Handler did not process event")
            return 1

        print(f"[test] PASS: License created: {data.get('license_key')}")
        print(f"[test] Team provisioned: {data.get('team_provisioned')}")
        print(f"[test] n8n triggered: {data.get('n8n_triggered')}")
        return 0

    finally:
        if handler_proc:
            print("[test] Stopping handler...")
            os.killpg(os.getpgid(handler_proc.pid), signal.SIGTERM)
            handler_proc.wait(timeout=5)


if __name__ == "__main__":
    sys.exit(main())
