import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/diagnostics-otel";
import {
  emptyPluginConfigSchema,
  onDiagnosticEvent,
} from "openclaw/plugin-sdk/diagnostics-otel";
import type { DiagnosticEventPayload } from "openclaw/plugin-sdk/diagnostics-otel";

const OPENCLAW_HOME = process.env.OPENCLAW_HOME ?? join(homedir(), ".openclaw");
const MC_CONFIG_PATH = join(OPENCLAW_HOME, ".alice-mission-control.json");
const DEFAULT_DASHBOARD_URL = "https://alice.av3.ai";
const DEFAULT_INGEST_URL = `${DEFAULT_DASHBOARD_URL}/api/v1/ingest`;
const DEFAULT_RUNTIME_BASE_URL = `${DEFAULT_DASHBOARD_URL}/api/v1/runtime`;
const DEFAULT_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL ?? "http://127.0.0.1:18789";
const DEFAULT_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? process.env.MC_GATEWAY_TOKEN ?? "";
const DEFAULT_CHAT_USER = process.env.MC_CHAT_USER ?? "mission-control-worker";
const HEARTBEAT_INTERVAL_MS = 15000;
const COMMAND_POLL_INTERVAL_MS = 5000;

type JsonRecord = Record<string, unknown>;

interface RuntimeNodeRegistrationPayload {
  nodeId: string;
  installId: string;
  nodeName: string;
  sourceNode: string;
  connectionMode: "relay";
  gatewayUrl: string;
  runtimeVersion: string;
  platform: string;
  capabilities: JsonRecord;
  metadata: JsonRecord;
}

interface RuntimeCommand {
  id: string;
  nodeId: string;
  type: string;
  status: string;
  threadId: string | null;
  sessionId: string | null;
  payload: JsonRecord;
}

function readMissionControlConfig(): JsonRecord {
  try {
    if (!existsSync(MC_CONFIG_PATH)) return {};
    return JSON.parse(readFileSync(MC_CONFIG_PATH, "utf8")) as JsonRecord;
  } catch {
    return {};
  }
}

function getCloudConfig(): JsonRecord {
  const fileConfig = readMissionControlConfig();
  return typeof fileConfig.cloud === "object" && fileConfig.cloud
    ? (fileConfig.cloud as JsonRecord)
    : {};
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

const cloudConfig = getCloudConfig();
const DASHBOARD_URL = normalizeUrl(
  getString(process.env.MC_DASHBOARD_URL, getString(cloudConfig.dashboardUrl, DEFAULT_DASHBOARD_URL)),
);
const INGEST_URL = normalizeUrl(
  getString(process.env.MC_INGEST_URL, getString(cloudConfig.ingestUrl, DEFAULT_INGEST_URL)),
);
const RUNTIME_BASE_URL = normalizeUrl(
  getString(process.env.MC_RUNTIME_BASE_URL, getString(cloudConfig.runtimeBaseUrl, DEFAULT_RUNTIME_BASE_URL)),
);
const NODE_REGISTER_URL = normalizeUrl(
  getString(process.env.MC_NODE_REGISTER_URL, getString(cloudConfig.nodeRegisterUrl, `${RUNTIME_BASE_URL}/nodes/register`)),
);
const NODE_HEARTBEAT_URL = normalizeUrl(
  getString(
    process.env.MC_NODE_HEARTBEAT_URL,
    getString(cloudConfig.nodeHeartbeatUrl, `${RUNTIME_BASE_URL}/nodes/heartbeat`),
  ),
);
const COMMANDS_URL = normalizeUrl(
  getString(process.env.MC_COMMANDS_URL, getString(cloudConfig.commandsUrl, `${RUNTIME_BASE_URL}/commands`)),
);
const INGEST_TOKEN = getString(process.env.MC_INGEST_TOKEN, getString(cloudConfig.ingestToken));
const WORKER_TOKEN = getString(
  process.env.MC_RUNTIME_WORKER_TOKEN,
  getString(cloudConfig.workerToken, INGEST_TOKEN),
);
const SOURCE_NODE = getString(process.env.MC_SOURCE_NODE, getString(cloudConfig.sourceNode, "openclaw-local"));
const INSTALL_ID = getString(process.env.MC_INSTALL_ID, SOURCE_NODE);
const NODE_ID = getString(process.env.MC_NODE_ID, SOURCE_NODE);
const GATEWAY_URL = normalizeUrl(getString(process.env.MC_GATEWAY_URL, DEFAULT_GATEWAY_URL));
const GATEWAY_TOKEN = getString(process.env.MC_GATEWAY_TOKEN, DEFAULT_GATEWAY_TOKEN);

function now(): string {
  return new Date().toISOString();
}

function sessionKeyToAgentId(sessionKey?: string): string {
  if (!sessionKey) return "unknown";
  const parts = sessionKey.split(":");
  return parts[1] ?? parts[0] ?? "unknown";
}

let seq = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++seq}`;
}

function authHeaders(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function headers(token = ""): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...authHeaders(token),
  };
}

async function postJson(url: string, token: string, body: object): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
}

async function postToIngest(events: object[]): Promise<void> {
  try {
    const res = await postJson(INGEST_URL, INGEST_TOKEN, events);
    if (!res.ok) {
      console.warn(`[mc-bridge] ingest HTTP ${res.status} — ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    console.warn(`[mc-bridge] ingest post failed: ${String(err)}`);
  }
}

