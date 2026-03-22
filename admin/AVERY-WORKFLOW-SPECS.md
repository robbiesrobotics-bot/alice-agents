# AVERY-WORKFLOW-SPECS.md
## A.L.I.C.E. Business Automation Workflows
### Spec Author: Avery ⚙️ — Workflow Automation & Process Engineering Lead
### Status: Ready for Implementation by Felix (frontend) + Dylan (backend)

---

## Reference: Mission Control Node Types

| Node Type   | Usage                                                          |
|-------------|----------------------------------------------------------------|
| `trigger`   | Entry point — webhook, cron, event, or manual                 |
| `agent`     | Delegates a task to a named A.L.I.C.E. agent                  |
| `condition` | Boolean branch — `trueTargetId` / `falseTargetId`             |
| `tool`      | Calls an MCP/external tool directly                           |
| `parallel`  | Splits into concurrent branches (use before join agent)       |
| `approval`  | Pauses run for human approval (Rob or designated approver)    |
| `loop`      | Iterates over an array with `iterateOver` + `itemVar`         |
| `output`    | Renders final output using Handlebars-style template          |
| `transform` | Reshapes data mid-flow (no agent, just template mapping)      |
| `end`       | Terminal node for early exits / error paths                   |

**Variable binding syntax:**
- Trigger payload: `{{trigger.data.fieldName}}`
- Step output: `{{steps.nodeId.output}}`
- Step data: `{{steps.nodeId.data}}`
- Loop item: `{{item.fieldName}}`

---

## Workflow 1: New Customer Onboarding

**Template ID:** `tpl-customer-onboarding`
**Category:** operations
**Trigger type:** webhook
**Estimated run time:** 3–6 minutes
**Tags:** `onboarding`, `stripe`, `crm`, `email`, `sales`

### Trigger
```
type: webhook
event: stripe checkout.session.completed
token: stripe-onboarding-token
secret: STRIPE_WEBHOOK_SECRET
expectedContentType: application/json
```
**Payload variables available:**
- `{{trigger.data.customer_email}}`
- `{{trigger.data.customer_name}}`
- `{{trigger.data.metadata.plan}}` — "free" | "pro" | "enterprise"
- `{{trigger.data.customer_id}}` — Stripe customer ID
- `{{trigger.data.subscription_id}}`
- `{{trigger.data.amount_total}}`

### Node Graph

```
[trigger-1] stripe webhook
     ↓
[parallel-1] split: CRM + Slack in parallel
  ├── [agent-crm]   Caleb: create CRM record
  └── [agent-slack] tool: post to #sales Slack
     ↓ (join via agent-welcome)
[agent-welcome] Clara: send welcome email day 1
     ↓
[cond-plan] condition: is plan == "pro" or "enterprise"?
  ├── true → [cond-tier] condition: is plan == "enterprise"?
  │              ├── true  → [agent-enterprise] Sloane: personal outreach task
  │              └── false → [agent-checkin] Clara: schedule day-3 check-in email
  └── false → [agent-tag-free] Caleb: tag lifecycle as Free
     ↓
[agent-tag] Caleb: confirm CRM lifecycle tag updated
     ↓
[output-1] output: onboarding complete summary
```

### Node Specs

| ID               | Type      | Agent/Tool | Label                          | outputKey           |
|------------------|-----------|------------|--------------------------------|---------------------|
| `trigger-1`      | trigger   | —          | Stripe Checkout Completed      | —                   |
| `parallel-1`     | parallel  | —          | Parallel: CRM + Slack          | —                   |
| `agent-crm`      | agent     | caleb      | Create CRM Record              | `crmRecord`         |
| `tool-slack`     | tool      | —          | Post #sales Notification       | `slackPost`         |
| `agent-welcome`  | agent     | clara      | Send Welcome Email Day 1       | `welcomeEmail`      |
| `cond-plan`      | condition | —          | Plan is Pro or Enterprise?     | —                   |
| `cond-tier`      | condition | —          | Plan is Enterprise?            | —                   |
| `agent-checkin`  | agent     | clara      | Schedule Day-3 Check-in Email  | `checkinScheduled`  |
| `agent-enterprise` | agent   | sloane     | Route to Sloane for Outreach   | `enterpriseOutreach`|
| `agent-tag`      | agent     | caleb      | Tag CRM Lifecycle: Free → Pro  | `crmTagUpdate`      |
| `output-1`       | output    | —          | Onboarding Complete            | `onboardingResult`  |

### Detailed Task Strings

**agent-crm (Caleb):**
```
Create a new CRM record for the following customer:
- Email: {{trigger.data.customer_email}}
- Name: {{trigger.data.customer_name}}
- Stripe Customer ID: {{trigger.data.customer_id}}
- Plan: {{trigger.data.metadata.plan}}
- Subscription ID: {{trigger.data.subscription_id}}
- Lifecycle stage: new_customer
Set status to active and log creation timestamp.
```

**tool-slack:**
```
toolName: slack_post_message
inputArgs:
  channel: "#sales"
  text: "🎉 New {{trigger.data.metadata.plan}} customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}}) — ${{trigger.data.amount_total}} — Stripe ID: {{trigger.data.customer_id}}"
```

**agent-welcome (Clara):**
```
Send day-1 welcome email to {{trigger.data.customer_email}} ({{trigger.data.customer_name}}).
CRM record was created: {{steps.agent-crm.output}}
Plan: {{trigger.data.metadata.plan}}
Use the standard welcome email template. Include:
- Personalized greeting
- Quick start guide link
- Support contact
- Link to docs
```

**cond-plan expression:**
```javascript
steps["agent-welcome"].output && (trigger.data.metadata.plan === "pro" || trigger.data.metadata.plan === "enterprise")
```

**cond-tier expression:**
```javascript
trigger.data.metadata.plan === "enterprise"
```

**agent-checkin (Clara):**
```
Schedule a day-3 follow-up check-in email for Pro customer {{trigger.data.customer_email}}.
Email should be friendly, ask if they have questions, offer a 15-min onboarding call.
Tag as "onboarding_day3" drip in email system. Scheduled for 72 hours from now.
```

**agent-enterprise (Sloane):**
```
New Enterprise customer requires personal outreach:
- Name: {{trigger.data.customer_name}}
- Email: {{trigger.data.customer_email}}
- Stripe ID: {{trigger.data.customer_id}}
Research the company if possible. Draft a personalized outreach email from Rob's voice.
Add to Enterprise pipeline in CRM. Flag for high-priority follow-up within 24 hours.
CRM record: {{steps.agent-crm.output}}
```

**agent-tag (Caleb):**
```
Update CRM lifecycle tag for {{trigger.data.customer_email}}:
- Previous stage: free
- New stage: {{trigger.data.metadata.plan}}
- CRM record: {{steps.agent-crm.output}}
Log the lifecycle transition with timestamp.
```

### Error Handling

