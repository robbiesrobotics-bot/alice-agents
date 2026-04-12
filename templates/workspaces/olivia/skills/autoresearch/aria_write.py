#!/usr/bin/env python3
"""
aria_write.py — Aria's SSH write helper.
Writes research findings to Ubuntu Desktop from subagent sessions.
Usage: python3 aria_write.py --action write|read|list --project namibia|bllm --filename "..." --content "..."
"""
import argparse, json, os, subprocess, sys, re
from datetime import datetime, timezone

# Config
SSH_KEY = os.path.expanduser("~/.ssh/id_ed25519")
UBUNTU_HOST = "alpha@100.106.110.119"
BASE = "/home/alpha/alice-autonomous-researcher"

def sanitize(s):
    s = re.sub(r'[^a-zA-Z0-9_\-]', '_', s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s[:100]

def write_findings(project, filename, content):
    """Write content to Ubuntu Desktop findings directory."""
    dest = f"{BASE}/{project}-findings/{filename}"
    local = f"/tmp/{sanitize(filename)}"
    
    with open(local, "w") as f:
        f.write(content)
    
    r = subprocess.run(
        ["ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no", UBUNTU_HOST, f"mkdir -p {BASE}/{project}-findings"],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        return False, f"mkdir failed: {r.stderr}"
    
    r = subprocess.run(
        ["scp", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no", local, f"{UBUNTU_HOST}:{dest}"],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        return False, f"SCP failed: {r.stderr}"
    
    os.remove(local)
    return True, dest

def write_queue_task(project, topic, depth, priority, requester):
    """Write a task file to the queue directory."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    filename = f"{sanitize(topic)}-{ts}.json"
    dest = f"{BASE}/queue/{project}/{filename}"
    local = f"/tmp/{sanitize(filename)}"
    
    task = {
        "topic": topic,
        "project": project,
        "depth": depth,
        "priority": priority,
        "requester": requester,
        "timestamp": ts,
        "received_at": datetime.now(timezone.utc).isoformat(),
        "status": "queued"
    }
    
    with open(local, "w") as f:
        json.dump(task, f, indent=2)
    
    r = subprocess.run(
        ["ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no", UBUNTU_HOST, f"mkdir -p {BASE}/queue/{project}"],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        return False, f"mkdir failed: {r.stderr}", None
    
    r = subprocess.run(
        ["scp", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no", local, f"{UBUNTU_HOST}:{dest}"],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        return False, f"SCP failed: {r.stderr}", None
    
    os.remove(local)
    return True, dest, filename

def list_findings(project, limit=20):
    """List existing findings in a project."""
    r = subprocess.run(
        ["ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no", UBUNTU_HOST,
         f"ls {BASE}/{project}-findings/ 2>/dev/null | tail -{limit}"],
        capture_output=True, text=True
    )
    return r.stdout.strip()

def read_findings(project, filename):
    """Read a findings file from Ubuntu Desktop."""
    dest = f"{BASE}/{project}-findings/{filename}"
    local = f"/tmp/{sanitize(filename)}"
    r = subprocess.run(
        ["scp", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no", f"{UBUNTU_HOST}:{dest}", local],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        return None, f"SCP failed: {r.stderr}"
    with open(local) as f:
        content = f.read()
    os.remove(local)
    return content, None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="action")
    
    w = sub.add_parser("write-findings")
    w.add_argument("--project", required=True, choices=["namibia","bllm"])
    w.add_argument("--filename", required=True)
    w.add_argument("--content", required=True)
    
    q = sub.add_parser("write-queue")
    q.add_argument("--project", required=True, choices=["namibia","bllm"])
    q.add_argument("--topic", required=True)
    q.add_argument("--depth", default="medium")
    q.add_argument("--priority", default="normal")
    q.add_argument("--requester", default="aria")
    
    l = sub.add_parser("list-findings")
    l.add_argument("--project", required=True, choices=["namibia","bllm"])
    l.add_argument("--limit", type=int, default=20)
    
    r = sub.add_parser("read-findings")
    r.add_argument("--project", required=True, choices=["namibia","bllm"])
    r.add_argument("--filename", required=True)
    
    args = parser.parse_args()
    
    if args.action == "write-findings":
        ok, msg = write_findings(args.project, args.filename, args.content)
        print(msg if not ok else f"Written: {msg}")
        sys.exit(0 if ok else 1)
    elif args.action == "write-queue":
        ok, msg, fname = write_queue_task(args.project, args.topic, args.depth, args.priority, args.requester)
        print(f"Queued: {fname} → {msg}" if ok else f"Failed: {msg}")
        sys.exit(0 if ok else 1)
    elif args.action == "list-findings":
        print(list_findings(args.project, args.limit))
    elif args.action == "read-findings":
        content, err = read_findings(args.project, args.filename)
        if err:
            print(f"Error: {err}", file=sys.stderr)
            sys.exit(1)
        print(content)
