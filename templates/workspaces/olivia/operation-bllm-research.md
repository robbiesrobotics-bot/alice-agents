# OperationBLLM Research Notes
**Status:** Active — Initial Landscape Analysis Complete
**Last Updated:** 2026-03-25

---

## 1. DATASET LANDSCAPE

### Text Datasets (AAVE/Black English)
| Dataset | Source | Size/Format | License | Notes |
|--------|--------|-------------|---------|-------|
| AAVE_SAE_dataset | GitHub (sophiegroenwold) | Text pairs (AAVE ↔ SAE) | Not specified | Accompanying paper: "Investigating AAVE in Transformer-Based Text Generation" |
| CORAAL (Corpus of Regional African American Language) | lingtools.uoregon.edu + HuggingFace (zsayers/CORAAL) | Audio + transcripts, v2023.06 | Check per-component licensing | First corpus devoted to spoken AAL data. Sociolinguistic interviews. Main download: http://lingtools.uoregon.edu/coraal |
| Stanford PACS AAVE Corpus | Stanford PACS Center | Text, created by AAVE speakers FOR AAVE speakers | Key differentiator: consent-based | Published Aug 2023. Strong ethical framework. URL: pacscenter.stanford.edu |
| English Dialects (ylacombe) | HuggingFace | Crowdsourced UK/Ireland dialect speech | Unknown | Not AAVE-specific |
| People's Speech | MLCommons, HuggingFace | 30K+ hours English speech | CC-BY-SA, CC-BY 4.0 | Commercial-friendly license but not AAVE-specific |
| Common Corpus | PleIAs, HuggingFace | Multilingual text | CC0/Mixed | Not AAVE-specific |

### Speech Datasets (Black American Speakers)
| Dataset | Source | Size/Format | License | Notes |
|--------|--------|-------------|---------|-------|
| Howard University HCAI AAVE Audio | Howard HCAI (sites.google.com/view/hcaiathoward) | ~600 hours | HBCU-first access | Unique. Created by Howard researchers for ASR improvement |
| African American Vernacular Media Audio | GTS.ai | Media audio | Unknown | New (Feb 2025) |
| AVE-Speech | HuggingFace (MML-Group) | Mandarin Chinese | N/A | Not relevant |

### Gap: NO existing large-scale, consent-based, community-owned text corpus specifically for AAVE fine-tuning exists. The Stanford PACS corpus is closest but is relatively small and institutional.

---

## 2. EXISTING WORK & GAP ANALYSIS

### Existing AAVE/Black-Focused AI Projects
1. **AfroLlama-v1** (Jacaranda/AfroLlama_V1 on HuggingFace) — 8B model, African languages focus (not specifically AAVE)
2. **Lugha-Llama** (Princeton, April 2025) — Based on Llama-3.1-8B, African languages benchmark (IrokoBench). Authors: Happy Buzaaba et al. URL: Lugha-Llama/Lugha-Llama-8B-wura_math
3. **N-ATLAS** — Need to investigate further
4. **Howard HCAI ASR dataset** — 600hr AAVE speech corpus, improving automatic speech recognition for African American English

### The REAL Gap (Whitespace)
**No one has built:**
- A community-owned, open-weights LLM specifically centered on AAVE/Black American English
- A consent-based data collection pipeline where Black people own/contribute to training data
- A governance model that centers Black community control over the model
- An AAVE-specific instruction-tuning dataset and benchmark at scale
- A culturally-aware alignment training set for Black English

**Existing African-language models (AfroLlama, Lugha-Llama) do NOT serve Black Americans** — they focus on continental African languages (Swahili, Yoruba, etc.). This is a fundamentally different use case.

---

## 3. MODEL SELECTION ANALYSIS

### Top Candidates for Fine-Tuning Base

| Model | Params | License | Community Fine-tune Ecosystem | Hardware (QLoRA) | Best For |
|-------|--------|---------|-------------------------------|-----------------|---------|
| **DeepSeek-V3** | 236B | **MIT** ⭐ | Growing | 4x A100 (80GB) | Best license for community ownership, strong reasoning |
| **Mistral Small 3.2** | 24B | **Apache 2.0** ⭐ | Excellent (LLaMA-Factory, Unsloth) | 1x A100 (80GB) or 2x RTX 3090 | Most accessible for community, efficient |
| **Qwen3** | 235B / 32B | Permissive | Strong | Multiple A100s | Multilingual capability |
| **Llama 4 Scout** | 17B active / 109B MoE | Llama 4 license (restrictions) | Massive | 1-2 A100s | 10M context window |
| **Mistral Small 3.1** | 22B | Apache 2.0 | Excellent | 1x A100 | Budget option |

**Recommendation for Rob:** Start with **Mistral Small 3.2 (24B)** for Phase 1 — Apache 2.0 license (no restrictions, community-owned), accessible compute, best fine-tuning ecosystem. Graduate to DeepSeek-V3 or Qwen3 32B for Phase 2 if more compute is available.

**Licensing Reality:**
- DeepSeek-V3 (MIT) = truly community-owned friendly
- Mistral Apache 2.0 = same — no "built with Mistral" branding required
- Llama 4 = has usage restrictions that complicate full community ownership
- Qwen3 = permissive but check Alibaba's terms

