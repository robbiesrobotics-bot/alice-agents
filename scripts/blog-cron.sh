#!/bin/bash
# A.L.I.C.E. Blog Post Cron
# Runs 2x weekly (Tue + Thu). Spawns a subagent to write a new post and push to GitHub.
# Add to crontab: 0 9 * * 2,4 /Users/aliceclaw/.openclaw/workspace-olivia/alice-agents/scripts/blog-cron.sh

set -e

LANDING_DIR="/Users/aliceclaw/.openclaw/workspace-olivia/alice-agents/landing"
LOG_FILE="/Users/aliceclaw/.openclaw/workspace-olivia/alice-agents/scripts/blog-cron.log"

echo "[$(date)] Blog cron triggered" >> "$LOG_FILE"

# Ask Olivia to write a new blog post via OpenClaw
openclaw run --agent olivia --message "Write a new blog post for getalice.av3.ai. Save it to /Users/aliceclaw/.openclaw/workspace-olivia/alice-agents/landing/content/blog/ with today's date in the filename (YYYY-MM-DD-slug.md). Topics to rotate through: AI agent use cases, product updates, developer tutorials, comparisons with other tools, A.L.I.C.E. team spotlights, industry trends in AI orchestration. Make it genuinely useful, ~600-800 words, proper frontmatter (title, date, excerpt, author, tags, readTime). Then commit and push to git." >> "$LOG_FILE" 2>&1

# Git commit and push if there are new files
cd "$LANDING_DIR"
if [ -n "$(git status --porcelain content/blog/)" ]; then
  git add content/blog/
  git commit -m "blog: automated post $(date +%Y-%m-%d)"
  git push origin main
  echo "[$(date)] Blog post pushed successfully" >> "$LOG_FILE"
else
  echo "[$(date)] No new blog files to push" >> "$LOG_FILE"
fi
