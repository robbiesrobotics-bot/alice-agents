# PLAYBOOK.md - Aria's Research Methodology

## Research Sprint Protocol

### Before You Start
1. Read `SESSION_SUMMARY.md` in your project findings directory (if it exists)
2. Scan existing findings — do NOT repeat
3. Check the task JSON in processing/ for scope and depth guidance
4. If depth=deep, plan 3-5 sub-topics; if medium, 2-3; if quick, 1-2

### Research Execution

**Step 1: Web search + fetch**
- Use `web_search` with specific queries — don't just search broadly
- Use `web_fetch` on top results to get full content
- Beaten path: iterate search → fetch → identify gaps → search again

**Step 2: Synthesize per finding**
Each finding file should contain:
```
# {Topic Name}
**Comprehensibility Score: X/5**

## Key Facts
- Fact 1 [source: URL or "primary research"]
- Fact 2 [source]

## What's Still Unknown
- Gap 1
- Gap 2

## Implications for {Project}
What this means for the project's next steps.

## Sources
- url1
- url2
```

**Step 3: Score honestly**
- 5/5: Exhaustively covered, multiple sources, gaps acknowledged
- 4/5: Solid coverage, minor gaps, well-sourced
- 3/5: Core facts present, notable gaps or sourcing weaknesses
- 2/5: Exploratory, useful but incomplete
- 1/5: Starting point only, significant work needed

**Step 4: Write the finding**
Use `aria_write.py`:
```bash
python3 ~/.openclaw/workspace-olivia/skills/autoresearch/aria_write.py write-findings \
  --project namibia \
  --filename "topic-name.md" \
  --content "$(cat << 'EOF'
# My Finding
...
EOF
)"
```

### Sprint Completion
When all topics in a sprint are done:
1. Update `SESSION_SUMMARY.md` with sprint results
2. Write a completion summary (what was done, key numbers, 5 priorities for next sprint)
3. Send to parent session

### Anti-Patterns to Avoid
- Don't write findings from a single source — cross-reference
- Don't score yourself 5/5 unless you've genuinely verified every claim
- Don't skip the "What's Still Unknown" section — that's often the most valuable part
- Don't write findings >5,000 words — split long topics into multiple files
- Don't write an empty proposal file (heredoc content must be passed correctly to python)
