# A.L.I.C.E. Pro — Email Sequences v2

> Written by Clara (Communication specialist)
> Last updated: 2026-03-17
> Email provider: Resend
> Sender: Rob Sanchez <rob@robbiesrobotics.com>

---

## Sequence 1: License Delivery
**Trigger:** Stripe `checkout.session.completed`
**Delay:** Immediate

---

### Subject: Your A.L.I.C.E. Pro license key 🧠

Hey,

Your license key is below. Keep it somewhere safe.

```
{{LICENSE_KEY}}
```
*(formatted: ALICE-XXXX-XXXX-XXXX)*

**To get started:**

```bash
npx @robbiesrobotics/alice-agents
```

Enter your key when prompted. That's it.

→ [Docs](https://getalice.av3.ai/docs)

---

Glad you're here. 28 agents are ready when you are.

— Rob
Robbies Robotics

---

## Sequence 2: Pro Welcome Series
**Trigger:** After license delivery email sends

---

### Email 1 — Day 0 (send immediately after license delivery)
**Subject: Welcome to the team 🤝**

Hey,

You just unlocked 28 agents. That's not marketing copy — there are literally 28 of them, ready to work.

Start here:

```bash
npx @robbiesrobotics/alice-agents
```

Enter your license key. Olivia will greet you.

Olivia is your orchestrator. Tell her what you're working on. She'll figure out which agents to loop in. On day one, most people just talk to her — she handles the rest.

You don't need to learn all 28 agents today. Just start a conversation.

Talk soon,
Rob

---

### Email 2 — Day 3
**Subject: Have you met the whole team yet?**

Hey,

Everyone knows Olivia. But there are 27 other agents worth knowing.

Here are five underrated ones:

**Logan** — legal. Drafts contracts, spots risky clauses, flags what to push back on.

**Audrey** — accounting. Cash flow, expenses, bookkeeping logic — without opening a spreadsheet.

**Uma** — UX research. Synthesizes user interviews, identifies patterns, tells you what's actually broken.

**Elena** — estimation. Scopes projects, breaks down tasks, gives you realistic timelines.

**Parker** — project management. Tracks moving parts, flags blockers, keeps things from falling through the cracks.

Next time you're in a conversation with Olivia, try: *"Loop in Logan"* or *"Get Parker on this."*

— Rob

---

### Email 3 — Day 7
**Subject: One week in — how's the team treating you?**

Hey,

One week with A.L.I.C.E. How's it going?

Quick heads up on something worth knowing: there's a Cloud Add-on for $20/mo. It stores your agents' memory in the cloud and gives you access to the hosted Mission Control dashboard — so you can pick up any conversation from any machine. Requires an active Pro license.

Default is local memory, which is fine. But if you work across devices, cloud memory is worth it.

→ [Add Cloud — $20/mo](https://getalice.av3.ai/signup?plan=cloud)

If you have questions — about setup, agents, anything — reply to this email. I actually read it.

— Rob

---

## Sequence 3: Waitlist Nurture
**Trigger:** Waitlist form submission

---

### Email 1 — Immediate (on waitlist join)
**Subject: You're on the list — here's what's coming 🧠**

Hey,

You're on the list. I'll email you when Pro opens up.

Here's what you're getting:

- **28 agents** — legal, accounting, UX, project management, estimation, and more
- **Olivia** as your orchestrator — she coordinates the rest so you don't have to
- **Supabase-hosted memory** — your agents remember context across sessions
- **One-time payment, $49** — no subscription, no recurring charges

While you wait, Starter is free and available now:

```bash
npx @robbiesrobotics/alice-agents
```

No account needed. 10 agents, local memory. Good way to get familiar before Pro drops.

— Rob
Robbies Robotics

---

### Email 2 — Day 14
**Subject: Still thinking about A.L.I.C.E. Pro?**

Hey,

A.L.I.C.E. Pro is available now.

28 agents. One-time payment. No subscription.

→ [Get Pro — $49](https://getalice.av3.ai/pricing)

You're on the waitlist — you've got first access. Don't wait too long.

If you have questions, reply here.

— Rob

---

## HTML Template

Clean, dark-mode-friendly, Resend-compatible. Dylan: swap `{{VARIABLE}}` tokens with your template engine of choice.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>{{EMAIL_SUBJECT}}</title>
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; }

    /* Base */
    body {
      margin: 0;
      padding: 0;
      background-color: #0f0f0f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e2e2;
    }

    /* Container */
    .wrapper {
      width: 100%;
      background-color: #0f0f0f;
      padding: 40px 0;
    }

    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #1a1a1a;
      border-radius: 8px;
      border: 1px solid #2a2a2a;
      padding: 40px;
    }

    /* Header */
    .header {
      margin-bottom: 32px;
    }

    .logo {
      font-size: 13px;
      font-weight: 600;
      color: #888;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* Body */
    p {
      margin: 0 0 16px;
      font-size: 15px;
      line-height: 1.6;
      color: #e2e2e2;
    }

    /* License key / code block */
    .license-box {
      background-color: #111;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 20px 24px;
      margin: 24px 0;
      text-align: center;
    }

    .license-key {
      font-family: 'Courier New', Courier, monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #a8f0a8;
    }

    /* Inline code */
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      background-color: #111;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 2px 6px;
      color: #a8f0a8;
    }

    /* Code block */
    .code-block {
      background-color: #111;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 16px 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #a8f0a8;
      white-space: pre;
      overflow-x: auto;
    }

    /* CTA Button */
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 6px;
      margin: 16px 0;
    }

    .btn:hover {
      background-color: #1d4ed8;
    }

    /* Inline link */
    a {
      color: #60a5fa;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Agent spotlight list */
    .agent-list {
      margin: 16px 0;
      padding: 0;
      list-style: none;
    }

    .agent-list li {
      font-size: 15px;
      line-height: 1.6;
      color: #e2e2e2;
      padding: 10px 0;
      border-bottom: 1px solid #2a2a2a;
    }

    .agent-list li:last-child {
      border-bottom: none;
    }

    .agent-name {
      font-weight: 600;
      color: #ffffff;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #2a2a2a;
      margin: 28px 0;
    }

    /* Signature */
    .signature {
      margin-top: 28px;
      font-size: 14px;
      color: #888;
      line-height: 1.6;
    }

    /* Footer */
    .footer {
      max-width: 560px;
      margin: 24px auto 0;
      padding: 0 40px;
      text-align: center;
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    }

    .footer a {
      color: #555;
    }

    /* Light mode overrides */
    @media (prefers-color-scheme: light) {
      body { background-color: #f5f5f5; color: #111; }
      .container { background-color: #ffffff; border-color: #e5e5e5; }
      p { color: #111; }
      .license-box { background-color: #f0f0f0; border-color: #ddd; }
      .code-block { background-color: #f0f0f0; border-color: #ddd; color: #1a5c1a; }
      code { background-color: #f0f0f0; border-color: #ddd; color: #1a5c1a; }
      .license-key { color: #1a5c1a; }
      .agent-list li { color: #111; border-bottom-color: #e5e5e5; }
      .agent-name { color: #000; }
      .divider { border-color: #e5e5e5; }
      .signature { color: #555; }
      .wrapper { background-color: #f5f5f5; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <!-- Header -->
      <div class="header">
        <span class="logo">A.L.I.C.E. · Robbies Robotics</span>
      </div>

      <!-- ===================== -->
      <!-- SLOT: Email body here -->
      <!-- ===================== -->

      <!-- Example: License key block -->
      <!--
      <div class="license-box">
        <div class="license-key">{{LICENSE_KEY}}</div>
      </div>
      -->

      <!-- Example: Code block -->
      <!--
      <div class="code-block">npx @robbiesrobotics/alice-agents</div>
      -->

      <!-- Example: CTA button -->
      <!--
      <a href="{{CTA_URL}}" class="btn">{{CTA_LABEL}}</a>
      -->

      <!-- Example: Agent spotlight list -->
      <!--
      <ul class="agent-list">
        <li><span class="agent-name">Logan</span> — legal. Drafts contracts, spots risky clauses.</li>
      </ul>
      -->

      <hr class="divider" />

      <!-- Signature -->
      <div class="signature">
        — Rob<br />
        Robbies Robotics
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      You're receiving this because you purchased or signed up at getalice.av3.ai.<br />
      <a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
```

---

## Template Variables Reference

| Variable | Used In | Description |
|---|---|---|
| `{{LICENSE_KEY}}` | License Delivery | Formatted as `ALICE-XXXX-XXXX-XXXX` |
| `{{EMAIL_SUBJECT}}` | All | Email subject line for `<title>` |
| `{{CTA_URL}}` | Waitlist emails, Day 7 | Target URL for CTA button |
| `{{CTA_LABEL}}` | Waitlist emails | Button label text |
| `{{UNSUBSCRIBE_URL}}` | All | Resend-generated unsubscribe link |

---

## Resend Integration Notes

- **Sender:** `Rob Sanchez <rob@robbiesrobotics.com>`
- **Reply-To:** `rob@robbiesrobotics.com` (Day 3 and Day 7 emails especially — Rob reads replies)
- **Sequences:** Set up as Resend Broadcasts or use a sequence trigger via API
- **Triggers:**
  - License Delivery → `stripe.checkout.session.completed` webhook
  - Welcome Series Email 1 → after license email sends (same event, +1 min delay)
  - Welcome Series Email 2 → Day 3 delay
  - Welcome Series Email 3 → Day 7 delay
  - Waitlist Email 1 → form submission event
  - Waitlist Email 2 → Day 14 delay from Waitlist Email 1
- **Unsubscribe:** Use Resend's built-in unsubscribe header + `{{UNSUBSCRIBE_URL}}` in footer
