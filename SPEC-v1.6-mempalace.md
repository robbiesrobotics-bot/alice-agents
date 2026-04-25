# alice-agents v1.6 — MemPalace Memory Integration

Status: design draft, not yet implemented.

## Goal

Bring the OpenClaw mempalace + Supabase backup setup into the public npx package so any user installing alice-agents gets the same recall + DR story without hand-rolling it.

## Scope

1. **Memory runtime** — every scaffolded workspace gets a configured mempalace install
2. **Auto re-mine** — agents' new journal entries become searchable without manual `mine` calls
3. **Optional cloud backup** — opt-in chunked snapshots to a user-supplied Supabase project (or skip)
4. **Cross-platform** — must work on macOS (launchd) and Linux (systemd timers)

## Module additions

### `lib/memory-installer.mjs` (new)

- `installMempalace()` — runs `pipx install mempalace` (preferred for isolation), falls back to `pip install --user`. Verifies CLI on PATH.
- `scaffoldPalace({ scope })` — creates `~/.alice/mempalace/palace` as the shared palace, runs initial `mempalace mine` for each scaffolded agent's `memory/` + root `.md`.
- `installRotation({ scheduler })` — drops a launchd plist on darwin or systemd `*.timer`/`*.service` on linux for nightly re-mine.

### `lib/backup-installer.mjs` (new, opt-in)

- `promptForSupabase()` — interactive prompt: project_ref, service_role JWT, bucket name (default `mempalace`).
- `storeKeychain()` — darwin: `security add-generic-password`. Linux: `secret-tool` (libsecret) with fallback to `~/.alice/secrets` (chmod 600 + clear warning).
- `installBackupSchedule({ scheduler, intervalSeconds })` — installs the hourly push agent.

## Templates to ship

### `templates/mempalace/`
- `push.sh` — port of our current chunked push. Hardcoded constants extracted to env: `MEMPALACE_PROJECT_REF`, `MEMPALACE_BUCKET`, `MEMPALACE_HEALTHCHECK_URL`.
- `pull.sh` — DR restore, same env model.
- `remine-all.sh` — port of the stable-cache rsync miner.
- `rotate-logs.sh` — port of the log rotator.
- `palace-size-report.sh` — port.

### `templates/schedulers/`
- `darwin/com.alice.mempalace-push.plist`, `*-remine.plist`, `*-log-rotate.plist`, `*-palace-size-report.plist`.
- `linux/alice-mempalace-push.{service,timer}` and counterparts.
- Template variables resolved at install (`$HOME`, agent paths, project ref).

### `templates/agents-shared/`
- New `MEMORY.md` snippet appended to every scaffolded agent's SOUL.md teaching the **wing-first / global-fallback** search pattern. Replaces existing `localhost:8080` references where present.

## Install flow changes (`bin/alice-install.mjs`)

New flags:

```
--memory <embedded|none>     (default: embedded — installs mempalace)
--backup <supabase|none>     (default: none — opt-in)
--backup-interval <seconds>  (default: 3600)
--healthcheck-url <url>      (optional, passed to push.sh env)
--no-rotation                (skip log rotation install)
```

Interactive flow (after agent selection):
1. "Install local memory backend (mempalace)? [Y/n]"
2. If yes → check `python3 --version` ≥ 3.9 → `pipx install mempalace` (fallback `pip install --user`)
3. "Configure cloud backup of memory? [y/N]"
4. If yes → prompt for Supabase project_ref + service_role JWT → store in keychain → install hourly schedule
5. "Schedule nightly memory re-mine? [Y/n]"
6. Always install log rotation unless `--no-rotation`

### `lib/doctor.mjs` additions

- `mempalace --version` runs cleanly
- Palace dir exists and has drawers
- Schedulers loaded (`launchctl list` on darwin, `systemctl --user list-timers` on linux)
- If backup configured: latest snapshot age (fetch `latest-manifest.json` from Supabase, warn if > 2h stale)

## Configuration model

`~/.alice/config.json` gains a `memory` section:

```json
{
  "memory": {
    "backend": "mempalace",
    "palace": "~/.alice/mempalace/palace",
    "remine": { "enabled": true, "schedule": "daily-3am" },
    "backup": {
      "enabled": true,
      "provider": "supabase",
      "project_ref": "hpyzbhlkznkhudiwbnny",
      "bucket": "mempalace",
      "interval_seconds": 3600,
      "retention": { "hourly": 24, "daily": 30 },
      "healthcheck_url": null
    }
  }
}
```

Secrets never touch this file — only references that resolve to keychain entries.

## Cross-platform abstractions

### `lib/scheduler.mjs` (new dispatcher)

- `register({ id, command, schedule })` where schedule is `{ kind: 'interval', seconds }` or `{ kind: 'calendar', hour, minute, weekday? }`.
- `unregister(id)` for `--uninstall`.
- Two implementations: `darwin-launchd.mjs` (writes plists + `launchctl load`), `linux-systemd.mjs` (writes `.service` + `.timer` + `systemctl --user enable --now`).

## Migration path for existing users

- `alice-agents --update` detects legacy `localhost:8080` memory server references in scaffolded SOUL.md/AGENTS.md and rewrites them.
- Adds new schedulers without disturbing existing OpenClaw config.
- For users who had the previous custom alice-agents-memory: doctor warns "legacy pgvector setup detected — run `alice-agents --memory-migrate` to mine your journals into mempalace."

## What NOT to ship in v1.6

- **Compress/aging** — needs recall validation on a test wing before defaulting on. `mempalace compress` is lossy AAAK encoding without an age filter.
- **Cross-machine sync** — multiple devices writing to the same Supabase bucket has race conditions and manifest contention. Single-machine only for v1.6.
- **Web UI for browsing the palace** — out of scope.

## Risks / open questions

1. **Python dependency** — npx package now requires Python 3.9+. Some Node devs won't have it. Doctor must give a clear pointer (`brew install python` / `apt install python3`).
2. **Disk usage** — 30 daily + 24 hourly snapshots at ~250 MB each ≈ ~13 GB Supabase storage. Free tier (1 GB) overflows quickly. Doctor should warn if user is on free tier.
3. **Service-role JWT rotation** — need an `alice-agents --rotate-secret` flow.
4. **Windows** — either skip mempalace install on win32 with a clear message, or use Task Scheduler + `pip install` (deferred).

## Reference: validated reference implementation

Live and running on Alice's machine since 2026-04-25:

- `~/.openclaw/workspace-olivia/mempalace-sync/push.sh` — chunked Supabase push, healthcheck-aware
- `~/.openclaw/workspace-olivia/mempalace-sync/pull.sh` — DR restore (drill passed)
- `~/.openclaw/bin/remine-all.sh` — stable-cache rsync miner
- `~/.openclaw/bin/rotate-logs.sh` — log rotator
- `~/.openclaw/bin/palace-size-report.sh` — growth instrumentation
- `~/Library/LaunchAgents/com.alice.mempalace-push.plist` — hourly push schedule
- `~/Library/LaunchAgents/com.alice.openclaw-remine.plist` — nightly re-mine
- `~/Library/LaunchAgents/com.alice.openclaw-log-rotate.plist` — log rotation
- `~/Library/LaunchAgents/com.alice.palace-size-report.plist` — weekly growth report

Recall validated against grep baseline: mempalace wins or ties 8/8 queries. Palace settled at 2,610 drawers / ~270 MB across 36 wings after pollution cleanup.
