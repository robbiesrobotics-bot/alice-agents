"""
pool_router.py — A.L.I.C.E. Pool Resolver + Agent Selector + Task Classifier

Dylan (Backend/API specialist) — Implementation for Olivia's orchestration logic.

Exposes:
    resolve_pool(task_description: str) -> str
    select_agent(pool: str, task_description: str) -> str
    classify_task(task_description: str) -> dict
"""

from __future__ import annotations

import json
import re
import time
from typing import Optional

# ---------------------------------------------------------------------------
# POOL DEFINITIONS (from spawn-strategy.md Section 2.1)
# ---------------------------------------------------------------------------

POOLS: dict[str, dict] = {
    "ui":          {"primary": "felix",       "backups": ["nadia", "quinn"]},
    "design":      {"primary": "nadia",       "backups": ["felix"]},
    "backend":     {"primary": "dylan",       "backups": ["isaac"]},
    "frontend":    {"primary": "felix",       "backups": []},
    "qa":          {"primary": "quinn",       "backups": ["smoketestagent"]},
    "security":    {"primary": "selena",      "backups": ["logan"]},
    "devops":      {"primary": "devon",       "backups": ["owen", "avery"]},
    "docs":        {"primary": "daphne",      "backups": ["parker"]},
    "research":    {"primary": "rowan",       "backups": ["uma", "aria"]},
    "data":        {"primary": "darius",      "backups": ["aiden", "alex"]},
    "marketing":   {"primary": "morgan",      "backups": ["clara", "sloane"]},
    "operations":  {"primary": "owen",        "backups": ["avery", "parker"]},
    "product":     {"primary": "morgan",      "backups": ["eva"]},
    "crm":         {"primary": "caleb",       "backups": ["sophie"]},
    "financial":   {"primary": "audrey",      "backups": ["elena"]},
    "legal":       {"primary": "logan",       "backups": ["selena"]},
    "hr":          {"primary": "hannah",      "backups": ["clara"]},
    "integration": {"primary": "isaac",       "backups": ["alex", "nate"]},
    "autonomous-research": {"primary": "aria", "backups": ["rowan"]},
    "construction": {"primary": "maxxipro",  "backups": ["accuscope"]},
    "travel":      {"primary": "tommy",       "backups": ["uma", "rowan"]},
}

POOL_MEMBER_LIST: dict[str, list[str]] = {
    pool: [cfg["primary"]] + cfg["backups"]
    for pool, cfg in POOLS.items()
}

# Pool order for deterministic tie-breaking (alphabetical)
_POOL_ORDER = {p: i for i, p in enumerate(sorted(POOLS.keys()))}

# ---------------------------------------------------------------------------
# TASK TYPE LIMITS (from spawn-strategy.md Section 2.3)
# ---------------------------------------------------------------------------

TASK_TYPES: dict[str, dict] = {
    "quick":         {"max_concurrent": 8,  "timeout_seconds": 300},
    "standard":      {"max_concurrent": 4,  "timeout_seconds": 1800},
    "complex":       {"max_concurrent": 2,  "timeout_seconds": 5400},
    "deep-research": {"max_concurrent": 1,  "timeout_seconds": 14400},
    "infra-change":  {"max_concurrent": 1,  "timeout_seconds": 3600},
    "review":        {"max_concurrent": 4,  "timeout_seconds": 1200},
    "qa-pass":       {"max_concurrent": 3,  "timeout_seconds": 2700},
}

BUSY_BACKOFF_MS = 60_000
MAX_PER_AGENT_CONCURRENT = 3

# ---------------------------------------------------------------------------
# MATCHING ENGINE
# ---------------------------------------------------------------------------

def _keyword_match(text: str, keywords: list[str]) -> float:
    """
    Score keyword/phrase matches in text.

    Multi-word phrase: +1.0 for exact substring match.
    Single-word with word-boundary match: +1.0.
    Single-word substring fallback (kw >= 4 chars): +0.3.
    """
    score = 0.0
    text_lower = text.lower()

    for kw in keywords:
        kw_lower = kw.lower()
        if " " in kw_lower:
            # Phrase: exact substring
            if kw_lower in text_lower:
                score += 1.0
        elif re.search(r'\b' + re.escape(kw_lower) + r'\b', text_lower):
            score += 1.0
    return score


# ---------------------------------------------------------------------------
# POOL KEYWORD INDEX
# ---------------------------------------------------------------------------

