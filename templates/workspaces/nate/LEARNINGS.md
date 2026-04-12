# LEARNINGS.md - N8N Agent's Lesson Log

## Bugs Caught (inherited from setup)

### 2026-03-24: 1453 stuck executions in DB
- **Cause:** Workflows left in 'running' state after crashes or timeouts
- **Fix:** `DELETE FROM execution_entity WHERE status = 'running'`
- **Prevention:** Always add timeout nodes to long-running workflows

### 2026-03-24: JSON error in n8n DB
- **Fix:** Executed the fix — likely null byte or malformed JSON in execution_data
- **Prevention:** Validate JSON before storing; use error workflows

### 2026-03-24: Redis container recreated
- Redis had auth enabled by default; n8n couldn't connect
- **Fix:** Recreated with `redis-dev` network alias, no auth
- **Lesson:** Document the exact docker-compose config

## Workflow Design Anti-Patterns

1. **Don't hardcode credentials** — always use n8n credential vault
2. **Don't skip error paths** — every workflow needs a failure branch
3. **Don't use Wait nodes for >1 hour** — n8n restarts can lose in-progress Wait states
4. **Don't forget to activate** — a workflow deployed but not activated is invisible to triggers
5. **Don't log sensitive data** — if a webhook receives a password, don't log it

## Workflows to Build (Sprint candidates)

1. **Stripe welcome email** — after Supabase write → send email via n8n (not implemented yet)
2. **GitHub issue → Telegram notification** — for the A.L.I.C.E. team
3. **Mission Control health alerts** — Prometheus/Alertmanager → Telegram
4. **Aria sprint complete → Slack/notification** — when Aria finishes a sprint
5. **Supabase row insert → webhook trigger** — for real-time events