| Failing Node      | Fallback                                                                      |
|-------------------|-------------------------------------------------------------------------------|
| `agent-crm`       | Retry 2x → log failure → post to #sales-alerts Slack → continue workflow      |
| `tool-slack`      | Non-blocking: log failure, continue — Slack is best-effort                    |
| `agent-welcome`   | Retry 2x → escalate to Eva → queue for manual send                            |
| `agent-enterprise`| Alert Eva immediately — enterprise customers cannot go silent                 |
| Any other node    | Log to workflow run, post summary error to #ops-alerts                        |

---

## Workflow 2: Support Ticket Router

**Template ID:** `tpl-support-ticket-router`
**Category:** support
**Trigger type:** webhook
**Estimated run time:** 2–8 minutes (varies by classification path)
**Tags:** `support`, `triage`, `routing`, `sla`, `github`, `billing`

### Trigger
```
type: webhook
event: new_support_ticket
token: support-router-token
```
**Payload variables:**
- `{{trigger.data.ticket_id}}`
- `{{trigger.data.subject}}`
- `{{trigger.data.body}}`
- `{{trigger.data.customer_email}}`
- `{{trigger.data.customer_plan}}` — "free" | "pro" | "enterprise"
- `{{trigger.data.channel}}` — "email" | "discord" | "telegram" | "form"

### Node Graph

```
[trigger-1] new ticket
     ↓
[agent-classify] Sophie: classify → Bug / Billing / General / Enterprise
     ↓
[transform-sla] set SLA timer based on plan tier
     ↓
[cond-type] condition: classification
  ├── Bug         → [agent-bug-assign] Dylan: assign + create GitHub issue
  ├── Billing     → [agent-billing] Sloane: assign + pull Stripe record
  ├── General     → [agent-general] Sophie: draft response → [approval-rob] Rob approval
  └── Enterprise  → [parallel-enterprise]
                        ├── [agent-eva] Eva: route to enterprise queue
                        └── [agent-sloane-notify] Sloane: notified + add to pipeline
     ↓
[output-1] ticket routed summary
```

> Note: `condition` node supports string matching via expression. Use chained conditions for 4-way split.

### Node Specs

| ID                    | Type      | Agent   | Label                              | outputKey              |
|-----------------------|-----------|---------|------------------------------------|------------------------|
| `trigger-1`           | trigger   | —       | New Support Ticket                 | —                      |
| `agent-classify`      | agent     | sophie  | Classify Ticket                    | `classification`       |
| `transform-sla`       | transform | —       | Set SLA Deadline                   | `slaDeadline`          |
| `cond-is-bug`         | condition | —       | Classification = Bug?              | —                      |
| `cond-is-billing`     | condition | —       | Classification = Billing?          | —                      |
| `cond-is-enterprise`  | condition | —       | Classification = Enterprise?       | —                      |
| `agent-bug-assign`    | agent     | dylan   | Assign Bug + Create GitHub Issue   | `bugIssue`             |
| `agent-billing`       | agent     | sloane  | Assign Billing + Pull Stripe       | `billingRecord`        |
| `agent-general`       | agent     | sophie  | Draft General Response             | `generalDraft`         |
| `approval-rob`        | approval  | —       | Rob Approves General Response      | —                      |
| `parallel-enterprise` | parallel  | —       | Enterprise Parallel Routing        | —                      |
| `agent-eva`           | agent     | eva     | Route to Enterprise Queue          | `evaRouting`           |
| `agent-sloane-notify` | agent     | sloane  | Notify Sloane + Add to Pipeline    | `sloaneNotified`       |
| `output-1`            | output    | —       | Ticket Routed                      | `ticketRoutingResult`  |

### SLA Transform

```
transform-sla:
  outputKey: slaDeadline
  template: |
    {{#if (eq trigger.data.customer_plan "enterprise")}}
    SLA: 1 hour — Deadline: {{dateAdd trigger.data.received_at 1 "hours"}}
    {{else if (eq trigger.data.customer_plan "pro")}}
    SLA: 4 hours — Deadline: {{dateAdd trigger.data.received_at 4 "hours"}}
    {{else}}
    SLA: 24 hours — Best effort
    {{/if}}
```

### Condition Chain (4-way split)

```
cond-is-bug:
  expression: steps["agent-classify"].output.toLowerCase().includes("bug")
  trueTargetId: agent-bug-assign
  falseTargetId: cond-is-billing

cond-is-billing:
  expression: steps["agent-classify"].output.toLowerCase().includes("billing")
  trueTargetId: agent-billing
  falseTargetId: cond-is-enterprise

cond-is-enterprise:
  expression: steps["agent-classify"].output.toLowerCase().includes("enterprise")
  trueTargetId: parallel-enterprise
  falseTargetId: agent-general
```

### Detailed Task Strings

**agent-classify (Sophie):**
```
Classify this support ticket into exactly one category: Bug | Billing | General | Enterprise

Ticket ID: {{trigger.data.ticket_id}}
From: {{trigger.data.customer_email}} (plan: {{trigger.data.customer_plan}})
Subject: {{trigger.data.subject}}
Body: {{trigger.data.body}}
Channel: {{trigger.data.channel}}

Respond with: CATEGORY: [Bug|Billing|General|Enterprise]
Then provide 1-2 sentence reasoning.
```

**agent-bug-assign (Dylan):**
```
New Bug ticket assigned to you:
- Ticket ID: {{trigger.data.ticket_id}}
- Customer: {{trigger.data.customer_email}}
- Subject: {{trigger.data.subject}}
- Body: {{trigger.data.body}}
- SLA: {{steps.transform-sla.output}}

1. Create a GitHub issue in the alice-platform repo with title, description, and label "customer-bug"
2. Assign to yourself
3. Link back the GitHub issue URL
4. Post a brief acknowledgment back to ticket ID {{trigger.data.ticket_id}}
```

**agent-billing (Sloane):**
```
New Billing ticket assigned to you:
- Ticket ID: {{trigger.data.ticket_id}}
- Customer: {{trigger.data.customer_email}}
- Subject: {{trigger.data.subject}}
- Body: {{trigger.data.body}}
- SLA: {{steps.transform-sla.output}}

1. Pull the Stripe customer record for {{trigger.data.customer_email}}
2. Summarize relevant billing history (last 3 invoices, subscription status, any failed payments)
3. Draft a response addressing their concern with the Stripe data context
4. Assign ticket to yourself in the support system
```

**agent-general (Sophie):**
```
Draft a helpful, empathetic response for this General support ticket:
- Ticket ID: {{trigger.data.ticket_id}}
- Customer: {{trigger.data.customer_email}} (plan: {{trigger.data.customer_plan}})
- Subject: {{trigger.data.subject}}
- Body: {{trigger.data.body}}
- Classification reasoning: {{steps.agent-classify.output}}

Write a complete, ready-to-send response. Use A.L.I.C.E. support voice — helpful, clear, not robotic.
```

**approval-rob:**
```
label: Rob Approval — General Support Response
message: |
  Sophie drafted a response for ticket #{{trigger.data.ticket_id}}
  Customer: {{trigger.data.customer_email}}
  Subject: {{trigger.data.subject}}

  Proposed response:
  {{steps.agent-general.output}}

  Approve to send. Reject to route back to Sophie for revision.
approvers: ["rob"]
timeoutMs: 14400000  # 4 hours
```

