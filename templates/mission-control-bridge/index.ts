import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/diagnostics-otel";
import { emptyPluginConfigSchema, onDiagnosticEvent } from "openclaw/plugin-sdk/diagnostics-otel";
import type { DiagnosticEventPayload } from "openclaw/plugin-sdk/diagnostics-otel";

const OPENCLAW_HOME = process.env.OPENCLAW_HOME ?? join(homedir(), ".openclaw");
const MC_CONFIG_PATH = join(OPENCLAW_HOME, ".alice-mission-control.json");
const DEFAULT_INGEST_URL = "https://alice.av3.ai/api/v1/ingest";

function readMissionControlConfig(): Record<string, unknown> {
  try {
    if (!existsSync(MC_CONFIG_PATH)) return {};
    return JSON.parse(readFileSync(MC_CONFIG_PATH, "utf8"));
  } catch {
    return {};
  }
}

function getCloudConfig(): Record<string, unknown> {
  const fileConfig = readMissionControlConfig();
  return typeof fileConfig.cloud === "object" && fileConfig.cloud ? fileConfig.cloud as Record<string, unknown> : {};
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const cloudConfig = getCloudConfig();
const INGEST_URL = getString(process.env.MC_INGEST_URL, getString(cloudConfig.ingestUrl, DEFAULT_INGEST_URL));
const INGEST_TOKEN = getString(process.env.MC_INGEST_TOKEN, getString(cloudConfig.ingestToken));
const SOURCE_NODE = getString(process.env.MC_SOURCE_NODE, getString(cloudConfig.sourceNode, "openclaw-local"));

function now(): string {
  return new Date().toISOString();
}

function sessionKeyToAgentId(sessionKey?: string): string {
  if (!sessionKey) return "unknown";
  const parts = sessionKey.split(":");
  return parts[1] ?? parts[0] ?? "unknown";
}

let seq = 0;
function nextEventId(): string {
  return `mc-bridge-${Date.now()}-${++seq}`;
}

async function postToIngest(events: object[]): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (INGEST_TOKEN) {
    headers["Authorization"] = `Bearer ${INGEST_TOKEN}`;
  }

  try {
    const res = await fetch(INGEST_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(events),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[mc-bridge] ingest HTTP ${res.status} — ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    console.warn(`[mc-bridge] ingest post failed: ${String(err)}`);
  }
}

function handleModelUsage(evt: Extract<DiagnosticEventPayload, { type: "model.usage" }>) {
  const agentId = sessionKeyToAgentId(evt.sessionKey);
  const totalTokens = evt.usage.total ?? (evt.usage.input ?? 0) + (evt.usage.output ?? 0);

  const event = {
    event_id: nextEventId(),
    event_type: "agent.session.completed",
    event_version: "1.0",
    source_system: "openclaw",
    source_node: SOURCE_NODE,
    occurred_at: now(),
    actor_id: agentId,
    actor_type: "agent",
    correlation_id: evt.sessionId ?? null,
    payload: {
      session_id: evt.sessionId ?? evt.sessionKey ?? nextEventId(),
      agent_id: agentId,
      model: evt.model ?? "unknown",
      channel: evt.channel ?? "unknown",
      total_tokens: totalTokens,
      input_tokens: evt.usage.input ?? 0,
      output_tokens: evt.usage.output ?? 0,
      cache_read_tokens: evt.usage.cacheRead ?? 0,
      cache_write_tokens: evt.usage.cacheWrite ?? 0,
      cost_usd: evt.costUsd ?? 0,
      duration_ms: evt.durationMs ?? 0,
      context_limit: evt.context?.limit ?? 0,
      context_used: evt.context?.used ?? 0,
      status: "completed",
    },
  };

  postToIngest([event]);
}

function handleMessageProcessed(evt: Extract<DiagnosticEventPayload, { type: "message.processed" }>) {
  if (!evt.sessionKey && !evt.sessionId) return;
  const agentId = sessionKeyToAgentId(evt.sessionKey);
  const eventType =
    evt.outcome === "completed"
      ? "agent.session.completed"
      : evt.outcome === "error"
        ? "agent.session.completed"
        : null;

  if (!eventType) return;

  const event = {
    event_id: nextEventId(),
    event_type: eventType,
    event_version: "1.0",
    source_system: "openclaw",
    source_node: SOURCE_NODE,
    occurred_at: now(),
    actor_id: agentId,
    actor_type: "agent",
    correlation_id: evt.sessionId ?? null,
    payload: {
      session_id: evt.sessionId ?? evt.sessionKey ?? nextEventId(),
      agent_id: agentId,
      channel: evt.channel ?? "unknown",
      status: evt.outcome === "error" ? "failed" : "completed",
      duration_ms: evt.durationMs ?? 0,
      ...(evt.error ? { error: evt.error } : {}),
    },
  };

  postToIngest([event]);
}

function handleSessionState(evt: Extract<DiagnosticEventPayload, { type: "session.state" }>) {
  if (!evt.sessionKey && !evt.sessionId) return;
  const agentId = sessionKeyToAgentId(evt.sessionKey);
  const stateToEventType: Record<string, string> = {
    processing: "agent.session.started",
    idle: "agent.session.completed",
  };
  const eventType = stateToEventType[evt.state];
  if (!eventType) return;

  const event = {
    event_id: nextEventId(),
    event_type: eventType,
    event_version: "1.0",
    source_system: "openclaw",
    source_node: SOURCE_NODE,
    occurred_at: now(),
    actor_id: agentId,
    actor_type: "agent",
    correlation_id: evt.sessionId ?? null,
    payload: {
      session_id: evt.sessionId ?? evt.sessionKey ?? nextEventId(),
      agent_id: agentId,
      state: evt.state,
      prev_state: evt.prevState ?? null,
    },
  };

  postToIngest([event]);
}

const plugin = {
  id: "mission-control-bridge",
  name: "Mission Control Bridge",
  description: "Forwards OpenClaw diagnostic events to the A.L.I.C.E. Mission Control ingest endpoint",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    api.registerService({
      id: "mission-control-bridge",

      async start(ctx) {
        ctx.logger.info(`[mc-bridge] starting — ingest URL: ${INGEST_URL}`);

        const unsubscribe = onDiagnosticEvent((evt: DiagnosticEventPayload) => {
          try {
            switch (evt.type) {
              case "model.usage":
                handleModelUsage(evt);
                break;
              case "message.processed":
                handleMessageProcessed(evt);
                break;
              case "session.state":
                handleSessionState(evt);
                break;
            }
          } catch (err) {
            ctx.logger.warn(`[mc-bridge] event handler error (${evt.type}): ${String(err)}`);
          }
        });

        (this as { _unsub?: () => void })._unsub = unsubscribe;

        await postToIngest([
          {
            event_id: nextEventId(),
            event_type: "node.registered",
            event_version: "1.0",
            source_system: "openclaw",
            source_node: SOURCE_NODE,
            occurred_at: now(),
            payload: {
              node_name: SOURCE_NODE,
              platform: process.platform,
              node_version: process.version,
            },
          },
        ]);
      },

      async stop() {
        const self = this as { _unsub?: () => void };
        self._unsub?.();
        self._unsub = undefined;
      },
    });
  },
};

export default plugin;
