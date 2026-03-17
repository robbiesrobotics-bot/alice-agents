# NemoClaw — Quick Reference

**Last updated:** 2026-03-16 (NVIDIA GTC 2026 launch day)

---

## What Is NemoClaw?

NemoClaw is **OpenClaw + NVIDIA's enterprise security layer**. It combines the OpenClaw agent runtime (the same runtime A.L.I.C.E. runs on) with NVIDIA's three-part hardening stack:

| Component | Role |
|---|---|
| **OpenShell** | Sandboxed tool/command execution environment |
| **Nemotron models** | NVIDIA's on-device/private LLMs |
| **Privacy Router** | Data egress filtering and PII redaction layer |

Jensen Huang at GTC: *"OpenClaw is the OS for personal AI."*

---

## A.L.I.C.E. Compatibility

✅ **Fully compatible.** NemoClaw IS OpenClaw under the hood — same runtime, same agent protocol, same skill system. A.L.I.C.E. agents run on NemoClaw without modification.

**Key distinction:**
- **NemoClaw** = infrastructure & security layer (the OS)
- **A.L.I.C.E.** = orchestration & application layer (runs on top)

NemoClaw does **not** do orchestration. It does **not** compete with A.L.I.C.E.

---

## Platform Context

- OpenClaw was **acquihired by OpenAI in February 2026**
- **Peter Steinberger** (original author) remains maintainer
- This positions A.L.I.C.E. as the application layer on an increasingly enterprise-grade, OpenAI-backed agent OS

---

## Enterprise Partners (NemoClaw launch)

Salesforce · Cisco · Google · Adobe · CrowdStrike

---

## Integration Considerations

1. **OpenShell sandboxing** — In NemoClaw deployments, tool/exec calls run inside OpenShell. Permissions model may differ from standard OpenClaw. Dylan (DevOps) and Selena (Security) should be aware when configuring agents for enterprise environments.

2. **Nemotron models** — These are NVIDIA's private LLMs. If a NemoClaw enterprise client wants on-prem inference, Nemotron is the likely default model provider instead of OpenAI/Anthropic.

3. **Privacy Router** — Outbound data filtering is handled at the infra layer in NemoClaw. A.L.I.C.E.'s own PII handling and data governance still applies at the orchestration layer.

4. **npx package** — `alice-agents` updated to v1.2.5 with NemoClaw detection and a README compatibility section.

---

## Positioning Summary

```
┌─────────────────────────────────────────────────┐
│              A.L.I.C.E. (Application Layer)      │
│   Orchestration · Agents · Skills · Memory       │
├─────────────────────────────────────────────────┤
│              NemoClaw (Infrastructure Layer)     │
│   OpenShell · Nemotron · Privacy Router          │
├─────────────────────────────────────────────────┤
│              OpenClaw Runtime                    │
│   (acquihired by OpenAI, Feb 2026)               │
└─────────────────────────────────────────────────┘
```

---

## Links & References

- NVIDIA GTC 2026 announcement: https://www.nvidia.com/gtc
- OpenClaw: https://openclaw.ai
- Internal: see `MEMORY.md` in workspace-olivia for the canonical team record