POOL_SCORE_KEYWORDS: dict[str, list[str]] = {
    "backend": [
        # Bug fixes (QA reproduces; backend fixes)
        "bug fix", "fix bug", "stack trace", "runtime error", "null pointer",
        "exception", "500 error", "crash", "memory leak",
        # Backend code changes
        "backend", "api endpoint", "api service", "data model", "server-side",
        "middleware", "crud endpoint", "rest api", "graphql api",
        "refactor", "code review", "pull request", "full-stack",
        # Languages / frameworks
        "python", "nodejs", "fastapi", "express", "django", "flask",
        "postgresql", "mysql", "redis", "websockets",
        # Auth (backend-owned)
        "authentication endpoint", "login endpoint", "auth endpoint",
        "jwt token", "bearer token",
    ],
    "frontend": [
        "frontend", "front-end", "react", "jsx", "tsx", "vue", "angular",
        "css", "html", "javascript", "typescript",
        "component library", "webpack", "vite", "tailwind", "sass",
        "dom", "browser", "bundle size", "web vitals",
        "frontend code",
    ],
    "ui": [
        "ui design", "user interface", "button", "modal", "layout",
        "screen design", "pixel perfect", "mockup", "ui implementation",
        "accessibility", "wcag", "aria", "responsive",
    ],
    "design": [
        "design", "wireframe", "figma", "mockup", "design system", "typography",
        "color palette", "visual design", "branding", "logo", "icon",
        "user experience", "ux design",
    ],
    "qa": [
        # Explicit testing terms
        "test suite", "regression test", "run test", "execute test",
        "qa pass", "qa review", "functional test", "integration test",
        "end-to-end test", "e2e test",
        # Automation frameworks
        "playwright", "selenium", "cypress", "test automation",
        # Bug investigation (not fixing)
        "test case", "assertion", "test coverage", "flaky test", "smoke test",
    ],
    "security": [
        "security", "vulnerability", "pen test", "hardcoded secret",
        "exposure", "hardening", "encryption at rest", "owasp",
        "auth vulnerability", "xss", "sql injection", "csrf",
        "compliance", "gdpr", "ccpa", "threat model", "security audit",
        "secrets audit", "penetration test", "zero-day", "cve",
    ],
    "devops": [
        "devops", "ci cd", "pipeline", "docker", "kubernetes", "k8s",
        "terraform", "deployment", "release", "helm", "ingress",
        "nginx", "cloud infrastructure", "aws", "gcp", "azure",
        "github actions", "gitlab ci", "monitoring", "alerting",
        "runbook", "sre", "on-call",
    ],
    "docs": [
        "docs", "documentation", "readme", "guide", "runbook",
        "api reference", "changelog", "onboarding guide", "manual",
        "how-to", "technical writing",
    ],
    "research": [
        "research", "competitive analysis", "market research", "survey",
        "intel", "benchmark", "trend analysis", "findings", "investigation",
        "deep research", "comprehensive analysis",
    ],
    "data": [
        "data pipeline", "etl", "data warehouse", "sql query", "dashboard",
        "analytics", "metric", "kpi", "reporting", "schema design",
        "dbt", "airflow", "data migration",
    ],
    "marketing": [
        "marketing", "campaign", "seo", "paid ads", "social media",
        "email campaign", "content strategy", "brand positioning",
        "go-to-market", "gtm",
    ],
    "operations": [
        "operations", "business process", "workflow", "vendor management",
        "sop", "org design", "policy", "process improvement",
    ],
    "product": [
        "product", "roadmap", "feature prioritization", "product brief",
        "user story", "mvp", "product launch",
    ],
    "crm": [
        "crm", "salesforce", "hubspot", "lead", "contact record",
        "account management", "opportunity", "deal stage",
        "crm audit", "crm data", "pipeline management",
        "acculynx", "accuLynx",
    ],
    "financial": [
        "financial", "budget", "forecast", "invoice", "expense",
        "p&l", "cash flow", "accounting", "accounts payable",
        "accounts receivable", "controller", "financial statement",
        "variance analysis", "monthly close",
    ],
    "legal": [
        "legal", "contract", "agreement", "nda", "terms of service",
        "compliance", "privacy policy", "liability", "risk assessment",
        "legal review", "contractor agreement",
    ],
    "hr": [
        "hr", "hiring", "onboarding", "feedback", "performance review",
        "policy", "people ops", "compensation", "job description",
        "candidate screening", "interview",
    ],
    "integration": [
        # Must check BEFORE operations fallback — "n8n", "zapier" etc.
        "integration", "n8n", "zapier", "make.com", "webhook",
        "third-party api", "api connection", "oauth flow",
        "slack integration", "stripe integration", "hubspot integration", "hubspot sync", "hubspot",  # standalone to beat CRM fallback,
        "data sync",
    ],
    "autonomous-research": [
        "autonomous research", "long-running research", "persistent agent",
        "aria", "multi-sprint research",
    ],
    "construction": [
        "roof", "roofing", "remodeling", "construction", "dealer",
        "roof maxx", "shingle", "contractor", "roof maxx connect",
    ],
    "travel": [
        "travel", "flight", "hotel", "booking", "itinerary",
        "trip planning", "airline", "visa", "logistics",
    ],
}

