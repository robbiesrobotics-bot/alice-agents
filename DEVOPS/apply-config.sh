#!/usr/bin/env bash
# =============================================================================
# apply-config.sh — Apply openclaw-config-patch.json to ~/.openclaw/openclaw.json
#
# What this does:
#   1. Reads the current ~/.openclaw/openclaw.json (base)
#   2. Deep-merges it with openclaw-config-patch.json (patch)
#   3. Writes the result back to ~/.openclaw/openclaw.json
#   4. Warns that a gateway restart is needed — does NOT restart automatically
#
# ACP flag note: acp.enabled is set to true in the patch but is marked
# "pending Phase 4" — it will be activated after Dylan's pool router is live.
# =============================================================================

set -euo pipefail

BASE="${HOME}/.openclaw/openclaw.json"
PATCH="${HOME}/.openclaw/workspace-olivia/alice-agents/DEVOPS/openclaw-config-patch.json"
BACKUP="${HOME}/.openclaw/openclaw.json.backup-$(date +%Y%m%d-%H%M%S)"

if [[ ! -f "$BASE" ]]; then
  echo "ERROR: Base config not found at $BASE" >&2
  exit 1
fi
if [[ ! -f "$PATCH" ]]; then
  echo "ERROR: Patch file not found at $PATCH" >&2
  exit 1
fi

echo "=== OpenClaw Config Patch Runner ==="
echo ""
echo "Base:  $BASE"
echo "Patch: $PATCH"
echo ""

echo "--- Changes to be applied ---"
echo ""
echo "  agents.defaults.subagents.maxConcurrent : 4  →  20"
echo "    Reason: Rob wants multiple teams in parallel; pool-based routing"
echo "            + duplicate agent support requires real headroom."
echo ""
echo "  agents.defaults.subagents.taskTypes : NEW (per-type limits)"
echo "    quick         maxConcurrent: 8  / timeout:   300s"
echo "    standard      maxConcurrent: 4  / timeout:  1800s"
echo "    complex       maxConcurrent: 2  / timeout:  5400s"
echo "    deep-research maxConcurrent: 1  / timeout: 14400s"
echo "    infra-change  maxConcurrent: 1  / timeout:  3600s"
echo "    review        maxConcurrent: 4  / timeout:  1200s"
echo "    qa-pass       maxConcurrent: 3  / timeout:  2700s"
echo "    Reason: Different task types have very different parallelism profiles."
echo "            deep-research needs hours; infra-change needs 1-concurrent safety rail."
echo ""
echo "  acp.enabled : false  →  true  [PENDING Phase 4]"
echo "    Reason: ACP dispatch routing requires Dylan's pool router live first."
echo "            This flip happens in Phase 4 of the spawn strategy rollout."
echo ""

read -rp "Apply these changes to $BASE? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# Backup current config
cp "$BASE" "$BACKUP"
echo "Backup created: $BACKUP"
echo ""

# --- Deep-merge patch into base using jq ---
#
# Deep-merge logic (corrected):
#   - Walk patch entries; for each key in patch:
#       if base has the key AND both base[key] and patch[key] are objects → recurse
#       else → use patch value (patch wins for all present keys)
#   - Keys only in base are preserved untouched
#
# This means: patch adds/overrides; base keys not in patch are kept.

MERGED=$(jq --null-input \
  --slurpfile P <(jq '.' "$PATCH") \
  --slurpfile B <(jq '.' "$BASE") \
  '
  def deep_merge($base; $patch):
    reduce (($patch | to_entries)[]) as $kv ($base;
      if ($patch | has($kv.key)) and (.[$kv.key] != null) and ($kv.value | type == "object")
      then .[$kv.key] = deep_merge(.[$kv.key]; $kv.value)
      else .[$kv.key] = $kv.value
      end
    )
  ;

  $P[0] as $P | $B[0] as $B |

  # --- agents.defaults.subagents: deep-merge patch ONTO existing ---
  # Preserves archiveAfterMinutes, cliBackends, etc. from base.
  (deep_merge(
    ($B.agents.defaults.subagents // {});
    $P.agents.defaults.subagents
  )) as $new_subagents |

  # Rebuild agents.defaults with merged subagents (preserves model, cliBackends, etc.)
  (($B.agents.defaults // {}) | .subagents = $new_subagents) as $new_defaults |
  (($B.agents // {}) | .defaults = $new_defaults) as $new_agents |

  # --- acp: preserve dispatch settings, override .enabled from patch ---
  (($B.acp // {}) | .enabled = $P.acp.enabled) as $new_acp |

  # Final merged document
  ($B | .agents = $new_agents | .acp = $new_acp)
')

# Write merged result back
echo "$MERGED" > "$BASE"

echo "✓ Config patched successfully."
echo ""
echo "=========================================="
echo "⚠️  GATEWAY RESTART REQUIRED"
echo "=========================================="
echo "Run the following to pick up the new config:"
echo ""
echo "    openclaw gateway restart"
echo ""
echo "Or restart from the OpenClaw UI."
echo ""
echo "IMPORTANT — acp.enabled is now true but is PENDING Phase 4:"
echo "  Do NOT restart the gateway until Dylan's pool router is verified live."
echo "  If you must restart before Phase 4, manually set:"
echo "    acp.enabled: false"
echo "  in ~/.openclaw/openclaw.json to avoid unexpected dispatch behavior."
echo ""
echo "Backup of previous config: $BACKUP"
