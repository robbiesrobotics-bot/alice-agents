# A.L.I.C.E. Model Reference Guide — Alpha Node (AGX Orin 64GB)
*Research by Rowan | Compiled March 2026*

---

## 🗺️ Quick Routing Table

| Model | Size | Type | Best For | Primary A.L.I.C.E. Users |
|---|---|---|---|---|
| **qwen3-coder-next** | 79.7B Q4 MoE | Code + Reasoning | Complex multi-file code, agentic coding | Dylan, Felix |
| **deepseek-r1:14b** | 14.8B Q4 | Reasoning | Math, logic chains, structured analysis | Uma, Selena |
| **llama3.3:70b** | 70.6B Q4 | General | Broad instruction following, synthesis | A.L.I.C.E., Daphne |
| **nemotron-3-nano:30b** | 31.6B Q4 | Instruction/RLHF | Synthetic data gen, reward modeling, judge | Dylan (eval) |
| **nemotron-cascade-2** | 31.6B Q4 | Hybrid/Speed | High-throughput pipelines, fast classification | Owen |
| **glm-4.7-flash** | 29.9B Q8 | Fast General | Low-latency Q&A, tool calls, routing | A.L.I.C.E. (quick tasks) |
| **qwen3.5:35b** | 36B Q4 | General + Code | Multilingual, solid coding, tool use | Dylan, Daphne |
| **olmo-3.1:32b** | 32.2B Q4 | Open Research | Auditable pipelines, academic/research tasks | Uma (auditability) |
| **lfm2:24b** | 23.8B Q4 | Liquid/SSM | Long context, streaming, efficient inference | Owen |
| **rnj-1:8b** | 8.3B Q4 | Compact | Fast triage, classification, lightweight routing | A.L.I.C.E. (router) |
| **deepseek-v3.2:cloud** | 671B fp8 | Flagship General | Hardest tasks, frontier reasoning (escalation) | A.L.I.C.E., Dylan |
| **glm-5:cloud** | — | Flagship ZhipuAI | Complex CN-EN tasks, vision | Morgan |
| **minimax-m2.7:cloud** | — | Long Context | Very long doc analysis, batch summarization | Uma, Daphne |
| **nomic-embed-text-v2-moe** | 475M | Embeddings | RAG, semantic search, vector clustering | Uma |
| **glm-ocr** | 1.1B | OCR/Vision | Document digitization, image text extraction | Owen, Daphne |

---

## 📦 Local Models (On Alpha — AGX Orin 64GB)

---

### 1. `qwen3-coder-next` — 79.7B Q4 MoE
**Vendor:** Alibaba / Qwen Team | **Architecture:** Mixture-of-Experts

**Best At:**
- Long-horizon agentic coding with tool calls and multi-file reasoning
- Repository-level code understanding and generation
- Strong on Python, TypeScript, Rust, Go; solid on shell/SQL
- MoE activates ~20–25B params per token — efficient for its class

**Weaknesses:**
- MoE routing inconsistency on highly specialized domains
- Q4 precision loss on numerical edge cases
- Slower than dense 35B at low batch sizes due to routing overhead

**Benchmarks:**
- HumanEval: ~92%+
- SWE-bench Verified: ~40%+ range
- Strong MBPP and LiveCodeBench

**A.L.I.C.E. Routing:** Dylan (primary coder), Felix (implementation), Quinn (code review tasks)

---

### 2. `deepseek-r1:14b` — 14.8B Q4
**Vendor:** DeepSeek | **Architecture:** Dense + RL-trained chain-of-thought

**Best At:**
- Mathematical reasoning and multi-step problem solving
- Logical deduction, proof-like reasoning chains
- Distilled from 671B R1 — punches well above its weight on reasoning

**Weaknesses:**
- Verbose CoT traces — wasteful for simple tasks
- Weak on pure knowledge retrieval
- Not optimized for speed-critical coding tasks

**Benchmarks:**
- MATH: ~75–80%
- GSM8K: ~90%+
- AIME 2024: competitive with much larger dense models