---

## 4. GOVERNANCE MODELS

### Reference Models
1. **EleutherAI** — Started as Discord community → 2023 formally incorporated as nonprofit research institute. Funded by CoreWeave, HuggingFace, Stability AI, Mozilla Foundation, Google. Model: nonprofit with open membership.
2. **LAION** — Nonprofit, international, made large-scale datasets (LAION-5B). Had CSAM scandal with LAION-5B — lesson: data governance and safety pipelines are essential.
3. **Cooperative AI Foundation** — $15M from Macroscopic Ventures. Charity in UK. Focuses on "cooperative intelligence" research. Active grants program.
4. **HBR: "5 Ways Cooperatives Can Shape AI"** — Key interventions: (1) Democratizing data governance, (2) Bridging research + civil society, (3) Education, (4) Alternative ownership, (5) Cooperative-specific AI applications.

### Stability AI Lessons
- Reliance on VC funding creates misaligned incentives
- No clear community governance = no accountability to the community
- Model access restricted despite "open" branding
- Key lesson: structural independence from VC is essential for community trust

### Recommended Legal Structure for Rob
**Option A: 501(c)(3) Nonprofit** — Easiest to get grants (NSF, Cooperative AI Foundation), tax-deductible donations, established credibility. ElectherAI path.
**Option B: Cooperative (member-owned)** — Most aligned with community ownership values. Harder to get initial grants. Platform cooperativism model.
**Option C: Hybrid** — Nonprofit parent with community advisory board + cooperative data trust underneath. Most defensible long-term.

---

## 5. TECHNICAL IMPLEMENTATION

### Fine-Tuning Pipeline
```
Data Prep → Tokenization → QLoRA/DoRA Fine-tune → Alignment (SimPO/GRPO) → Evaluation
```

### Toolchain
- **LLaMA-Factory** (hiyouga/LlamaFactory, ACL 2024) — Unified interface for 100+ LLMs. Supports LoRA, QLoRA, DoRA, full fine-tuning. Integrated with Axolotl/TRL alternatives. ⭐ Best for this project.
- **Unsloth** — Faster training, less VRAM. Good for initial experiments.
- **TRL** (HuggingFace) — For alignment (DPO, PPO)
- **Axolotl** — Established fine-tuning framework
- **SimPO/GRPO** — Newer alignment methods (from DeepSeek-R1, NCSI papers)

### AAVE Evaluation Benchmarks
- **AAVENUE** (arXiv:2408.14845, Aug 2024) — Novel benchmark for detecting LLM biases on NLU tasks in AAVE. ⭐ Most relevant.
- **CORAAL-QA** — Question answering on CORAAL corpus
- **EnDive** — Emotion analysis in AAVE
- **ReDial** — Dialogue evaluation
- **AAVE-SAE dataset** —检测 AAVE-to-SAE translation quality

---

## 6. FUNDING LANDSCAPE

| Source | Amount | Notes |
|--------|--------|-------|
| Cooperative AI Foundation | Varies (~$15M total commitment) | Grants for cooperative/coordinate AI research. Active. cooperativeai.com |
| NSF AI Research Institutes | Up to $10M per award | Theme: AI + Society. Requires institutional partnership. |
| NSF Planning Grants (AI test beds) | Up to unspecified | More accessible for pilot phase |
| AIGrant.org | Need to investigate | Potentially relevant |
| Mozilla Foundation | AI-focused grants | EleutherAI received funding |
| HuggingFace | Compute credits | Community program |
| CoreWeave | GPU credits | In-kind for EleutherAI |

**Immediate Action:** Apply to Cooperative AI Foundation grants (deadline-aware). Pair with NSF planning grant for legitimacy.

---

## 7. STAKEHOLDER MAP

### Key Organizations
- **Howard University** — HCAI lab, 600hr AAVE dataset, AfroTech connections
- **Stanford PACS Lab** — AAVE corpus, consent-based data collection framework
- **Black in AI** (blackinai.org) — 500+ member collective, conferences, mentorship. PRIMARY PARTNER.
- **HBCU AI Network** (charlescearl.github.io/ai-hbcu) — Documents HBCU AI efforts
- **EleutherAI** — Potential technical mentor/partner
- **African American Linguistics (AAL) research community** — Academic linguists (Kendall, Farrington, Wolfram, Labov)

### Key Researchers
- Tyler Kendall — CORAAL lead (University of Oregon)
- Sophie Groenwold — AAVE text generation paper
- Happy Buzaaba — Lugha-Llama (Princeton)
- Stanford PACS Lab researchers
- Howard HCAI team

---

## 8. TOP 5 IMMEDIATE DECISIONS (see full report below)

1. **Legal Structure** — nonprofit vs. cooperative vs. hybrid
2. **Base Model Selection** — Mistral Small 3.2 vs. DeepSeek-V3 vs. Qwen3
3. **Dataset Strategy** — What to license, what to collect, consent framework
4. **Governance Design** — Community representation, board structure
5. **Funding Path** — First grant application, compute strategy
