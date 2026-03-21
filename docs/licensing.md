# Licensing

## Starter vs Pro

| Feature | Starter | Pro |
|---------|---------|-----|
| **Price** | Free | $49 one-time |
| **Agents included** | 10 | 28 |
| **License key required** | No | Yes |
| **Updates** | Included | Included |
| **Cloud add-on eligible** | Yes | Yes |
| **Commercial use** | Yes | Yes |

### Starter Agents (10)
Olivia, Dylan, Selena, Devon, Quinn, Felix, Daphne, Rowan, Darius, Sophie

### Pro Agents (18 additional)
Hannah, Aiden, Clara, Avery, Owen, Isaac, Tommy, Sloane, Nadia, Morgan, Alex, Uma, Caleb, Elena, Audrey, Logan, Eva, Parker

### Cloud Add-On ($20/month)
An optional hosted runtime for teams that prefer not to self-host OpenClaw. Not required for local or self-hosted deployments. Billed separately via Stripe subscription.

---

## How License Delivery Works

1. Purchase Pro at [robbiesrobotics.com](https://robbiesrobotics.com) (or wherever A.L.I.C.E. is sold)
2. Stripe processes the payment
3. Your license key is emailed to the address used at checkout — usually within a few minutes
4. If the email doesn't arrive within 15 minutes, check spam or contact support

The license key is a short alphanumeric string. Keep it somewhere safe (a password manager is ideal).

---

## How to Activate

Pass your license key during install:

```bash
npx @robbiesrobotics/alice-agents
```

When prompted:
```
Enter your Pro license key (press Enter to skip for Starter):
> YOUR-LICENSE-KEY-HERE
```

Or if you're re-installing and want to skip prompts:

```bash
npx @robbiesrobotics/alice-agents --yes --tier pro --license-key YOUR_KEY
```

The installer validates the key and unlocks all 28 Pro agents. If the validation service is temporarily unavailable, the installer stores a short grace period and asks you to re-run validation later.

---

## Transferability

Your Pro license is **tied to you, not to a machine**. You may:
- Install A.L.I.C.E. on multiple machines you personally own and use
- Reinstall on a new machine after replacing hardware

You may **not**:
- Share your license key with other people
- Transfer the license to another individual or organization
- Use the same key across a team (team licensing is not yet available)

If you're a team, each person needs their own Pro license.

---

## What Happens If You Lose Your Key

Don't panic. Your purchase is recorded in Stripe under the email address you used at checkout.

Email support with:
- The email address used at purchase
- Approximate date of purchase

We'll look it up and resend your key. There's no fee for key recovery.

---

## Upgrading from Starter to Pro

Starter users can upgrade at any time. Purchase Pro, receive the license key by email, then run:

```bash
npx @robbiesrobotics/alice-agents
```

Enter your key when prompted, or pass `--yes --tier pro --license-key YOUR_KEY` for automation. The upgrade is immediate — no reinstall required for existing files.
