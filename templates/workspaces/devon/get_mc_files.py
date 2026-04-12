#!/usr/bin/env python3
"""Download Vercel deployment file tree for mc-final."""
import json, subprocess

token = json.load(open('/Users/aliceclaw/.vercel/auth'))['token']
uid = 'dpl_FaYDF8KSdg9qnGrC99kfSSf4WxCN'
team = 'robbiesrobotics-7692s-projects'

# Get file list
result = subprocess.run(
    ['curl', '-s', f'https://api.vercel.com/v6/deployments/{uid}/files?teamId={team}',
     '-H', f'Authorization: Bearer {token}'],
    capture_output=True, text=True
)
raw = result.stdout
print(f"Length: {len(raw)}")
print(f"First 200: {repr(raw[:200])}")
