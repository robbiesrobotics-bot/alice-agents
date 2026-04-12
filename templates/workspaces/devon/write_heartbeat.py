import os

content = """import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const AUTH_TOKEN = 'mc_worker_164bb779164a780da36df4f5272dc38c784f6f1e'

async function supabaseRequest(method: string, path: string, body?: unknown) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': method === 'GET' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.text()
  return { ok: res.ok, status: res.status, data }
}

export async function GET() {
  return NextResponse.json({ ok: true, commands: [] })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { nodeId?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { nodeId, status } = body
  if (!nodeId) {
    return NextResponse.json({ error: 'nodeId is required' }, { status: 400 })
  }

  const { ok, data } = await supabaseRequest(
    'PATCH',
    `gateway_connections?gateway_name=eq.${nodeId}`,
    {
      last_heartbeat: new Date().toISOString(),
      status: status === 'offline' ? 'disconnected' : 'connected',
    }
  )

  if (!ok) {
    return NextResponse.json({ error: 'Failed to update heartbeat', detail: data }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
"""

path = '/Users/aliceclaw/.openclaw/workspace/apps/mission-control-web/src/app/api/v1/runtime/nodes/heartbeat/route.ts'
with open(path, 'w') as f:
    f.write(content)
print(f"Written to {path}")