**A.L.I.C.E. Routing:** Uma (research analysis), Selena (threat modeling), hard debugging passes

---

### 3. `llama3.3:70b` — 70.6B Q4
**Vendor:** Meta | **Architecture:** Dense transformer, instruction-tuned

**Best At:**
- Broad instruction following across all task types
- Long-form synthesis, summarization, document drafting
- Matches Llama 3.1 405B on many benchmarks at 70B size

**Weaknesses:**
- Outperformed by Qwen3-Coder-Next on coding
- Reasoning depth below dedicated reasoning models
- No native vision

**Benchmarks:**
- MMLU: ~86%
- HumanEval: ~80%
- MT-Bench: ~9.1

**A.L.I.C.E. Routing:** A.L.I.C.E. orchestration fallback, Daphne (docs), Morgan (copy/synthesis)

---

### 4. `nemotron-3-nano:30b` — 31.6B Q4
**Vendor:** NVIDIA | **Architecture:** Dense, RLHF/DPO-optimized

**Best At:**
- Synthetic data generation
- Reward modeling and preference annotation
- Acting as a judge model for evaluating other model outputs
- Fine-tuning data curation pipelines

**Weaknesses:**
- Not a frontier general model
- "Nano" branding misleading — it's mid-size
- Limited community adoption outside NVIDIA ecosystem

**A.L.I.C.E. Routing:** Dylan (code quality judge), fine-tuning pipeline workflows

---

### 5. `nemotron-cascade-2` — 31.6B Q4
**Vendor:** NVIDIA | **Architecture:** Cascade/speculative decoding hybrid

**Best At:**
- Speed-quality tradeoff for interactive tasks
- High-throughput batch inference pipelines
- Speculative decoding can yield 2–3x throughput when configured

**Weaknesses:**
- Cascade benefits are infrastructure-dependent
- Awkward size class — not fastest, not most capable
- Requires specific serving config to unlock cascade behavior

**A.L.I.C.E. Routing:** Owen (ops pipelines), high-volume classification tasks

---

### 6. `glm-4.7-flash` — 29.9B Q8
**Vendor:** Zhipu AI | **Architecture:** GLM-style bidirectional + causal hybrid

**Best At:**
- Fast, high-quality general inference (Q8 = better quality than Q4)
- Tool/function calling with low latency
- Chinese-English bilingual tasks

**Weaknesses:**
- Less strong on pure code vs. Qwen3-Coder-Next
- Community tooling less mature than Llama ecosystem
- GLM architecture diverges from standard transformer

**Benchmarks:**
- MMLU: ~80%
- Function calling: competitive with GPT-4o-mini class
- Strong on C-Eval, CMMLU

**A.L.I.C.E. Routing:** Quick orchestration queries, A.L.I.C.E. fast-path routing decisions

---

### 7. `qwen3.5:35b` — 36B Q4
**Vendor:** Alibaba / Qwen Team | **Architecture:** Dense transformer

**Best At:**
- Strong general capability at practical size
- Solid code generation (second to Qwen3-Coder-Next)
- Multilingual across 100+ languages
- Tool use and structured output

**Weaknesses:**
- Sits between size classes — not the fastest or most capable
- Less specialized than the coder variant for pure coding

**A.L.I.C.E. Routing:** Dylan (multilingual code), Daphne (multilingual docs), general fallback

---

### 8. `olmo-3.1:32b` — 32.2B Q4
**Vendor:** Allen Institute for AI (AI2) | **Architecture:** Fully open, auditable

**Best At:**
- Fully auditable pipelines (training data fully documented)
- Academic and research tasks where provenance matters
- Reproducible research workflows
- Strong reasoning for its class

**Weaknesses:**
- Not quite frontier capability
- Less optimized for production tool-calling
- Smaller community than Meta/Alibaba models

**A.L.I.C.E. Routing:** Uma (research requiring auditability), Selena (compliance-sensitive tasks)

---

### 9. `lfm2:24b` — 23.8B Q4 (Liquid Foundation Model)
**Vendor:** Liquid AI | **Architecture:** Liquid Neural Network / SSM hybrid