**agent-eva (Eva):**
```
Route this Enterprise support ticket to the enterprise queue:
- Ticket ID: {{trigger.data.ticket_id}}
- Customer: {{trigger.data.customer_email}}
- Subject: {{trigger.data.subject}}
- Body: {{trigger.data.body}}
- SLA: {{steps.transform-sla.output}}

1. Create an enterprise ticket entry with priority: CRITICAL
2. Prep a brief context doc: who is this customer, what do they need, what's the urgency
3. Add to Rob's next morning brief
```

**agent-sloane-notify (Sloane):**
```
Enterprise ticket received — action required:
- Customer: {{trigger.data.customer_email}}
- Subject: {{trigger.data.subject}}
- Body: {{trigger.data.body}}
- SLA: 1 hour (Enterprise tier)

1. Check CRM for this customer's pipeline record
2. Add ticket to their account timeline
3. Prepare a personal outreach draft for Rob's review
4. Flag pipeline deal if applicable
```

### Error Handling

| Failing Node         | Fallback                                                                |
|----------------------|-------------------------------------------------------------------------|
| `agent-classify`     | Retry 2x → default to General path → flag for manual review            |
| `agent-bug-assign`   | Alert Dylan via Telegram directly, log ticket                           |
| `approval-rob`       | Timeout after 4h → auto-escalate to Eva → Sophie sends response anyway  |
| `parallel-enterprise`| Any branch failure → alert Eva immediately, ticket stays open           |

---

## Workflow 3: Weekly Business Report

**Template ID:** `tpl-weekly-business-report`
**Category:** intelligence
**Trigger type:** cron
**Estimated run time:** 15–25 minutes
**Tags:** `wbr`, `weekly`, `revenue`, `competitive`, `report`, `monday`

### Trigger
```
type: cron
expression: "0 9 * * 1"   # Monday 9am
timezone: America/New_York
```

### Node Graph

```
[trigger-1] Monday 9am cron
     ↓
[parallel-1] 5 concurrent data pulls
  ├── [agent-aiden]  Aiden: Stripe revenue delta
  ├── [agent-rowan]  Rowan: competitive intel delta
  ├── [agent-morgan] Morgan: content performance
  ├── [agent-sloane] Sloane: pipeline delta
  └── [agent-darius] Darius: data health summary
     ↓ (all complete)
[agent-olivia] Olivia: synthesize → WBR document
     ↓
[agent-eva] Eva: format morning brief
     ↓
[parallel-2] distribute
  ├── [tool-telegram] send to Rob on Telegram
  └── [tool-mc-post]  post to Mission Control
     ↓
[output-1] WBR published
```

### Node Specs

| ID              | Type      | Agent   | Label                           | outputKey          |
|-----------------|-----------|---------|---------------------------------|--------------------|
| `trigger-1`     | trigger   | —       | Monday 9am EST                  | —                  |
| `parallel-1`    | parallel  | —       | Parallel Data Pulls             | —                  |
| `agent-aiden`   | agent     | aiden   | Pull Revenue Delta              | `revenueDelta`     |
| `agent-rowan`   | agent     | rowan   | Pull Competitive Intel Delta    | `intelDelta`       |
| `agent-morgan`  | agent     | morgan  | Pull Content Performance        | `contentPerf`      |
| `agent-sloane`  | agent     | sloane  | Pull Pipeline Delta             | `pipelineDelta`    |
| `agent-darius`  | agent     | darius  | Pull Data Health Summary        | `dataHealth`       |
| `agent-olivia`  | agent     | olivia  | Synthesize WBR Document         | `wbrDoc`           |
| `agent-eva`     | agent     | eva     | Format Morning Brief            | `morningBrief`     |
| `parallel-2`    | parallel  | —       | Distribute Report               | —                  |
| `tool-telegram` | tool      | —       | Send to Rob on Telegram         | `telegramSent`     |
| `tool-mc-post`  | tool      | —       | Post to Mission Control         | `mcPosted`         |
| `output-1`      | output    | —       | WBR Published                   | `wbrPublished`     |

### Detailed Task Strings

**agent-aiden (Aiden):**
```
Pull weekly revenue report from Stripe:
- MRR as of today vs. 7 days ago (delta + %)
- New subscriptions this week (count + value)
- Churned subscriptions this week (count + value)
- Net revenue change
- Any notable outliers (large one-off payments, refunds)
Format as a compact data table. Flag any metric that moved >10% in either direction.
```

**agent-rowan (Rowan):**
```
Competitive intelligence delta — what changed this week?
- Any new competitor product announcements
- Pricing changes spotted
- Notable competitor marketing pushes
- New entrants to watch
- Threat level this week vs. last week (🟢 LOW / 🟡 MED / 🔴 HIGH)
Be specific — cite sources and dates. Skip fluff.
```

**agent-morgan (Morgan):**
```
Content performance report for the past 7 days:
- Top 3 performing pieces (traffic, engagement, or conversion)
- Blog post views delta vs. prior week
- Social post reach + engagement summary
- Email open/click rates if campaigns ran this week
- Any content experiments or A/B tests in progress
Flag what's working and what flopped.
```

**agent-sloane (Sloane):**
```
Pipeline delta report for the past 7 days:
- New leads added (count + estimated ACV)
- Deals that advanced a stage
- Deals that went cold or were lost
- Active enterprise deals status
- Win/loss highlights this week
- Forecast: what's likely to close in the next 14 days?
Be specific with names/companies where available.
```

**agent-darius (Darius):**
```
Data health summary for the past week:
- Any pipeline failures or ETL errors
- Data freshness status across key tables
- Unusual query patterns or data anomalies
- License table integrity check
- CRM sync status
Keep it brief — green/yellow/red status per system, with notes on anything yellow or red.
```

**agent-olivia (Olivia):**
```
Synthesize this week's WBR from the following data inputs:

REVENUE: {{steps.agent-aiden.output}}
COMPETITIVE INTEL: {{steps.agent-rowan.output}}
CONTENT PERFORMANCE: {{steps.agent-morgan.output}}
PIPELINE: {{steps.agent-sloane.output}}
DATA HEALTH: {{steps.agent-darius.output}}

Produce a structured Weekly Business Report with:
1. Executive summary (3-4 sentences: what happened this week)
2. Key metrics table
3. Highlights (top 3 wins)
4. Concerns (top 3 risks or problems)
5. Recommended decisions for Rob (with clear options where relevant)
6. Section-by-section detail

This will be delivered to Rob. Be direct and specific — no filler.
```

**agent-eva (Eva):**
```
Format a concise Monday morning brief from the WBR:
{{steps.agent-olivia.output}}

Format for Telegram delivery:
- Max 800 words
- Use bold headers
- Lead with the 3 most important things Rob needs to know today
- End with: "Full WBR available in Mission Control."
Keep the tone professional but human.
```

**tool-telegram:**
```
toolName: telegram_send_message
inputArgs:
  chat_id: "{{env.ROB_TELEGRAM_CHAT_ID}}"
  text: "{{steps.agent-eva.output}}"
  parse_mode: "Markdown"
```

