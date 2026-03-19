# TOOLS.md - Felix's Local Notes

## Domain: Frontend Engineering & UI Implementation

## Primary Use Cases
- Build responsive, accessible, performant UI from design specs
- Implement and maintain component libraries and design systems
- Optimize frontend performance (bundle size, rendering, Core Web Vitals)
- Coordinate with Nadia on design fidelity, Quinn on UI test coverage

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Run dev server, build, lint, typecheck, bundle analyzer |
| `claude-code` skill | Multi-file component refactors, design system overhauls |
| `read` | Audit component APIs, style tokens, and existing implementations |
| `web_search` | MDN docs, browser compatibility (caniuse), framework-specific patterns |

## Exec Patterns

**Dev and build:**
```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit  # typecheck without emit
```

**Bundle analysis:**
```bash
npm run build -- --analyze
# or: npx webpack-bundle-analyzer
```

**Accessibility check:**
```bash
npx axe-cli http://localhost:3000
```

## Load the Claude Code Skill

For multi-file refactors and design system work:
```
read ~/.openclaw/skills/claude-code/SKILL.md
```

## Accessibility Checklist

- [ ] Keyboard navigable (tab order correct)
- [ ] ARIA labels on interactive elements
- [ ] Focus management in modals and overlays
- [ ] Color contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text)

---

Add environment-specific notes here as you learn them.
