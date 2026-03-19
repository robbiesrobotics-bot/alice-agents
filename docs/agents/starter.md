# Starter Agents

The 10 Starter agents are available in every A.L.I.C.E. deployment. They cover the core technical and operational needs of most software teams.

> All requests go through **Olivia** — she routes to these agents automatically. You don't need to address them directly.

---

## 🧠 Olivia — Chief Orchestration Officer

Olivia is the entry point for all requests. See [olivia.md](./olivia.md) for full details.

---

## 💻 Dylan — Senior Full-Stack Software Engineer

Dylan writes, debugs, and reviews code across the full stack. He handles backend services, APIs, and data models, and coordinates with Felix on frontend contracts. He's the go-to for anything that lives in a code editor — from greenfield features to gnarly bug fixes.

**Works well for:**
- "Build a REST API endpoint for user authentication"
- "There's a race condition in our queue processor — can you find and fix it?"
- "Review this PR for security issues and code quality"

**Don't ask Dylan to:**
- Design UIs or write CSS (that's Felix)
- Set up CI/CD pipelines or provision infrastructure (that's Devon)
- Audit for security vulnerabilities (that's Selena)

---

## 🛡️ Selena — Director of Security Engineering

Selena audits code, configs, and infrastructure for security vulnerabilities and exposure risks. She implements hardening measures, reviews architectural decisions for threat surface, and responds to security incidents with triage and remediation guidance. If it touches secrets, access control, or data privacy, she's the right agent.

**Works well for:**
- "Audit our auth flow for common vulnerabilities"
- "We're storing API keys in env vars — is that safe? What should we do instead?"
- "Review our GDPR data handling and flag any gaps"

**Don't ask Selena to:**
- Write application features (that's Dylan)
- Handle compliance documentation (that's Logan)
- Set up deployment pipelines (that's Devon)

---

## 🚀 Devon — Principal DevOps & Infrastructure Engineer

Devon owns CI/CD pipelines, cloud infrastructure, containers, and deployment automation. He monitors system health, leads incident response for infrastructure failures, and optimizes build and deployment performance. If it runs in the cloud or touches a pipeline, Devon handles it.

**Works well for:**
- "Set up a GitHub Actions CI pipeline with automated tests and deploys"
- "Our Kubernetes pods keep OOMKilling — help me diagnose and fix it"
- "We need zero-downtime deployments — what's the right approach for our stack?"

**Don't ask Devon to:**
- Write application code (that's Dylan)
- Audit security posture (that's Selena)
- Handle business operations or vendor management (that's Owen)

---

## ✅ Quinn — QA Engineering Lead & Test Automation Architect

Quinn designs and executes test suites across functional, regression, integration, and end-to-end layers. She authors automated test scripts, tracks defect lifecycles, and defines quality gates and acceptance criteria. She's the last line of defense before a release goes out.

**Works well for:**
- "Write an end-to-end test suite for our checkout flow using Playwright"
- "Our test coverage is at 40% — help me prioritize what to cover next"
- "Bug report came in — write a regression test to prevent it from coming back"

**Don't ask Quinn to:**
- Fix the bugs she finds (that's Dylan)
- Build the CI pipeline that runs her tests (that's Devon)
- Design the UI she's testing (that's Felix or Nadia)

---

## 🖥️ Felix — Frontend Engineer & UI Implementation Specialist

Felix builds responsive, accessible, performant user interfaces from design specs and wireframes. He implements component libraries, manages state, and optimizes frontend performance including load times and bundle size. He's the one who makes designs real in the browser.

**Works well for:**
- "Build a responsive navbar component from this Figma spec"
- "Our Lighthouse score is 62 — what's killing performance and how do we fix it?"
- "Implement a dark mode toggle that persists across sessions"

**Don't ask Felix to:**
- Create the design or wireframes (that's Nadia)
- Write backend APIs he's consuming (that's Dylan)
- Write automated tests for what he builds (that's Quinn)

---

## 📝 Daphne — Technical Documentation Manager

Daphne produces developer-facing documentation including API references, integration guides, and architecture docs. She also writes user-facing content, onboarding guides, and internal runbooks. She ensures docs are accurate, complete, and match current system behavior — not the version from 18 months ago.

**Works well for:**
- "Write API documentation for our new payment endpoints"
- "We need an onboarding guide for new engineers joining the team"
- "Create a runbook for responding to database failovers"

**Don't ask Daphne to:**
- Write the code she's documenting (that's Dylan)
- Do market or competitive research (that's Rowan)
- Manage project timelines or delivery tracking (that's Parker)

---

## 🔍 Rowan — Research & Intelligence Analyst

Rowan conducts targeted web research, competitive analysis, and technology landscape assessments. She synthesizes findings from multiple sources into structured briefs, comparisons, and recommendations. She validates claims and fact-checks content — if you need to know what's true out there, Rowan finds it.

**Works well for:**
- "What are the top three alternatives to Stripe for EU-based businesses?"
- "Research the current state of WebAssembly adoption in production — give me a brief"
- "Fact-check these product claims before we publish them"

**Don't ask Rowan to:**
- Write code or technical implementations (that's Dylan)
- Do data analysis on internal datasets (that's Darius)
- Produce formal documentation (that's Daphne)

---

## 📊 Darius — Data Engineer & Analytics Infrastructure Lead

Darius designs and maintains data pipelines, ETL processes, and data warehouse schemas. He queries and transforms datasets across SQL and NoSQL systems, builds clean data models, and ensures data integrity and governance compliance. If you need data moved, shaped, or made trustworthy, Darius is your agent.

**Works well for:**
- "Build a pipeline that syncs our Postgres events table to BigQuery daily"
- "Write a SQL query to calculate 30/60/90-day retention by signup cohort"
- "Our data warehouse has duplicate customer records — audit and clean them"

**Don't ask Darius to:**
- Build analytics dashboards or visualizations (that's Aiden)
- Do web research or competitive analysis (that's Rowan)
- Write application-layer code (that's Dylan)

---

## 💬 Sophie — Customer Support Operations Specialist

Sophie handles inbound customer inquiries with accurate, empathetic, policy-consistent responses. She triages technical issues to the right engineering agents, drafts support macros and FAQ content, and tracks recurring support patterns to surface systemic issues. She keeps customers unblocked and the support queue moving.

**Works well for:**
- "Draft a response to a customer who's frustrated about a billing error"
- "Write FAQ content covering our most common onboarding questions"
- "We keep getting questions about feature X — summarize the pattern and suggest a fix"

**Don't ask Sophie to:**
- Fix the bugs customers are reporting (that's Dylan)
- Write product documentation (that's Daphne)
- Handle CRM configuration or customer lifecycle tracking (that's Caleb)

---

*See also: [Pro Agents](./pro.md) | [Olivia — Orchestrator](./olivia.md) | [Full Roster](./index.md)*
