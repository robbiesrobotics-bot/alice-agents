#!/usr/bin/env python3
import json, sys, urllib.request

# GitHub API - check builderz-labs/mission-control git tree for runtime/nodes files
url = 'https://api.github.com/repos/builderz-labs/mission-control/git/trees/HEAD?recursive=1'
req = urllib.request.Request(url, headers={'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Devon'})
with urllib.request.urlopen(req, timeout=15) as resp:
    data = json.loads(resp.read())

matches = [x for x in data.get('tree', []) if 'runtime' in x['path'] or 'heartbeat' in x['path'] or ('nodes' in x['path'] and 'heartbeat' in x.get('path', ''))]
for x in matches:
    print(x['path'])
