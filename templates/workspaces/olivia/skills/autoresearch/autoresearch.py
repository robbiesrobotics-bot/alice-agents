#!/usr/bin/env python3
"""
autoresearch — queue a research task for Aria.
Writes a task JSON file to the Ubuntu Desktop queue directory via SSH.
"""
import argparse, json, os, re, subprocess, sys
from datetime import datetime, timezone

SSH_KEY = os.path.expanduser("~/.ssh/id_ed25519")
UBUNTU_HOST = "alpha@100.106.110.119"
QUEUE_BASE = "/home/alpha/alice-autonomous-researcher/queue"

def sanitize(s):
    """Make a string safe for use as a filename."""
    s = re.sub(r'[^a-zA-Z0-9_\-]', '_', s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s[:80]

def queue_research(topic, project, depth="medium", priority="normal", requester="cli"):
    if project not in ("namibia", "bllm"):
        raise ValueError(f"Unknown project: {project}. Must be 'namibia' or 'bllm'.")
    
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    sanitized_topic = sanitize(topic)
    filename = f"{sanitized_topic}-{ts}.json"
    filepath = f"{QUEUE_BASE}/{project}/{filename}"
    
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
    
    task_json = json.dumps(task, indent=2)
    
    # Write locally then SCP to Ubuntu Desktop
    local_path = f"/tmp/{filename}"
    with open(local_path, "w") as f:
        json.dump(task, f, indent=2)
    
    subprocess.run(["ssh", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no",
                    UBUNTU_HOST, f"mkdir -p {QUEUE_BASE}/{project}"], capture_output=True)
    scp = subprocess.run(
        ["scp", "-i", SSH_KEY, "-o", "StrictHostKeyChecking=no",
         local_path, f"{UBUNTU_HOST}:{QUEUE_BASE}/{project}/{filename}"],
        capture_output=True, text=True
    )
    if scp.returncode != 0:
        print(f"SCP error: {scp.stderr}", file=sys.stderr)
        return None
    
    os.remove(local_path)
    
    print(f"Queued: [{project}] {topic}")
    print(f"  File: {filename}")
    print(f"  Depth: {depth} | Priority: {priority}")
    print(f"  Aria will pick this up within ~2 minutes")
    return filepath

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Queue a research task for Aria")
    parser.add_argument("--topic", required=True, help="Research topic/question")
    parser.add_argument("--project", required=True, choices=["namibia", "bllm"], help="Project")
    parser.add_argument("--depth", default="medium", choices=["quick", "medium", "deep"])
    parser.add_argument("--priority", default="normal", choices=["low", "normal", "high"])
    parser.add_argument("--requester", default="cli", help="Who is requesting")
    args = parser.parse_args()
    
    result = queue_research(args.topic, args.project, args.depth, args.priority, args.requester)
    sys.exit(0 if result else 1)