**Best At:**
- Long context processing with lower memory overhead than transformers
- Streaming and continuous inference tasks
- Efficient on edge hardware (designed for it)
- Time-series and sequential data patterns

**Weaknesses:**
- Newer architecture — less battle-tested
- Ecosystem tooling still maturing
- May underperform standard transformers on discrete reasoning tasks

**A.L.I.C.E. Routing:** Owen (long-running monitoring streams), log analysis, sequential data pipelines

---

### 10. `rnj-1:8b` — 8.3B Q4
**Vendor:** Unknown / Community | **Architecture:** Gemma3-family (per metadata)

**Best At:**
- Fast lightweight inference — lowest latency on Alpha
- Classification and routing tasks
- Quick triage, tagging, label generation
- Ideal as a pre-filter before routing to heavier models

**Weaknesses:**
- Capability ceiling well below larger models
- Not suitable for complex multi-step tasks

**A.L.I.C.E. Routing:** A.L.I.C.E. fast pre-routing decisions, Owen (alert triage), lightweight classification

---

## ☁️ Cloud-Routed Models (via Ollama remote)

---

### 11. `deepseek-v3.2:cloud` — 671B fp8
**Vendor:** DeepSeek | Cloud-routed via Ollama

**Best At:**
- Frontier-tier reasoning and coding
- The hardest tasks that local models can't handle
- MoE at scale — exceptional quality/cost ratio vs. GPT-4 class
- Escalation path when Alpha's local models hit their ceiling

**A.L.I.C.E. Routing:** Escalation only — A.L.I.C.E. routes here when local models fail or confidence is low

---

### 12. `glm-5:cloud`
**Vendor:** Zhipu AI | Cloud-routed

**Best At:**
- Flagship Zhipu model; strong Chinese-English tasks
- Vision capabilities (multimodal)
- Complex document understanding

**A.L.I.C.E. Routing:** Morgan (multilingual content), vision tasks if glm-ocr is insufficient

---

### 13. `minimax-m2.7:cloud`
**Vendor:** MiniMax | Cloud-routed

**Best At:**
- Very long context windows (1M+ token claims)
- Batch document summarization
- Long-form research synthesis

**A.L.I.C.E. Routing:** Uma (massive document analysis), Daphne (large codebase documentation)

---

## 🔧 Utility Models

---

### 14. `nomic-embed-text-v2-moe` — 475M
**Vendor:** Nomic AI | **Type:** Embeddings only

**Best At:**
- High-quality text embeddings for RAG pipelines
- Semantic search and clustering
- MoE architecture for embedding = better coverage than dense embed models
- Drop-in for OpenAI `text-embedding-ada-002` class tasks

**A.L.I.C.E. Routing:** Any RAG pipeline on Alpha — Uma (research retrieval), memory systems

---

### 15. `glm-ocr` — 1.1B
**Vendor:** Zhipu AI | **Type:** OCR/Vision specialist

**Best At:**
- Document digitization from images
- Extracting structured text from scanned PDFs, photos
- Receipt/invoice parsing
- Handwriting recognition

**A.L.I.C.E. Routing:** Owen (infra doc digitization), Daphne (converting scanned docs to editable text)

---

## 📌 Decision Framework

```
Is the task coding/agentic?
  → YES → qwen3-coder-next (primary) or qwen3.5:35b (multilingual)
  
Is the task hard reasoning/math/logic?
  → YES → deepseek-r1:14b

Is the task fast/lightweight triage?
  → YES → rnj-1:8b or glm-4.7-flash

Is the task general synthesis/docs/comms?
  → YES → llama3.3:70b or qwen3.5:35b

Is the task long-context document analysis?
  → YES → minimax-m2.7:cloud or lfm2:24b (local)

Is the task embeddings/RAG?
  → YES → nomic-embed-text-v2-moe

Is the task OCR/image text?
  → YES → glm-ocr

Is it beyond all local model capabilities?
  → ESCALATE → deepseek-v3.2:cloud
```

---

---