**tool-mc-post:**
```
toolName: mission_control_post_report
inputArgs:
  title: "Weekly Business Report — {{dateFormat 'YYYY-MM-DD'}}"
  body: "{{steps.agent-olivia.output}}"
  category: "wbr"
  pinned: true
```

### Error Handling

| Failing Node    | Fallback                                                                      |
|-----------------|-------------------------------------------------------------------------------|
| Any data-pull   | Skip that section, Olivia notes "Data unavailable" in WBR, continue          |
| `agent-olivia`  | Retry 2x → Eva sends raw sections to Rob with note "synthesis failed"        |
| `tool-telegram` | Retry 3x → Eva emails Rob instead → log failure                              |
| `tool-mc-post`  | Non-blocking — log failure, report still delivered via Telegram               |

---

## Workflow 4: Competitive Alert

**Template ID:** `tpl-competitive-alert`
**Category:** intelligence
**Trigger type:** webhook (event from Rowan's intel report)
**Estimated run time:** 5–10 minutes
**Tags:** `competitive`, `threat`, `alert`, `marketing`, `sales`

### Trigger
```
type: webhook
event: competitive_threat_detected
token: competitive-alert-token
filter: trigger.data.threat_level === "HIGH"
```
**Payload variables:**
- `{{trigger.data.threat_level}}` — "HIGH"
- `{{trigger.data.competitor}}`
- `{{trigger.data.threat_summary}}`
- `{{trigger.data.source_url}}`
- `{{trigger.data.detected_at}}`

### Node Graph

```
[trigger-1] Rowan HIGH threat webhook
     ↓
[agent-rowan] Rowan: write full threat brief
     ↓
[parallel-1] parallel response prep
  ├── [agent-morgan] Morgan: draft positioning response
  └── [agent-sloane] Sloane: update pipeline messaging
     ↓
[agent-eva] Eva: add to Rob's next brief as top item
     ↓
[output-1] alert response packaged
```

### Node Specs

| ID             | Type      | Agent   | Label                               | outputKey            |
|----------------|-----------|---------|-------------------------------------|----------------------|
| `trigger-1`    | trigger   | —       | Competitive HIGH Threat             | —                    |
| `agent-rowan`  | agent     | rowan   | Write Full Threat Brief             | `threatBrief`        |
| `parallel-1`   | parallel  | —       | Parallel Response Prep              | —                    |
| `agent-morgan` | agent     | morgan  | Draft Positioning Response          | `positioningDraft`   |
| `agent-sloane` | agent     | sloane  | Update Pipeline Messaging           | `pipelineUpdated`    |
| `agent-eva`    | agent     | eva     | Add to Morning Brief (Top Item)     | `briefUpdated`       |
| `output-1`     | output    | —       | Competitive Alert Package           | `alertPackage`       |

### Detailed Task Strings

**agent-rowan (Rowan):**
```
Write a detailed competitive threat brief:

Competitor: {{trigger.data.competitor}}
Threat Summary: {{trigger.data.threat_summary}}
Source: {{trigger.data.source_url}}
Detected: {{trigger.data.detected_at}}

Include:
1. What exactly changed or was announced
2. Why this is rated HIGH threat
3. Potential customer impact (who might be affected in our pipeline/base)
4. Direct comparison: how does ALICE compare on this dimension today?
5. Recommended response options (ranked)
Be precise. This goes to Rob.
```

**agent-morgan (Morgan):**
```
A competitor just made a significant move:
{{steps.agent-rowan.output}}

Draft a positioning response. Choose the best angle:
Option A: Blog post rebuttal / differentiation piece
Option B: Social post positioning ALICE's strengths
Option C: Both

Provide a ready-to-publish draft of whichever you recommend (or both), tailored to our brand voice.
Title, intro paragraph, 3 key differentiator points, and a CTA.
```

**agent-sloane (Sloane):**
```
Competitive threat requiring immediate pipeline messaging update:
{{steps.agent-rowan.output}}

Review all active pipeline deals and:
1. Identify any deals where {{trigger.data.competitor}} is a factor
2. Draft updated messaging/talking points for those deals
3. Update CRM notes for affected deals
4. Flag any deals at risk due to this development
Provide a summary of changes made.
```

**agent-eva (Eva):**
```
Add this to Rob's NEXT morning brief as the TOP agenda item:

🔴 COMPETITIVE ALERT — {{trigger.data.competitor}}

Threat Brief: {{steps.agent-rowan.output}}

Marketing Response: {{steps.agent-morgan.output}}

Pipeline Impact: {{steps.agent-sloane.output}}

Frame this as a decision item requiring Rob's attention: does he want to proceed with Morgan's proposed response? Does he want to get on a call with Sloane re: affected deals?
```

### Error Handling

| Failing Node    | Fallback                                                                   |
|-----------------|----------------------------------------------------------------------------|
| `agent-rowan`   | Retry 2x → Eva sends raw trigger data to Rob immediately — never drop HIGH alerts |
| `agent-morgan`  | Non-blocking: log failure, Eva notes in brief "positioning draft pending"  |
| `agent-sloane`  | Non-blocking: log failure, Sloane alerted via Telegram directly            |
| `agent-eva`     | Retry 3x → direct Telegram alert to Rob with raw brief                    |

---

## Workflow 5: Content Publishing Pipeline

**Template ID:** `tpl-content-publishing`
**Category:** content
**Trigger type:** event (file watch or manual signal)
**Estimated run time:** 10–20 minutes
**Tags:** `content`, `blog`, `publish`, `qa`, `social`, `email`

### Trigger
```
type: event
eventName: blog_draft_ready
filter: trigger.data.status === "ready_for_review"
```
Alternate: webhook from file system watch on `blog/drafts/` directory.

**Payload variables:**
- `{{trigger.data.draft_title}}`
- `{{trigger.data.draft_path}}` — file path to draft
- `{{trigger.data.draft_content}}` — full draft text
- `{{trigger.data.author}}` — "morgan"
- `{{trigger.data.is_technical}}` — boolean

### Node Graph

```
[trigger-1] blog draft ready event
     ↓
[agent-quinn] Quinn: QA pass — factual/technical errors
     ↓
[cond-technical] is_technical == true?
  ├── true  → [agent-daphne] Daphne: add to docs/changelog
  └── false → (skip)
     ↓
[agent-felix] Felix: publish to landing site blog
     ↓
[parallel-1] post-publish
  ├── [agent-morgan-social] Morgan: schedule 3 social posts
  └── [agent-clara] Clara: queue for weekly email digest
     ↓
[output-1] published summary
```

### Node Specs

| ID                   | Type      | Agent   | Label                              | outputKey           |
|----------------------|-----------|---------|------------------------------------|---------------------|
| `trigger-1`          | trigger   | —       | Blog Draft Ready                   | —                   |
| `agent-quinn`        | agent     | quinn   | QA Pass — Factual/Technical Review | `qaResult`          |
| `cond-technical`     | condition | —       | Is Technical Content?              | —                   |
| `agent-daphne`       | agent     | daphne  | Add to Docs / Changelog            | `docsUpdated`       |
| `agent-felix`        | agent     | felix   | Publish to Landing Site Blog       | `publishResult`     |
| `parallel-1`         | parallel  | —       | Post-Publish Parallel              | —                   |
| `agent-morgan-social`| agent     | morgan  | Schedule 3 Social Posts            | `socialScheduled`   |
| `agent-clara`        | agent     | clara   | Queue for Email Digest             | `emailQueued`       |
| `output-1`           | output    | —       | Published Summary                  | `publishSummary`    |

### Detailed Task Strings

**agent-quinn (Quinn):**
```
QA review this blog post draft for publication:

Title: {{trigger.data.draft_title}}
Content: {{trigger.data.draft_content}}

Check for:
1. Factual accuracy — flag any claims that seem incorrect or unverifiable
2. Technical accuracy — if code or CLI commands are shown, verify they look correct
3. Broken links or placeholder text (TODO, FIXME, [INSERT X])
4. Logical inconsistencies or contradictions
5. Readability issues

Return: PASS or FAIL
If FAIL: list specific issues that must be fixed before publishing.
If PASS: confirm with a brief summary of what was checked.
```

**cond-technical expression:**
```javascript
trigger.data.is_technical === true || steps["agent-quinn"].output.toLowerCase().includes("technical") || trigger.data.draft_content.toLowerCase().includes("api") || trigger.data.draft_content.toLowerCase().includes("cli")
```

**agent-daphne (Daphne):**
```
This blog post contains technical content that should be reflected in docs:

Title: {{trigger.data.draft_title}}
Content: {{trigger.data.draft_content}}
QA Notes: {{steps.agent-quinn.output}}

1. Identify any new features, CLI commands, or API changes documented in this post
2. Add corresponding entries to the changelog (docs/CHANGELOG.md)
3. Check if any existing docs pages should link to this post
4. If the post introduces something new, draft a brief docs addition or flag for Daphne to create
Provide a summary of updates made.
```

**agent-felix (Felix):**
```
Publish this blog post to the A.L.I.C.E. landing site:

Title: {{trigger.data.draft_title}}
Content: {{trigger.data.draft_content}}
QA Status: {{steps.agent-quinn.output}}
{{#if steps.agent-daphne}}Docs Update: {{steps.agent-daphne.output}}{{/if}}

Steps:
1. Create the blog post file in the site's blog directory (proper slug from title)
2. Add required frontmatter: title, date, author, tags, description
3. Ensure the post renders correctly
4. Commit and push to main (or open a PR if publish workflow requires review)
5. Return the published URL
```

**agent-morgan-social (Morgan):**
```
The following blog post was just published:
Title: {{trigger.data.draft_title}}
URL: {{steps.agent-felix.output}}
Content summary: {{trigger.data.draft_content}}

Create and schedule 3 social posts promoting this post:
1. LinkedIn post — professional angle, 150-200 words
2. Twitter/X post — punchy hook, max 280 chars, include URL
3. 2nd Twitter/X post — different angle (e.g., behind-the-scenes or key insight), scheduled 3 days later

Schedule post 1 for today, post 2 for tomorrow, post 3 for +3 days.
```

**agent-clara (Clara):**
```
Queue this blog post for the next weekly email digest:
Title: {{trigger.data.draft_title}}
URL: {{steps.agent-felix.output}}
Key takeaway: [extract 1-2 sentence summary from content]

Content: {{trigger.data.draft_content}}

Add to the "Latest from the Blog" section of this week's digest.
Write a 2-3 sentence teaser that makes readers want to click.
Tag as queued in the content calendar.
```

### Error Handling

| Failing Node        | Fallback                                                                      |
|---------------------|-------------------------------------------------------------------------------|
| `agent-quinn`       | Retry 2x → human review required before publish — pause workflow, alert Morgan |
| `agent-quinn` FAIL  | Block publish path → notify Morgan with QA issues — do not publish             |
| `agent-daphne`      | Non-blocking: log, continue — docs can be updated manually after               |
| `agent-felix`       | Retry 2x → alert Felix via Telegram → escalate to Devon if CI/deploy issue     |
| `agent-morgan-social`| Non-blocking: log failure, Morgan alerted to schedule manually                |
| `agent-clara`       | Non-blocking: log failure, Clara alerted to queue manually                    |

---

## Workflow 6: Enterprise Inquiry Handler

**Template ID:** `tpl-enterprise-inquiry`
**Category:** sales
**Trigger type:** webhook
**Estimated run time:** 10–20 minutes + Rob approval gate
**Tags:** `enterprise`, `sales`, `legal`, `crm`, `outreach`, `calendar`

### Trigger
```
type: webhook
event: enterprise_inquiry
token: enterprise-inquiry-token
filter: trigger.data.inquiry_type === "enterprise" OR trigger.data.tags includes "enterprise"
```
**Payload variables:**
- `{{trigger.data.company_name}}`
- `{{trigger.data.contact_name}}`
- `{{trigger.data.contact_email}}`
- `{{trigger.data.company_size}}` — "1-10" | "11-50" | "51-200" | "201-500" | "500+"
- `{{trigger.data.use_case}}`
- `{{trigger.data.message}}`
- `{{trigger.data.source}}` — "contact_form" | "support_ticket"

### Node Graph

```
[trigger-1] enterprise inquiry webhook
     ↓
[parallel-1] prep in parallel
  ├── [agent-eva]   Eva: enterprise briefing doc
  └── [agent-logan] Logan: legal/compliance flags check
     ↓ (join)
[agent-sloane] Sloane: research + draft personalized response
     ↓
[agent-caleb] Caleb: create/update CRM record (Enterprise stage)
     ↓
[approval-rob] Rob reviews Sloane's draft → approve/reject
     ↓
[cond-approved] approved?
  ├── true  → [tool-send-email] send approved response + [agent-tommy] schedule discovery call
  └── false → [agent-sloane-revise] Sloane revises → back to approval
     ↓
[output-1] enterprise inquiry handled
```

> Note: Rejection loop uses a second approval node rather than a true loop to keep the graph clean in Mission Control. Max 2 revision cycles before escalating to Eva.

### Node Specs

| ID                   | Type      | Agent   | Label                                 | outputKey              |
|----------------------|-----------|---------|---------------------------------------|------------------------|
| `trigger-1`          | trigger   | —       | Enterprise Inquiry                    | —                      |
| `parallel-1`         | parallel  | —       | Parallel Prep                         | —                      |
| `agent-eva`          | agent     | eva     | Prepare Enterprise Briefing Doc       | `enterpriseBrief`      |
| `agent-logan`        | agent     | logan   | Legal / Compliance Flag Check         | `legalFlags`           |
| `agent-sloane`       | agent     | sloane  | Research + Draft Personalized Reply   | `sloanesDraft`         |
| `agent-caleb`        | agent     | caleb   | Create CRM Record (Enterprise)        | `crmRecord`            |
| `approval-rob`       | approval  | —       | Rob Reviews Outreach Draft            | —                      |
| `cond-approved`      | condition | —       | Rob Approved?                         | —                      |
| `tool-send-email`    | tool      | —       | Send Approved Response                | `emailSent`            |
| `agent-tommy`        | agent     | tommy   | Schedule Discovery Call               | `callScheduled`        |
| `agent-sloane-revise`| agent     | sloane  | Revise Draft Per Rob's Feedback       | `revisedDraft`         |
| `output-1`           | output    | —       | Enterprise Inquiry Handled            | `inquiryResult`        |

### Detailed Task Strings

**agent-eva (Eva):**
```
Prepare an enterprise briefing document for this incoming inquiry:

Company: {{trigger.data.company_name}}
Contact: {{trigger.data.contact_name}} ({{trigger.data.contact_email}})
Company Size: {{trigger.data.company_size}}
Use Case: {{trigger.data.use_case}}
Message: {{trigger.data.message}}
Source: {{trigger.data.source}}

Include:
1. Company overview (search LinkedIn, website, Crunchbase)
2. Estimated deal size based on company size + use case
3. Relevant context (tech stack if detectable, competitors they likely use)
4. Recommended approach: high-touch personal? Self-serve? Partnership angle?
5. Key questions to answer in the response
```

**agent-logan (Logan):**
```
Review this enterprise inquiry for legal or compliance flags:

Company: {{trigger.data.company_name}}
Contact: {{trigger.data.contact_email}}
Use Case: {{trigger.data.use_case}}
Message: {{trigger.data.message}}

Check for:
1. Regulated industry flags (healthcare, finance, government, legal)
2. Data residency requirements implied
3. Any statements that imply liability, SLA guarantees, or contractual commitments
4. GDPR/CCPA considerations based on geography if detectable
5. Any language that should NOT be included in our response

Return: CLEAR or FLAGS DETECTED
If flags: list each one with recommended action.
```

**agent-sloane (Sloane):**
```
Research this enterprise prospect and draft a personalized outreach response:

Company: {{trigger.data.company_name}}
Contact: {{trigger.data.contact_name}} ({{trigger.data.contact_email}})
Use Case: {{trigger.data.use_case}}
Message: {{trigger.data.message}}

Briefing doc: {{steps.agent-eva.output}}
Legal flags: {{steps.agent-logan.output}}

1. Search GitHub and LinkedIn for {{trigger.data.company_name}} — note team size, tech stack, relevant repos
2. Draft a personalized reply (from Rob's voice) that:
   - Acknowledges their specific use case
   - Shows we understand their context
   - Positions ALICE clearly for their needs
   - Proposes a 30-min discovery call
   - Does NOT make any legal/pricing commitments
   - Avoids anything flagged by Logan
3. Draft must be ready to send upon Rob's approval — no placeholders
```

**agent-caleb (Caleb):**
```
Create a new CRM record for this enterprise inquiry:

Company: {{trigger.data.company_name}}
Contact: {{trigger.data.contact_name}}
Email: {{trigger.data.contact_email}}
Company Size: {{trigger.data.company_size}}
Use Case: {{trigger.data.use_case}}

Set:
- Stage: Enterprise Inquiry
- Source: {{trigger.data.source}}
- Priority: High
- Assigned to: Sloane
- Notes: {{steps.agent-sloane.output}}
- Tags: enterprise, inbound

Return the CRM record ID.
```

**approval-rob:**
```
label: Rob Approval — Enterprise Outreach Response
message: |
  🏢 Enterprise Inquiry — {{trigger.data.company_name}}
  Contact: {{trigger.data.contact_name}} ({{trigger.data.contact_email}})
  Size: {{trigger.data.company_size}} | Use Case: {{trigger.data.use_case}}

  Briefing: {{steps.agent-eva.output}}
  Legal flags: {{steps.agent-logan.output}}
  CRM: {{steps.agent-caleb.output}}

  Sloane's draft response:
  ─────────────────────────
  {{steps.agent-sloane.output}}
  ─────────────────────────

  Approve → send + schedule discovery call
  Reject → return to Sloane for revision (include feedback in rejection)
approvers: ["rob"]
timeoutMs: 86400000  # 24 hours
```

**cond-approved expression:**
```javascript
approval.approved === true
```

**agent-tommy (Tommy):**
```
Schedule a 30-minute discovery call with:
Contact: {{trigger.data.contact_name}} ({{trigger.data.contact_email}})
Company: {{trigger.data.company_name}}

Find 3 available 30-min slots in Rob's calendar over the next 5 business days.
Send a calendar invite proposal to {{trigger.data.contact_email}} with:
- Meeting title: "ALICE Discovery Call — {{trigger.data.company_name}}"
- Brief agenda: intro, use case deep dive, next steps
- Zoom/Google Meet link
- Rob's contact details

Attach context: {{steps.agent-sloane.output}}
```

### Error Handling

| Failing Node      | Fallback                                                                      |
|-------------------|-------------------------------------------------------------------------------|
| `agent-eva`       | Continue with partial brief, flag to Sloane                                   |
| `agent-logan`     | Block until resolved — do NOT send response without legal clearance            |
| `agent-sloane`    | Retry 2x → escalate to Eva to draft manually                                  |
| `approval-rob`    | 24h timeout → Eva pings Rob on Telegram → 48h total max before auto-escalation|
| `agent-tommy`     | Retry 2x → Tommy alerted via Telegram to schedule manually                   |

---

## Workflow 7: License Delivery & Validation

**Template ID:** `tpl-license-delivery`
**Category:** operations
**Trigger type:** webhook
**Estimated run time:** 2–5 minutes
**Tags:** `license`, `payment`, `stripe`, `delivery`, `crm`, `revenue`

### Trigger
```
type: webhook
event: stripe checkout.session.completed
token: stripe-license-token
secret: STRIPE_WEBHOOK_SECRET
filter: trigger.data.mode === "payment"
```
**Payload variables:**
- `{{trigger.data.customer_email}}`
- `{{trigger.data.customer_name}}`
- `{{trigger.data.customer_id}}`
- `{{trigger.data.payment_intent}}`
- `{{trigger.data.amount_total}}`
- `{{trigger.data.metadata.product}}` — "alice_pro_license" | etc.
- `{{trigger.data.metadata.plan}}` — "pro"

> Note: Differentiated from Workflow 1 by `mode === "payment"` (one-time) vs. `mode === "subscription"`.

### Node Graph

```
[trigger-1] Stripe payment confirmed (mode=payment)
     ↓
[agent-dylan] Dylan: generate license key ALICE-XXXX-XXXX-XXXX
     ↓
[agent-darius] Darius: store license in DB
     ↓
[parallel-1] parallel delivery + CRM update
  ├── [agent-clara]  Clara: send license delivery email
  ├── [agent-caleb]  Caleb: update CRM record → Pro + license key
  └── [agent-aiden]  Aiden: log revenue event
     ↓ (join)
[agent-sophie] Sophie: set 3-day check-in reminder
     ↓
[output-1] license delivered
```

### Node Specs

| ID             | Type      | Agent   | Label                                | outputKey          |
|----------------|-----------|---------|--------------------------------------|--------------------|
| `trigger-1`    | trigger   | —       | Stripe Payment Confirmed             | —                  |
| `agent-dylan`  | agent     | dylan   | Generate License Key                 | `licenseKey`       |
| `agent-darius` | agent     | darius  | Store License in DB                  | `licenseRecord`    |
| `parallel-1`   | parallel  | —       | Parallel: Deliver + Update           | —                  |
| `agent-clara`  | agent     | clara   | Send License Delivery Email          | `deliveryEmail`    |
| `agent-caleb`  | agent     | caleb   | Update CRM: Free → Pro + Key         | `crmUpdated`       |
| `agent-aiden`  | agent     | aiden   | Log Revenue Event                    | `revenueLogged`    |
| `agent-sophie` | agent     | sophie  | Set 3-Day Check-in Reminder          | `reminderSet`      |
| `output-1`     | output    | —       | License Delivered                    | `deliveryResult`   |

### Detailed Task Strings

**agent-dylan (Dylan):**
```
Generate a new ALICE license key for:
Customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}})
Product: {{trigger.data.metadata.product}}
Payment Intent: {{trigger.data.payment_intent}}

Format: ALICE-XXXX-XXXX-XXXX where each X is an uppercase alphanumeric character.
The key must be:
- Cryptographically random
- 16 characters (4 groups of 4, hyphen separated, prefixed ALICE-)
- Unique (check against existing keys if possible)

Return only the license key string.
```

**agent-darius (Darius):**
```
Store this license in the licenses table:
- license_key: {{steps.agent-dylan.output}}
- customer_email: {{trigger.data.customer_email}}
- customer_name: {{trigger.data.customer_name}}
- stripe_customer_id: {{trigger.data.customer_id}}
- stripe_payment_intent: {{trigger.data.payment_intent}}
- product: {{trigger.data.metadata.product}}
- plan: {{trigger.data.metadata.plan}}
- status: active
- issued_at: NOW()
- amount_paid: {{trigger.data.amount_total}}

Confirm storage with record ID.
```

**agent-clara (Clara):**
```
Send a license delivery email to {{trigger.data.customer_email}}:

Customer name: {{trigger.data.customer_name}}
License key: {{steps.agent-dylan.output}}
Product: {{trigger.data.metadata.product}}

Email must include:
1. Warm congratulations / confirmation of purchase
2. License key in a prominent, easy-to-copy format
3. Installation/activation instructions (link to docs)
4. Getting started guide link
5. Support contact
6. Receipt: ${{trigger.data.amount_total}} charged to card on file

Use the license-delivery email template. Make it feel premium.
```

**agent-caleb (Caleb):**
```
Update CRM record for {{trigger.data.customer_email}}:
- Find existing record by email or Stripe ID: {{trigger.data.customer_id}}
- If no existing record, create one
- Update fields:
  * plan: pro
  * lifecycle_stage: customer
  * license_key: {{steps.agent-dylan.output}}
  * license_issued_at: NOW()
  * stripe_payment: {{trigger.data.payment_intent}}
  * amount_paid: {{trigger.data.amount_total}}
Log the plan upgrade event (Free → Pro) with timestamp.
```

**agent-aiden (Aiden):**
```
Log this revenue event in the analytics system:
- Event type: license_purchase
- Customer: {{trigger.data.customer_email}}
- Amount: {{trigger.data.amount_total}}
- Product: {{trigger.data.metadata.product}}
- Stripe payment intent: {{trigger.data.payment_intent}}
- Timestamp: NOW()

Update:
- Total license revenue counter
- Daily revenue log for today
- MRR conversion count (Free → Pro)
Confirm the event was logged.
```

**agent-sophie (Sophie):**
```
Set a 3-day post-purchase check-in reminder for:
Customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}})
License key: {{steps.agent-dylan.output}}
Purchase date: NOW()

Schedule a check-in task for 72 hours from now:
- Type: proactive_checkin
- Message template: "Hi {{trigger.data.customer_name}}, just checking in — have you had a chance to activate your ALICE license? We're here if you need help getting started."
- Channel: email
- Assigned to: Sophie
Tag as "post_purchase_checkin" in the support queue.
```

### Error Handling

| Failing Node    | Fallback                                                                        |
|-----------------|---------------------------------------------------------------------------------|
| `agent-dylan`   | Retry 3x → alert Dylan via Telegram → block delivery until key is generated     |
| `agent-darius`  | Retry 3x → alert Darius → do NOT send key until stored (key issuance requires DB)|
| `agent-clara`   | Retry 3x → alert Eva → manual send within 1h — paying customer cannot wait      |
| `agent-caleb`   | Log failure, retry async — non-blocking for delivery                            |
| `agent-aiden`   | Log failure, non-blocking — revenue event can be reconciled later               |
| `agent-sophie`  | Log failure, non-blocking — reminder can be added manually                     |

---

## Workflow 8: Churn Prevention

**Template ID:** `tpl-churn-prevention`
**Category:** operations
**Trigger type:** webhook
**Estimated run time:** 2–5 minutes (immediate) + async follow-ups at 24h
**Tags:** `churn`, `billing`, `retention`, `dunning`, `stripe`, `crm`

### Trigger
```
type: webhook
event: stripe_subscription_event
token: stripe-churn-token
secret: STRIPE_WEBHOOK_SECRET
filter: trigger.data.event_type === "invoice.payment_failed" OR trigger.data.event_type === "customer.subscription.deleted"
```
**Payload variables:**
- `{{trigger.data.event_type}}` — "invoice.payment_failed" | "customer.subscription.deleted"
- `{{trigger.data.customer_email}}`
- `{{trigger.data.customer_name}}`
- `{{trigger.data.customer_id}}`
- `{{trigger.data.subscription_id}}`
- `{{trigger.data.plan}}` — "pro" | "enterprise"
- `{{trigger.data.amount_due}}` — (for payment_failed)

### Node Graph

```
[trigger-1] Stripe payment_failed OR subscription.deleted
     ↓
[cond-event-type] event type?
  ├── invoice.payment_failed  → [agent-clara-dunning] Clara: send dunning email
  └── subscription.deleted    → [agent-sloane-churn]  Sloane: flag as churned in CRM
     ↓
[agent-aiden] Aiden: log churn/payment-fail event
     ↓
[agent-sophie] Sophie: schedule 24h follow-up "why did you leave?" email
     ↓
[cond-enterprise] is plan == "enterprise"?
  ├── true  → [agent-sloane-notify] Sloane: notify Rob immediately
  └── false → (continue)
     ↓
[output-1] churn event handled
```

### Node Specs

| ID                    | Type      | Agent   | Label                                  | outputKey            |
|-----------------------|-----------|---------|----------------------------------------|----------------------|
| `trigger-1`           | trigger   | —       | Stripe Churn Event                     | —                    |
| `cond-event-type`     | condition | —       | Payment Failed or Subscription Deleted?| —                    |
| `agent-clara-dunning` | agent     | clara   | Send Dunning Email (Payment Failed)    | `dunningEmail`       |
| `agent-sloane-churn`  | agent     | sloane  | Flag Churned in CRM                    | `churnFlagged`       |
| `agent-aiden`         | agent     | aiden   | Log Churn / Payment Fail Event         | `eventLogged`        |
| `agent-sophie`        | agent     | sophie  | Schedule 24h Follow-up Email           | `followupScheduled`  |
| `cond-enterprise`     | condition | —       | Enterprise Customer?                   | —                    |
| `agent-sloane-notify` | agent     | sloane  | Notify Rob — Enterprise Churn          | `robNotified`        |
| `output-1`            | output    | —       | Churn Event Handled                    | `churnResult`        |

### Condition Expressions

**cond-event-type:**
```javascript
trigger.data.event_type === "invoice.payment_failed"
// true → clara-dunning, false → sloane-churn
```

**cond-enterprise:**
```javascript
trigger.data.plan === "enterprise"
```

### Detailed Task Strings

**agent-clara-dunning (Clara):**
```
Send a dunning email for a failed payment:

Customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}})
Amount Due: ${{trigger.data.amount_due}}
Subscription ID: {{trigger.data.subscription_id}}

Email must:
1. Be empathetic, not punitive — payment failures are often accidental
2. Clearly explain: a payment of ${{trigger.data.amount_due}} failed for their ALICE subscription
3. Provide a direct link to update payment method
4. Note: they retain access for 72 hours while they resolve the issue
5. Offer support contact if they need help

Do NOT use alarming language. Keep the tone warm and solution-focused.
Use the dunning-payment-failed email template.
```

**agent-sloane-churn (Sloane):**
```
A customer has cancelled their subscription:

Customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}})
Plan: {{trigger.data.plan}}
Stripe ID: {{trigger.data.customer_id}}
Subscription ID: {{trigger.data.subscription_id}}

In CRM:
1. Find the customer record by email or Stripe ID
2. Update lifecycle stage: churned
3. Set churn_date: NOW()
4. Add note: "Subscription cancelled — event received from Stripe: customer.subscription.deleted"
5. Tag: churned_{{trigger.data.plan}}
6. If enterprise: flag as HIGH priority lost account

Return CRM record ID and confirm the update.
```

**agent-aiden (Aiden):**
```
Log this churn/payment event in analytics:
- Event type: {{trigger.data.event_type}}
- Customer: {{trigger.data.customer_email}}
- Plan: {{trigger.data.plan}}
- Subscription ID: {{trigger.data.subscription_id}}
- Amount (if applicable): {{trigger.data.amount_due}}
- Timestamp: NOW()

Update metrics:
- Churn counter (if subscription.deleted)
- Failed payment counter (if invoice.payment_failed)
- MRR impact (if subscription.deleted: subtract plan value from MRR)
- Weekly churn rate recalculation

CRM status: {{steps.agent-sloane-churn.output}} OR {{steps.agent-clara-dunning.output}}
Confirm all events logged.
```

**agent-sophie (Sophie):**
```
Schedule a 24-hour follow-up email for:
Customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}})
Event: {{trigger.data.event_type}}
Plan: {{trigger.data.plan}}

Schedule for 24 hours from now:
- If event was invoice.payment_failed: send "Did you get a chance to update your payment method?" — gentle reminder with direct link
- If event was subscription.deleted: send "We'd love to understand why you left" — short, genuine, no-pressure survey or reply prompt

Email should feel human, not automated. From Rob, not "The ALICE Team."
Tag as "churn_followup_{{trigger.data.event_type}}" in the support queue.
Assign to Sophie for response monitoring.
```

**agent-sloane-notify (Sloane):**
```
🚨 ENTERPRISE CUSTOMER CHURN — IMMEDIATE ACTION REQUIRED

Customer: {{trigger.data.customer_name}} ({{trigger.data.customer_email}})
Plan: Enterprise
Event: {{trigger.data.event_type}}
Subscription ID: {{trigger.data.subscription_id}}

1. Pull the full CRM record for this customer — deal history, ARR, contacts
2. Pull Stripe account history — how long were they a customer? What did they pay?
3. Draft a personal outreach message FOR ROB to send — not a template, a genuine human note from Rob
4. Notify Rob immediately on Telegram with:
   - Who churned
   - Estimated ARR lost
   - Context (why they might have left, if knowable)
   - The drafted personal message for Rob to send
5. Add to Rob's next morning brief as urgent item
This cannot wait until Monday.
```

### Error Handling

| Failing Node           | Fallback                                                                     |
|------------------------|------------------------------------------------------------------------------|
| `agent-clara-dunning`  | Retry 3x → alert Eva → manual dunning email within 1h — revenue at risk      |
| `agent-sloane-churn`   | Retry 2x → log failure, Sophie manually flags CRM                            |
| `agent-aiden`          | Log failure, non-blocking — reconcile in next data audit                     |
| `agent-sophie`         | Retry 2x → log failure, Sophie alerted to schedule manually                 |
| `agent-sloane-notify`  | Retry 3x → direct Telegram to Rob with raw event data — enterprise churn cannot go unnoticed |

---

## Implementation Notes for Felix + Dylan

### Node IDs
Use the pattern `[type]-[short-label]` (e.g., `agent-caleb`, `cond-plan`, `tool-slack`). Avoid generic `agent-1`, `agent-2` — these break readability in the Mission Control graph view.

### Parallel Join Pattern
Mission Control doesn't have a dedicated `ParallelJoin` node type (confirmed from types.ts — it's just `parallel`). The join is implicit: downstream nodes with `dependsOn` listing all parallel branch output keys will only run when all are complete. Use the `dependsOn` array on the first post-parallel `agent` node to specify which branches must complete.