function buildNodeRegistrationPayload(): RuntimeNodeRegistrationPayload {
  return {
    nodeId: NODE_ID,
    installId: INSTALL_ID,
    nodeName: SOURCE_NODE,
    sourceNode: SOURCE_NODE,
    connectionMode: "relay",
    gatewayUrl: GATEWAY_URL,
    runtimeVersion: process.version,
    platform: process.platform,
    capabilities: {
      telemetry: true,
      commands: true,
      directGateway: true,
      commandTypes: ["agent.message.send"],
    },
    metadata: {
      dashboardUrl: DASHBOARD_URL,
      pluginId: "mission-control-bridge",
    },
  };
}

async function registerNode(logger: { info(message: string): void; warn(message: string): void }): Promise<void> {
  if (!WORKER_TOKEN) {
    logger.warn("[mc-bridge] worker token missing; node registration skipped");
    return;
  }
  try {
    const res = await postJson(NODE_REGISTER_URL, WORKER_TOKEN, buildNodeRegistrationPayload());
    if (!res.ok) {
      logger.warn(`[mc-bridge] register failed ${res.status}: ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    logger.warn(`[mc-bridge] register failed: ${String(err)}`);
  }
}

async function heartbeatNode(logger: { warn(message: string): void }): Promise<void> {
  if (!WORKER_TOKEN) return;
  try {
    const res = await postJson(NODE_HEARTBEAT_URL, WORKER_TOKEN, {
      nodeId: NODE_ID,
      status: "online",
      runtimeVersion: process.version,
      platform: process.platform,
      capabilities: {
        telemetry: true,
        commands: true,
        directGateway: true,
        commandTypes: ["agent.message.send"],
      },
      metadata: {
        dashboardUrl: DASHBOARD_URL,
      },
    });
    if (!res.ok) {
      logger.warn(`[mc-bridge] heartbeat failed ${res.status}: ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    logger.warn(`[mc-bridge] heartbeat failed: ${String(err)}`);
  }
}

async function listQueuedCommands(logger: { warn(message: string): void }): Promise<RuntimeCommand[]> {
  if (!WORKER_TOKEN) return [];
  const url = `${COMMANDS_URL}?nodeId=${encodeURIComponent(NODE_ID)}&limit=5`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: authHeaders(WORKER_TOKEN),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      logger.warn(`[mc-bridge] command poll failed ${res.status}: ${await res.text().catch(() => "")}`);
      return [];
    }
    const data = (await res.json()) as { commands?: RuntimeCommand[] };
    return Array.isArray(data.commands) ? data.commands : [];
  } catch (err) {
    logger.warn(`[mc-bridge] command poll failed: ${String(err)}`);
    return [];
  }
}

async function leaseCommand(commandId: string, logger: { warn(message: string): void }): Promise<boolean> {
  try {
    const res = await postJson(`${COMMANDS_URL}/${commandId}/lease`, WORKER_TOKEN, {
      nodeId: NODE_ID,
      leaseOwner: NODE_ID,
    });
    if (res.ok) return true;
    if (res.status !== 409) {
      logger.warn(`[mc-bridge] command lease failed ${res.status}: ${await res.text().catch(() => "")}`);
    }
    return false;
  } catch (err) {
    logger.warn(`[mc-bridge] command lease failed: ${String(err)}`);
    return false;
  }
}