# ---------------------------------------------------------------------------
# TASK CLASSIFICATION KEYWORDS
# ---------------------------------------------------------------------------

TASK_CLASSIFICATION_KEYWORDS: dict[str, list[str]] = {
    "quick":         ["lookup", "find", "what is", "who is", "quick", "simple",
                       "single file", "one file", "factual", "read only"],
    "standard":      ["build", "create", "implement", "fix", "update",
                       "add feature", "write", "edit", "modify", "integrate",
                       "configure", "screen candidates"],
    "complex":       ["architect", "redesign", "refactor", "multi-file",
                       "multi-component", "system design", "distributed",
                       "overhaul", "migration"],
    "deep-research": ["research", "competitive intel", "survey",
                       "long-running", "autonomous", "investigate",
                       "comprehensive", "deep research"],
    "infra-change":  ["terraform", "kubernetes", "kubectl", "helm",
                       "ci cd pipeline", "provision", "infrastructure",
                       "deploy to production", "apply changes to prod"],
    "review":        ["review", "pr review", "code review", "security audit",
                       "assess", "evaluate", "pull request", "financial review",
                       "variance", "audit"],
    "qa-pass":       ["qa pass", "regression", "test suite", "qa review",
                       "smoke test", "full regression", "sign off",
                       "run test", "execute test"],
}

# ---------------------------------------------------------------------------
# SESSION CACHE
# ---------------------------------------------------------------------------

_session_cache: dict[str, int] = {}
_session_cache_ts: float = 0
SESSION_CACHE_TTL: float = 30.0


