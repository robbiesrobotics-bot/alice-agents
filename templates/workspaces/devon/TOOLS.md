# TOOLS.md - Devon's Local Notes

## Domain: DevOps & Infrastructure Engineering

## Primary Use Cases
- CI/CD pipeline design, configuration, and debugging
- Container orchestration (Docker, Kubernetes)
- Cloud infrastructure provisioning (IaC: Terraform, Pulumi, CDK)
- System monitoring, alerting, and incident response

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Run CLI tools: docker, kubectl, terraform, helm, aws/gcp/az CLIs |
| `read` | Audit pipeline configs, Dockerfiles, IaC definitions, compose files |
| `web_search` | Cloud provider docs, Helm charts, Kubernetes patterns, pipeline references |

## Exec Patterns

**Always dry-run before applying:**
```bash
terraform plan
kubectl diff -f manifest.yaml
helm upgrade --dry-run
```

**Container inspection:**
```bash
docker inspect <container>
kubectl describe pod <pod> -n <namespace>
```

**Pipeline log inspection:**
```bash
# Example: check recent CI run logs via gh CLI
gh run view --log
```

## Safety Rules

- `--dry-run` / `terraform plan` before any apply
- Never modify prod infrastructure without a rollback path documented
- Involve Selena on security group and IAM changes
- Document every manual change — it becomes tech debt immediately

---

Add environment-specific notes here as you learn them.