## 🧪 Live Benchmark Results (March 22, 2026)

| Model | Task | Speed (tok/s) | Load Time | Quality | Grade |
|---|---|---|---|---|---|
| qwen3-coder-next:latest | Coding | 8.5 | ~30s | Production-grade, edge cases handled | ⭐⭐⭐⭐⭐ |
| deepseek-r1:14b | Reasoning | 13.9 | 31.8s | Clean step-by-step LaTeX math, correct answer | ⭐⭐⭐⭐⭐ |
| nemotron-3-nano:30b | General | 33.9 | 50.2s | Thorough, well-structured table output | ⭐⭐⭐⭐ |
| nemotron-cascade-2 | General | 33.8 | 50.6s | Verbose think trace + solid structured output | ⭐⭐⭐⭐ |
| glm-4.7-flash:q8_0 | General | 20.3 | 75.0s | Clean, well-organized markdown, practical | ⭐⭐⭐⭐ |
| qwen3.5:35b | Coding | 24.0 | 64.4s | Thread-safe class, full type hints, docstrings | ⭐⭐⭐⭐⭐ |
| lfm2:24b | General | **39.6** | 32.2s | Concise and accurate, fastest local model | ⭐⭐⭐⭐ |
| rnj-1:8b | Coding | 23.8 | 14.2s | Clean, functional, good for its size | ⭐⭐⭐ |
| llama3.3:70b | General | 3.4 tok/s | 221.9s ⚠️ | Good structured output, very slow cold start. Requires num_ctx=2048 (OOM otherwise) | ⭐⭐⭐ |
| olmo-3.1:32b | General | 6.6 tok/s | 39.8s | Thinking model — output goes to `thinking` field not `response`. Needs custom client handling. | ⚠️ |

> Note: llama3.3:70b and olmo-3.1:32b both require num_ctx=2048 — full context causes cudaMalloc OOM on Alpha's 64GB. olmo is a thinking/reasoning model that writes to a `thinking` JSON field rather than `response` — requires custom Ollama client integration to use properly.

---

## 🔥 Hot-Load Strategy (64GB Unified Memory)

**Memory estimates (Q4 ~= 0.5 bytes/param, Q8 ~= 1 byte/param):**

| Model | Est. VRAM |
|---|---|
| qwen3-coder-next (79.7B Q4 MoE, ~20B active) | ~12GB active / ~40GB loaded |
| deepseek-r1:14b Q4 | ~8GB |
| lfm2:24b Q4 | ~13GB |
| rnj-1:8b Q4 | ~5GB |
| glm-4.7-flash Q8 | ~30GB |
| qwen3.5:35b Q4 | ~20GB |

**Recommended hot-load combos:**

### Combo A — "Coder + Reasoner + Fast Router" (~61GB)
```
qwen3-coder-next  ~40GB  ← primary coder
deepseek-r1:14b    ~8GB  ← reasoning/debugging
rnj-1:8b           ~5GB  ← fast triage/routing
nomic-embed (free) ~1GB  ← always-on embeddings
                  ≈54GB total
```
Best for: A.L.I.C.E. coding node — covers 90% of coding + reasoning tasks with fast routing

### Combo B — "Speed + Quality" (~53GB)
```
qwen3.5:35b       ~20GB  ← balanced coder/general
lfm2:24b          ~13GB  ← fastest local, long context
deepseek-r1:14b    ~8GB  ← hard reasoning
rnj-1:8b           ~5GB  ← fast path
nomic-embed        ~1GB
                  ≈47GB total
```
Best for: Mixed agent workloads needing faster turnaround

### Combo C — "Max Quality Single Model"
```
qwen3-coder-next  ~40GB  ← solo, all coding tasks
glm-4.7-flash     ~30GB  ← EXCEEDS 64GB, cannot co-load
```
> glm-4.7-flash Q8 at ~30GB cannot co-load with qwen3-coder-next. Use one or the other.

**Recommendation: Combo A** — keeps the best coder hot, reasoning available, fast router always ready, fits within 64GB with headroom.

*Last updated: March 22, 2026*
