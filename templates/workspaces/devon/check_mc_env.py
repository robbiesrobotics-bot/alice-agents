#!/usr/bin/env python3
import json, subprocess

token = json.load(open('/Users/aliceclaw/.vercel/auth'))['token']

# Get mc-final project full config
result = subprocess.run(
    ['curl', '-s', f'https://api.vercel.com/v6/projects/mc-final?teamId=robbiesrobotics-7692s-projects',
     '-H', f'Authorization: Bearer {token}'],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
git = data.get('git', {})
print(f"Git repo: {git.get('repo','?')}")
print(f"Git type: {git.get('type','?')}")
print(f"Git deployed约: {git.get('deployedDeployments',[])}")
print(f"Build command: {data.get('buildCommand',{})}")
print(f"Install command: {data.get('installCommand',{})}")
print(f"Dev command: {data.get('devCommand',{})}")
print(f"Framework: {data.get('framework','?')}")

# Try to get deployments
result2 = subprocess.run(
    ['curl', '-s', f'https://api.vercel.com/v6/deployments?teamId=robbiesrobotics-7692s-projects&projectName=mc-final&limit=3',
     '-H', f'Authorization: Bearer {token}'],
    capture_output=True, text=True
)
data2 = json.loads(result2.stdout)
for d in data2.get('deployments', []):
    print(f"\nDeploy: {d['uid']} | {d['state']} | {d.get('meta',{}).get('githubCommitSha','?')[:12]} | {d.get('meta',{}).get('githubCommitMessage','?')[:60]}")
