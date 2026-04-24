#!/usr/bin/env python3
"""
test_pool_router.py — Demonstrates pool_router.py functionality.

Run:
    python3 test_pool_router.py

Tests:
    1. resolve_pool() — keyword matching to 21 pools
    2. select_agent() — specialty scoring + load awareness
    3. classify_task() — task type classification with correct limits
    4. route_task() — full end-to-end routing
    5. Diagnostics — pool_list, pool_members, agent_loads
"""

import sys
import os

# Add this dir to path so the module can be imported
sys.path.insert(0, os.path.dirname(__file__))

from pool_router import (
    resolve_pool, select_agent, classify_task, route_task,
    pool_list, pool_members, agent_loads,
    select_agents_for_parallel,
)

# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

POOL_TESTS = [
    # (task, expected_pool)
    ("Fix the bug in the user authentication endpoint that causes 500 errors", "backend"),
    ("Design a new landing page wireframe for the product launch", "design"),
    ("Run a full regression test suite on the checkout flow", "qa"),
    ("Research competitor pricing for AI coding assistants", "research"),
    ("Build a new API endpoint to handle file uploads", "backend"),
    ("Write the API documentation for the new v2 endpoints", "docs"),
    ("Deploy the latest changes to production with Terraform", "devops"),
    ("Review the PR for the payment service refactor", "backend"),
    ("Set up a new n8n workflow to sync HubSpot contacts", "integration"),
    ("Plan a 3-day business trip to Chicago for the team", "travel"),
    ("Audit the AccuLynx CRM for data quality issues", "crm"),
    ("Run a smoke test on the login flow", "qa"),
    ("Deep research on LLM benchmarks for the BLLM project", "research"),
    ("Analyze the Q1 financial statements and variance vs budget", "financial"),
    ("Screen 20 candidates for the senior engineer role and rank them", "hr"),
    ("Draft a contract review for the new vendor agreement", "legal"),
    ("Set up a new AWS EC2 instance with Terraform", "devops"),
    ("Create a React button component with accessibility support", "ui"),
    ("Investigate the memory leak in the Python service", "backend"),
    ("Run a penetration test on the authentication system", "security"),
]

CLASSIFY_TESTS = [
    # (task, expected_type)
    ("Find the current weather in New York", "quick"),
    ("Build a user registration API endpoint", "standard"),
    ("Architect a new microservices system from scratch", "complex"),
    ("Conduct comprehensive competitive research on AI coding tools", "deep-research"),
    ("Apply Terraform changes to the production environment", "infra-change"),
    ("Review the PR for the OAuth implementation", "review"),
    ("Run the full regression test suite before release", "qa-pass"),
]

SELECT_AGENT_TESTS = [
    # (pool, task, expected_agent)
    ("backend", "Build a new FastAPI endpoint", "dylan"),
    ("qa", "Run the regression test suite", "quinn"),
    ("devops", "Deploy to production with Terraform", "devon"),
    ("docs", "Write API documentation", "daphne"),
    ("research", "Research competitor pricing", "rowan"),
    ("crm", "Audit the Salesforce CRM", "caleb"),
    ("security", "Penetration test the auth system", "selena"),
    ("integration", "Set up a HubSpot webhook", "isaac"),
]


def run_tests():
    print("=" * 70)
    print("pool_router.py — test suite")
    print("=" * 70)

    passed = 0
    failed = 0

    # --- Phase 1: resolve_pool ---
    print("\n[Phase 1] resolve_pool()")
    print("-" * 50)
    for task, expected in POOL_TESTS:
        result = resolve_pool(task)
        status = "PASS" if result == expected else "FAIL"
        if result != expected:
            failed += 1
            print(f"  {status}: '{task[:50]}...'")
            print(f"         got={result}, expected={expected}")
        else:
            passed += 1
            print(f"  {status}: '{task[:50]}...' → {result}")

    # --- Phase 2: classify_task ---
    print("\n[Phase 2] classify_task()")
    print("-" * 50)
    for task, expected_type in CLASSIFY_TESTS:
        result = classify_task(task)
        status = "PASS" if result["type"] == expected_type else "FAIL"
        if result["type"] != expected_type:
            failed += 1
            print(f"  {status}: '{task[:45]}...'")
            print(f"         got type={result['type']}, expected={expected_type}")
        else:
            passed += 1
            print(f"  {status}: '{task[:45]}...' → {result['type']} "
                  f"(timeout={result['timeout_seconds']}s, "
                  f"max_concurrent={result['max_concurrent']})")

    # --- Phase 3: select_agent ---
    print("\n[Phase 3] select_agent() (specialty scoring)")
    print("-" * 50)
    # Note: select_agent returns None if all at capacity,
    # so we only check that it returns a valid agent from the pool.
    for pool, task, expected_agent in SELECT_AGENT_TESTS:
        result = select_agent(pool, task)
        if result is None:
            # All agents at capacity — this is ok, just note it
            print(f"  SKIP: {pool}/{expected_agent} — all agents at capacity")
            continue
        status = "PASS" if result == expected_agent else "WARN"
        if result != expected_agent:
            failed += 1
            print(f"  {status}: [{pool}] '{task[:35]}...'")
            print(f"         got agent={result}, expected={expected_agent}")
        else:
            passed += 1
            print(f"  {status}: [{pool}] '{task[:35]}...' → {result}")

    # --- Full route_task ---
    print("\n[Full routing] route_task() — demo")
    print("-" * 50)
    demo_tasks = [
        "Build a new API endpoint for user file uploads",
        "Design the login screen UI mockup",
        "Run regression tests on the checkout flow",
        "Research competitor pricing for the new AI feature",
        "Deploy the latest build to production with kubectl",
    ]
    for task in demo_tasks:
        r = route_task(task)
        print(f"  '{task[:55]}...'")
        print(f"    → pool={r['pool']}, agent={r['agent_id']}, "
              f"type={r['task_type']}, timeout={r['timeout_seconds']}s")

    # --- Diagnostics ---
    print("\n[Diagnostics]")
    print("-" * 50)
    print(f"  All pools ({len(pool_list())}): {pool_list()}")
    print(f"  qa pool members: {pool_members('qa')}")
    print(f"  backend pool members: {pool_members('backend')}")
    print(f"  devops pool members: {pool_members('devops')}")
    print(f"  integration pool members: {pool_members('integration')}")
    print(f"  autonomous-research pool members: {pool_members('autonomous-research')}")
    print(f"  construction pool members: {pool_members('construction')}")

    loads = agent_loads()
    if loads:
        print(f"\n  Agent loads ({len(loads)} agents tracked):")
        for aid, count in sorted(loads.items()):
            print(f"    {aid}: {count} active session(s)")
    else:
        print("\n  Agent loads: (no active sessions or cache miss)")

    # --- Parallel selection ---
    print("\n[Parallel selection] select_agents_for_parallel()")
    print("-" * 50)
    for pool in ["backend", "qa", "devops"]:
        agents = select_agents_for_parallel(pool, "multi-component task", count=3)
        print(f"  {pool} (requesting 3): {agents}")

    # ---------------------------------------------------------------------------
    print(f"\n{'=' * 70}")
    print(f"Results: {passed} passed, {failed} failed")
    print(f"{'=' * 70}")
    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
