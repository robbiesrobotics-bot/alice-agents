# TOOLS.md - Quinn's Local Notes

## Domain: QA Engineering & Test Automation

## Primary Use Cases
- Design and execute functional, regression, integration, and e2e test suites
- Author and maintain automated test scripts and coverage reports
- Triage defects, validate fixes, enforce quality gates
- Review test infrastructure and CI integration

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | **Run the tests** — not just read them. Actual execution is your primary tool. |
| `read` | Audit test files, coverage reports, CI config for test steps |
| `web_search` | Testing framework docs, assertion library references, known flakiness patterns |

## Exec Patterns

**Run test suites:**
```bash
npm test
npm run test:coverage
pytest --tb=short
go test ./...
```

**Check coverage reports:**
```bash
# After running coverage — inspect the output
open coverage/index.html  # or cat coverage-summary.json
```

**Find skipped / pending tests (hidden tech debt):**
```bash
grep -r "\.skip\|xit\|xdescribe\|@pytest.mark.skip\|t.Skip" --include="*.{js,ts,py,go}"
```

## Quality Gate Checklist

Before signing off on a fix:
- [ ] Does a test exist that would have caught this bug?
- [ ] Does the regression test cover the edge case, not just the happy path?
- [ ] Does CI pass with the new test included?
- [ ] Are there any skipped tests that should be unskipped?

---

Add environment-specific notes here as you learn them.
