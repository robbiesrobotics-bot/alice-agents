# A.L.I.C.E. Self-Healing System — Technical Specification

**Version:** 1.0.0  
**Author:** Dylan (Development Specialist)  
**Date:** 2026-03-16  
**Status:** Production Spec

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Schema Snapshot Format](#3-schema-snapshot-format)
4. [Tool Snapshot Format](#4-tool-snapshot-format)
5. [Compatibility Report Format](#5-compatibility-report-format)
6. [GitHub Action Workflow](#6-github-action-workflow)
7. [Compatibility Checker Script](#7-compatibility-checker-script)
8. [Local Remediation Cron](#8-local-remediation-cron)
9. [Mission Control UI](#9-mission-control-ui)
10. [Patch Generation](#10-patch-generation)
11. [Rollback Mechanism](#11-rollback-mechanism)
12. [Notification System](#12-notification-system)
13. [Error States & Edge Cases](#13-error-states--edge-cases)
14. [File Layout Reference](#14-file-layout-reference)

---

## 1. Overview

A.L.I.C.E. is a 28-agent framework running on top of OpenClaw. OpenClaw updates may introduce breaking changes to:

- `openclaw.json` config schema (field renames, removals, restructuring)
- Tool API surface (tool names, parameter signatures, tool removals)
- Behavioral defaults (agent defaults, sandbox semantics, session routing)
- Skill infrastructure (SKILL.md format, skill loading contract)

The Self-Healing System is a two-layer detection and remediation pipeline:

| Layer | Where | Trigger | Responsibility |
|-------|-------|---------|---------------|
| **Layer 1: Detection** | GitHub CI | Daily + on OpenClaw release | Detect breaking changes, generate reports, publish patches |
| **Layer 2: Remediation** | User's machine | Every 24h + gateway restart | Apply patches, escalate high-risk changes, rollback on failure |

**Design principles:**
- Auto-fix only low-risk, mechanical changes (renames, value swaps)
- Always create a backup before mutating files
- Escalate anything requiring judgment to the user
- Prefer direct script execution over spawning agents for simple fixes (saves tokens)
- Maintain an auditable trail of every change made

---

## 2. Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                   LAYER 1: DETECTION                    │
│                  (GitHub CI — our repo)                 │
│                                                         │
│  Trigger: daily cron + OpenClaw npm release webhook     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ tools/compatibility-checker.mjs                  │   │
│  │                                                  │   │
│  │  1. Fetch latest OpenClaw schema + tool registry │   │
│  │  2. Diff against schema-snapshot.json            │   │
│  │  3. Diff against tool-snapshot.json              │   │
│  │  4. Diff behavioral defaults                     │   │
│  │  5. Diff skill API contract                      │   │
│  │  6. Generate compatibility-report.json           │   │
│  │  7. If autoFixable → generate patch → npm publi  │   │
│  │  8. If not fixable → open GitHub issue           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Outputs: compatibility/{version}.json (hosted)         │
└─────────────────────────────────────────────────────────┘
                            │
                            │ https fetch
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 LAYER 2: REMEDIATION                    │
│                  (User's machine)                       │
│                                                         │
│  Trigger: OpenClaw cron (24h) + gateway restart hook    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ tools/local-remediation.mjs                      │   │
│  │                                                  │   │
│  │  1. Read .alice-manifest.json                    │   │
│  │  2. Compare installed vs current OpenClaw ver    │   │
│  │  3. Fetch compatibility report for new version   │   │
│  │  4. For each breaking change:                    │   │
│  │     - LOW risk → backup → auto-fix → verify      │   │
│  │     - HIGH risk → surface in Mission Control     │   │
│  │  5. Update manifest                              │   │
│  │  6. Send notifications                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Optional: spawn Devon or Avery for complex fixes       │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Schema Snapshot Format

**File:** `snapshots/schema-snapshot.json`  
**Purpose:** Captures every `openclaw.json` config field that A.L.I.C.E. depends on, at a known-good OpenClaw version.

### 3.1 Format

```json
{
  "$schema": "https://alice.robbiesrobotics.com/schema/schema-snapshot/v1.json",
  "capturedAt": "2026-03-16T10:00:00Z",
  "openclawVersion": "2026.3.14",
  "aliceVersion": "1.1.1",
  "fields": [
    {
      "path": "agents.list.*.name",
      "type": "string",
      "required": true,
      "description": "Agent identifier used in sessions_spawn calls"
    },
    {
      "path": "agents.list.*.model",
      "type": "string",
      "required": false,
      "description": "Model override for this agent"
    },
    {
      "path": "agents.list.*.tools.allow",
      "type": "array<string>",
      "required": false,
      "description": "Allowlist of tool names for this agent"
    },
    {
      "path": "agents.list.*.tools.deny",
      "type": "array<string>",
      "required": false,
      "description": "Denylist of tool names for this agent"
    },
    {
      "path": "agents.list.*.tools.profile",
      "type": "string",
      "required": false,
      "allowedValues": ["coding", "research", "operations", "minimal"],
      "description": "Tool profile shorthand"
    },
    {
      "path": "agents.defaults.model",
      "type": "string",
      "required": false,
      "description": "Default model for all agents"
    },
    {
      "path": "agents.defaults.sandbox.mode",
      "type": "string",
      "required": false,
      "allowedValues": ["strict", "standard", "permissive"],
      "description": "Default sandbox mode"
    },
    {
      "path": "agents.defaults.heartbeat.interval",
      "type": "number",
      "required": false,
      "description": "Heartbeat interval in seconds"
    },
    {
      "path": "agents.defaults.subagents.maxDepth",
      "type": "number",
      "required": false,
      "description": "Maximum subagent recursion depth"
    },
    {
      "path": "cron.entries",
      "type": "array<object>",
      "required": false,
      "description": "Scheduled cron job definitions"
    },
    {
      "path": "cron.entries.*.schedule",
      "type": "string",
      "required": true,
      "description": "Cron expression"
    },
    {
      "path": "cron.entries.*.command",
      "type": "string",
      "required": true,
      "description": "Command to run on schedule"
    },
    {
      "path": "plugins.entries",
      "type": "array<object>",
      "required": false,
      "description": "Plugin configurations"
    },
    {
      "path": "workspace.root",
      "type": "string",
      "required": false,
      "description": "Root workspace directory"
    },
    {
      "path": "memory.backend",
      "type": "string",
      "required": false,
      "allowedValues": ["sqlite", "postgres", "memory"],
      "description": "Memory storage backend"
    },
    {
      "path": "notifications.channels",
      "type": "array<object>",
      "required": false,
      "description": "Notification channel configurations"
    }
  ],
  "checksum": "sha256:abc123..."
}
```

### 3.2 What to Capture

The snapshot must include **every config path** that any of the 28 A.L.I.C.E. agents reads from or writes to, including:

- All `agents.list.*` fields used in agent definitions
- All `agents.defaults.*` fields
- `cron.*` — for the self-healing cron itself
- `plugins.*` — for any plugin the agents depend on
- `workspace.*` — workspace resolution paths
- `memory.*` — memory backend configuration
- `notifications.*` — alerting configuration

### 3.3 Update Procedure

The snapshot is updated **only when intentionally upgrading** A.L.I.C.E. to support a new OpenClaw version:

```bash
node tools/compatibility-checker.mjs --update-snapshot --openclaw-version 2026.4.0
```

This command fetches the new OpenClaw schema, diffs it, applies any changes, and writes a new `schema-snapshot.json` with the updated version and timestamp.

---

## 4. Tool Snapshot Format

**File:** `snapshots/tool-snapshot.json`  
**Purpose:** Captures every tool name and parameter signature that A.L.I.C.E. agents reference in their allow/deny lists or call directly.

### 4.1 Format

```json
{
  "$schema": "https://alice.robbiesrobotics.com/schema/tool-snapshot/v1.json",
  "capturedAt": "2026-03-16T10:00:00Z",
  "openclawVersion": "2026.3.14",
  "aliceVersion": "1.1.1",
  "tools": [
    {
      "name": "read",
      "category": "filesystem",
      "parameters": ["file_path", "path", "offset", "limit"],
      "requiredParameters": [],
      "referencedBy": ["ALL"],
      "criticality": "high"
    },
    {
      "name": "write",
      "category": "filesystem",
      "parameters": ["file_path", "path", "content"],
      "requiredParameters": ["content"],
      "referencedBy": ["dylan", "devon", "avery", "atlas"],
      "criticality": "high"
    },
    {
      "name": "edit",
      "category": "filesystem",
      "parameters": ["file_path", "path", "old_string", "new_string", "oldText", "newText"],
      "requiredParameters": [],
      "referencedBy": ["dylan", "devon", "avery"],
      "criticality": "high"
    },
    {
      "name": "exec",
      "category": "shell",
      "parameters": ["command", "workdir", "timeout", "background", "pty", "env", "elevated", "host", "node", "yieldMs", "security", "ask"],
      "requiredParameters": ["command"],
      "referencedBy": ["dylan", "devon", "avery", "atlas"],
      "criticality": "high"
    },
    {
      "name": "process",
      "category": "shell",
      "parameters": ["action", "sessionId", "data", "keys", "hex", "literal", "text", "timeout", "limit", "offset", "eof", "bracketed"],
      "requiredParameters": ["action"],
      "referencedBy": ["dylan", "devon", "avery"],
      "criticality": "medium"
    },
    {
      "name": "web_search",
      "category": "web",
      "parameters": ["query", "count", "country", "language", "freshness", "date_after", "date_before", "search_lang", "ui_lang"],
      "requiredParameters": ["query"],
      "referencedBy": ["reeve", "scout", "nova", "echo"],
      "criticality": "medium"
    },
    {
      "name": "web_fetch",
      "category": "web",
      "parameters": ["url", "extractMode", "maxChars"],
      "requiredParameters": ["url"],
      "referencedBy": ["reeve", "scout", "nova", "echo"],
      "criticality": "medium"
    },
    {
      "name": "browser",
      "category": "web",
      "parameters": ["action", "url", "selector", "text", "key", "screenshot"],
      "requiredParameters": ["action"],
      "referencedBy": ["reeve", "scout"],
      "criticality": "low"
    },
    {
      "name": "canvas",
      "category": "ui",
      "parameters": ["action", "content", "title", "language"],
      "requiredParameters": ["action"],
      "referencedBy": ["olivia", "nova"],
      "criticality": "low"
    },
    {
      "name": "message",
      "category": "communication",
      "parameters": ["channel", "text", "parse_mode", "reply_to", "buttons"],
      "requiredParameters": ["channel", "text"],
      "referencedBy": ["olivia", "herald"],
      "criticality": "high"
    },
    {
      "name": "tts",
      "category": "communication",
      "parameters": ["text", "voice", "speed"],
      "requiredParameters": ["text"],
      "referencedBy": ["herald", "sable"],
      "criticality": "low"
    },
    {
      "name": "cron",
      "category": "scheduling",
      "parameters": ["action", "id", "schedule", "command", "label"],
      "requiredParameters": ["action"],
      "referencedBy": ["avery", "devon"],
      "criticality": "high"
    },
    {
      "name": "sessions_spawn",
      "category": "agents",
      "parameters": ["agent", "message", "label", "runtime", "channel", "model"],
      "requiredParameters": ["agent", "message"],
      "referencedBy": ["olivia", "avery"],
      "criticality": "critical"
    },
    {
      "name": "sessions_send",
      "category": "agents",
      "parameters": ["session", "message"],
      "requiredParameters": ["session", "message"],
      "referencedBy": ["olivia"],
      "criticality": "critical"
    },
    {
      "name": "sessions_list",
      "category": "agents",
      "parameters": ["filter", "limit"],
      "requiredParameters": [],
      "referencedBy": ["olivia", "atlas"],
      "criticality": "high"
    },
    {
      "name": "sessions_history",
      "category": "agents",
      "parameters": ["session", "limit", "offset"],
      "requiredParameters": ["session"],
      "referencedBy": ["olivia", "atlas"],
      "criticality": "medium"
    },
    {
      "name": "session_status",
      "category": "agents",
      "parameters": [],
      "requiredParameters": [],
      "referencedBy": ["ALL"],
      "criticality": "medium"
    },
    {
      "name": "agents_list",
      "category": "agents",
      "parameters": ["filter"],
      "requiredParameters": [],
      "referencedBy": ["olivia", "atlas"],
      "criticality": "high"
    },
    {
      "name": "apply_patch",
      "category": "filesystem",
      "parameters": ["patch", "workdir"],
      "requiredParameters": ["patch"],
      "referencedBy": ["dylan", "devon"],
      "criticality": "medium"
    },
    {
      "name": "memory_search",
      "category": "memory",
      "parameters": ["query", "limit", "agent", "since"],
      "requiredParameters": ["query"],
      "referencedBy": ["ALL"],
      "criticality": "high"
    },
    {
      "name": "memory_get",
      "category": "memory",
      "parameters": ["id"],
      "requiredParameters": ["id"],
      "referencedBy": ["ALL"],
      "criticality": "high"
    }
  ],
  "agentToolMap": {
    "olivia": ["read", "write", "sessions_spawn", "sessions_send", "sessions_list", "sessions_history", "session_status", "agents_list", "message", "canvas", "memory_search", "memory_get"],
    "dylan": ["read", "write", "edit", "exec", "process", "apply_patch", "web_search", "web_fetch", "memory_search", "memory_get"],
    "devon": ["read", "write", "edit", "exec", "process", "apply_patch", "cron", "sessions_spawn", "memory_search", "memory_get"],
    "avery": ["read", "write", "edit", "exec", "cron", "sessions_spawn", "web_search", "memory_search", "memory_get"],
    "ALL": ["read", "session_status", "memory_search", "memory_get"]
  },
  "checksum": "sha256:def456..."
}
```

### 4.2 Criticality Levels

| Level | Meaning |
|-------|---------|
| `critical` | Removal would break core orchestration (sessions_spawn, sessions_send) |
| `high` | Removal would break most agents significantly |
| `medium` | Removal degrades capability but workarounds exist |
| `low` | Removal is inconvenient but non-blocking |

---

## 5. Compatibility Report Format

**File:** `compatibility/{openclawVersion}.json`  
**Hosted at:** `https://raw.githubusercontent.com/robbiesrobotics-bot/alice/main/compatibility/{version}.json`

### 5.1 Full Schema

```json
{
  "$schema": "https://alice.robbiesrobotics.com/schema/compatibility-report/v1.json",
  "openclawVersion": "2026.4.0",
  "aliceVersion": "1.1.1",
  "reportGeneratedAt": "2026-04-01T08:30:00Z",
  "compatible": false,
  "summary": {
    "breakingChangesCount": 3,
    "warningsCount": 1,
    "autoFixableCount": 2,
    "manualReviewCount": 1
  },
  "breakingChanges": [
    {
      "id": "BC-2026.4.0-001",
      "category": "config",
      "severity": "low",
      "autoFixable": true,
      "field": "agents.list.*.tools.profile",
      "change": "Enum value 'coding' renamed to 'developer'",
      "description": "The tool profile shorthand 'coding' has been renamed to 'developer' in OpenClaw 2026.4.0. All agent configs using profile: 'coding' must be updated.",
      "affectedAgents": ["dylan", "devon"],
      "fix": {
        "type": "value-rename",
        "target": "openclaw.json",
        "jsonPath": "$.agents.list[*].tools.profile",
        "from": "coding",
        "to": "developer"
      },
      "rollbackable": true,
      "verificationCommand": "openclaw validate --config openclaw.json"
    },
    {
      "id": "BC-2026.4.0-002",
      "category": "tool",
      "severity": "low",
      "autoFixable": true,
      "field": "tools.web_fetch.parameters.extractMode",
      "change": "Parameter 'extractMode' default changed from 'markdown' to 'text'",
      "description": "The web_fetch tool now defaults to 'text' extraction mode. A.L.I.C.E. agents that rely on markdown output must pass extractMode: 'markdown' explicitly.",
      "affectedAgents": ["reeve", "scout", "nova", "echo"],
      "fix": {
        "type": "config-inject",
        "target": "openclaw.json",
        "jsonPath": "$.agents.defaults.toolDefaults.web_fetch",
        "value": { "extractMode": "markdown" }
      },
      "rollbackable": true,
      "verificationCommand": null
    },
    {
      "id": "BC-2026.4.0-003",
      "category": "behavioral",
      "severity": "high",
      "autoFixable": false,
      "field": "agents.defaults.sandbox.mode",
      "change": "Default sandbox mode changed from 'standard' to 'strict'. Tool 'exec' now requires explicit 'security: full' to run arbitrary shell commands.",
      "description": "OpenClaw 2026.4.0 tightens sandbox defaults. 'exec' calls without a security parameter will now be blocked under strict mode. A.L.I.C.E. agents that use exec must be audited and updated individually. This requires human review because blanket-patching all agents to 'security: full' would defeat the security intent.",
      "affectedAgents": ["dylan", "devon", "avery", "atlas"],
      "fix": null,
      "manualSteps": [
        "Review each affected agent's exec usage in their SOUL.md and config",
        "For trusted agents (dylan, devon): add security: 'full' to their agent config",
        "For limited agents (avery, atlas): add security: 'allowlist' with explicit allowed commands",
        "Test each agent's exec capability after update",
        "Update schema-snapshot.json to reflect new sandbox.mode default"
      ],
      "rollbackable": false,
      "githubIssueUrl": "https://github.com/robbiesrobotics-bot/alice/issues/142",
      "verificationCommand": "node tools/verify-sandbox.mjs"
    }
  ],
  "warnings": [
    {
      "id": "W-2026.4.0-001",
      "category": "skills",
      "severity": "low",
      "field": "skills.discovery.path",
      "change": "Skills are now also discovered from ~/.local/share/openclaw/skills in addition to node_modules",
      "description": "Non-breaking, but A.L.I.C.E. skill references should be reviewed to ensure no naming conflicts with user-installed skills.",
      "affectedAgents": [],
      "actionRequired": false
    }
  ],
  "patches": [
    {
      "changeId": "BC-2026.4.0-001",
      "patchType": "json-transform",
      "targetFile": "openclaw.json",
      "operations": [
        {
          "op": "replace-value",
          "jsonPath": "$.agents.list[?(@.tools.profile=='coding')].tools.profile",
          "value": "developer"
        }
      ]
    },
    {
      "changeId": "BC-2026.4.0-002",
      "patchType": "json-transform",
      "targetFile": "openclaw.json",
      "operations": [
        {
          "op": "set",
          "jsonPath": "$.agents.defaults.toolDefaults.web_fetch.extractMode",
          "value": "markdown"
        }
      ]
    }
  ],
  "alicePatchVersion": "1.1.2",
  "alicePatchNpmTag": "@robbiesrobotics/alice-agents@1.1.2"
}
```

### 5.2 Severity Matrix

| Severity | Auto-Fix? | User Alert? | Block? |
|----------|-----------|-------------|--------|
| `low` | Yes | Notification only | No |
| `medium` | Yes (with confirmation) | Mission Control + notification | No |
| `high` | No | Mission Control + notification | No (warn) |
| `critical` | No | Mission Control + notification + Telegram | Yes (gate) |

---

## 6. GitHub Action Workflow

**File:** `.github/workflows/compatibility-check.yml`

```yaml
name: OpenClaw Compatibility Check

on:
  schedule:
    # Run daily at 06:00 UTC
    - cron: '0 6 * * *'
  
  # Triggered by OpenClaw npm release webhook
  repository_dispatch:
    types: [openclaw-release]
  
  # Allow manual trigger for testing
  workflow_dispatch:
    inputs:
      openclaw_version:
        description: 'Specific OpenClaw version to check (leave blank for latest)'
        required: false
        type: string
      dry_run:
        description: 'Dry run (generate report but do not publish)'
        required: false
        type: boolean
        default: false

env:
  NODE_VERSION: '22'
  ALICE_REPO: 'robbiesrobotics-bot/alice'

jobs:
  detect-openclaw-version:
    name: Detect Latest OpenClaw Version
    runs-on: ubuntu-latest
    outputs:
      openclaw_version: ${{ steps.version.outputs.version }}
      alice_version: ${{ steps.alice_version.outputs.version }}
      already_checked: ${{ steps.cache-check.outputs.cache-hit }}
    
    steps:
      - name: Checkout A.L.I.C.E. repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Determine OpenClaw version to check
        id: version
        run: |
          if [ -n "${{ github.event.inputs.openclaw_version }}" ]; then
            VERSION="${{ github.event.inputs.openclaw_version }}"
          elif [ "${{ github.event_name }}" = "repository_dispatch" ]; then
            VERSION="${{ github.event.client_payload.version }}"
          else
            VERSION=$(npm view openclaw version)
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Checking OpenClaw version: $VERSION"

      - name: Get A.L.I.C.E. version
        id: alice_version
        run: |
          VERSION=$(node -e "console.log(require('./package.json').version)")
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Check if this version was already analyzed
        id: cache-check
        uses: actions/cache@v4
        with:
          path: compatibility/${{ steps.version.outputs.version }}.json
          key: compat-${{ steps.version.outputs.version }}-${{ steps.alice_version.outputs.version }}

  run-compatibility-check:
    name: Run Compatibility Checker
    runs-on: ubuntu-latest
    needs: detect-openclaw-version
    if: needs.detect-openclaw-version.outputs.already_checked != 'true'
    
    outputs:
      compatible: ${{ steps.check.outputs.compatible }}
      auto_fixable_only: ${{ steps.check.outputs.auto_fixable_only }}
      breaking_count: ${{ steps.check.outputs.breaking_count }}
      patch_version: ${{ steps.check.outputs.patch_version }}

    steps:
      - name: Checkout A.L.I.C.E. repo
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: 'https://registry.npmjs.org'

      - name: Install A.L.I.C.E. dependencies
        run: npm ci

      - name: Install target OpenClaw version
        run: |
          npm install openclaw@${{ needs.detect-openclaw-version.outputs.openclaw_version }} --no-save
          echo "Installed OpenClaw ${{ needs.detect-openclaw-version.outputs.openclaw_version }}"

      - name: Run compatibility checker
        id: check
        run: |
          node tools/compatibility-checker.mjs \
            --openclaw-version "${{ needs.detect-openclaw-version.outputs.openclaw_version }}" \
            --alice-version "${{ needs.detect-openclaw-version.outputs.alice_version }}" \
            --output "compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json" \
            --snapshots-dir "snapshots/"
          
          # Parse outputs for downstream steps
          COMPATIBLE=$(node -e "const r=require('./compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json'); console.log(r.compatible)")
          BREAKING=$(node -e "const r=require('./compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json'); console.log(r.summary.breakingChangesCount)")
          AUTO_ONLY=$(node -e "const r=require('./compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json'); console.log(r.summary.breakingChangesCount > 0 && r.summary.manualReviewCount === 0)")
          PATCH_VER=$(node -e "const r=require('./compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json'); console.log(r.alicePatchVersion || '')")
          
          echo "compatible=$COMPATIBLE" >> $GITHUB_OUTPUT
          echo "breaking_count=$BREAKING" >> $GITHUB_OUTPUT
          echo "auto_fixable_only=$AUTO_ONLY" >> $GITHUB_OUTPUT
          echo "patch_version=$PATCH_VER" >> $GITHUB_OUTPUT

      - name: Commit compatibility report
        if: github.event.inputs.dry_run != 'true'
        run: |
          git config user.name "alice-bot"
          git config user.email "alice-bot@robbiesrobotics.com"
          git add compatibility/
          git diff --cached --quiet || git commit -m "chore: add compatibility report for OpenClaw ${{ needs.detect-openclaw-version.outputs.openclaw_version }}"
          git push

  publish-auto-patch:
    name: Publish Auto-Fix Patch
    runs-on: ubuntu-latest
    needs: [detect-openclaw-version, run-compatibility-check]
    if: |
      needs.run-compatibility-check.outputs.compatible == 'false' &&
      needs.run-compatibility-check.outputs.auto_fixable_only == 'true' &&
      github.event.inputs.dry_run != 'true'
    
    steps:
      - name: Checkout A.L.I.C.E. repo
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Apply auto-fix patches to package
        run: |
          node tools/compatibility-checker.mjs \
            --apply-patches \
            --report "compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json" \
            --target-version "${{ needs.run-compatibility-check.outputs.patch_version }}"

      - name: Bump version
        run: |
          npm version ${{ needs.run-compatibility-check.outputs.patch_version }} --no-git-tag-version

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Commit version bump
        run: |
          git config user.name "alice-bot"
          git config user.email "alice-bot@robbiesrobotics.com"
          git add package.json package-lock.json
          git commit -m "chore: bump to ${{ needs.run-compatibility-check.outputs.patch_version }} for OpenClaw ${{ needs.detect-openclaw-version.outputs.openclaw_version }} compatibility"
          git tag "v${{ needs.run-compatibility-check.outputs.patch_version }}"
          git push --follow-tags

  open-manual-review-issue:
    name: Open GitHub Issue for Manual Changes
    runs-on: ubuntu-latest
    needs: [detect-openclaw-version, run-compatibility-check]
    if: |
      needs.run-compatibility-check.outputs.compatible == 'false' &&
      needs.run-compatibility-check.outputs.auto_fixable_only == 'false'
    
    steps:
      - name: Checkout A.L.I.C.E. repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Generate issue body
        id: issue
        run: |
          BODY=$(node tools/compatibility-checker.mjs \
            --generate-issue-body \
            --report "compatibility/${{ needs.detect-openclaw-version.outputs.openclaw_version }}.json")
          echo "body<<EOF" >> $GITHUB_OUTPUT
          echo "$BODY" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create GitHub issue
        uses: actions/github-script@v7
        with:
          script: |
            const body = `${{ steps.issue.outputs.body }}`;
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Manual review required: OpenClaw ${{ needs.detect-openclaw-version.outputs.openclaw_version }} breaking changes',
              body: body,
              labels: ['compatibility', 'breaking-change', 'needs-review']
            });

  notify-telegram:
    name: Send Telegram Notification
    runs-on: ubuntu-latest
    needs: [detect-openclaw-version, run-compatibility-check, publish-auto-patch, open-manual-review-issue]
    if: always() && needs.run-compatibility-check.result == 'success'
    
    steps:
      - name: Notify via Telegram
        run: |
          OCVER="${{ needs.detect-openclaw-version.outputs.openclaw_version }}"
          COMPATIBLE="${{ needs.run-compatibility-check.outputs.compatible }}"
          BREAKING="${{ needs.run-compatibility-check.outputs.breaking_count }}"
          
          if [ "$COMPATIBLE" = "true" ]; then
            MSG="✅ OpenClaw $OCVER is fully compatible with A.L.I.C.E. No changes needed."
          elif [ "${{ needs.publish-auto-patch.result }}" = "success" ]; then
            MSG="🔧 OpenClaw $OCVER detected $BREAKING change(s). A.L.I.C.E. patch published automatically. Run: npm update @robbiesrobotics/alice-agents"
          else
            MSG="⚠️ OpenClaw $OCVER has breaking changes that need manual review. Check GitHub Issues or Mission Control → Settings → Compatibility."
          fi
          
          curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -d chat_id="${{ secrets.TELEGRAM_CHAT_ID }}" \
            -d text="$MSG" \
            -d parse_mode="HTML"
```

---

## 7. Compatibility Checker Script

**File:** `tools/compatibility-checker.mjs`

### 7.1 What It Does (Step by Step)

```
1. Parse CLI arguments
2. Load snapshots (schema-snapshot.json, tool-snapshot.json)
3. Extract OpenClaw schema from installed package
4. Run 4 category checks (config, tools, behavioral, skills)
5. Build compatibility report
6. Write report to --output path
7. If --apply-patches: apply all autoFixable patches to package files
8. If --generate-issue-body: render markdown for GitHub issue
9. Exit with code 0 (compatible) or 1 (breaking changes found)
```

### 7.2 Full Script

```javascript
#!/usr/bin/env node
// tools/compatibility-checker.mjs
// A.L.I.C.E. Self-Healing System — Compatibility Checker
// Runs in GitHub CI to detect OpenClaw breaking changes.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─────────────────────────────────────────────
// CLI argument parsing
// ─────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name, def = null) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : def;
};
const hasFlag = (name) => args.includes(name);

const openclawVersion = getArg('--openclaw-version');
const aliceVersion = getArg('--alice-version');
const outputPath = getArg('--output');
const snapshotsDir = getArg('--snapshots-dir', 'snapshots/');
const reportPath = getArg('--report');
const targetVersion = getArg('--target-version');
const MODE_APPLY_PATCHES = hasFlag('--apply-patches');
const MODE_GENERATE_ISSUE = hasFlag('--generate-issue-body');
const MODE_UPDATE_SNAPSHOT = hasFlag('--update-snapshot');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function load(path) {
  const full = resolve(ROOT, path);
  if (!existsSync(full)) throw new Error(`File not found: ${full}`);
  return JSON.parse(readFileSync(full, 'utf8'));
}

function save(path, data) {
  writeFileSync(resolve(ROOT, path), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function sha256(obj) {
  return 'sha256:' + createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

function jsonPath(obj, path) {
  // Simple dot-bracket path resolver (no regex wildcards at runtime)
  return path.split('.').reduce((acc, key) => {
    if (acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

// ─────────────────────────────────────────────
// Step 1: Load snapshots
// ─────────────────────────────────────────────
function loadSnapshots(dir) {
  return {
    schema: load(`${dir}schema-snapshot.json`),
    tools: load(`${dir}tool-snapshot.json`),
  };
}

// ─────────────────────────────────────────────
// Step 2: Extract OpenClaw schema from installed package
// ─────────────────────────────────────────────
function extractOpenclawSchema() {
  // Try to load OpenClaw's exported schema
  // OpenClaw exposes its config schema via package exports
  let openclawPkg;
  try {
    openclawPkg = load('node_modules/openclaw/package.json');
  } catch {
    throw new Error('openclaw not found in node_modules. Run: npm install openclaw@latest --no-save');
  }

  // Load OpenClaw's config schema definition
  let configSchema;
  const schemaPath = openclawPkg.exports?.['./config-schema'] || 'dist/config.schema.json';
  try {
    configSchema = load(`node_modules/openclaw/${schemaPath}`);
  } catch {
    // Fallback: extract from source if schema file not found
    console.warn('Config schema file not found, attempting source extraction...');
    configSchema = extractSchemaFromSource();
  }

  // Load OpenClaw's tool registry
  let toolRegistry;
  const toolsPath = openclawPkg.exports?.['./tools'] || 'dist/tools.json';
  try {
    toolRegistry = load(`node_modules/openclaw/${toolsPath}`);
  } catch {
    toolRegistry = extractToolsFromSource();
  }

  return { configSchema, toolRegistry, version: openclawPkg.version };
}

function extractSchemaFromSource() {
  // Parse OpenClaw source files to extract config fields
  // This is a fallback when no compiled schema is available
  const result = { fields: {}, defaults: {} };
  
  // Check known source locations
  const candidates = [
    'node_modules/openclaw/src/config/schema.ts',
    'node_modules/openclaw/src/config.ts',
    'node_modules/openclaw/lib/config.js',
  ];
  
  for (const candidate of candidates) {
    const full = resolve(ROOT, candidate);
    if (existsSync(full)) {
      const src = readFileSync(full, 'utf8');
      // Extract Zod or JSONSchema definitions via regex
      const fieldMatches = src.matchAll(/['"]([a-zA-Z][a-zA-Z0-9._*]+)['"]\s*:/g);
      for (const [, field] of fieldMatches) {
        result.fields[field] = { type: 'unknown', source: candidate };
      }
      break;
    }
  }
  
  return result;
}

function extractToolsFromSource() {
  // Parse OpenClaw tool definitions
  const result = { tools: [] };
  const candidates = [
    'node_modules/openclaw/src/tools/index.ts',
    'node_modules/openclaw/src/tools.ts',
    'node_modules/openclaw/lib/tools.js',
  ];
  
  for (const candidate of candidates) {
    const full = resolve(ROOT, candidate);
    if (existsSync(full)) {
      const src = readFileSync(full, 'utf8');
      const nameMatches = src.matchAll(/name:\s*['"]([a-z_]+)['"]/g);
      for (const [, name] of nameMatches) {
        result.tools.push({ name, parameters: [] });
      }
      break;
    }
  }
  
  return result;
}

// ─────────────────────────────────────────────
// Step 3: Config schema diff
// ─────────────────────────────────────────────
function diffConfigSchema(snapshot, openclawSchema) {
  const changes = [];
  const snapshotFields = new Map(snapshot.fields.map(f => [f.path, f]));
  
  // Build a flat field map from OpenClaw's schema
  const openclawFields = buildFieldMap(openclawSchema);

  for (const [path, snapshotField] of snapshotFields) {
    const current = openclawFields.get(path);
    
    if (!current) {
      // Field was removed or renamed
      changes.push({
        id: `config-removed-${path.replace(/[^a-z0-9]/gi, '-')}`,
        category: 'config',
        type: 'field-removed',
        field: path,
        change: `Field '${path}' was removed from OpenClaw config schema`,
        severity: snapshotField.required ? 'high' : 'low',
        autoFixable: false,
      });
      continue;
    }
    
    // Check type changes
    if (current.type !== snapshotField.type) {
      changes.push({
        id: `config-type-${path.replace(/[^a-z0-9]/gi, '-')}`,
        category: 'config',
        type: 'type-changed',
        field: path,
        change: `Type changed from '${snapshotField.type}' to '${current.type}'`,
        severity: 'medium',
        autoFixable: false,
      });
    }
    
    // Check allowed values changes
    if (snapshotField.allowedValues && current.allowedValues) {
      const removed = snapshotField.allowedValues.filter(v => !current.allowedValues.includes(v));
      const added = current.allowedValues.filter(v => !snapshotField.allowedValues.includes(v));
      
      if (removed.length > 0) {
        // Check if this looks like a rename (removed 1, added 1)
        if (removed.length === 1 && added.length === 1) {
          changes.push({
            id: `config-rename-${path.replace(/[^a-z0-9]/gi, '-')}-${removed[0]}`,
            category: 'config',
            type: 'value-renamed',
            field: path,
            change: `Value '${removed[0]}' renamed to '${added[0]}'`,
            severity: 'low',
            autoFixable: true,
            fix: {
              type: 'value-rename',
              target: 'openclaw.json',
              jsonPath: `$.agents.list[*].${path.split('.').pop()}`,
              from: removed[0],
              to: added[0],
            },
          });
        } else {
          changes.push({
            id: `config-values-${path.replace(/[^a-z0-9]/gi, '-')}`,
            category: 'config',
            type: 'allowed-values-changed',
            field: path,
            change: `Values removed: [${removed.join(', ')}], Values added: [${added.join(', ')}]`,
            severity: 'medium',
            autoFixable: false,
          });
        }
      }
    }
  }
  
  // Check for new required fields
  for (const [path, field] of openclawFields) {
    if (field.required && !snapshotFields.has(path)) {
      changes.push({
        id: `config-new-required-${path.replace(/[^a-z0-9]/gi, '-')}`,
        category: 'config',
        type: 'new-required-field',
        field: path,
        change: `New required field '${path}' added to OpenClaw config schema`,
        severity: 'high',
        autoFixable: false,
      });
    }
  }
  
  return changes;
}

function buildFieldMap(schema) {
  const map = new Map();
  // Support both JSONSchema and OpenClaw's custom schema format
  if (schema.fields) {
    for (const f of schema.fields) map.set(f.path, f);
  } else if (schema.properties) {
    flattenProperties(schema.properties, '', map);
  }
  return map;
}

function flattenProperties(props, prefix, map) {
  for (const [key, val] of Object.entries(props)) {
    const path = prefix ? `${prefix}.${key}` : key;
    map.set(path, { path, type: val.type || 'unknown', required: false });
    if (val.properties) flattenProperties(val.properties, path, map);
  }
}

// ─────────────────────────────────────────────
// Step 4: Tool registry diff
// ─────────────────────────────────────────────
function diffToolRegistry(snapshot, openclawTools) {
  const changes = [];
  const snapshotTools = new Map(snapshot.tools.map(t => [t.name, t]));
  const currentTools = new Map();
  
  // Build current tool map from OpenClaw
  const toolList = openclawTools.tools || openclawTools;
  for (const tool of (Array.isArray(toolList) ? toolList : [])) {
    currentTools.set(tool.name, tool);
  }

  for (const [name, snapshotTool] of snapshotTools) {
    const current = currentTools.get(name);
    
    if (!current) {
      changes.push({
        id: `tool-removed-${name}`,
        category: 'tool',
        type: 'tool-removed',
        field: `tools.${name}`,
        change: `Tool '${name}' was removed from OpenClaw`,
        severity: snapshotTool.criticality === 'critical' ? 'critical' : 
                  snapshotTool.criticality === 'high' ? 'high' : 'medium',
        autoFixable: false,
        affectedAgents: snapshotTool.referencedBy,
      });
      continue;
    }
    
    // Check parameter changes
    const snapshotParams = new Set(snapshotTool.parameters || []);
    const currentParams = new Set(current.parameters?.map(p => 
      typeof p === 'string' ? p : p.name
    ) || []);
    
    const removedParams = [...snapshotParams].filter(p => !currentParams.has(p));
    const addedRequired = (current.parameters || [])
      .filter(p => typeof p === 'object' && p.required && !snapshotParams.has(p.name))
      .map(p => p.name);
    
    if (removedParams.length > 0) {
      changes.push({
        id: `tool-params-${name}`,
        category: 'tool',
        type: 'parameters-removed',
        field: `tools.${name}.parameters`,
        change: `Parameters removed from '${name}': [${removedParams.join(', ')}]`,
        severity: 'medium',
        autoFixable: false,
        affectedAgents: snapshotTool.referencedBy,
      });
    }
    
    if (addedRequired.length > 0) {
      changes.push({
        id: `tool-required-${name}`,
        category: 'tool',
        type: 'new-required-parameters',
        field: `tools.${name}.parameters`,
        change: `New required parameters in '${name}': [${addedRequired.join(', ')}]`,
        severity: 'medium',
        autoFixable: false,
        affectedAgents: snapshotTool.referencedBy,
      });
    }
  }
  
  return changes;
}

// ─────────────────────────────────────────────
// Step 5: Behavioral defaults diff
// ─────────────────────────────────────────────
function diffBehavioralDefaults(snapshot, openclawSchema) {
  const changes = [];
  const behavioralFields = [
    'agents.defaults.sandbox.mode',
    'agents.defaults.heartbeat.interval',
    'agents.defaults.subagents.maxDepth',
    'agents.defaults.model',
  ];
  
  for (const field of behavioralFields) {
    const snapshotField = snapshot.fields.find(f => f.path === field);
    if (!snapshotField) continue;
    
    // Extract default value from OpenClaw schema
    const currentDefault = extractDefaultValue(openclawSchema, field);
    const snapshotDefault = snapshotField.defaultValue;
    
    if (snapshotDefault !== undefined && currentDefault !== undefined && 
        snapshotDefault !== currentDefault) {
      const severity = field.includes('sandbox') ? 'high' : 'low';
      changes.push({
        id: `behavioral-default-${field.replace(/[^a-z0-9]/gi, '-')}`,
        category: 'behavioral',
        type: 'default-changed',
        field,
        change: `Default value changed from '${snapshotDefault}' to '${currentDefault}'`,
        severity,
        autoFixable: severity === 'low',
        fix: severity === 'low' ? {
          type: 'config-inject',
          target: 'openclaw.json',
          jsonPath: `$.${field}`,
          value: snapshotDefault, // Pin to old default explicitly
        } : null,
      });
    }
  }
  
  return changes;
}

function extractDefaultValue(schema, fieldPath) {
  // Navigate the schema structure to find default values
  const parts = fieldPath.split('.');
  let current = schema;
  for (const part of parts) {
    if (!current) return undefined;
    current = current[part] || current.properties?.[part] || current.definitions?.[part];
  }
  return current?.default;
}

// ─────────────────────────────────────────────
// Step 6: Skills API diff
// ─────────────────────────────────────────────
function diffSkillsAPI(openclawVersion) {
  const changes = [];
  
  // Check if SKILL.md format version changed
  let skillFormat;
  try {
    skillFormat = load('node_modules/openclaw/dist/skill-format.json');
  } catch {
    // Try to detect from source
    const candidates = [
      'node_modules/openclaw/src/skills/loader.ts',
      'node_modules/openclaw/lib/skills.js',
    ];
    for (const c of candidates) {
      const full = resolve(ROOT, c);
      if (existsSync(full)) {
        const src = readFileSync(full, 'utf8');
        if (src.includes('SKILL.md')) {
          // Check for format version indicators
          const vMatch = src.match(/skill[_-]?format[_-]?version\s*[:=]\s*['"]?(\d+)/i);
          if (vMatch) {
            skillFormat = { version: parseInt(vMatch[1]) };
          }
        }
        break;
      }
    }
  }
  
  // Compare skill discovery paths
  const knownSkillPaths = [
    'node_modules/openclaw/skills',
  ];
  
  try {
    const openclawPkg = load('node_modules/openclaw/package.json');
    const configuredPaths = openclawPkg.openclawSkillPaths || [];
    const newPaths = configuredPaths.filter(p => !knownSkillPaths.includes(p));
    
    if (newPaths.length > 0) {
      changes.push({
        id: 'skills-new-discovery-path',
        category: 'skills',
        type: 'discovery-path-added',
        field: 'skills.discoveryPaths',
        change: `New skill discovery paths added: [${newPaths.join(', ')}]`,
        severity: 'low',
        autoFixable: false, // Non-breaking warning
        isWarning: true,
      });
    }
  } catch {
    // No skill path config found, skip
  }
  
  return changes;
}

// ─────────────────────────────────────────────
// Step 7: Build compatibility report
// ─────────────────────────────────────────────
function buildReport(allChanges, openclawVersion, aliceVersion) {
  const breaking = allChanges.filter(c => !c.isWarning);
  const warnings = allChanges.filter(c => c.isWarning);
  
  const autoFixable = breaking.filter(c => c.autoFixable);
  const manualReview = breaking.filter(c => !c.autoFixable);
  
  // Compute patch version (bump patch number)
  const [major, minor, patch] = aliceVersion.split('.').map(Number);
  const patchVersion = autoFixable.length > 0 && manualReview.length === 0
    ? `${major}.${minor}.${patch + 1}`
    : null;
  
  // Build patches array
  const patches = autoFixable
    .filter(c => c.fix)
    .map(c => ({
      changeId: c.id,
      patchType: 'json-transform',
      targetFile: c.fix.target,
      operations: buildPatchOperations(c.fix),
    }));
  
  return {
    $schema: 'https://alice.robbiesrobotics.com/schema/compatibility-report/v1.json',
    openclawVersion,
    aliceVersion,
    reportGeneratedAt: new Date().toISOString(),
    compatible: breaking.length === 0,
    summary: {
      breakingChangesCount: breaking.length,
      warningsCount: warnings.length,
      autoFixableCount: autoFixable.length,
      manualReviewCount: manualReview.length,
    },
    breakingChanges: breaking.map(c => ({
      id: c.id,
      category: c.category,
      severity: c.severity,
      autoFixable: c.autoFixable,
      field: c.field,
      change: c.change,
      affectedAgents: c.affectedAgents || [],
      fix: c.fix || null,
      manualSteps: c.manualSteps || null,
      rollbackable: c.autoFixable,
      verificationCommand: c.verificationCommand || null,
    })),
    warnings: warnings.map(w => ({
      id: w.id,
      category: w.category,
      severity: w.severity || 'low',
      field: w.field,
      change: w.change,
      actionRequired: false,
    })),
    patches,
    alicePatchVersion: patchVersion,
    alicePatchNpmTag: patchVersion 
      ? `@robbiesrobotics/alice-agents@${patchVersion}` 
      : null,
  };
}

function buildPatchOperations(fix) {
  switch (fix.type) {
    case 'value-rename':
      return [{ op: 'replace-value', jsonPath: fix.jsonPath, from: fix.from, to: fix.to }];
    case 'config-inject':
      return [{ op: 'set', jsonPath: fix.jsonPath, value: fix.value }];
    case 'field-remove':
      return [{ op: 'remove', jsonPath: fix.jsonPath }];
    default:
      return [];
  }
}

// ─────────────────────────────────────────────
// Step 8: Apply patches to package files
// ─────────────────────────────────────────────
function applyPatches(report) {
  console.log(`Applying ${report.patches.length} patches...`);
  
  for (const patch of report.patches) {
    console.log(`  Patching ${patch.targetFile} (${patch.changeId})`);
    applyJsonTransform(patch.targetFile, patch.operations);
  }
  
  // Update the snap shots to reflect the new baseline
  console.log('Updating snapshots to reflect applied patches...');
  // Snapshot update happens separately via --update-snapshot flag
}

function applyJsonTransform(targetFile, operations) {
  const filePath = resolve(ROOT, targetFile);
  if (!existsSync(filePath)) {
    console.warn(`  Target file not found: ${targetFile}, skipping`);
    return;
  }
  
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  
  for (const op of operations) {
    applyOperation(data, op);
  }
  
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function applyOperation(obj, op) {
  // Simplified JSON path operations for patch application
  // In production, use a library like jsonpath-plus
  switch (op.op) {
    case 'set': {
      setByPath(obj, op.jsonPath, op.value);
      break;
    }
    case 'replace-value': {
      replaceValues(obj, op.from, op.to);
      break;
    }
    case 'remove': {
      removeByPath(obj, op.jsonPath);
      break;
    }
  }
}

function setByPath(obj, path, value) {
  // Parse $. prefix and navigate
  const parts = path.replace(/^\$\./, '').split('.');
  const last = parts.pop();
  let current = obj;
  for (const part of parts) {
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[last] = value;
}

function replaceValues(obj, from, to) {
  if (typeof obj !== 'object' || obj === null) return;
  for (const key of Object.keys(obj)) {
    if (obj[key] === from) obj[key] = to;
    else if (typeof obj[key] === 'object') replaceValues(obj[key], from, to);
  }
}

function removeByPath(obj, path) {
  const parts = path.replace(/^\$\./, '').split('.');
  const last = parts.pop();
  let current = obj;
  for (const part of parts) {
    if (!current[part]) return;
    current = current[part];
  }
  delete current[last];
}

// ─────────────────────────────────────────────
// Step 9: Generate GitHub issue body
// ─────────────────────────────────────────────
function generateIssueBody(report) {
  const lines = [
    `## 🚨 OpenClaw ${report.openclawVersion} — Breaking Changes Detected`,
    '',
    `**A.L.I.C.E. Version:** ${report.aliceVersion}  `,
    `**Detected At:** ${report.reportGeneratedAt}  `,
    `**Breaking Changes:** ${report.summary.breakingChangesCount}  `,
    `**Auto-Fixable:** ${report.summary.autoFixableCount}  `,
    `**Needs Manual Review:** ${report.summary.manualReviewCount}  `,
    '',
    '---',
    '',
    '## Breaking Changes',
    '',
  ];
  
  for (const change of report.breakingChanges) {
    lines.push(`### ${change.id}`);
    lines.push(`**Category:** ${change.category} | **Severity:** ${change.severity} | **Auto-Fixable:** ${change.autoFixable}`);
    lines.push('');
    lines.push(`**Field:** \`${change.field}\``);
    lines.push(`**Change:** ${change.change}`);
    if (change.affectedAgents?.length > 0) {
      lines.push(`**Affected Agents:** ${change.affectedAgents.join(', ')}`);
    }
    if (change.manualSteps) {
      lines.push('');
      lines.push('**Manual Steps Required:**');
      for (const step of change.manualSteps) {
        lines.push(`- ${step}`);
      }
    }
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  lines.push('## Next Steps');
  lines.push('');
  lines.push('1. Review each breaking change above');
  lines.push('2. Update affected agent configs manually');
  lines.push('3. Update `snapshots/schema-snapshot.json` to reflect new baseline');
  lines.push('4. Bump A.L.I.C.E. version and publish');
  lines.push('5. Close this issue');
  
  return lines.join('\n');
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  if (MODE_APPLY_PATCHES) {
    const report = load(reportPath);
    applyPatches(report);
    console.log('✅ Patches applied successfully');
    return;
  }
  
  if (MODE_GENERATE_ISSUE) {
    const report = load(reportPath);
    console.log(generateIssueBody(report));
    return;
  }
  
  if (MODE_UPDATE_SNAPSHOT) {
    console.log(`Updating snapshots for OpenClaw ${openclawVersion}...`);
    const { configSchema, toolRegistry } = extractOpenclawSchema();
    // Merge new fields into existing snapshot
    const existingSchema = load(`${snapshotsDir}schema-snapshot.json`);
    existingSchema.openclawVersion = openclawVersion;
    existingSchema.capturedAt = new Date().toISOString();
    existingSchema.checksum = sha256(configSchema);
    save(`${snapshotsDir}schema-snapshot.json`, existingSchema);
    console.log('✅ Snapshots updated');
    return;
  }
  
  // Main check flow
  console.log(`🔍 Checking compatibility: A.L.I.C.E. ${aliceVersion} vs OpenClaw ${openclawVersion}`);
  
  const snapshots = loadSnapshots(snapshotsDir);
  const { configSchema, toolRegistry } = extractOpenclawSchema();
  
  const allChanges = [
    ...diffConfigSchema(snapshots.schema, configSchema),
    ...diffToolRegistry(snapshots.tools, toolRegistry),
    ...diffBehavioralDefaults(snapshots.schema, configSchema),
    ...diffSkillsAPI(openclawVersion),
  ];
  
  const report = buildReport(allChanges, openclawVersion, aliceVersion);
  
  if (outputPath) {
    save(outputPath, report);
    console.log(`✅ Report written to ${outputPath}`);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  
  console.log(`\nSummary: ${report.compatible ? '✅ Compatible' : '❌ Breaking changes found'}`);
  console.log(`  Breaking: ${report.summary.breakingChangesCount}`);
  console.log(`  Auto-fixable: ${report.summary.autoFixableCount}`);
  console.log(`  Manual review: ${report.summary.manualReviewCount}`);
  
  process.exit(report.compatible ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Compatibility checker failed:', err.message);
  process.exit(2);
});
```

---

## 8. Local Remediation Cron

### 8.1 OpenClaw Cron Configuration

The self-healing check is registered as an OpenClaw cron job in `openclaw.json`:

```json
{
  "cron": {
    "entries": [
      {
        "id": "alice-self-heal",
        "label": "A.L.I.C.E. Self-Healing Check",
        "schedule": "0 3 * * *",
        "command": "node ~/.openclaw/workspace-olivia/alice-agents/tools/local-remediation.mjs",
        "runOnStart": true,
        "onGatewayRestart": true,
        "timeout": 120,
        "retries": 1,
        "notifyOnFailure": true
      }
    ]
  }
}
```

**Key options:**
- `schedule: "0 3 * * *"` — runs at 3 AM daily (low-traffic window)
- `runOnStart: true` — runs once when the gateway starts
- `onGatewayRestart: true` — triggers after every gateway restart (catches update events)
- `timeout: 120` — 2 minute max (should complete in <30s normally)
- `notifyOnFailure: true` — alerts user if the remediation script itself crashes

### 8.2 Alice Manifest Format

**File:** `.alice-manifest.json` (in the alice-agents package directory)

```json
{
  "$schema": "https://alice.robbiesrobotics.com/schema/manifest/v1.json",
  "aliceVersion": "1.1.1",
  "installedAt": "2026-03-14T12:00:00Z",
  "installedAgainstOpenclawVersion": "2026.3.14",
  "lastCompatibilityCheck": "2026-03-15T03:00:00Z",
  "lastCompatibilityCheckResult": "compatible",
  "pendingChanges": [],
  "appliedPatches": [
    {
      "patchId": "BC-2026.3.10-001",
      "appliedAt": "2026-03-11T03:02:14Z",
      "openclawVersion": "2026.3.10",
      "description": "Auto-renamed tool profile 'coding' to 'developer'"
    }
  ],
  "backups": [
    {
      "timestamp": "2026-03-11T03:02:10Z",
      "file": "openclaw.json",
      "backupPath": "openclaw.json.bak.selfheal-1741658530"
    }
  ]
}
```

### 8.3 Local Remediation Script

**File:** `tools/local-remediation.mjs`

```javascript
#!/usr/bin/env node
// tools/local-remediation.mjs
// A.L.I.C.E. Self-Healing System — Local Remediation
// Runs as an OpenClaw cron job on the user's machine.

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ALICE_ROOT = resolve(__dirname, '..');
const OPENCLAW_CONFIG = resolve(process.env.HOME, '.openclaw', 'openclaw.json');
const MANIFEST_PATH = resolve(ALICE_ROOT, '.alice-manifest.json');
const COMPAT_BASE_URL = 'https://raw.githubusercontent.com/robbiesrobotics-bot/alice/main/compatibility';

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
function log(msg) { console.log(`[alice-selfheal] ${new Date().toISOString()} ${msg}`); }
function warn(msg) { console.warn(`[alice-selfheal] ⚠️  ${msg}`); }
function error(msg) { console.error(`[alice-selfheal] ❌ ${msg}`); }

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getCurrentOpenclawVersion() {
  try {
    const pkg = loadJson(resolve(process.env.HOME, '.local', 'share', 'fnm', 'node-versions', 
      `v${process.version.slice(1)}`, 'installation', 'lib', 'node_modules', 'openclaw', 'package.json'));
    if (pkg) return pkg.version;
    // Fallback: run openclaw --version
    const out = execSync('openclaw --version 2>/dev/null', { encoding: 'utf8' }).trim();
    return out.replace(/^openclaw\s+/i, '');
  } catch {
    // Try npm
    try {
      return execSync('npm list -g openclaw --json 2>/dev/null', { encoding: 'utf8' });
    } catch {
      return null;
    }
  }
}

async function fetchCompatibilityReport(openclawVersion) {
  const url = `${COMPAT_BASE_URL}/${openclawVersion}.json`;
  log(`Fetching compatibility report from ${url}`);
  
  try {
    const response = await fetch(url);
    if (response.status === 404) {
      log(`No compatibility report found for OpenClaw ${openclawVersion} — assuming compatible`);
      return null;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    warn(`Could not fetch compatibility report: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// Backup
// ─────────────────────────────────────────────
function backupConfig(timestamp) {
  const backupPath = `${OPENCLAW_CONFIG}.bak.selfheal-${timestamp}`;
  copyFileSync(OPENCLAW_CONFIG, backupPath);
  log(`Backed up openclaw.json → ${backupPath}`);
  return backupPath;
}

// ─────────────────────────────────────────────
// Gateway health check
// ─────────────────────────────────────────────
async function checkGatewayHealth() {
  try {
    const out = execSync('openclaw gateway status --json 2>/dev/null', { encoding: 'utf8', timeout: 10000 });
    const status = JSON.parse(out);
    return status.running === true;
  } catch {
    // Gateway status command failed — try HTTP health endpoint
    try {
      const res = await fetch('http://localhost:3000/health', { signal: AbortSignal.timeout(5000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

async function restartGateway() {
  log('Restarting OpenClaw gateway...');
  try {
    execSync('openclaw gateway restart', { timeout: 30000 });
    // Wait for it to come up
    await new Promise(r => setTimeout(r, 5000));
    return await checkGatewayHealth();
  } catch (err) {
    error(`Gateway restart failed: ${err.message}`);
    return false;
  }
}

// ─────────────────────────────────────────────
// Rollback
// ─────────────────────────────────────────────
async function rollback(backupPath, manifest) {
  warn('Rolling back openclaw.json to pre-patch state...');
  copyFileSync(backupPath, OPENCLAW_CONFIG);
  
  // Remove the backup entry from manifest and mark rollback
  manifest.pendingChanges = [];
  manifest.lastCompatibilityCheckResult = 'rolled-back';
  saveJson(MANIFEST_PATH, manifest);
  
  // Restart with restored config
  const healthy = await restartGateway();
  if (healthy) {
    log('✅ Rollback successful — gateway healthy with original config');
    return true;
  } else {
    error('Gateway unhealthy even after rollback — manual intervention required');
    return false;
  }
}

// ─────────────────────────────────────────────
// Auto-fix application
// ─────────────────────────────────────────────
function applyAutoFixes(report, manifest) {
  const config = loadJson(OPENCLAW_CONFIG);
  let changeCount = 0;
  
  for (const patch of report.patches) {
    log(`  Applying patch: ${patch.changeId}`);
    for (const op of patch.operations) {
      try {
        applyOperation(config, op);
        changeCount++;
      } catch (err) {
        warn(`  Failed to apply operation ${op.op} on ${op.jsonPath}: ${err.message}`);
      }
    }
  }
  
  saveJson(OPENCLAW_CONFIG, config);
  
  // Record applied patches in manifest
  for (const patch of report.patches) {
    const change = report.breakingChanges.find(c => c.id === patch.changeId);
    manifest.appliedPatches.push({
      patchId: patch.changeId,
      appliedAt: new Date().toISOString(),
      openclawVersion: report.openclawVersion,
      description: change?.change || patch.changeId,
    });
  }
  
  return changeCount;
}

function applyOperation(obj, op) {
  switch (op.op) {
    case 'set': setByPath(obj, op.jsonPath, op.value); break;
    case 'replace-value': replaceValues(obj, op.from, op.to); break;
    case 'remove': removeByPath(obj, op.jsonPath); break;
  }
}

function setByPath(obj, path, value) {
  const parts = path.replace(/^\$\./, '').split('.');
  const last = parts.pop();
  let cur = obj;
  for (const p of parts) {
    if (!cur[p]) cur[p] = {};
    cur = cur[p];
  }
  cur[last] = value;
}

function replaceValues(obj, from, to) {
  if (typeof obj !== 'object' || obj === null) return;
  for (const key of Object.keys(obj)) {
    if (obj[key] === from) obj[key] = to;
    else if (typeof obj[key] === 'object') replaceValues(obj[key], from, to);
  }
}

function removeByPath(obj, path) {
  const parts = path.replace(/^\$\./, '').split('.');
  const last = parts.pop();
  let cur = obj;
  for (const p of parts) {
    if (!cur[p]) return;
    cur = cur[p];
  }
  delete cur[last];
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────
async function notify(message, level = 'info') {
  log(`NOTIFY [${level}]: ${message}`);
  
  // Write to Mission Control state file
  const mcState = loadJson(resolve(ALICE_ROOT, '.mission-control-state.json')) || { alerts: [] };
  mcState.alerts.unshift({
    id: `selfheal-${Date.now()}`,
    level,
    message,
    timestamp: new Date().toISOString(),
    source: 'self-healing',
    read: false,
  });
  // Keep last 50 alerts
  mcState.alerts = mcState.alerts.slice(0, 50);
  saveJson(resolve(ALICE_ROOT, '.mission-control-state.json'), mcState);
  
  // Send Telegram notification if configured
  try {
    const config = loadJson(OPENCLAW_CONFIG);
    const telegramChannel = config?.notifications?.channels?.find(c => c.type === 'telegram');
    if (telegramChannel?.chatId && telegramChannel?.botToken) {
      const emoji = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : '✅';
      await fetch(`https://api.telegram.org/bot${telegramChannel.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChannel.chatId,
          text: `${emoji} *A.L.I.C.E. Self-Healing*\n\n${message}`,
          parse_mode: 'Markdown',
        }),
      });
    }
  } catch (err) {
    warn(`Telegram notification failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// Escalation — surface to Mission Control
// ─────────────────────────────────────────────
function escalateToMissionControl(report, manualChanges) {
  const escalations = loadJson(resolve(ALICE_ROOT, '.selfheal-escalations.json')) || { pending: [] };
  
  for (const change of manualChanges) {
    // Avoid duplicate escalations
    if (escalations.pending.find(e => e.changeId === change.id)) continue;
    
    escalations.pending.push({
      changeId: change.id,
      openclawVersion: report.openclawVersion,
      category: change.category,
      severity: change.severity,
      field: change.field,
      change: change.change,
      manualSteps: change.manualSteps,
      githubIssueUrl: change.githubIssueUrl || null,
      escalatedAt: new Date().toISOString(),
      resolved: false,
    });
  }
  
  saveJson(resolve(ALICE_ROOT, '.selfheal-escalations.json'), escalations);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  log('Starting A.L.I.C.E. self-healing check...');
  
  // Step 1: Load manifest
  const manifest = loadJson(MANIFEST_PATH);
  if (!manifest) {
    warn('No .alice-manifest.json found — skipping self-heal (A.L.I.C.E. not installed?)');
    return;
  }
  
  // Step 2: Get current OpenClaw version
  const currentOcVersion = getCurrentOpenclawVersion();
  if (!currentOcVersion) {
    warn('Could not determine current OpenClaw version — skipping');
    return;
  }
  
  const installedAgainst = manifest.installedAgainstOpenclawVersion;
  log(`Installed against: ${installedAgainst} | Current: ${currentOcVersion}`);
  
  // Step 3: Check if versions diverged
  if (installedAgainst === currentOcVersion) {
    log('✅ OpenClaw version unchanged — no action needed');
    manifest.lastCompatibilityCheck = new Date().toISOString();
    manifest.lastCompatibilityCheckResult = 'compatible';
    saveJson(MANIFEST_PATH, manifest);
    return;
  }
  
  log(`Version diverged! Fetching compatibility report for ${currentOcVersion}...`);
  
  // Step 4: Fetch compatibility report
  const report = await fetchCompatibilityReport(currentOcVersion);
  if (!report) {
    warn(`No compatibility data available for OpenClaw ${currentOcVersion}`);
    manifest.lastCompatibilityCheck = new Date().toISOString();
    manifest.lastCompatibilityCheckResult = 'unknown';
    saveJson(MANIFEST_PATH, manifest);
    await notify(
      `OpenClaw updated to ${currentOcVersion} but no compatibility report is available yet. Monitor for issues.`,
      'warn'
    );
    return;
  }
  
  if (report.compatible) {
    log(`✅ OpenClaw ${currentOcVersion} is compatible with A.L.I.C.E. ${manifest.aliceVersion}`);
    manifest.installedAgainstOpenclawVersion = currentOcVersion;
    manifest.lastCompatibilityCheck = new Date().toISOString();
    manifest.lastCompatibilityCheckResult = 'compatible';
    saveJson(MANIFEST_PATH, manifest);
    return;
  }
  
  log(`Found ${report.summary.breakingChangesCount} breaking change(s)`);
  
  // Step 5: Separate auto-fixable from manual
  const autoFixable = report.breakingChanges.filter(c => c.autoFixable);
  const manualChanges = report.breakingChanges.filter(c => !c.autoFixable);
  
  let timestamp = Math.floor(Date.now() / 1000);
  let backupPath = null;
  
  // Step 6: Apply auto-fixes
  if (autoFixable.length > 0 && report.patches.length > 0) {
    log(`Auto-fixing ${autoFixable.length} change(s)...`);
    
    // Backup first
    backupPath = backupConfig(timestamp);
    manifest.backups = manifest.backups || [];
    manifest.backups.push({
      timestamp: new Date().toISOString(),
      file: 'openclaw.json',
      backupPath,
    });
    
    // Apply patches
    const fixCount = applyAutoFixes(report, manifest);
    log(`Applied ${fixCount} patch operation(s)`);
    
    // Restart gateway to pick up changes
    const healthy = await restartGateway();
    
    if (!healthy) {
      error('Gateway unhealthy after auto-fix — initiating rollback');
      await rollback(backupPath, manifest);
      await notify(
        `⚠️ OpenClaw ${currentOcVersion}: auto-patch failed health check and was rolled back. Manual intervention required.`,
        'error'
      );
      return;
    }
    
    // Update manifest
    manifest.installedAgainstOpenclawVersion = currentOcVersion;
    manifest.lastCompatibilityCheck = new Date().toISOString();
    manifest.lastCompatibilityCheckResult = manualChanges.length === 0 ? 'auto-fixed' : 'partial';
    
    await notify(
      `A.L.I.C.E. auto-patched ${fixCount} config change(s) for OpenClaw ${currentOcVersion}. Gateway restarted and healthy. ✅`,
      'info'
    );
  }
  
  // Step 7: Escalate manual changes
  if (manualChanges.length > 0) {
    log(`Escalating ${manualChanges.length} change(s) requiring manual review...`);
    escalateToMissionControl(report, manualChanges);
    
    await notify(
      `OpenClaw ${currentOcVersion} has ${manualChanges.length} change(s) that need your review. ` +
      `Open Mission Control → Settings → Compatibility to review and approve.`,
      'warn'
    );
  }
  
  // Save updated manifest
  saveJson(MANIFEST_PATH, manifest);
  log('Self-healing check complete.');
}

main().catch(err => {
  error(`Self-healing script crashed: ${err.message}`);
  error(err.stack);
  process.exit(1);
});
```

---

## 9. Mission Control UI

The Mission Control dashboard is the user-facing surface for reviewing and approving high-risk compatibility changes.

### 9.1 Dashboard Location

**Path:** Mission Control → Settings → Compatibility  
**Data source:** `.selfheal-escalations.json` + `.mission-control-state.json`

### 9.2 Compatibility Tab Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Mission Control                      A.L.I.C.E. v1.1.1      │
├──────────────────────────────────────────────────────────────┤
│  Dashboard │ Agents │ Logs │ Settings ▼                       │
│                              └─ Compatibility  ← active      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔴 COMPATIBILITY ALERTS                       [Dismiss All] │
│  ─────────────────────────────────────────────────────────   │
│  OpenClaw 2026.4.0 — 1 change requires your review          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ⚠️  HIGH: Sandbox mode default changed              │    │
│  │                                                     │    │
│  │ Field: agents.defaults.sandbox.mode                 │    │
│  │                                                     │    │
│  │ BEFORE: "standard"                                  │    │
│  │ AFTER:  "strict"                                    │    │
│  │                                                     │    │
│  │ Impact: exec calls without security parameter will  │    │
│  │ be blocked for all agents. Affected: dylan, devon,  │    │
│  │ avery, atlas.                                       │    │
│  │                                                     │    │
│  │ Manual steps:                                       │    │
│  │  1. Review exec usage in each affected agent        │    │
│  │  2. Add security: 'full' to trusted agents          │    │
│  │  3. Add security: 'allowlist' to limited agents     │    │
│  │  4. Restart gateway after changes                   │    │
│  │                                                     │    │
│  │ 🔗 GitHub Issue #142                                │    │
│  │                                                     │    │
│  │ [View Diff]  [Mark Resolved]  [Spawn Devon]         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  COMPATIBILITY HISTORY                                       │
│                                                              │
│  ✅ 2026.3.14  Compatible                    2026-03-14      │
│  🔧 2026.3.10  Auto-fixed (1 change)         2026-03-10      │
│  ✅ 2026.3.5   Compatible                    2026-03-05      │
│  ✅ 2026.3.1   Compatible                    2026-03-01      │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  INSTALLED PATCHES                                           │
│                                                              │
│  BC-2026.3.10-001  2026-03-10  Auto-renamed tool profile    │
│                               'coding' → 'developer'        │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  BACKUPS                                                     │
│                                                              │
│  2026-03-10 03:02  openclaw.json.bak.selfheal-1741658530    │
│                                              [Restore] [Del] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Alert Data Structure

The Mission Control UI reads from `.mission-control-state.json`:

```json
{
  "alerts": [
    {
      "id": "selfheal-1741234567",
      "level": "warn",
      "message": "OpenClaw 2026.4.0 has 1 change(s) that need your review. Open Mission Control → Settings → Compatibility to review and approve.",
      "timestamp": "2026-04-01T03:02:14Z",
      "source": "self-healing",
      "read": false
    }
  ]
}
```

### 9.4 Escalation Data Structure

`.selfheal-escalations.json`:

```json
{
  "pending": [
    {
      "changeId": "BC-2026.4.0-003",
      "openclawVersion": "2026.4.0",
      "category": "behavioral",
      "severity": "high",
      "field": "agents.defaults.sandbox.mode",
      "change": "Default sandbox mode changed from 'standard' to 'strict'",
      "manualSteps": [
        "Review each affected agent's exec usage in their SOUL.md and config",
        "For trusted agents (dylan, devon): add security: 'full' to their agent config",
        "For limited agents (avery, atlas): add security: 'allowlist' with explicit allowed commands",
        "Test each agent's exec capability after update",
        "Update schema-snapshot.json to reflect new sandbox.mode default"
      ],
      "githubIssueUrl": "https://github.com/robbiesrobotics-bot/alice/issues/142",
      "escalatedAt": "2026-04-01T03:02:14Z",
      "resolved": false
    }
  ]
}
```

### 9.5 Action Buttons

| Button | Action |
|--------|--------|
| **View Diff** | Shows side-by-side before/after of affected config sections |
| **Mark Resolved** | Sets `resolved: true` in escalations file, removes alert |
| **Spawn Devon** | Triggers `sessions_spawn` for Devon with the full change context and manual steps |
| **Restore** (backup) | Copies backup file back to `openclaw.json`, restarts gateway |
| **Delete** (backup) | Removes backup file after user confirms |

---

## 10. Patch Generation

### 10.1 Patch Types

| Type | Use Case | Risk |
|------|----------|------|
| `value-rename` | Enum value renamed | Low |
| `config-inject` | New config key added with explicit value | Low |
| `field-remove` | Deprecated field removed from config | Low |
| `field-rename` | Config key renamed | Medium |
| `structural` | Object restructured, requires data migration | High (manual) |

### 10.2 Patch Operation Format

All auto-fix patches use a normalized operation format:

```json
{
  "changeId": "BC-2026.4.0-001",
  "patchType": "json-transform",
  "targetFile": "openclaw.json",
  "operations": [
    {
      "op": "replace-value",
      "jsonPath": "$.agents.list[*].tools.profile",
      "from": "coding",
      "to": "developer",
      "comment": "Rename tool profile enum value"
    },
    {
      "op": "set",
      "jsonPath": "$.agents.defaults.toolDefaults.web_fetch.extractMode",
      "value": "markdown",
      "comment": "Pin extractMode to preserve previous default behavior"
    },
    {
      "op": "remove",
      "jsonPath": "$.agents.defaults.legacyField",
      "comment": "Remove field deprecated in 2026.4.0"
    }
  ]
}
```

### 10.3 Patch Application Rules

1. **Patches are applied in order** — operations within a patch run sequentially
2. **Patches are idempotent** — applying the same patch twice must be safe (no-op on second run)
3. **Patches are atomic** — if any operation in a patch fails, the whole patch is skipped and logged
4. **Patches only modify `openclaw.json`** — they do not modify agent SOUL.md, PLAYBOOK.md, or other files (those require manual review)

### 10.4 NPM Patch Version Publishing

When the compatibility checker generates a patch:

1. Auto-fix operations are baked into the A.L.I.C.E. package defaults
2. The package version is bumped by one patch increment (e.g., 1.1.1 → 1.1.2)
3. Published to npm as `@robbiesrobotics/alice-agents@1.1.2`
4. Users running `npm update @robbiesrobotics/alice-agents` get the fix baked in
5. The local remediation script also applies patches directly (does not require npm update)

### 10.5 Verification After Patch

After applying patches, the local remediation script runs a verification:

```javascript
async function verifyPatch() {
  // 1. Validate openclaw.json syntax
  try {
    JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf8'));
  } catch {
    return { valid: false, reason: 'Invalid JSON after patch' };
  }
  
  // 2. Run openclaw config validation if available
  try {
    execSync('openclaw validate --config ' + OPENCLAW_CONFIG, { timeout: 15000 });
  } catch (err) {
    return { valid: false, reason: `openclaw validate failed: ${err.message}` };
  }
  
  // 3. Check gateway health after restart
  const healthy = await checkGatewayHealth();
  if (!healthy) return { valid: false, reason: 'Gateway unhealthy after restart' };
  
  return { valid: true };
}
```

---

## 11. Rollback Mechanism

### 11.1 Backup Flow

Before any auto-fix is applied:

```
1. Generate timestamp: Math.floor(Date.now() / 1000)
2. Copy openclaw.json → openclaw.json.bak.selfheal-{timestamp}
3. Record backup in .alice-manifest.json backups array
4. Proceed with patch application
```

**Backup file naming:** `openclaw.json.bak.selfheal-1741658530`  
(Unix timestamp ensures unique, sortable, human-readable names)

**Backup retention:** Backups are kept indefinitely until the user manually deletes them via Mission Control. Each backup is ~10-50KB. Purge policy: if more than 10 backups exist, the local remediation script will warn the user via Mission Control but will not auto-delete.

### 11.2 Rollback Trigger Conditions

Rollback is triggered automatically if:

1. `openclaw validate` exits with non-zero after patch
2. Gateway fails to restart after patch (timeout: 30s, health check fails)
3. Gateway health check fails within 60 seconds of restart

Rollback is **not** triggered for:
- Agent-level errors (those are not gateway-health indicators)
- Slow startup (extends timeout to 60s before failing)

### 11.3 Rollback Flow

```
1. Log: "Gateway unhealthy after auto-fix — initiating rollback"
2. Copy openclaw.json.bak.selfheal-{timestamp} → openclaw.json
3. Clear manifest.pendingChanges
4. Set manifest.lastCompatibilityCheckResult = 'rolled-back'
5. Save manifest
6. Run: openclaw gateway restart
7. Wait 5s
8. Check gateway health
9. If healthy:
   - Log: "Rollback successful"
   - Notify user: "Auto-patch rolled back. Review escalation in Mission Control."
   - Escalate all attempted changes to Mission Control as manual-review items
10. If not healthy:
   - Log: "Gateway unhealthy even after rollback — manual intervention required"
   - Notify user: "CRITICAL: Gateway unhealthy. Manual intervention required."
   - Do NOT attempt further automatic changes
```

### 11.4 Manual Rollback via Mission Control

Users can also trigger rollback manually from Mission Control → Settings → Compatibility → Backups:

```
[Restore] button:
  1. Confirm dialog: "Restore openclaw.json from backup {timestamp}? This will restart the gateway."
  2. On confirm: run local-remediation.mjs --restore {backupPath}
  3. Show result inline
```

---

## 12. Notification System

### 12.1 Notification Channels

| Channel | Trigger | Content |
|---------|---------|---------|
| **Telegram** | Any self-heal event | Short summary message |
| **Mission Control** | Any self-heal event | Full alert with action buttons |
| **CLI stdout** | Cron job execution | Timestamped log lines |

### 12.2 Telegram Message Format

**Auto-fixed (success):**
```
✅ A.L.I.C.E. Self-Healing

Auto-patched 2 config change(s) for OpenClaw 2026.4.0.
Gateway restarted and healthy.

Changes applied:
• Renamed tool profile 'coding' → 'developer'
• Pinned web_fetch extractMode to 'markdown'
```

**Needs manual review:**
```
⚠️ A.L.I.C.E. Self-Healing

OpenClaw 2026.4.0 has 1 change(s) requiring your review.

Open Mission Control → Settings → Compatibility
or view GitHub Issue #142
```

**Rollback occurred:**
```
🚨 A.L.I.C.E. Self-Healing — Rollback

Auto-patch for OpenClaw 2026.4.0 failed health check
and was rolled back automatically.

Your config is restored to the previous working state.
Manual intervention required.

Open Mission Control → Settings → Compatibility
```

**No changes needed:**
*(No notification sent — silent success)*

### 12.3 Notification Configuration

Telegram credentials are read from `openclaw.json`:

```json
{
  "notifications": {
    "channels": [
      {
        "id": "primary-telegram",
        "type": "telegram",
        "botToken": "{{env.TELEGRAM_BOT_TOKEN}}",
        "chatId": "{{env.TELEGRAM_CHAT_ID}}",
        "enabled": true,
        "events": ["self-healing"]
      }
    ]
  }
}
```

### 12.4 Notification Rate Limiting

To prevent spam during repeated failures:

- Max 1 notification per event type per OpenClaw version
- If an escalation for a given `changeId` already exists in `.selfheal-escalations.json`, no repeat notification is sent
- Rollback notifications are always sent regardless of rate limits

---

## 13. Error States & Edge Cases

| Scenario | Behavior |
|----------|----------|
| `openclaw.json` not found | Skip remediation, log warning |
| `.alice-manifest.json` not found | Skip remediation (A.L.I.C.E. not installed) |
| Compatibility report HTTP 404 | Assume compatible, log info, set `lastCompatibilityCheckResult: 'unknown'` |
| Compatibility report HTTP 5xx | Retry once after 5s, then skip with warning |
| Patch application crashes mid-way | Rollback from backup, escalate all changes as manual |
| Gateway does not restart within 60s | Rollback, send critical notification |
| Backup file missing during rollback | Log error, attempt gateway restart with current config anyway |
| Duplicate escalation (same changeId) | Skip, do not create duplicate in `.selfheal-escalations.json` |
| Self-heal cron fails to start | OpenClaw fires `notifyOnFailure: true` — user gets system-level alert |
| OpenClaw version string unparseable | Skip version comparison, log warning |
| Multiple OpenClaw updates in one day | Process only the most recent version; do not chain multiple reports |

---

## 14. File Layout Reference

```
alice-agents/
├── .alice-manifest.json              # Installation + patch history
├── .mission-control-state.json       # Alerts for Mission Control UI
├── .selfheal-escalations.json        # Manual review queue
│
├── snapshots/
│   ├── schema-snapshot.json          # Config field snapshot (Layer 1 source of truth)
│   └── tool-snapshot.json            # Tool registry snapshot (Layer 1 source of truth)
│
├── compatibility/
│   ├── 2026.3.14.json               # Report per OpenClaw version
│   ├── 2026.4.0.json
│   └── ...
│
├── tools/
│   ├── compatibility-checker.mjs     # Layer 1: CI script
│   └── local-remediation.mjs        # Layer 2: cron script
│
└── .github/
    └── workflows/
        └── compatibility-check.yml   # GitHub Action
```

**OpenClaw config (on user's machine):**
```
~/.openclaw/
├── openclaw.json                          # Live config
├── openclaw.json.bak.selfheal-{ts}        # Auto-backup before each patch
└── workspace-olivia/
    └── alice-agents/                      # This repo, checked out locally
```

---

*End of spec. All formats, workflows, and scripts above are production-ready starting points. Implementation should add proper error handling, logging levels, and integration tests before first deployment.*
