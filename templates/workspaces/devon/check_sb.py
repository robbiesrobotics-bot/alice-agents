#!/usr/bin/env python3
"""Direct Supabase gateway_connections heartbeat update + file search."""
import json, subprocess

SB_URL = 'https://xxxgvtwnlbtdgmlgccee.supabase.co'
SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eGd2dHdubGJ0ZGdtbGdjY2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU4MjI5MCwiZXhwIjoyMDkwMTU4MjkwfQ.TM_CDuPsuHZK6HeK_pzc5NHCT-peVr16l0qUNWufXqw'

# Test: check if gateway_connections table exists and has the Mac.fios-router.home row
query = {
    "query": "SELECT id, gateway_name, last_heartbeat, status FROM public.gateway_connections WHERE gateway_name = 'Mac.fios-router.home' LIMIT 5;"
}
result = subprocess.run(
    ['curl', '-s', f'{SB_URL}/rest/v1/rpc/exec_sql',
     '-H', f'apikey: {SB_KEY}',
     '-H', f'Authorization: Bearer {SB_KEY}',
     '-H', 'Content-Type: application/json',
     '-d', json.dumps(query)],
    capture_output=True, text=True
)
print("Query result:", result.stdout[:500])

# Also check all gateway_connections rows
query2 = {
    "query": "SELECT id, gateway_name, last_heartbeat, status FROM public.gateway_connections LIMIT 10;"
}
result2 = subprocess.run(
    ['curl', '-s', f'{SB_URL}/rest/v1/rpc/exec_sql',
     '-H', f'apikey: {SB_KEY}',
     '-H', f'Authorization: Bearer {SB_KEY}',
     '-H', 'Content-Type: application/json',
     '-d', json.dumps(query2)],
    capture_output=True, text=True
)
print("All rows:", result2.stdout[:500])
