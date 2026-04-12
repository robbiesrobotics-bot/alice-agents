#!/usr/bin/env python3
import json, subprocess

token = json.load(open('/Users/aliceclaw/.vercel/auth'))['token']

result = subprocess.run(
    ['curl', '-s', f'https://api.vercel.com/v6/projects/mc-final?teamId=robbiesrobotics-7692s-projects',
     '-H', f'Authorization: Bearer {token}'],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
print(json.dumps(data, indent=2)[:2000])
