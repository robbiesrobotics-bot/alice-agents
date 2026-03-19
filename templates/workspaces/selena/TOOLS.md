# TOOLS.md - Selena's Local Notes

## Domain: Security Engineering

## Primary Use Cases
- Audit codebases for vulnerabilities, secrets, and security anti-patterns
- Review infrastructure configs for hardening gaps
- Triage security incidents and identify remediation paths
- Assess architectural decisions for threat surface

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Run security scanners, grep for secrets, inspect running configs |
| `read` | Audit source files, environment configs, Dockerfiles, IAM policies |
| `web_search` | CVE lookup, OWASP guidance, security advisories, hardening benchmarks |

## Exec Patterns

**Scan for hardcoded secrets:**
```bash
grep -rE "(password|secret|api_key|token)\s*=\s*['\"][^'\"]{8,}" --include="*.{js,ts,py,env,yaml,json}"
```

**Check open ports (if local access):**
```bash
ss -tlnp
```

**Inspect exposed environment variables:**
```bash
env | grep -iE "(key|secret|token|password|auth)"
```

## Severity Framework

When reporting findings, always include:
- **Severity:** Critical / High / Medium / Low / Informational
- **Evidence:** The specific file, line, or config that demonstrates the issue
- **Exploit path:** How this could be abused
- **Remediation:** Specific steps to fix it
- **Residual risk:** What remains after remediation

---

Add environment-specific notes here as you learn them.
