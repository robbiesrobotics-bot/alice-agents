# GitHub Webhook Setup — A.L.I.C.E. Issue Triage

This guide configures the GitHub webhook that routes issues and merged PRs into Dylan's triage inbox.

---

## What This Does

When a GitHub issue is labeled **bug** or **enhancement**, a JSON file is written to `support/inbox/` for Dylan to process. When a PR is merged, a JSON file is written for Clara to use in update announcements.

---

## Step 1 — Generate a Webhook Secret

Generate a strong random secret:

```bash
openssl rand -hex 32
```

Save this value — you'll need it in both GitHub and your environment.

---

## Step 2 — Add the Secret to Your Environment

In your landing site deployment (Vercel, or local `.env.local`):

```
GITHUB_WEBHOOK_SECRET=<your-secret-from-step-1>
```

It's also in `.env.example` as a reminder.

---

## Step 3 — Configure the Webhook in GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Payload URL** | `https://getalice.av3.ai/api/github/webhook` |
| **Content type** | `application/json` |
| **Secret** | The secret you generated in Step 1 |
| **SSL verification** | Enable SSL verification ✓ |

4. Under **Which events would you like to trigger this webhook?**, select **Let me select individual events**, then check:
   - ✅ **Issues**
   - ✅ **Pull requests**
   - Uncheck everything else

5. Ensure **Active** is checked, then click **Add webhook**

---

## Step 4 — Verify It's Working

After saving, GitHub will send a `ping` event. You can check delivery status under **Settings → Webhooks → [your webhook] → Recent Deliveries**.

To test manually, label a GitHub issue as `bug` or `enhancement` and confirm a file appears in `support/inbox/github-[issue-number].json`.

---

## Inbox File Formats

### Bug / Enhancement (`support/inbox/github-[issue-number].json`)
```json
{
  "type": "bug",
  "issueNumber": 42,
  "title": "Something is broken",
  "body": "Steps to reproduce...",
  "url": "https://github.com/owner/repo/issues/42",
  "createdAt": "2026-03-17T00:00:00Z"
}
```

### PR Merged (`support/inbox/pr-merged-[pr-number].json`)
```json
{
  "type": "pr-merged",
  "prNumber": 17,
  "title": "feat: new feature",
  "body": "Description...",
  "url": "https://github.com/owner/repo/pull/17",
  "mergedAt": "2026-03-17T12:00:00Z",
  "mergedBy": "robcaw",
  "branch": "feature/new-thing",
  "baseBranch": "main"
}
```

---

## Handler Response Codes

| Status | Meaning |
|--------|---------|
| `200` | Event received and processed |
| `204` | Event received but not handled (ignored) |
| `401` | Bad or missing signature |
| `500` | Internal error (check logs) |