### Condition Chaining (4-way splits)
Chain `condition` nodes in series. Each false-branch falls through to the next condition. This keeps the graph acyclic and compatible with the current WorkflowNodeCondition type (which only supports `trueTargetId` / `falseTargetId`).

### Approval Timeout Strategy
- Support tickets: 4h (Rob is busy; Sophie self-escalates)
- Enterprise outreach: 24h (high stakes, give Rob time to review)
- General approvals: 4–8h default

### Variable Namespacing
All `outputKey` values are scoped to `steps.[nodeId].output` in templates. Keep outputKey values short and descriptive (camelCase). Felix: the template rendering engine should handle undefined steps gracefully (empty string or "N/A").

### Webhook Security
All Stripe webhooks must validate the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`. The `secret` field in `WorkflowTriggerWebhook` maps to this. Dylan: wire up signature verification before any Stripe workflow goes to production.

### Template IDs → Workflow Templates File
These 8 specs should be added to `workflow-templates.ts` as `WorkflowTemplate` objects following the exact schema in `types.ts`. Felix: use the existing 10 templates as format reference — same structure, same edge convention.

---

*Spec authored by Avery ⚙️ — March 2026*
*Handoff to: Felix (UI/template registration), Dylan (backend: webhooks, DB, key gen)*
*Questions → Olivia → Avery*