async function emitCommandEvent(
  commandId: string,
  eventType: string,
  payload: JsonRecord,
  logger: { warn(message: string): void },
): Promise<void> {
  try {
    const res = await postJson(`${COMMANDS_URL}/${commandId}/events`, WORKER_TOKEN, {
      nodeId: NODE_ID,
      eventType,
      payload,
    });
    if (!res.ok) {
      logger.warn(`[mc-bridge] command event failed ${res.status}: ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    logger.warn(`[mc-bridge] command event failed: ${String(err)}`);
  }
}

async function completeCommand(
  commandId: string,
  result: JsonRecord,
  logger: { warn(message: string): void },
): Promise<void> {
  try {
    const res = await postJson(`${COMMANDS_URL}/${commandId}/complete`, WORKER_TOKEN, {
      nodeId: NODE_ID,
      result,
    });
    if (!res.ok) {
      logger.warn(`[mc-bridge] command completion failed ${res.status}: ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    logger.warn(`[mc-bridge] command completion failed: ${String(err)}`);
  }
}

async function failCommand(
  commandId: string,
  error: string,
  logger: { warn(message: string): void },
): Promise<void> {
  try {
    const res = await postJson(`${COMMANDS_URL}/${commandId}/fail`, WORKER_TOKEN, {
      nodeId: NODE_ID,
      error,
    });
    if (!res.ok) {
      logger.warn(`[mc-bridge] command failure update failed ${res.status}: ${await res.text().catch(() => "")}`);
    }
  } catch (err) {
    logger.warn(`[mc-bridge] command failure update failed: ${String(err)}`);
  }
}

async function executeAgentMessage(command: RuntimeCommand): Promise<JsonRecord> {
  const payload = command.payload ?? {};
  const message = getString(payload.message);
  const agentId = getString(payload.agentId, "olivia");
  const chatUser = getString(payload.user, DEFAULT_CHAT_USER);

  if (!message) {
    throw new Error("agent.message.send requires payload.message");
  }

  const gatewayHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (GATEWAY_TOKEN) {
    gatewayHeaders.Authorization = `Bearer ${GATEWAY_TOKEN}`;
  }

  const res = await fetch(`${GATEWAY_URL}/v1/responses`, {
    method: "POST",
    headers: gatewayHeaders,
    body: JSON.stringify({
      model: `openclaw:${agentId}`,
      input: message,
      user: chatUser,
      stream: false,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`gateway ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data = (await res.json()) as JsonRecord;
  const outputText = extractOutputText(data);

  return {
    agentId,
    user: chatUser,
    responseId: getString(data.id),
    outputText,
    raw: data,
  };
}

function extractOutputText(data: JsonRecord): string {
  const output = Array.isArray(data.output) ? data.output : [];
  const parts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as JsonRecord).content) ? ((item as JsonRecord).content as unknown[]) : [];
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const record = block as JsonRecord;
      const text =
        getString(record.text) ||
        getString(record.value) ||
        getString(typeof record.output_text === "string" ? record.output_text : "");
      if (text) parts.push(text);
    }
  }

  return parts.join("\n\n").trim();
}

async function executeCommand(
  command: RuntimeCommand,
  logger: { info(message: string): void; warn(message: string): void },
): Promise<void> {
  await emitCommandEvent(command.id, "command.started", {
    commandType: command.type,
    startedAt: now(),
  }, logger);

  try {
    switch (command.type) {
      case "agent.message.send": {
        const result = await executeAgentMessage(command);
        await emitCommandEvent(command.id, "agent.message.completed", result, logger);
        await completeCommand(command.id, result, logger);
        break;
      }
      default:
        throw new Error(`unsupported command type: ${command.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await emitCommandEvent(command.id, "command.failed", {
      error: message,
      failedAt: now(),
    }, logger);
    await failCommand(command.id, message, logger);
  }
}

function handleModelUsage(evt: Extract<DiagnosticEventPayload, { type: "model.usage" }>) {
  const agentId = sessionKeyToAgentId(evt.sessionKey);
  const totalTokens = evt.usage.total ?? (evt.usage.input ?? 0) + (evt.usage.output ?? 0);

  const event = {
    event_id: nextId("mc-bridge"),
    event_type: "agent.session.completed",
    event_version: "1.0",
    source_system: "openclaw",
    source_node: SOURCE_NODE,
    occurred_at: now(),
    actor_id: agentId,
    actor_type: "agent",
    correlation_id: evt.sessionId ?? null,
    payload: {
      session_id: evt.sessionId ?? evt.sessionKey ?? nextId("sess"),
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

  void postToIngest([event]);
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
    event_id: nextId("mc-bridge"),
    event_type: eventType,
    event_version: "1.0",
    source_system: "openclaw",
    source_node: SOURCE_NODE,
    occurred_at: now(),
    actor_id: agentId,
    actor_type: "agent",
    correlation_id: evt.sessionId ?? null,
    payload: {
      session_id: evt.sessionId ?? evt.sessionKey ?? nextId("sess"),
      agent_id: agentId,
      channel: evt.channel ?? "unknown",
      status: evt.outcome === "error" ? "failed" : "completed",
      duration_ms: evt.durationMs ?? 0,
      ...(evt.error ? { error: evt.error } : {}),
    },
  };

  void postToIngest([event]);
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
    event_id: nextId("mc-bridge"),
    event_type: eventType,
    event_version: "1.0",
    source_system: "openclaw",
    source_node: SOURCE_NODE,
    occurred_at: now(),
    actor_id: agentId,
    actor_type: "agent",
    correlation_id: evt.sessionId ?? null,
    payload: {
      session_id: evt.sessionId ?? evt.sessionKey ?? nextId("sess"),
      agent_id: agentId,
      state: evt.state,
      prev_state: evt.prevState ?? null,
    },
  };

  void postToIngest([event]);
}

const plugin = {
  id: "mission-control-bridge",
  name: "Mission Control Bridge",
  description: "Forwards OpenClaw diagnostic events to A.L.I.C.E. Mission Control and executes hosted runtime commands",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    api.registerService({
      id: "mission-control-bridge",

      async start(ctx) {
        ctx.logger.info(`[mc-bridge] starting — ingest URL: ${INGEST_URL}`);
        ctx.logger.info(`[mc-bridge] runtime worker — commands URL: ${COMMANDS_URL}`);

        let pollInFlight = false;
        let stopped = false;

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

        const pollCommands = async () => {
          if (stopped || pollInFlight || !WORKER_TOKEN) return;
          pollInFlight = true;
          try {
            const commands = await listQueuedCommands(ctx.logger);
            for (const command of commands) {
              if (!(await leaseCommand(command.id, ctx.logger))) continue;
              await executeCommand(command, ctx.logger);
            }
          } finally {
            pollInFlight = false;
          }
        };

        await registerNode(ctx.logger);
        await heartbeatNode(ctx.logger);
        await postToIngest([
          {
            event_id: nextId("mc-bridge"),
            event_type: "node.registered",
            event_version: "1.0",
            source_system: "openclaw",
            source_node: SOURCE_NODE,
            occurred_at: now(),
            payload: {
              node_name: SOURCE_NODE,
              node_id: NODE_ID,
              install_id: INSTALL_ID,
              platform: process.platform,
              node_version: process.version,
              gateway_url: GATEWAY_URL,
            },
          },
        ]);

        const heartbeatTimer = setInterval(() => {
          void heartbeatNode(ctx.logger);
        }, HEARTBEAT_INTERVAL_MS);

        const pollTimer = setInterval(() => {
          void pollCommands();
        }, COMMAND_POLL_INTERVAL_MS);

        await pollCommands();

        (
          this as {
            _unsub?: () => void;
            _heartbeatTimer?: ReturnType<typeof setInterval>;
            _pollTimer?: ReturnType<typeof setInterval>;
            _stop?: () => void;
          }
        )._unsub = unsubscribe;
        (
          this as {
            _unsub?: () => void;
            _heartbeatTimer?: ReturnType<typeof setInterval>;
            _pollTimer?: ReturnType<typeof setInterval>;
            _stop?: () => void;
          }
        )._heartbeatTimer = heartbeatTimer;
        (
          this as {
            _unsub?: () => void;
            _heartbeatTimer?: ReturnType<typeof setInterval>;
            _pollTimer?: ReturnType<typeof setInterval>;
            _stop?: () => void;
          }
        )._pollTimer = pollTimer;
        (
          this as {
            _unsub?: () => void;
            _heartbeatTimer?: ReturnType<typeof setInterval>;
            _pollTimer?: ReturnType<typeof setInterval>;
            _stop?: () => void;
          }
        )._stop = () => {
          stopped = true;
          clearInterval(heartbeatTimer);
          clearInterval(pollTimer);
        };
      },

      async stop() {
        const self = this as {
          _unsub?: () => void;
          _heartbeatTimer?: ReturnType<typeof setInterval>;
          _pollTimer?: ReturnType<typeof setInterval>;
          _stop?: () => void;
        };
        self._unsub?.();
        self._stop?.();
        if (self._heartbeatTimer) clearInterval(self._heartbeatTimer);
        if (self._pollTimer) clearInterval(self._pollTimer);
        self._unsub = undefined;
        self._heartbeatTimer = undefined;
        self._pollTimer = undefined;
        self._stop = undefined;
      },
    });
  },
};

export default plugin;
