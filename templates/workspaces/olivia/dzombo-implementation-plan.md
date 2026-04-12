# DZOMBO HUNTING SAFARIS — AI INFRASTRUCTURE DEPLOYMENT
## Implementation Plan & Execution Roadmap

**Project:** AI Infrastructure Deployment — Tier 1 Base Package  
**Client:** Dzombo Hunting Safaris, Windhoek, Namibia  
**Vendor:** Robbies Robotics Inc., Fairfax, VA  
**Contract Value:** ~$53,700 USD / ~N$918,000 NAD  
**Plan Date:** March 30, 2026  
**Document Owner:** Robbie Sanchez, Robbies Robotics  
**Version:** 1.0  

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Master Timeline (Gantt)](#master-timeline)
3. [Phase 0: Pre-Deployment (Week 0–2)](#phase-0)
4. [Phase 1: Blueprint & Discovery (Week 1–2)](#phase-1)
5. [Phase 2: Hardware Build & Ship (Week 2–4)](#phase-2)
6. [Phase 3: On-Site Deployment (Week 4–5)](#phase-3)
7. [Phase 4: Training (Week 5–6)](#phase-4)
8. [Phase 5: Go-Live & Handover (Week 6)](#phase-5)
9. [Phase 6: Revenue Generation (Week 6–12)](#phase-6)
10. [Risk Register](#risk-register)
11. [Communication Plan](#communication-plan)
12. [Success Metrics Framework](#success-metrics)
13. [Budget Summary](#budget-summary)
14. [Appendices](#appendices)

---

<a name="executive-summary"></a>
## 1. EXECUTIVE SUMMARY

Robbies Robotics will design, build, ship, and deploy a private AI infrastructure stack for Dzombo Hunting Safaris at their Windhoek, Namibia headquarters. The system comprises a 4× RTX 5090 GPU server and an Apple Mac Studio M3 Ultra, pre-loaded with open-source AI models to deliver:

- **AI Chat Service** — website management, booking, records, logs, permits (25 users)
- **AI Travel & Client Ops** — proposal drafting, itinerary generation, client follow-up
- **Marketing Content Generation** — 50 pieces/month

A 2-person team will deploy on-site over ~10 days, train staff, and provide 90 days of post-launch remote support. The ongoing partnership begins at N$2,499/month.

**Target Timeline:** 12 weeks from contract signing to revenue generation phase  
**Critical Path:** GPU procurement → server build → shipping → on-site deployment

---

<a name="master-timeline"></a>
## 2. MASTER TIMELINE

```
WEEK    0    1    2    3    4    5    6    7    8    9   10   11   12
        |    |    |    |    |    |    |    |    |    |    |    |    |
PHASE 0 ████████████                Pre-Deployment / Procurement
PHASE 1      ████████                Blueprint & Discovery
PHASE 2           ████████████       Hardware Build & Ship
PHASE 3                     ████████ On-Site Deployment
PHASE 4                          ████████ Training
PHASE 5                               ████ Go-Live & Handover
PHASE 6                               ████████████████████████ Revenue Gen

KEY MILESTONES:
  Week 0  — Project kickoff call
  Week 1  — Discovery sessions begin
  Week 2  — Blueprint document delivered; hardware build starts
  Week 2  — Hardware procurement complete (all components in-house)
  Week 3  — Server build complete, burn-in testing done
  Week 3  — Hardware ships to Windhoek
  Week 4  — Deployment team flies DC → Windhoek
  Week 5  — AI services operational (soft launch)
  Week 6  — Training complete, hard launch, handover
  Week 6  — 90-day support begins
  Week 8  — First white-label outreach
  Week 12 — First white-label client signed (target)
  Week 18 — 90-day support ends
```

---

<a name="phase-0"></a>
## 3. PHASE 0: PRE-DEPLOYMENT (Week 0–2)

### 3.1 Hardware Procurement Checklist

#### GPU Server Build (4U Rackmount)

| Component | Spec | Qty | Vendor Options | Est. Price (USD) | Lead Time |
|-----------|------|-----|----------------|-------------------|-----------|
| **CPU** | AMD Ryzen Threadripper PRO 7965WX (24-core, sTR5) | 1 | Newegg, B&H Photo, CDW | $2,200 | 3–5 days |
| **Motherboard** | ASUS Pro WS WRX90E-SAGE SE (sTR5, 7× PCIe 5.0 x16) | 1 | Newegg, B&H Photo | $1,100 | 3–7 days |
| **GPUs** | NVIDIA GeForce RTX 5090 32GB (Founders Edition or ASUS/MSI partner) | 4 | Best Buy, Newegg, B&H Photo, Micro Center (Fairfax) | $3,050–$3,800 ea (~$14,000 total) | In stock — verify; may need 1–2 week watch |
| **RAM** | Kingston Fury Renegade DDR5-6000 ECC 32GB sticks | 8 (256GB) | Newegg, Amazon | $800 | 2–3 days |
| **NVMe Storage** | Samsung 990 Pro 2TB PCIe 4.0 NVMe | 2 (RAID 1 mirror) | Amazon, Newegg | $340 | 2 days |
| **Chassis** | Rosewill RSV-L4412U (4U rackmount, 12-bay, extended depth) | 1 | Newegg | $180 | 3 days |
| **PSU** | Corsair HX1500i (1500W, 80+ Platinum, ATX 3.0) | 1 | Newegg, Amazon | $350 | 2 days |
| **CPU Cooler** | Noctua NH-U14S TR5-SP6 (Threadripper socket) | 1 | Amazon | $110 | 2 days |
| **Case Fans** | Noctua NF-A14 PWM 140mm | 6 | Amazon | $150 | 2 days |
| **Rail Kit** | Generic 4U sliding rails (adjustable 26"–33") | 1 | Newegg | $50 | 3 days |
| **Network** | Intel X710-DA2 10GbE SFP+ dual-port NIC | 1 | Amazon, CDW | $180 | 3 days |
| **KVM** | Rackmount KVM + 8-port switch | 1 | Amazon | $120 | 3 days |
| **UPS** | APC Smart-UPS 1500VA LCD (SMT1500RM2U) 2U rackmount | 1 | CDW, Amazon | $650 | 3–5 days |
| **PDU** | APC Basic Rack PDU AP7900B | 1 | Amazon | $180 | 3 days |

**Server subtotal: ~$20,410**

#### Mac Studio

| Component | Spec | Qty | Vendor | Est. Price (USD) | Lead Time |
|-----------|------|-----|--------|-------------------|-----------|
| **Mac Studio** | M3 Ultra, 80-core GPU, 32-core Neural Engine, 128GB unified memory, 2TB SSD | 1 | Apple.com or Apple Store (Tysons Corner, VA) | $5,999 | In stock or 1–2 weeks CTO |

**Mac Studio subtotal: ~$5,999**

#### Accessories & Cables

| Item | Qty | Est. Price |
|------|-----|------------|
| Cat6a Ethernet cables (various lengths) | 10 | $50 |
| DisplayPort cables | 4 | $40 |
| USB-C to DisplayPort adapters | 2 | $30 |
| Surge protectors (heavy duty) | 2 | $60 |
| Cable management kit (velcro, ties, labels) | 1 | $30 |
| External backup drive (WD Red 8TB) | 1 | $180 |
| Pelican 1690 transport case (for server) | 1 | $450 |
| Pelican 1510 transport case (for Mac Studio + accessories) | 1 | $200 |

**Accessories subtotal: ~$1,040**

**TOTAL HARDWARE: ~$27,449**

#### Procurement Timeline
- **Day 1–2:** Place all orders; visit Micro Center Fairfax for GPUs in-stock
- **Day 3–7:** Components arrive at Robbies Robotics workshop
- **Day 7–10:** Identify any backorder items, source alternatives
- **Day 10:** All components in-house — begin build

**Owner:** Robbies Robotics  
**Risk:** RTX 5090 stock availability — current street price ~$3,050–$3,800 each. Mitigate by checking Micro Center Fairfax walk-in stock, setting up Newegg/Best Buy alerts, and having an EVGA/MSI/ASUS partner card as backup model.

---

### 3.2 Software Stack (Pre-Configure Before Shipping)

#### GPU Server (Ubuntu Server 24.04 LTS)

| Layer | Software | Version | Purpose |
|-------|----------|---------|---------|
| **OS** | Ubuntu Server 24.04 LTS | Latest | Base operating system |
| **GPU Drivers** | NVIDIA Driver 560+ | Latest stable | GPU support |
| **CUDA** | CUDA Toolkit 12.6+ | Latest | GPU compute |
| **Container** | Docker CE + NVIDIA Container Toolkit | Latest | Service isolation |
| **Orchestration** | Docker Compose | Latest | Multi-service management |
| **LLM Runtime** | Ollama | Latest | Model serving (primary) |
| **LLM Runtime** | vLLM | Latest | High-throughput inference |
| **Web UI** | Open WebUI | Latest | Chat interface for staff |
| **AI Framework** | LangChain + LangGraph | Latest | Agentic workflows |
| **RAG** | ChromaDB | Latest | Vector database for docs |
| **CMS Integration** | n8n (self-hosted) | Latest | Workflow automation, website updates |
| **Reverse Proxy** | Nginx + Certbot | Latest | HTTPS, routing |
| **Monitoring** | Prometheus + Grafana | Latest | System/GPU monitoring |
| **Backup** | Restic + rclone | Latest | Automated backups |
| **SSH** | OpenSSH + WireGuard | Latest | Remote access |
| **Security** | UFW, Fail2Ban, CrowdSec | Latest | Firewall & intrusion prevention |

#### AI Models to Pre-Load

| Model | Size | Purpose | VRAM Usage |
|-------|------|---------|------------|
| **Llama 3.3 70B Instruct (Q4_K_M)** | ~40GB | Primary chat, writing, analysis | 1–2 GPUs |
| **Qwen 3 32B** | ~18GB | Multilingual support, coding | 1 GPU |
| **Mistral Small 3.1 24B** | ~14GB | Fast responses, lighter tasks | 1 GPU |
| **DeepSeek-V3 (distilled 7B)** | ~4GB | Quick queries, lightweight ops | Shared |
| **Llama 3.2 Vision 11B** | ~7GB | Image analysis (marketing, property) | 1 GPU |
| **Stable Diffusion XL / FLUX.1** | ~7GB | Marketing image generation | 1 GPU |
| **Nomic Embed Text v1.5** | ~275MB | RAG embeddings | CPU/shared |
| **Whisper Large v3** | ~3GB | Speech-to-text (optional) | Shared |

**Total VRAM available:** 4 × 32GB = 128GB  
**Estimated active usage:** 60–90GB (allows concurrent model serving)

#### Mac Studio (macOS Sonoma)

| Software | Purpose |
|----------|---------|
| Ollama (macOS) | Local model serving via unified memory |
| Open WebUI | Admin interface |
| Homebrew + CLI tools | System management |
| Apple Remote Desktop | Remote admin |
| TimeMachine | Local backup |

**The Mac Studio serves as:** admin workstation, backup inference node (128GB unified memory can run 70B+ models natively), and management console.

---

### 3.3 Import/Customs Preparation for Namibia

#### SACU Customs Framework
- Namibia is a SACU member (Southern African Customs Union)
- Electronics/computer equipment from outside SACU: **~15% import duty + 15% VAT**
- Total landed cost addition: **~30% on declared value**
- No specific import license required for computer equipment (non-restricted)

#### Estimated Customs Costs
| Item | Declared Value | Duty (15%) | VAT (15%) | Total Customs |
|------|---------------|------------|-----------|---------------|
| GPU Server components | $20,000 | $3,000 | $3,450 | $6,450 |
| Mac Studio | $6,000 | $900 | $1,035 | $1,935 |
| **Total** | **$26,000** | **$3,900** | **$4,485** | **$8,385** |

> **Note:** Declare at fair market value. Over-declaring triggers higher duties; under-declaring risks seizure. Work with customs broker to optimize.

#### Customs Broker
- **Recommended:** ACT Logistics, Windhoek — [airfreight.com.na](https://www.airfreight.com.na)
  - Licensed for all points of entry (air, road, sea)
  - Can handle customs clearance at Hosea Kutako International Airport (WDH)
  - **Action:** Contact ACT Logistics in Week 0 to establish relationship and pre-file documentation
- **Backup:** Woker Freight Services, Windhoek

#### Required Documentation
1. Commercial invoice (detailed, itemized with HS codes)
2. Packing list with weights and dimensions
3. Bill of lading / airway bill
4. Certificate of origin (USA)
5. Import permit (not required for computer equipment, but verify)
6. Company registration documents (Robbies Robotics)
7. Letter from Dzombo authorizing import on their behalf

#### HS Codes (Harmonized System)
- GPU/Computer components: **8471.49** (automatic data processing machines)
- Computer monitors: **8528.52**
- UPS/Power: **8504.40**
- Cables/accessories: **8544.42**

**Owner:** Robbies Robotics (procurement, packing, documentation) + ACT Logistics Namibia (clearance)  
**Timeline:** Engage customs broker by Week 1; pre-file documents by Week 2

---

### 3.4 Travel Logistics

#### Flights: Washington DC → Windhoek

**No direct flights exist.** Best routing options:

| Route | Airlines | Duration | Est. Cost (RT/person) |
|-------|----------|----------|-----------------------|
| **IAD → DOH → WDH** | Qatar Airways | ~22h + 9h layover | $1,400–$1,800 |
| **IAD → JNB → WDH** | United/SAA then Airlink | ~17h + 2h connection + 2h | $1,200–$1,600 |
| **IAD → FRA → WDH** | Lufthansa/United → Eurowings Discover | ~8h + 10h | $1,400–$1,700 |
| **IAD → ADD → WDH** | Ethiopian Airlines | ~15h + 5h layover + 5h | $1,100–$1,500 |

**Recommended:** IAD → JNB → WDH via United + Airlink  
- Most common routing for business travelers
- Johannesburg (JNB) is the main hub for Southern Africa
- 2-hour Airlink connection JNB → WDH
- **Book at least 3 weeks in advance**

**Budget:** 2 persons × $1,500 avg RT = **$3,000**

#### Accommodation: Windhoek (10–12 nights)

| Hotel | Location | Rate/Night | Notes |
|-------|----------|------------|-------|
| **Hilton Windhoek** | CBD, Rev. Michael Scott St | $130–$180 | Business center, reliable wifi, near everything |
| **Mövenpick Hotel Windhoek** | CBD | $110–$150 | Pool, gym, good for extended stays |
| **Windhoek Gardens Boutique Hotel** | Klein Windhoek | $80–$120 | Quieter, good value |

**Recommended:** Hilton Windhoek — reliable business infrastructure, central location  
**Budget:** 2 persons × 12 nights × $160 = **$3,840**

#### Ground Transport
- Airport transfer (Hosea Kutako → Windhoek CBD): ~45min, $40–$60 per trip
- Rental car recommended for deployment period: **$50–$70/day × 12 days = $720**
- **Recommended:** Avis or Hertz at Windhoek Airport (pre-book)

**Budget:** Transfers + rental = **$900**

#### Visa Requirements
- **U.S. citizens do NOT need a visa** for business visits under 90 days to Namibia
- Passport must be valid for 6+ months beyond travel date
- At least 2 blank pages required
- **⚠️ IMPORTANT:** The Namibian Embassy notes that persons performing "work" (including installation) may technically require an employment permit under Section 27 of the Immigration Control Act
- **Mitigation:** Frame the trip as "business meetings, training, and technology consultation" — installation is supervised setup, not employment. Carry a letter from Dzombo confirming you are consultants, not employees. Consult with immigration attorney if concerned.

#### Travel Budget Summary
| Item | Cost |
|------|------|
| Flights (2 persons RT) | $3,000 |
| Accommodation (12 nights × 2) | $3,840 |
| Ground transport | $900 |
| Per diem (meals, incidentals) × 2 × 12 days @ $60/day | $1,440 |
| Travel insurance (2 persons) | $300 |
| **Travel total** | **$9,480** |

---

### 3.5 Pre-Deployment Client Questionnaire

> **Send to Japsie by end of Week 0. Responses needed by end of Week 1.**

#### A. IT & Network Infrastructure
1. Current internet provider and plan (speed, data cap, uptime)?
2. Do you have a dedicated server room or locked closet with climate control?
3. Current electrical capacity in the server location (single/three-phase, amperage)?
4. Do you have a network rack? If so, what size (U height)?
5. Existing network equipment (router, switches, access points — make/model)?
6. Current Wi-Fi coverage and number of access points?
7. Static IP address availability from ISP?
8. Backup internet connection or generator power?

#### B. Current Technology
9. What software/tools do staff currently use? (email, CRM, booking system, website CMS)
10. Website platform (WordPress, Squarespace, custom)?
11. Current hosting provider for website?
12. Do you use any cloud services (Google Workspace, Microsoft 365, etc.)?
13. How many computers/devices does the office have?
14. Current email system and domain?

#### C. Staff & Operations
15. How many staff members will use the AI system? (names, roles)
16. Who will be the designated IT administrator (day-to-day)?
17. What are the top 5 tasks you want AI to handle first?
18. What does your typical client booking workflow look like today?
19. What permit/license tracking do you currently do, and how?
20. Do you have existing client records/databases? What format?

#### D. Physical Space
21. Photos of proposed server location (room dimensions, ventilation, electrical outlets)
22. Physical security of server room (lock, access control)?
23. Ambient temperature in server location?
24. Nearest electrical panel to server location?

#### E. Access & Credentials
25. Domain registrar access (for DNS management)
26. Website admin access
27. Email admin access
28. ISP account details (for potential speed upgrade)

**Owner:** Robbies Robotics sends questionnaire; Dzombo completes  
**Deadline:** Responses by end of Week 1 (critical path for Blueprint)

---

### 3.6 Legal & Contract Items

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Service contract (signed) | ✅ Complete | Both | Tier 1 Base Package |
| SLA document | ❌ Needed | Robbies Robotics | Define uptime, response times, support hours |
| Equipment warranty terms | ❌ Needed | Robbies Robotics | GPU, server, Mac Studio warranty pass-through |
| Data processing agreement | ❌ Needed | Robbies Robotics | Client data handling, privacy |
| Shipping insurance | ❌ Needed | Robbies Robotics | Full replacement value coverage |
| Professional liability insurance | ❌ Needed | Robbies Robotics | E&O insurance for the project |
| Equipment ownership transfer | ❌ Needed | Both | When does Dzombo own the hardware? |
| IP assignment | ❌ Needed | Robbies Robotics | Clarify who owns custom configurations |
| Force majeure / shipping loss clause | ❌ Needed | Both | What happens if equipment is lost in transit? |
| Monthly partnership fee terms | ❌ Needed | Both | N$2,499/mo — start date, what's included, cancellation |

#### SLA Targets (Proposed)
- **System uptime:** 99% monthly (excludes scheduled maintenance)
- **Remote support response:** 4 hours during business hours (EST/CAT overlap: 8am–12pm EST / 2pm–6pm CAT)
- **Critical issue response:** 2 hours
- **Scheduled maintenance window:** Sundays 10pm–6am CAT
- **Monthly status report:** By 5th of each month

**Owner:** Robbies Robotics drafts all documents by end of Week 1  
**Deliverable:** SLA document, data processing agreement, equipment transfer terms

---

### Phase 0 Deliverables Summary

| Deliverable | Due | Owner |
|-------------|-----|-------|
| All hardware ordered | Week 0, Day 3 | Robbies Robotics |
| Client questionnaire sent | Week 0, Day 2 | Robbies Robotics |
| Customs broker engaged | Week 1 | Robbies Robotics |
| Travel booked (flights, hotel, car) | Week 1 | Robbies Robotics |
| SLA and legal docs drafted | Week 1 | Robbies Robotics |
| Client questionnaire responses received | Week 1 | Dzombo |
| All hardware components in-house | Week 2 | Robbies Robotics |

---

<a name="phase-1"></a>
## 4. PHASE 1: BLUEPRINT & DISCOVERY (Week 1–2)

### 4.1 Remote Discovery Sessions

| Session | Attendees | Duration | Agenda |
|---------|-----------|----------|--------|
| **Kickoff Call** (Week 1, Mon) | Rob + Japsie + Dzombo team | 90 min | Project overview, timeline, introductions, questionnaire review |
| **Technology Audit** (Week 1, Wed) | Rob + Japsie + Dzombo IT/admin | 60 min | Walk-through of current systems, tools, pain points |
| **Network & Space Assessment** (Week 1, Thu) | Rob + Japsie | 45 min | Video walkthrough of server location, power, internet |
| **Use Case Deep Dive** (Week 1, Fri) | Rob + Japsie + key staff | 90 min | Prioritize AI use cases, define success criteria |
| **Blueprint Review** (Week 2, Wed) | Rob + Japsie | 60 min | Present blueprint document, get sign-off |

**Tools:** Zoom/Google Meet, WhatsApp for async, Email for formal docs  
**Time Zone Coordination:** EST (UTC-4) ↔ CAT (UTC+2) = 6-hour difference  
- Best overlap window: **8:00 AM – 12:00 PM EST = 2:00 PM – 6:00 PM CAT**

### 4.2 Current Technology Audit

**Expected findings based on typical safari operations:**

| Area | Likely Current State | Target State |
|------|---------------------|--------------|
| Website | WordPress or basic CMS, manually updated | AI-assisted content updates, automated SEO |
| Booking | Email/phone/WhatsApp, spreadsheets | AI-powered booking assistant, CRM integration |
| Client records | Paper files, basic spreadsheets | Searchable AI-indexed database |
| Permits/licenses | Manual tracking, paper files | AI-tracked permit system with reminders |
| Marketing | Outsourced or manual, sporadic | AI-generated content pipeline (50 pieces/mo) |
| Proposals | Manual Word/PDF creation | AI-drafted proposals from templates |
| Communication | WhatsApp, email | Same + AI chat interface for internal ops |

### 4.3 Network Assessment Checklist

| Item | Minimum Requirement | Ideal |
|------|--------------------|----- |
| Internet speed | 25 Mbps down / 10 Mbps up | 50+ Mbps fiber |
| Data cap | Uncapped | Uncapped |
| Static IP | 1 | 1 |
| Power | 20A dedicated circuit | 30A with UPS backup |
| Server room temp | Below 30°C | 18–24°C with AC |
| Physical security | Locked room | Locked room + access log |
| Backup power | Generator on-site | Generator + UPS (provided) |

> **Windhoek internet note:** Fiber is available in most business areas via Telecom Namibia or MTC. Typical business plans: 50–100 Mbps uncapped for ~N$2,000–4,000/mo. Confirm with Japsie.

### 4.4 AI Use Case Prioritization

**Recommended go-live order (based on impact and complexity):**

| Priority | Service | Complexity | Impact | Go-Live Target |
|----------|---------|------------|--------|----------------|
| 1️⃣ | **AI Chat (internal)** — staff Q&A, document search | Low | High | Day 1 on-site |
| 2️⃣ | **Client Records & Booking Assistant** | Medium | High | Day 3 on-site |
| 3️⃣ | **Proposal & Itinerary Drafting** | Medium | High | Day 5 on-site |
| 4️⃣ | **Website Content Updates** | Medium | Medium | Day 7 on-site |
| 5️⃣ | **Marketing Content Generation** | Low | Medium | Day 8 on-site |
| 6️⃣ | **Permit & License Tracking** | High | Medium | Week 7 (remote) |

### 4.5 Blueprint Document Deliverable

**Contents of the Blueprint (PDF, delivered Week 2):**

1. Executive summary
2. Current state assessment (from discovery)
3. Target architecture diagram
4. Network topology diagram
5. AI services specification (models, endpoints, user flows)
6. Hardware placement plan
7. Integration points with existing systems
8. Data migration plan (if applicable)
9. Security architecture
10. Go-live sequence and acceptance criteria
11. Training plan overview
12. Support model

**Owner:** Robbies Robotics  
**Review:** Japsie signs off by end of Week 2  
**Dependency:** Blocks Phase 3 on-site work (team needs approved blueprint)

---

<a name="phase-2"></a>
## 5. PHASE 2: HARDWARE BUILD & SHIP (Week 2–4)

### 5.1 Server Assembly (Week 2, Day 1–3)

**Day 1: Chassis & Core**
| Task | Duration | Details |
|------|----------|---------|
| Unbox and inspect all components | 2h | Verify against BOM, check for damage |
| Install Threadripper PRO 7965WX in WRX90E-SAGE SE | 1h | Apply thermal paste, mount Noctua NH-U14S |
| Install DDR5 RAM (8× 32GB) | 30min | Populate all 8 DIMM slots |
| Mount motherboard in Rosewill 4U chassis | 1h | Standoffs, I/O shield, secure mount |
| Install Corsair HX1500i PSU | 30min | Route cables, modular connections |
| Install 2× Samsung 990 Pro NVMe | 15min | M.2 slots, thermal pads |

**Day 2: GPUs & Networking**
| Task | Duration | Details |
|------|----------|---------|
| Install 4× RTX 5090 GPUs | 1h | PCIe x16 slots, verify spacing, power cables |
| Install Intel X710-DA2 10GbE NIC | 15min | PCIe slot, if needed (or use onboard) |
| Cable management | 1h | Zip ties, velcro, proper airflow paths |
| Install case fans (6× Noctua NF-A14) | 30min | Front intake, rear exhaust configuration |
| Connect all power, data, fan cables | 1h | Double-check every connection |

**Day 3: First Boot & OS Install**
| Task | Duration | Details |
|------|----------|---------|
| First power-on / POST test | 30min | Verify BIOS, all GPUs detected, RAM count |
| BIOS configuration | 30min | PCIe settings, boot order, fan curves, XMP |
| Install Ubuntu Server 24.04 LTS | 30min | NVMe RAID 1 mirror, LVM |
| NVIDIA driver installation | 30min | `sudo apt install nvidia-driver-560` |
| CUDA toolkit installation | 30min | CUDA 12.6 |
| Docker + NVIDIA Container Toolkit | 30min | Verify `nvidia-smi` in container |
| Network configuration | 30min | Static IP, DNS, SSH keys |

### 5.2 Burn-In Testing (Week 2, Day 4–5)

| Test | Tool | Duration | Pass Criteria |
|------|------|----------|---------------|
| GPU stress test | FurMark / gpu-burn | 8h (overnight) | All 4 GPUs stable, temps < 85°C |
| CPU stress test | stress-ng | 4h | No throttling, stable temps |
| Memory test | memtest86+ | 8h (overnight) | Zero errors, all 256GB tested |
| Storage benchmark | fio | 1h | Sequential read > 6GB/s, write > 5GB/s |
| Multi-GPU inference test | Ollama + Llama 3.3 70B | 2h | Successful multi-GPU inference |
| Network throughput | iperf3 | 30min | Line-rate on 10GbE |
| Power consumption monitoring | Wall meter | During all tests | Under 1400W peak load |

### 5.3 Software Stack Deployment (Week 2–3, Day 5–7)

| Task | Duration | Details |
|------|----------|---------|
| Deploy Docker Compose stack | 2h | All services defined in `docker-compose.yml` |
| Install Ollama, pull all models | 4h | Download and verify all 8 models |
| Configure Open WebUI | 2h | Multi-user setup, branding, default models |
| Deploy n8n workflows | 3h | Website updater, booking, proposal templates |
| Configure ChromaDB + RAG pipeline | 3h | Document ingestion pipeline, embeddings |
| Set up Nginx reverse proxy | 1h | SSL certs (self-signed for now, Let's Encrypt on-site) |
| Prometheus + Grafana monitoring | 2h | GPU metrics, system health dashboards |
| Security hardening | 2h | UFW rules, Fail2Ban, SSH key-only, WireGuard |
| Backup configuration (Restic) | 1h | External drive backup schedule |
| End-to-end testing | 4h | All services, all user flows, all models |

### 5.4 Mac Studio Configuration (Week 2–3)

| Task | Duration | Details |
|------|----------|---------|
| Unbox and initial setup | 30min | macOS Sonoma, create admin account |
| Install Homebrew + CLI tools | 30min | git, wget, htop, etc. |
| Install Ollama (macOS) | 30min | Pull Llama 3.3 70B (fits in 128GB unified memory) |
| Install Open WebUI | 30min | Docker Desktop for Mac |
| Configure Remote Desktop | 15min | Apple Remote Desktop + SSH |
| Test as backup inference node | 1h | Verify model serving independently |
| Create system documentation | 1h | Admin guide for Mac Studio |

### 5.5 Shipping Logistics (Week 3)

#### Option Analysis

| Method | Transit Time | Cost (est.) | Risk Level | Recommendation |
|--------|-------------|-------------|------------|----------------|
| **Air freight (IAD → JNB → WDH)** | 3–5 days | $1,500–$2,500 | Low | ✅ **Recommended** |
| Ocean freight (Baltimore → Walvis Bay) | 25–35 days | $800–$1,200 | Medium | ❌ Too slow |
| Carry as checked luggage | 0 days (with team) | $200–$400 oversized fees | High (damage) | ❌ Too risky for server |
| **Hybrid: Ship server air freight, carry Mac Studio** | 3–5 days | $1,800 total | Low | ✅ **Best approach** |

**Recommended Approach: Hybrid**
- **GPU Server:** Air freight via DHL Express or FedEx International Priority
  - Pack in Pelican 1690 case, double-boxed with foam
  - Declare accurate value for customs
  - Purchase full-replacement shipping insurance ($27,000 value)
  - Ship to ACT Logistics Windhoek for customs clearance
  - **Cost:** ~$1,800 (DHL Express, ~80lbs, oversized)
  - **Insurance:** ~$500 (2% of declared value)
- **Mac Studio:** Carry in Pelican 1510 as checked luggage
  - Fits within airline checked bag dimensions
  - Accessible immediately on arrival
  - **Cost:** ~$150 (oversized checked bag fee)

#### Shipping Timeline
- **Week 3, Monday:** Pack server in Pelican case, label, photograph
- **Week 3, Tuesday:** DHL pickup from Fairfax
- **Week 3, Wednesday–Friday:** In transit (IAD → hub → JNB)
- **Week 3+1, Monday:** Arrives JNB, connects to WDH
- **Week 3+1, Tuesday:** ACT Logistics clears customs
- **Week 3+1, Wednesday:** Server delivered to Dzombo Hunting Safaris office

**Owner:** Robbies Robotics (packing, shipping) + ACT Logistics (clearance, delivery)  
**Dependency:** Customs clearance — have all docs pre-filed with broker  
**Risk:** Customs delay — mitigate with pre-filing and broker relationship

---

### 5.6 Budget: Phase 2

| Item | Cost |
|------|------|
| Hardware (server + Mac Studio + accessories) | $27,449 |
| Shipping (DHL Express) | $1,800 |
| Shipping insurance | $500 |
| Customs duties + VAT (~30% of $26,000) | $8,385 |
| Customs broker fee | $300 |
| **Phase 2 total** | **$38,434** |

---

<a name="phase-3"></a>
## 6. PHASE 3: ON-SITE DEPLOYMENT (Week 4–5)

### 6.1 Day-by-Day Deployment Schedule

**Team:** 2 Robbies Robotics engineers  
**Duration:** 10 working days on-site  
**Work hours:** 8:00 AM – 6:00 PM CAT (with breaks)

---

#### DAY 1 (Monday) — Arrival & Site Assessment
| Time | Task | Details |
|------|------|---------|
| Morning | Arrive Windhoek (previous evening flight) | Check into Hilton Windhoek |
| 10:00 | Meet Japsie at Dzombo office | Introductions, office tour |
| 11:00 | Physical site survey | Server room inspection, power, cooling, security |
| 12:00 | Lunch with Japsie | Build relationship, discuss priorities |
| 14:00 | Network assessment | Test internet speed, inspect router/switches, map topology |
| 15:00 | Verify server delivery | Confirm Pelican case arrived intact, inspect for damage |
| 16:00 | Document findings | Update blueprint with actual site conditions |
| 17:00 | Procurement run (if needed) | Local purchase: rack, cables, power adapters (Type M plugs) |

**⚠️ Power Note:** Namibia uses Type M (3-pin, 15A) and Type D plugs, 220V/50Hz. Server PSU is auto-switching (110–240V). Need Type M power cables or adapters. **Buy locally or bring universal adapters.**

#### DAY 2 (Tuesday) — Server Installation
| Time | Task | Details |
|------|------|---------|
| 08:00 | Unpack server from Pelican case | Inspect for shipping damage, photograph |
| 09:00 | Rack mounting | Install server in rack (or desk mount if no rack) |
| 10:00 | UPS installation | Mount APC UPS, connect to server + network gear |
| 11:00 | Power up and POST verification | Confirm all 4 GPUs detected, RAM, storage |
| 12:00 | Lunch | — |
| 13:00 | Network cabling | Connect server to switch, configure IPs |
| 14:00 | Internet connectivity test | Verify outbound access, speed test, DNS |
| 15:00 | Mac Studio setup | Unpack, connect to network, verify |
| 16:00 | WireGuard VPN setup | Remote access tunnel for post-deployment support |
| 17:00 | Run diagnostic suite | Quick stress test of all components |

#### DAY 3 (Wednesday) — AI Services Deployment
| Time | Task | Details |
|------|------|---------|
| 08:00 | Verify all Docker services running | Check Ollama, Open WebUI, n8n, monitoring |
| 09:00 | SSL/TLS configuration | Let's Encrypt via Certbot (if static IP + domain) |
| 10:00 | Open WebUI configuration | Create user accounts for all Dzombo staff |
| 11:00 | Test AI Chat Service | Run through common queries with Japsie |
| 12:00 | Lunch | — |
| 13:00 | Configure RAG pipeline | Ingest Dzombo's existing documents, records |
| 14:00 | Test document Q&A | "What permits do we need for Caprivi?" etc. |
| 15:00 | Booking assistant setup | Configure n8n workflow for booking inquiries |
| 16:00 | Test booking workflow | End-to-end: inquiry → AI response → record |
| 17:00 | Day 3 checkpoint with Japsie | Demo progress, gather feedback |

#### DAY 4 (Thursday) — Client Ops & Proposals
| Time | Task | Details |
|------|------|---------|
| 08:00 | Proposal drafting system setup | Load Dzombo templates, configure n8n workflow |
| 09:00 | Itinerary generation setup | Safari packages, route templates, pricing |
| 10:00 | Test proposal generation | Generate 3 sample proposals, review with Japsie |
| 11:00 | Client record system | Database schema, import existing records |
| 12:00 | Lunch | — |
| 13:00 | Import existing client data | Spreadsheets → ChromaDB, structured records |
| 14:00 | Test client lookup | "Show me all bookings for Client X" |
| 15:00 | Permit tracking setup | Configure permit database and reminder workflows |
| 16:00 | Test permit tracking | Create test permits, verify reminders |
| 17:00 | End-of-day review | Test all services deployed so far |

#### DAY 5 (Friday) — Website & Marketing Integration
| Time | Task | Details |
|------|------|---------|
| 08:00 | Website CMS access setup | Connect n8n to WordPress/CMS via API |
| 09:00 | Content update workflow | AI drafts content → human review → publish |
| 10:00 | Test website update flow | Generate and publish a test blog post |
| 11:00 | Marketing content pipeline | Configure image + text generation workflow |
| 12:00 | Lunch | — |
| 13:00 | Generate sample marketing content | 5 social media posts, 2 blog drafts, 3 images |
| 14:00 | Review with Japsie | Get feedback on tone, style, accuracy |
| 15:00 | Refine prompts and templates | Adjust based on feedback |
| 16:00 | Weekly checkpoint meeting | Full demo of all services to Dzombo team |
| 17:00 | Document all configurations | Runbooks, credentials, architecture |

#### DAY 6–7 (Weekend) — Buffer / Catch-Up
- Address any issues found during Week 1
- Additional data migration if needed
- Explore Windhoek (team wellbeing)
- Prepare training materials

#### DAY 8 (Monday) — Security & Optimization
| Time | Task | Details |
|------|------|---------|
| 08:00 | Security hardening review | Verify all firewall rules, SSH, fail2ban |
| 09:00 | Backup verification | Test full backup and restore cycle |
| 10:00 | Performance optimization | Model quantization tuning, batch sizes, caching |
| 11:00 | Load testing | Simulate 25 concurrent users |
| 12:00 | Lunch | — |
| 13:00 | Monitoring dashboards | Configure Grafana alerts, uptime monitoring |
| 14:00 | Set up external monitoring | UptimeRobot or similar for public-facing services |
| 15:00 | Documentation update | Final architecture diagram, IP tables, credentials |
| 16:00 | Disaster recovery test | Simulate server failure, test failover to Mac Studio |
| 17:00 | Review with Japsie | Security overview, admin responsibilities |

#### DAY 9–10 (Tuesday–Wednesday) — Training (see Phase 4)

### 6.2 Security Hardening Checklist

| Security Layer | Implementation |
|----------------|----------------|
| **Network** | UFW firewall: only ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 51820 (WireGuard) |
| **SSH** | Key-only authentication, disable password login, non-standard port (2222) |
| **Intrusion Prevention** | Fail2Ban + CrowdSec installed and configured |
| **VPN** | WireGuard tunnel for all remote admin access |
| **Encryption** | Full-disk encryption (LUKS), HTTPS everywhere |
| **User Management** | Unique accounts per user, role-based access in Open WebUI |
| **Updates** | Unattended security updates enabled |
| **Monitoring** | Prometheus alerts for unusual activity, GPU temp, disk usage |
| **Backup** | Encrypted daily backups to external drive + monthly off-site |
| **Physical** | Server in locked room, BIOS password set |

---

<a name="phase-4"></a>
## 7. PHASE 4: TRAINING (Week 5–6)

### 7.1 Training Schedule (2 Days On-Site)

#### Day 9 (Training Day 1): End Users

| Time | Module | Audience | Content |
|------|--------|----------|---------|
| 08:30 | Welcome & Overview | All staff | What AI can do for Dzombo, what to expect |
| 09:00 | **AI Chat Interface** | All staff (up to 25) | How to log in, ask questions, use conversation history |
| 10:00 | Hands-on Practice | All staff | Each person runs 10 practice queries |
| 10:30 | Break | — | — |
| 10:45 | **Booking Assistant** | Office/booking staff (3–5) | How to use AI for booking inquiries, record lookup |
| 12:00 | Lunch | — | — |
| 13:00 | **Proposal & Itinerary Tool** | Sales/ops staff (2–3) | Generate proposals, edit, export to PDF |
| 14:30 | **Marketing Content** | Marketing person (1–2) | Generate social media posts, blog content, images |
| 15:30 | Q&A Session | All staff | Open questions, concerns, feature requests |
| 16:30 | Day 1 Wrap-Up | All | Homework: use the system for the rest of the day |

#### Day 10 (Training Day 2): Administrators

| Time | Module | Audience | Content |
|------|--------|----------|---------|
| 08:30 | **Admin Dashboard** | Japsie + designated admin (1–2) | Open WebUI admin, user management |
| 09:30 | **System Monitoring** | Admin | Grafana dashboards, what metrics mean |
| 10:30 | Break | — | — |
| 10:45 | **Troubleshooting Guide** | Admin | Common issues, restart procedures, escalation |
| 12:00 | Lunch | — | — |
| 13:00 | **Backup & Recovery** | Admin | How to verify backups, restore procedure |
| 14:00 | **Website Content Workflow** | Admin + web person | Full workflow: draft → review → publish |
| 15:00 | **Advanced Features** | Japsie | Custom prompts, RAG document updates, model selection |
| 16:00 | Final Q&A + Handover | All key staff | Formal handover, emergency contacts |
| 17:00 | Celebratory dinner | Robbies + Dzombo team | 🎉 |

### 7.2 Training Materials to Leave Behind

| Material | Format | Contents |
|----------|--------|----------|
| **Quick Start Guide** | Printed A4 laminated cards (10 copies) | Login, basic queries, tips |
| **User Manual** | PDF (50+ pages) + printed spiral-bound | All features, screenshots, workflows |
| **Admin Runbook** | PDF + printed | Server management, backups, troubleshooting |
| **Network Diagram** | Printed A3 poster | IP addresses, services, connections |
| **Video Tutorials** | USB drive with MP4 files | Screen recordings of all key workflows |
| **Emergency Procedures** | Laminated 1-pager posted in server room | Power loss, restart, contact Robbies Robotics |
| **Credential Sheet** | Sealed envelope for Japsie | All admin passwords, API keys |

---

<a name="phase-5"></a>
## 8. PHASE 5: GO-LIVE & HANDOVER (Week 6)

### 8.1 Soft Launch Checklist (Before Deployment Team Departs)

| # | Item | Status | Verified By |
|---|------|--------|-------------|
| 1 | All 4 RTX 5090 GPUs operational and stable | ☐ | Rob |
| 2 | Mac Studio operational as backup | ☐ | Rob |
| 3 | Open WebUI accessible to all users | ☐ | Rob + Japsie |
| 4 | AI Chat Service responding accurately | ☐ | Japsie |
| 5 | Booking assistant functional | ☐ | Office staff |
| 6 | Proposal generator producing quality output | ☐ | Japsie |
| 7 | Marketing content pipeline working | ☐ | Marketing staff |
| 8 | Website update workflow tested | ☐ | Admin |
| 9 | Monitoring dashboards live | ☐ | Rob |
| 10 | Backups running and verified | ☐ | Rob |
| 11 | WireGuard VPN stable for remote support | ☐ | Rob |
| 12 | All users trained and can log in | ☐ | Japsie |
| 13 | Printed materials distributed | ☐ | Rob |
| 14 | Emergency procedures posted | ☐ | Rob |

### 8.2 Hard Launch Criteria

**System is "live" when ALL of the following are true for 48 consecutive hours:**
- Server uptime > 99%
- All AI models responding within 10 seconds
- At least 10 unique users have completed queries
- No critical errors in logs
- Backup has completed at least 1 successful cycle
- Japsie or admin can restart services independently

### 8.3 90-Day Support Plan

| Timeframe | Support Level | Activities |
|-----------|--------------|------------|
| **Week 6–8** (Intensive) | Daily check-in | Monitor remotely daily, WhatsApp availability, fix issues same-day |
| **Week 8–10** (Active) | 3× weekly check-in | Review monitoring dashboards, address tickets within 4h |
| **Week 10–14** (Standard) | Weekly check-in | Weekly status call, 24h response for non-critical |
| **Week 14–18** (Transition) | Bi-weekly check-in | Prepare for ongoing partnership phase |

#### Support Channels
| Channel | Use For | Response Time |
|---------|---------|---------------|
| WhatsApp group (Robbies + Dzombo) | Quick questions, status updates | < 4 hours |
| Email (support@robbiesrobotics.com) | Formal requests, documentation | < 24 hours |
| WireGuard VPN + SSH | Remote troubleshooting | As needed |
| Zoom/Meet | Scheduled calls, screen sharing | Scheduled |
| Emergency phone | System down, data loss | < 2 hours |

### 8.4 Monthly Reporting Framework

**Monthly report delivered by 5th of each month, containing:**

1. **System Health**
   - Uptime percentage
   - GPU utilization average
   - Storage usage and forecast
   - Any hardware alerts

2. **Usage Metrics**
   - Total queries processed
   - Active users (daily/weekly/monthly)
   - Most-used features
   - Average response time

3. **Content Output**
   - Marketing pieces generated
   - Proposals drafted
   - Website updates made

4. **Issues & Resolutions**
   - Tickets opened/closed
   - Mean time to resolution
   - Outstanding items

5. **Recommendations**
   - Optimization opportunities
   - New use cases to explore
   - Upgrade paths

### 8.5 Escalation Procedures

| Level | Trigger | Who | Action | Resolution Target |
|-------|---------|-----|--------|-------------------|
| **L1** | User question, minor issue | Dzombo admin | Check runbook, restart service | Same day |
| **L2** | Service not responding, performance issue | Robbies Robotics (remote) | SSH in, diagnose, fix | 4 hours |
| **L3** | Hardware failure, data issue | Robbies Robotics (remote + local vendor) | Diagnose, arrange replacement | 24–48 hours |
| **L4** | System down, unrecoverable | Robbies Robotics (emergency) | Mac Studio failover, then full recovery | 2 hours (failover), 72h (full fix) |

---

<a name="phase-6"></a>
## 9. PHASE 6: REVENUE GENERATION (Week 6–12)

### 9.1 White-Label AI Service Offering

**Concept:** Dzombo's AI infrastructure has excess capacity. With 4× RTX 5090s (128GB VRAM) serving 25 users, there's significant headroom. Offer "AI as a Service" to other safari operators, hunting outfitters, and tourism businesses in Southern Africa.

**Branding:** "Southern African AI Network" or "Safari AI Powered by Dzombo Technologies"

### 9.2 First 3 Target Clients

| # | Target | Country | Why | Approach |
|---|--------|---------|-----|----------|
| 1 | **Omujeve Hunting Safaris** | Namibia | Major Namibian operator, peer of Dzombo, would benefit from same tools | Japsie personal introduction |
| 2 | **Kwalata Safaris** | South Africa (Limpopo) | Large operation, multiple concessions, tech-forward | Industry conference + cold outreach |
| 3 | **Robin Hurt Safaris** | Tanzania | Legendary operator, massive client base, needs modernization | Japsie or industry referral |

> **Note:** Japsie operates in 8 countries with 8.5M acres — he likely knows the top operators personally. Leverage his network aggressively.

### 9.3 White-Label Pricing & Packaging

| Tier | Service | Price (USD/mo) | Included |
|------|---------|----------------|----------|
| **Lite** | AI Chat (5 users) + 10 marketing pieces/mo | $299/mo | Chat only, hosted on Dzombo infrastructure |
| **Standard** | AI Chat (15 users) + proposals + 25 marketing/mo | $799/mo | Full ops suite, shared resources |
| **Pro** | Dedicated model instance (25 users) + full suite | $1,499/mo | Isolated resources, priority support |
| **Enterprise** | Custom deployment (own hardware) | $5,000+ setup + $999/mo | Full Robbies Robotics build for their location |

**Revenue Target:**
- Month 2: 1 Lite client = $299/mo
- Month 3: 1 Standard client = $799/mo  
- Month 6: 3 clients = ~$1,800/mo recurring
- Month 12: 5–8 clients = $3,000–$6,000/mo recurring

### 9.4 Marketing Strategy

#### Positioning
> *"The first AI-powered safari operations network in Southern Africa. Built in Namibia. Run on your own hardware. Your data never leaves Africa."*

**Key differentiators:**
- 🔒 **Data sovereignty** — all processing happens on local hardware, not US/EU clouds
- 🌍 **Built for Africa** — understands safari operations, hunting regulations, African business
- ⚡ **Fast** — no cloud latency, local inference
- 💰 **Predictable costs** — fixed monthly, no per-query API fees

#### Marketing Channels
| Channel | Action | Timeline |
|---------|--------|----------|
| **Japsie's network** | Personal introductions at industry events | Week 6+ |
| **Safari Club International (SCI)** | Booth or presentation at next convention | Research dates |
| **Dallas Safari Club (DSC)** | Same | January 2027 (annual) |
| **LinkedIn** | Rob + Japsie post about the deployment | Week 7 |
| **Case study** | Published results from Dzombo (30-day) | Week 10 |
| **Industry publications** | Article in African Hunting Gazette, Magnum magazine | Week 8–10 |
| **Direct outreach** | Personal emails to top 20 operators | Week 8 |

#### Marketing Collateral to Create
1. **One-pager:** "AI for Safari Operations" — problem, solution, pricing
2. **Case study:** "How Dzombo Hunting Safaris Cut Admin Time by 60%"
3. **Demo video:** 3-minute screen recording showing the AI in action
4. **Presentation deck:** 10-slide investor/partner pitch
5. **Website landing page:** southernafricanai.com or similar

### 9.5 Revenue Generation Timeline

| Week | Activity | Owner |
|------|----------|-------|
| 6–7 | Dzombo system stabilized, collecting usage metrics | Robbies Robotics |
| 7–8 | Create white-label marketing collateral | Robbies Robotics |
| 8 | Japsie identifies 5 warm contacts from his network | Dzombo |
| 9 | First outreach: personal emails/WhatsApp from Japsie | Both |
| 10 | 30-day case study published | Robbies Robotics |
| 10–11 | Demo calls with interested operators | Both |
| 11–12 | First white-label contract signed (target) | Both |
| 12+ | Onboard first white-label client | Robbies Robotics |

---

<a name="risk-register"></a>
## 10. RISK REGISTER

| # | Risk | Probability | Impact | Risk Score | Mitigation | Owner |
|---|------|-------------|--------|------------|------------|-------|
| **R1** | RTX 5090 GPUs out of stock / price spike | Medium | High | 🔴 High | Pre-order immediately; Micro Center walk-in; consider 4090 as fallback | Robbies |
| **R2** | Customs delay / seizure in Namibia | Medium | High | 🔴 High | Pre-file all docs with ACT Logistics; correct HS codes; carry copy of commercial invoice | Robbies + ACT |
| **R3** | Server damaged in shipping | Low | Critical | 🔴 High | Pelican case, double-box, full insurance; carry Mac Studio as backup | Robbies |
| **R4** | Inadequate internet at Dzombo office | Medium | High | 🔴 High | Assess in Week 1; budget for ISP upgrade; all AI runs locally (no cloud dependency) | Both |
| **R5** | Power instability / outages in Windhoek | Medium | Medium | 🟡 Med | UPS included; verify generator; surge protection | Both |
| **R6** | Visa/immigration issue for deployment team | Low | High | 🟡 Med | US citizens visa-free for business < 90 days; carry consultant letter from Dzombo | Robbies |
| **R7** | Staff resistance to AI adoption | Medium | Medium | 🟡 Med | Hands-on training; start with easiest use case; quick wins; Japsie champions internally | Both |
| **R8** | Model performance not meeting expectations | Low | Medium | 🟡 Med | Pre-test all use cases before shipping; multiple model options; fine-tuning capability | Robbies |
| **R9** | Scope creep from Dzombo (want more features) | High | Low | 🟡 Med | Clear scope in blueprint; change request process; Phase 2 upsell path | Both |
| **R10** | Exchange rate fluctuation (USD/NAD) | Medium | Low | 🟢 Low | Contract in USD; monthly fee in NAD (small amount, low risk) | Both |

---

<a name="communication-plan"></a>
## 11. COMMUNICATION PLAN

### Regular Cadence

| Phase | Frequency | Format | Attendees | Duration |
|-------|-----------|--------|-----------|----------|
| **Phase 0–1** (Pre-deployment) | 2× per week | Zoom call | Rob + Japsie | 30 min |
| **Phase 2** (Build & Ship) | 1× per week | Zoom + WhatsApp updates | Rob + Japsie | 15 min + async |
| **Phase 3** (On-Site) | Daily standup | In-person | Rob + team + Japsie | 15 min |
| **Phase 4–5** (Training & Launch) | Daily | In-person + WhatsApp | Everyone | 15 min |
| **Phase 6** (90-day support, weeks 6–8) | 3× per week | Zoom/WhatsApp | Rob + Japsie/admin | 15 min |
| **Phase 6** (90-day support, weeks 8–18) | 1× per week | Zoom | Rob + Japsie | 30 min |
| **Ongoing partnership** | Monthly | Zoom + written report | Rob + Japsie | 30 min |

### Communication Tools

| Tool | Purpose |
|------|---------|
| **WhatsApp** (group: "Dzombo AI Project") | Quick updates, photos, async questions |
| **Email** | Formal documents, reports, contracts |
| **Zoom** | Scheduled calls, demos, training |
| **Shared Google Drive** | Documents, blueprints, training materials |
| **Grafana** (shared dashboard link) | Real-time system monitoring |

### Key Communication Principles
1. **No surprises** — if something's delayed, communicate immediately
2. **WhatsApp for urgent, email for important** — different channels for different urgency
3. **Weekly summary** — even if nothing changed, send a "status: on track" message
4. **Photos/screenshots** — visual updates (hardware build, installation) build trust
5. **Japsie gets a personal update** — he's the decision maker, not just a CC

---

<a name="success-metrics"></a>
## 12. SUCCESS METRICS FRAMEWORK

### 30-Day Metrics (by Week 10)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| System uptime | > 99% | Prometheus/Grafana |
| Active users (weekly) | > 15 of 25 accounts | Open WebUI analytics |
| Queries per day | > 50 | Ollama logs |
| AI Chat satisfaction | > 4/5 rating | User survey |
| Proposals generated | > 10 | n8n workflow logs |
| Marketing content pieces | > 30 | Content log |
| Booking queries handled by AI | > 20 | Workflow logs |
| Mean response time | < 8 seconds | Prometheus |
| Zero critical incidents | 0 | Incident log |
| Admin can restart services independently | Yes/No | Observed |

### 60-Day Metrics (by Week 14)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| System uptime | > 99.5% | Prometheus/Grafana |
| Active users (weekly) | > 20 of 25 accounts | Open WebUI analytics |
| Queries per day | > 100 | Ollama logs |
| Time saved per staff member | > 5 hours/week | Staff survey |
| Client response time improvement | > 30% faster | Before/after comparison |
| Marketing content pieces (cumulative) | > 80 | Content log |
| Website updates via AI | > 10 | CMS logs |
| White-label inquiries | > 3 | Sales pipeline |
| Staff can use all core features without help | Yes | Assessment |
| Backup successful for 60 consecutive days | Yes | Restic logs |

### 90-Day Metrics (by Week 18)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| System uptime | > 99.5% | Prometheus/Grafana |
| Active daily users | > 10 | Open WebUI analytics |
| Total queries processed | > 5,000 | Ollama logs |
| Client proposals drafted | > 50 | Workflow logs |
| Marketing content (cumulative) | > 150 | Content log |
| Revenue from white-label | > $0 (at least 1 client) | Invoicing |
| Net Promoter Score (Dzombo staff) | > 7/10 | Survey |
| Support tickets (open) | < 3 | Ticketing system |
| Admin handles L1 issues independently | > 90% of L1s | Support log |
| Dzombo recommends to another operator | Yes | Ask Japsie |

---

<a name="budget-summary"></a>
## 13. BUDGET SUMMARY

| Category | Amount (USD) | Notes |
|----------|-------------|-------|
| **Hardware** | | |
| GPU Server (components) | $20,410 | Threadripper + 4× RTX 5090 + RAM + storage |
| Mac Studio M3 Ultra 128GB | $5,999 | Apple.com |
| Accessories & cases | $1,040 | Cables, Pelican cases, UPS, etc. |
| **Subtotal Hardware** | **$27,449** | |
| | | |
| **Shipping & Customs** | | |
| Air freight (DHL Express) | $1,800 | Server to Windhoek |
| Shipping insurance | $500 | Full replacement value |
| Customs duties (15%) | $3,900 | On ~$26,000 declared |
| VAT (15%) | $4,485 | On value + duty |
| Customs broker fee | $300 | ACT Logistics |
| **Subtotal Shipping** | **$10,985** | |
| | | |
| **Travel** | | |
| Flights (2 persons RT) | $3,000 | IAD → JNB → WDH |
| Accommodation (12 nights × 2) | $3,840 | Hilton Windhoek |
| Ground transport | $900 | Rental car + transfers |
| Per diem (meals/incidentals) | $1,440 | 2 persons × 12 days × $60 |
| Travel insurance | $300 | — |
| **Subtotal Travel** | **$9,480** | |
| | | |
| **Labor & Services** | | |
| Design, assembly, configuration | $3,000 | ~40 hours @ $75/hr (internal) |
| Training materials creation | $500 | Manuals, videos, printed materials |
| Software licenses | $0 | All open-source |
| **Subtotal Labor** | **$3,500** | |
| | | |
| **Contingency (10%)** | **$5,141** | Unexpected costs, local purchases |
| | | |
| **PROJECT TOTAL** | **$56,555** | |
| **Contract Value** | **$53,700** | |
| **Margin** | **-$2,855** | ~-5% (tight margin on Tier 1; recoup via monthly fee + white-label) |

> **Note:** This is a tight build. The real revenue comes from:
> - Monthly partnership fee: N$2,499/mo (~$146/mo) — covers ongoing support
> - White-label revenue: $299–$1,499/mo per additional client
> - Tier 2/3 upsells: If Dzombo wants more GPU power, dedicated models, etc.
> - Portfolio value: First African deployment = case study + referral pipeline

---

<a name="appendices"></a>
## 14. APPENDICES

### Appendix A: Key Contacts

| Name | Role | Organization | Phone | Email |
|------|------|-------------|-------|-------|
| Japsie | Owner | Dzombo Hunting Safaris | +264 81 146 4959 | japsie@dzombo.com |
| Robbie Sanchez | Owner | Robbies Robotics Inc. | [TBD] | [TBD] |
| Deploy Team Member 2 | Engineer | Robbies Robotics Inc. | [TBD] | [TBD] |
| ACT Logistics | Customs Broker | ACT Logistics Windhoek | [TBD] | info@airfreight.com.na |

### Appendix B: Server Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DZOMBO AI INFRASTRUCTURE                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              GPU SERVER (4U Rackmount)               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │ RTX 5090 │ │ RTX 5090 │ │ RTX 5090 │ │RTX 5090│ │    │
│  │  │  32GB    │ │  32GB    │ │  32GB    │ │ 32GB   │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  │  Threadripper PRO 7965WX │ 256GB DDR5 │ 2TB NVMe  │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  Ubuntu 24.04 │ Docker │ Ollama │ Open WebUI       │    │
│  │  n8n │ ChromaDB │ Nginx │ Prometheus │ Grafana     │    │
│  └─────────────────────────┬───────────────────────────┘    │
│                            │ LAN (1GbE/10GbE)               │
│  ┌─────────────────────────┼───────────────────────────┐    │
│  │         NETWORK SWITCH  │                           │    │
│  └──────┬──────────────────┼────────────────┬──────────┘    │
│         │                  │                │               │
│  ┌──────┴──────┐   ┌──────┴──────┐  ┌──────┴──────┐       │
│  │  Mac Studio │   │   Router/   │  │  Staff PCs  │       │
│  │  (Backup)   │   │   Firewall  │  │  (25 users) │       │
│  │  M3 Ultra   │   │      │      │  │             │       │
│  │  128GB      │   │  ┌───┴───┐  │  └─────────────┘       │
│  └─────────────┘   │  │ ISP   │  │                         │
│                     │  │ Fiber │  │                         │
│         ┌───────────┘  └───┬───┘  └───────────────┐        │
│         │                  │                      │        │
│  ┌──────┴──────┐   ┌──────┴──────┐        ┌──────┴──────┐ │
│  │    UPS      │   │  Internet   │        │  WireGuard  │ │
│  │  1500VA     │   │  (Fiber)    │        │  VPN Tunnel │ │
│  └─────────────┘   └─────────────┘        │  to Robbies │ │
│                                           │  Robotics   │ │
│                                           └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Appendix C: Docker Services Stack

```yaml
# docker-compose.yml (simplified)
services:
  ollama:
    image: ollama/ollama:latest
    runtime: nvidia
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
              count: all
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - webui_data:/app/backend/data
    ports:
      - "3000:8080"

  n8n:
    image: n8nio/n8n:latest
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"

  chromadb:
    image: chromadb/chroma:latest
    volumes:
      - chroma_data:/chroma/chroma
    ports:
      - "8000:8000"

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"

  nginx:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    ports:
      - "80:80"
      - "443:443"
```

### Appendix D: Windhoek Time Zone & Work Schedule

- **Namibia Time Zone:** Central Africa Time (CAT) = UTC+2
- **Eastern Time:** UTC-4 (EDT) / UTC-5 (EST)
- **Time Difference:** 6 hours (CAT is 6 hours ahead of EDT)
- **Overlap window:** 8:00 AM – 12:00 PM EDT = 2:00 PM – 6:00 PM CAT
- **Best call times:** 9:00–11:00 AM EDT = 3:00–5:00 PM CAT

### Appendix E: Emergency Procedures (Server Room Poster)

```
╔══════════════════════════════════════════╗
║     🚨 EMERGENCY PROCEDURES 🚨          ║
║                                          ║
║  POWER OUTAGE:                           ║
║  1. UPS provides ~15 min battery         ║
║  2. Server will auto-shutdown gracefully ║
║  3. When power returns, wait 2 min       ║
║  4. Press server power button             ║
║  5. Wait 5 min for all services to start ║
║                                          ║
║  SERVER NOT RESPONDING:                  ║
║  1. Check power lights (should be green) ║
║  2. Try accessing Open WebUI in browser  ║
║  3. If no response, power cycle server   ║
║  4. Wait 5 min after restart              ║
║  5. If still down, contact Robbies:      ║
║     📱 WhatsApp: [Rob's number]          ║
║     📧 support@robbiesrobotics.com       ║
║                                          ║
║  DO NOT: Unplug cables, open server,     ║
║  or attempt hardware repairs              ║
╚══════════════════════════════════════════╝
```

---

## DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | Robbie Sanchez | _______________ | _______ |
| Client | Japsie (Dzombo Hunting Safaris) | _______________ | _______ |

---

*This document is confidential and intended for Robbies Robotics Inc. and Dzombo Hunting Safaris internal use only.*

**Prepared by:** Robbies Robotics Inc.  
**Version:** 1.0  
**Date:** March 30, 2026