def _refresh_session_cache() -> None:
    global _session_cache, _session_cache_ts
    import subprocess
    try:
        result = subprocess.run(
            ["openclaw", "sessions", "list", "--format", "json"],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0:
            sessions = json.loads(result.stdout)
            counts: dict[str, int] = {}
            for s in sessions:
                aid = s.get("agentId", "")
                if aid:
                    counts[aid] = counts.get(aid, 0) + 1
            _session_cache = counts
            _session_cache_ts = time.time()
    except Exception:
        pass


def get_active_sessions(agent_id: str) -> int:
    if time.time() - _session_cache_ts > SESSION_CACHE_TTL:
        _refresh_session_cache()
    return _session_cache.get(agent_id, 0)


# ---------------------------------------------------------------------------
# PHASE 1: Pool Resolver
# ---------------------------------------------------------------------------

def resolve_pool(task_description: str) -> str:
    """
    Return the best-matching pool name for a task description.

    Strategy:
      1. Score all pools by keyword overlap (phrase + word-boundary + substring).
      2. Deterministic tie-break: highest score, then lowest pool ordinal.
      3. Apply ordered fallback heuristics if score == 0.
      4. Default to "backend".
    """
    text = task_description.lower()

    scores: dict[str, float] = {}
    for pool, kws in POOL_SCORE_KEYWORDS.items():
        scores[pool] = _keyword_match(text, kws)

    # Deterministic best: highest score, then lowest pool ordinal (alphabetical)
    best_pool = max(scores, key=lambda p: (scores[p], -_POOL_ORDER[p]))
    if scores[best_pool] > 0:
        return best_pool

    # Fallback heuristics (more specific terms listed before general ones)
    if any(w in text for w in ["bug fix", "fix bug", "stack trace", "runtime error",
                                 "null pointer", "exception", "500 error"]):
        return "backend"
    if any(w in text for w in ["frontend", "react", "jsx", "tsx", "css", "html",
                                 "component"]):
        return "frontend"
    if any(w in text for w in ["design", "figma", "wireframe"]):
        return "design"
    if any(w in text for w in ["test suite", "regression", "run test", "qa pass",
                                 "playwright", "cypress", "selenium", "smoke test"]):
        return "qa"
    if any(w in text for w in ["security", "vulnerability", "secret", "pen test",
                                 "penetration"]):
        return "security"
    if any(w in text for w in ["deploy", "ci/cd", "docker", "k8s", "terraform",
                                 "kubernetes", "pipeline", "helm"]):
        return "devops"
    if any(w in text for w in ["doc", "readme", "guide", "runbook"]):
        return "docs"
    if any(w in text for w in ["research", "competitive", "survey"]):
        return "research"
    if any(w in text for w in ["data", "pipeline", "etl", "sql"]):
        return "data"
    if any(w in text for w in ["marketing", "campaign", "seo"]):
        return "marketing"
    if any(w in text for w in ["n8n", "zapier", "webhook", "integration",
                                 "oauth"]):
        return "integration"
    if any(w in text for w in ["crm", "hubspot", "salesforce", "acculynx",
                                 "lead", "contact", "pipeline"]):
        return "crm"
    if any(w in text for w in ["budget", "invoice", "financial", "p&l",
                                 "variance", "forecast"]):
        return "financial"
    if any(w in text for w in ["contract", "legal", "nda", "agreement"]):
        return "legal"
    if any(w in text for w in ["hr", "hiring", "onboarding", "people", "candidate"]):
        return "hr"
    if any(w in text for w in ["roof", "roofing", "construction", "remodel"]):
        return "construction"
    if any(w in text for w in ["travel", "flight", "hotel", "booking", "trip"]):
        return "travel"
    if any(w in text for w in ["ops", "workflow", "process", "vendor"]):
        return "operations"
    if any(w in text for w in ["product", "roadmap", "feature", "launch"]):
        return "product"

    return "backend"


# ---------------------------------------------------------------------------
# PHASE 2: Agent Selector
# ---------------------------------------------------------------------------

AGENT_SPECIALTY_KEYWORDS: dict[str, list[str]] = {
    "dylan":        ["backend", "api", "code", "bug", "service", "database",
                     "full-stack", "python", "node", "refactor", "stack trace",
                     "pull request", "fastapi", "express", "django"],
    "felix":        ["frontend", "react", "component", "css", "ui", "accessibility",
                     "browser", "performance", "javascript", "typescript"],
    "nadia":        ["design", "figma", "wireframe", "design system", "visual",
                     "typography", "color palette", "branding"],
    "quinn":        ["qa", "test", "bug", "regression", "automation", "playwright",
                     "selenium", "cypress", "test suite", "coverage"],
    "selena":       ["security", "vulnerability", "audit", "secret", "compliance",
                     "threat", "hardening", "oauth", "jwt", "encryption"],
    "devon":        ["devops", "ci cd", "docker", "kubernetes", "deployment",
                     "pipeline", "terraform", "cloud", "aws", "gcp", "azure"],
    "daphne":       ["docs", "documentation", "readme", "guide", "api docs",
                     "runbook", "changelog"],
    "rowan":        ["research", "competitive analysis", "intel", "survey",
                     "benchmark", "market research", "trend"],
    "darius":       ["data", "pipeline", "etl", "warehouse", "sql", "analytics",
                     "dbt", "airflow", "schema"],
    "isaac":        ["integration", "api", "webhook", "oauth", "third-party",
                     "connection", "sync"],
    "morgan":       ["marketing", "campaign", "seo", "content", "brand",
                     "positioning", "go-to-market"],
    "owen":         ["operations", "workflow", "process", "vendor", "sop"],
    "caleb":        ["crm", "salesforce", "hubspot", "lead", "account",
                     "pipeline", "deal", "opportunity"],
    "audrey":       ["financial", "budget", "forecast", "invoice", "p&l",
                     "cash flow", "accounting", "payable", "receivable"],
    "logan":        ["legal", "contract", "nda", "compliance", "gdpr",
                     "terms", "liability", "privacy policy"],
    "hannah":       ["hr", "hiring", "onboarding", "policy", "people",
                     "feedback", "performance", "compensation"],
    "clara":        ["content", "communications", "messaging", "brand voice"],
    "avery":        ["automation", "workflow", "n8n", "zapier", "process",
                     "no-code", "integration"],
    "elena":        ["estimation", "scoping", "effort", "project plan",
                     "complexity", "task breakdown"],
    "eva":          ["executive", "scheduling", "briefing", "coordination",
                     "calendar", "meeting prep"],
    "parker":       ["project", "delivery", "roadmap", "milestone", "status",
                     "sprint", "retrospective", "dependency"],
    "aiden":        ["analytics", "kpi", "dashboard", "insights", "cohort",
                     "trend", "business intelligence"],
    "alex":         ["scraper", "crawl", "extraction", "web data",
                     "rate limit", "robots.txt"],
    "uma":          ["ux", "user research", "usability", "interview", "survey",
                     "qualitative", "persona"],
    "sloane":       ["sales", "pipeline", "revenue", "prospecting", "deal",
                     "win/loss", "quotation"],
    "tommy":        ["travel", "flight", "hotel", "booking", "itinerary",
                     "visa", "logistics", "ground transport"],
    "aria":         ["autonomous", "deep research", "long-running", "independent",
                     "multi-sprint", "persistent"],
    "nate":         ["n8n", "workflow", "automation", "node", "docker"],
    "maxxipro":     ["roof maxx", "roofing", "dealer", "construction", "shingle",
                     "roof maxx connect", "service maxx", "warranty"],
    "accuscope":    ["acculynx", "crm audit", "profitability", "job data",
                     "accuLynx", "lead source", "a/r aging"],
    "smoketestagent": ["smoke test", "qa", "test", "regression", "automation"],
    "sophie":       ["support", "customer", "inquiry", "triage", "help desk"],
}

# Agent ordinal for deterministic tie-breaking
_AGENT_ORDER = {a: i for i, a in enumerate(sorted(AGENT_SPECIALTY_KEYWORDS.keys()))}


def _specialty_score(agent_id: str, pool: str, task_description: str) -> float:
    """Score how well an agent's specialty matches the task domain."""
    text = task_description.lower()
    score = 0.0

    for bonus in AGENT_SPECIALTY_KEYWORDS.get(agent_id, []):
        bl = bonus.lower()
        if " " in bl:
            if bl in text:
                score += 1.5
        elif re.search(r'\b' + re.escape(bl) + r'\b', text):
            score += 1.5

    if POOLS.get(pool, {}).get("primary") == agent_id:
        score += 0.5

    return score


def select_agent(pool: str, task_description: str) -> str | None:
    """
    Return the best available agent from the given pool.

    - Scores each pool member by specialty match to task.
    - Filters out agents at MAX_PER_AGENT_CONCURRENT capacity.
    - Retries at 2s intervals up to BUSY_BACKOFF_MS.
    - Returns None if all agents at capacity (escalate to Rob).
    """
    if pool not in POOLS:
        return None

    members = POOL_MEMBER_LIST[pool]
    deadline = time.time() + (BUSY_BACKOFF_MS / 1000)

    while time.time() < deadline:
        candidates: list[tuple[str, float]] = []

        for agent_id in members:
            active = get_active_sessions(agent_id)
            if active >= MAX_PER_AGENT_CONCURRENT:
                continue

            raw_score = _specialty_score(agent_id, pool, task_description)
            # Tie-break: prefer higher ordinal (alphabetical) at equal score
            # (This is deterministic; Olivia can override via affinity)
            adjusted = (raw_score, -_AGENT_ORDER.get(agent_id, 0))
            candidates.append((agent_id, raw_score))  # store raw for sort

        if candidates:
            # Sort by score desc, then agent ordinal asc
            candidates.sort(key=lambda x: (x[1], _AGENT_ORDER.get(x[0], 0)),
                             reverse=True)
            return candidates[0][0]

        time.sleep(2)

    return None


def select_agents_for_parallel(pool: str, task_description: str,
                                count: int) -> list[str]:
    """
    Return up to `count` agent ids from the pool for parallel work.
    Olivia handles spinUpDuplicates=true — this returns unique agent ids
    with available capacity; Olivia deduplicates and manages concurrency.
    """
    if pool not in POOLS:
        return []

    members = POOL_MEMBER_LIST[pool]
    selected: list[str] = []

    for agent_id in members:
        active = get_active_sessions(agent_id)
        slots = MAX_PER_AGENT_CONCURRENT - active
        for _ in range(max(0, min(slots, count - len(selected)))):
            selected.append(agent_id)
        if len(selected) >= count:
            break

    return selected[:count]


# ---------------------------------------------------------------------------
# PHASE 3: Task Classifier
# ---------------------------------------------------------------------------

_TASK_TYPE_ORDER = {t: i for i, t in enumerate(sorted(TASK_TYPES.keys()))}


def classify_task(task_description: str) -> dict:
    """
    Classify a task description into a task type.

    Returns:
        {"type": str, "timeout_seconds": int, "max_concurrent": int}
    """
    text = task_description.lower()

    scores = {t: _keyword_match(text, kws)
              for t, kws in TASK_CLASSIFICATION_KEYWORDS.items()}

    if not scores or max(scores.values()) == 0:
        detected_type = "standard"
    else:
        # Tie-break: lowest type ordinal (alphabetical)
        detected_type = max(scores,
                            key=lambda t: (scores[t], -_TASK_TYPE_ORDER[t]))

    cfg = TASK_TYPES.get(detected_type, TASK_TYPES["standard"])
    return {
        "type": detected_type,
        "timeout_seconds": cfg["timeout_seconds"],
        "max_concurrent": cfg["max_concurrent"],
    }


# ---------------------------------------------------------------------------
# CONVENIENCE: Full Route
# ---------------------------------------------------------------------------

def route_task(task_description: str) -> dict:
    """
    Full routing decision: pool → agent → task classification.

    Returns:
        {
            "pool": str,
            "agent_id": str | None,   # None = escalate (all busy)
            "task_type": str,
            "timeout_seconds": int,
            "max_concurrent": int,
        }
    """
    pool = resolve_pool(task_description)
    agent_id = select_agent(pool, task_description)
    classification = classify_task(task_description)

    return {
        "pool": pool,
        "agent_id": agent_id,
        "task_type": classification["type"],
        "timeout_seconds": classification["timeout_seconds"],
        "max_concurrent": classification["max_concurrent"],
    }


# ---------------------------------------------------------------------------
# DIAGNOSTICS
# ---------------------------------------------------------------------------

def pool_list() -> list[str]:
    return list(POOLS.keys())


def pool_members(pool: str) -> list[str]:
    return POOL_MEMBER_LIST.get(pool, [])


def agent_loads() -> dict[str, int]:
    _refresh_session_cache()
    return dict(_session_cache)


if __name__ == "__main__":
    test_tasks = [
        "Fix the bug in the user authentication endpoint that causes 500 errors",
        "Design a new landing page wireframe for the product launch",
        "Run a full regression test suite on the checkout flow",
        "Research competitor pricing for AI coding assistants",
        "Build a new API endpoint to handle file uploads",
        "Write the API documentation for the new v2 endpoints",
        "Deploy the latest changes to production with Terraform",
        "Review the PR for the payment service refactor",
        "Set up a new n8n workflow to sync HubSpot contacts",
        "Plan a 3-day business trip to Chicago for the team",
        "Audit the AccuLynx CRM for data quality issues",
        "Run a smoke test on the login flow",
        "Deep research on LLM benchmarks for the BLLM project",
        "Analyze the Q1 financial statements and variance vs budget",
        "Screen 20 candidates for the senior engineer role and rank them",
        "Create a React button component with accessibility support",
        "Run a full Terraform apply on the production environment",
        "Investigate the memory leak in the Python service",
        "Run a penetration test on the authentication system",
        "Draft a contract review for the new vendor agreement",
    ]

    print("=" * 70)
    print("pool_router.py — smoke test")
    print("=" * 70)

    for task in test_tasks:
        result = route_task(task)
        print(f"\nTask: {task[:65]}...")
        print(f"  pool={result['pool']}  agent={result['agent_id']}  "
              f"type={result['task_type']}  timeout={result['timeout_seconds']}s  "
              f"max_concurrent={result['max_concurrent']}")

    print("\n\n[pool_list]", pool_list())
    print("[pool_members:qa]", pool_members("qa"))
    print("[pool_members:backend]", pool_members("backend"))
    print("[pool_members:devops]", pool_members("devops"))
    print("[pool_members:integration]", pool_members("integration"))
    print("[pool_members:construction]", pool_members("construction"))
    print("[pool_members:autonomous-research]", pool_members("autonomous-research"))
