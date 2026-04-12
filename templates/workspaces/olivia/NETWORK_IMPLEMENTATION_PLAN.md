# A.L.I.C.E. 5-Node Compute Network — Implementation Plan

**Author:** Devon (DevOps & Infrastructure)  
**Date:** 2026-03-23  
**Target:** Rob / A.L.I.C.E. Orchestrator  
**Status:** Draft → Ready for Review

---

## A. Executive Summary

This plan executes a five-phase rollout across Rob's 5-node A.L.I.C.E. compute network to:
1. **Harden safety** by deploying `llama-guard3:8b` on all inference nodes
2. **Unlock voice** by building a full STT→LLM→TTS pipeline on the Orin edge node
3. **Stand up infrastructure** by deploying Qdrant, Redis, Prometheus, and Grafana on the Ubuntu Desktop GPU node
4. **Expand GPU model catalog** on Ubuntu Desktop with small efficient models
5. **Register everything** in OpenClaw's model and voice endpoint configuration

**Nodes involved:**
| Hostname | Tailscale IP | Role |
|---|---|---|
| MacBook Air | 100.101.241.124 | OpenClaw orchestration (no compute changes) |
| Mac Studio | 100.115.74.106 | Always-on inference + safety |
| Mac Mini | 100.107.132.71 | Inference + safety relay |
| Alpha/AGX Orin | 100.106.110.119 | Voice pipeline (STT + TTS) |
| Ubuntu Desktop | 100.76.82.8 | Infra services + GPU models |

**Total estimated time:** ~3–5 hours if run sequentially; ~1–2 hours if phases 1 and 2 run in parallel.

---

## B. Phase-by-Phase Breakdown

---

### Phase 1 — Safety Layer: `llama-guard3:8b` on Mac Studio + Mac Mini

**Node(s):** Mac Studio (100.115.74.106), Mac Mini (100.107.132.71)  
**SSH user:** rob  
**Risk:** Low — read-only model pull, no config changes  
**Rollback:** `ollama delete llama-guard3:8b`

#### Mac Studio

```bash
# SSH to Mac Studio
ssh rob@100.115.74.106

# Pull llama-guard3:8b (model is ~5GB, ~2-5 min on gigabit)
ollama pull llama-guard3:8b

# Verify it's registered
ollama list | grep llama-guard3

# Optional: quick smoke test
timeout 30 ollama run llama-guard3:8b "Hello world" --verbose
```

#### Mac Mini

```bash
# SSH to Mac Mini
ssh rob@100.107.132.71

# Pull llama-guard3:8b
ollama pull llama-guard3:8b

# Verify
ollama list | grep llama-guard3

# Quick smoke test
timeout 30 ollama run llama-guard3:8b "Hello world" --verbose
```

**Rollback (either node):**
```bash
ollama delete llama-guard3:8b
```

**Capabilities unlocked:** Content safety scoring on all inference requests handled by Mac Studio and Mac Mini. Model outputs can be passed through `llama-guard3:8b` before returning to clients.

---

### Phase 2 — Voice Pipeline on Orin (JetPack 6.2)

**Node:** Alpha/AGX Orin (100.106.110.119)  
**SSH:** `ssh rob@100.106.110.119`  
**OS:** Ubuntu ARM (JetPack 6.2 — CUDA 12.6, cuDNN 9.3, TensorRT 10.3)  
**Risk:** Medium — installs packages, creates systemd services, opens ports  
**Rollback:** `systemctl disable --now alice-stt alice-tts; rm -rf /opt/voice-pipeline`

This is the most complex phase. We install:
- **faster-whisper** with TensorRT backend → STT service on port 8765
- **Kokoro TTS** (CUDA-accelerated) → TTS primary on port 8766
- **Piper TTS** (fallback) → TTS fallback on port 8767
- **silero-vad** → VAD preprocessing

Services are exposed as HTTP APIs via systemd units.

#### Step 2.1 — Environment Prep

```bash
ssh rob@100.106.110.119

# Check JetPack / CUDA version
nvcc --version        # Should report CUDA 12.6
python3 -c "import tensorrt; print(tensorrt.__version__)"  # Should be 10.3.x
nvidia-smi            # Confirm GPU visible

# Create dedicated user for voice services (runs as isolated systemd services)
sudo useradd -r -M -s /usr/sbin/nologin voice 2>/dev/null || true
sudo mkdir -p /opt/voice-pipeline
sudo chown voice:voice /opt/voice-pipeline
```

#### Step 2.2 — Python + pip + venv

```bash
ssh rob@100.106.110.119

# JetPack ships Python 3.10+. Verify and set up venv
python3 --version
python3 -m pip --version || sudo apt-get install -y python3-pip

# Create venv
python3 -m venv /opt/voice-pipeline/venv
source /opt/voice-pipeline/venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

#### Step 2.3 — Install faster-whisper (TensorRT backend)

```bash
ssh rob@100.106.110.119
source /opt/voice-pipeline/venv/bin/activate

# faster-whisper + TensorRT plugin
pip install faster-whisper
pip install tensorrt-cu12  # matches CUDA 12.6

# Verify TensorRT plugin loads
python3 -c "
from faster_whisper import WhisperModel
model = WhisperModel('Systran/faster-whisper-tiny', device='cuda', compute_type='tensorrt')
print('TensorRT Whisper OK')
del model
"

# Download a base model for the service
# Using 'base' for balance of speed/accuracy (or 'small' for higher accuracy)
# Note: the service will cache this under ~/.cache/huggingface/
# For JetPack, prefer ONNX/TensorRT optimized variants when available
pip install huggingface_hub
python3 -c "
from huggingface_hub import snapshot_download
snapshot_download(repo_id='Systran/faster-whisper-tiny', local_dir='/opt/voice-pipeline/models/whisper-tiny')
print('Whisper model downloaded')
"
```

**Alternative model download (if Systran repo unavailable):**
```bash
# Use OpenAI's whisper model via faster-whisper auto-download
python3 -c "
from faster_whisper import WhisperModel
model = WhisperModel('tiny', device='cuda', compute_type='tensorrt')
print('Whisper tiny model ready')
"  # Downloads automatically on first run
```

#### Step 2.4 — Install Kokoro TTS (CUDA)

```bash
ssh rob@100.106.110.119
source /opt/voice-pipeline/venv/bin/activate

# Kokoro requires ONNX + onnxruntime-gpu
pip install kokoro-onnx onnxruntime-gpu

# Clone Kokoro weights (requires git lfs)
sudo apt-get install -y git-lfs
cd /opt/voice-pipeline
git lfs install
git clone https://huggingface.co/hexgrad/kokoro-v1.0 kokoro-v1.0

# Check available voices
ls kokoro-v1.0/voices/
# Expected: af_bella, af_nicole, af_sarah, am_adam, am_michael, etc.

# Quick test — generate a short audio clip
python3 -c "
from kokoro_onnx import Kokoro
k = Kokoro('/opt/voice-pipeline/kokoro-v1.0/kokoro-v1.0.onnx',
           '/opt/voice-pipeline/kokoro-v1.0/voices/af_bella.onnx')
audio, = k.create('Hello, this is a voice pipeline test.', speed=1.0)
with open('/tmp/test_kokoro.wav', 'wb') as f:
    f.write(audio)
print('Kokoro TTS OK — /tmp/test_kokoro.wav')
"
```

#### Step 2.5 — Install Piper TTS (fallback)

```bash
ssh rob@100.106.110.119
source /opt/voice-pipeline/venv/bin/activate

# Piper is a fast, local TTS engine
pip install piper-tts

# Download an English voice model (DJDK/medium quality, ~50MB)
mkdir -p /opt/voice-pipeline/piper-models
cd /opt/voice-pipeline/piper-models

# Download a voice + config
# Using en_US/lessac medium — good quality / speed balance
curl -L "https://github.com/rhasspy/piper/raw/master/src/python/examples/en_US-lessac-medium.onnx" \
  -o en_US-lessac-medium.onnx
curl -L "https://github.com/rhasspy/piper/raw/master/src/python/examples/en_US-lessac-medium.onnx.json" \
  -o en_US-lessac-medium.onnx.json

# Quick test
python3 -c "
import subprocess
result = subprocess.run([
    'piper', '--model', '/opt/voice-pipeline/piper-models/en_US-lessac-medium.onnx',
    '--output-raw'
], input=b'Hello from Piper TTS.', capture_output=True)
print(f'Piper output bytes: {len(result.stdout)}')
print('Piper OK')
"
```

#### Step 2.6 — Install silero-vad

```bash
ssh rob@100.106.110.119
source /opt/voice-pipeline/venv/bin/activate

pip install silero-vad

# Verify VAD works
python3 -c "
import torch
from silero_vad import load_silero_vad, get_speech_timestamps
vad_model = load_silero_vad()
print('Silero VAD loaded OK')
"
```

#### Step 2.7 — Write STT HTTP Service (port 8765)

```bash
ssh rob@100.106.110.119

cat > /opt/voice-pipeline/stt_service.py << 'PYEOF'
#!/opt/voice-pipeline/venv/bin/python3
"""
A.L.I.C.E. STT Service — faster-whisper + silero-vad on Orin (JetPack 6.2)
Listens on port 8765. Accepts POST with audio file (wav/flac/raw PCM).
Returns JSON: { "text": "...", "language": "en", "duration": 1.23 }
"""

import sys
import io
import wave
import struct
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from faster_whisper import WhisperModel
from silero_vad import load_silero_vad, get_speech_timestamps
import torch

app = FastAPI(title="A.L.I.C.E. STT Service")

# Load models at startup
MODEL_SIZE = "base"  # Options: tiny, base, small, medium, large-v3
VAD_MODEL = None
WHISPER_MODEL = None

@app.on_event("startup")
def load_models():
    global VAD_MODEL, WHISPER_MODEL
    print("[STT] Loading Silero VAD...", file=sys.stderr)
    VAD_MODEL = load_silero_vad()
    print("[STT] Loading faster-whisper (TensorRT, CUDA)...", file=sys.stderr)
    WHISPER_MODEL = WhisperModel(
        MODEL_SIZE, device="cuda", compute_type="float16"
    )
    print("[STT] Both models ready.", file=sys.stderr)

def pcm_to_wav(pcm_bytes: bytes, sample_rate: int = 16000, channels: int = 1) -> bytes:
    """Wrap raw PCM in a WAV header."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(2)  # 16-bit
        wf.framerate = sample_rate
        wf.writeframes(pcm_bytes)
    return buf.getvalue()

@app.post("/transcribe")
async def transcribe(file: bytes = None, language: str = "en", sample_rate: int = 16000):
    if not file:
        raise HTTPException(400, "No audio file provided")

    try:
        # If raw PCM, wrap in WAV header
        audio_bytes = pcm_to_wav(file, sample_rate=sample_rate)
    except Exception:
        raise HTTPException(400, "Could not parse audio data")

    # Run VAD to find speech segments
    audio_np = torch.frombuffer(file, dtype=torch.int16).float() / 32768.0
    torch.set_float32_matmul_precision('high')
    speech_ts = get_speech_timestamps(audio_np, VAD_MODEL, sampling_rate=sample_rate)

    if not speech_ts:
        return JSONResponse({"text": "", "language": language, "duration": 0.0, "segments": []})

    # Run Whisper on full audio (TensorRT-optimized)
    segments, info = WHISPER_MODEL.transcribe(
        audio_bytes,
        language=language,
        vad_filter=False,  # We handle VAD ourselves
        beam_size=5,
        word_timestamps=True,
    )

    segment_list = []
    full_text = []
    for seg in segments:
        segment_list.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip(),
        })
        full_text.append(seg.text.strip())

    return JSONResponse({
        "text": " ".join(full_text),
        "language": info.language,
        "duration": info.duration,
        "segments": segment_list,
    })

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_SIZE, "device": "cuda"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
PYEOF

chmod +x /opt/voice-pipeline/stt_service.py
chown voice:voice /opt/voice-pipeline/stt_service.py
```

#### Step 2.8 — Write TTS HTTP Service (port 8766 primary, 8767 fallback)

```bash
ssh rob@100.106.110.119

cat > /opt/voice-pipeline/tts_service.py << 'PYEOF'
#!/opt/voice-pipeline/venv/bin/python3
"""
A.L.I.C.E. TTS Service — Kokoro (primary, CUDA) + Piper (fallback)
Primary: port 8766, Fallback: port 8767
POST /synthesize with { "text": "...", "voice": "af_bella", "format": "wav" }
Returns raw audio bytes or JSON { "audio_base64": "..." }
"""

import sys
import io
import base64
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, JSONResponse
import uvicorn
import soundfile as sf

# Kokoro
try:
    from kokoro_onnx import Kokoro
    KOKORO_AVAILABLE = True
except ImportError:
    KOKORO_AVAILABLE = False
    print("[TTS] Kokoro not available", file=sys.stderr)

# Piper
try:
    import piper
    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False
    print("[TTS] Piper not available", file=sys.stderr)

app_primary = FastAPI(title="A.L.I.C.E. TTS (Kokoro/CUDA)")
app_fallback = FastAPI(title="A.L.I.C.E. TTS (Piper/Fallback)")

KOKORO_MODEL = None
PIPER_VOICE = None
PIPER_MODEL_PATH = "/opt/voice-pipeline/piper-models/en_US-lessac-medium.onnx"

@app_primary.on_event("startup")
def load_kokoro():
    global KOKORO_MODEL
    if not KOKORO_AVAILABLE:
        print("[TTS/Kokoro] Not available, exiting startup", file=sys.stderr)
        return
    print("[TTS] Loading Kokoro TTS (CUDA)...", file=sys.stderr)
    KOKORO_MODEL = Kokoro(
        "/opt/voice-pipeline/kokoro-v1.0/kokoro-v1.0.onnx",
        "/opt/voice-pipeline/kokoro-v1.0/voices/af_bella.onnx",
    )
    print("[TTS] Kokoro ready", file=sys.stderr)

@app_fallback.on_event("startup")
def load_piper():
    global PIPER_VOICE
    if not PIPER_AVAILABLE:
        print("[TTS/Piper] Not available", file=sys.stderr)
        return
    print("[TTS] Loading Piper TTS fallback...", file=sys.stderr)
    # Piper is loaded per-request via subprocess; just verify the file exists
    if Path(PIPER_MODEL_PATH).exists():
        print("[TTS] Piper model found", file=sys.stderr)
    else:
        print(f"[TTS] Piper model MISSING at {PIPER_MODEL_PATH}", file=sys.stderr)

def synthesize_kokoro(text: str, voice: str = "af_bella", speed: float = 1.0) -> bytes:
    voice_map = {
        "af_bella": "/opt/voice-pipeline/kokoro-v1.0/voices/af_bella.onnx",
        "af_nicole": "/opt/voice-pipeline/kokoro-v1.0/voices/af_nicole.onnx",
        "af_sarah": "/opt/voice-pipeline/kokoro-v1.0/voices/af_sarah.onnx",
        "am_adam": "/opt/voice-pipeline/kokoro-v1.0/voices/am_adam.onnx",
        "am_michael": "/opt/voice-pipeline/kokoro-v1.0/voices/am_michael.onnx",
    }
    voice_file = voice_map.get(voice, voice_map["af_bella"])
    k = Kokoro(
        "/opt/voice-pipeline/kokoro-v1.0/kokoro-v1.0.onnx",
        voice_file,
    )
    audio, = k.create(text, speed=speed)
    return audio

# ---- Primary (Kokoro) endpoints ----

@app_primary.post("/synthesize")
async def synthesize_primary(data: dict = None):
    if data is None:
        raise HTTPException(400, "JSON body required: {text, voice?, speed?}")
    text = data.get("text")
    if not text:
        raise HTTPException(400, "text field required")
    voice = data.get("voice", "af_bella")
    speed = float(data.get("speed", 1.0))

    try:
        audio = synthesize_kokoro(text, voice, speed)
        return Response(content=audio, media_type="audio/wav",
                        headers={"X-TTS-Engine": "kokoro-cuda"})
    except Exception as e:
        raise HTTPException(500, f"Kokoro synthesis failed: {e}")

@app_primary.get("/health")
def health_primary():
    return {"status": "ok", "engine": "kokoro", "device": "cuda",
            "available_voices": ["af_bella", "af_nicole", "af_sarah", "am_adam", "am_michael"]}

# ---- Fallback (Piper) endpoints ----

@app_fallback.post("/synthesize")
async def synthesize_fallback(data: dict = None):
    if data is None:
        raise HTTPException(400, "JSON body required: {text}")
    text = data.get("text")
    if not text:
        raise HTTPException(400, "text field required")

    try:
        import subprocess
        proc = subprocess.run(
            ["piper", "--model", PIPER_MODEL_PATH, "--output-raw"],
            input=text.encode("utf-8"),
            capture_output=True,
            timeout=30,
        )
        if proc.returncode != 0:
            raise HTTPException(500, f"Piper failed: {proc.stderr.decode()}")
        # Wrap raw PCM in WAV
        buf = io.BytesIO(proc.stdout)
        audio_bytes = buf.read()
        return Response(content=audio_bytes, media_type="audio/raw",
                        headers={"X-TTS-Engine": "piper", "X-Sample-Rate": "22050"})
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Piper synthesis timed out")
    except Exception as e:
        raise HTTPException(500, f"Piper synthesis failed: {e}")

@app_fallback.get("/health")
def health_fallback():
    return {"status": "ok", "engine": "piper", "device": "cpu"}

# ---- Run two servers: primary on 8766, fallback on 8767 ----
# We'll run these behind a single systemd service that spawns both via a wrapper script.

if __name__ == "__main__":
    import multiprocessing

    def run_primary():
        uvicorn.run(app_primary, host="0.0.0.0", port=8766, log_level="info")

    def run_fallback():
        uvicorn.run(app_fallback, host="0.0.0.0", port=8767, log_level="info")

    p_primary = multiprocessing.Process(target=run_primary)
    p_fallback = multiprocessing.Process(target=run_fallback)

    p_primary.start()
    p_fallback.start()

    p_primary.join()
    p_fallback.join()
PYEOF

chmod +x /opt/voice-pipeline/tts_service.py
chown voice:voice /opt/voice-pipeline/tts_service.py
```

#### Step 2.9 — Systemd Service Units

```bash
ssh rob@100.106.110.119

# STT systemd service
cat > /tmp/alice-stt.service << 'EOF'
[Unit]
Description=A.L.I.C.E. STT Service (faster-whisper + silero-vad)
After=network.target

[Service]
Type=simple
User=voice
Group=voice
WorkingDirectory=/opt/voice-pipeline
Environment="PATH=/opt/voice-pipeline/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
Environment="CUDA_VISIBLE_DEVICES=0"
ExecStart=/opt/voice-pipeline/venv/bin/python3 /opt/voice-pipeline/stt_service.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# TTS systemd service
cat > /tmp/alice-tts.service << 'EOF'
[Unit]
Description=A.L.I.C.E. TTS Service (Kokoro + Piper)
After=network.target

[Service]
Type=simple
User=voice
Group=voice
WorkingDirectory=/opt/voice-pipeline
Environment="PATH=/opt/voice-pipeline/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
Environment="CUDA_VISIBLE_DEVICES=0"
ExecStart=/opt/voice-pipeline/venv/bin/python3 /opt/voice-pipeline/tts_service.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Copy to systemd, reload, enable, start
sudo cp /tmp/alice-stt.service /etc/systemd/system/
sudo cp /tmp/alice-tts.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable alice-stt
sudo systemctl enable alice-tts
sudo systemctl start alice-stt
sudo systemctl start alice-tts

# Verify
sudo systemctl status alice-stt --no-pager
sudo systemctl status alice-tts --no-pager
```

#### Step 2.10 — Firewall / Port Verification

```bash
ssh rob@100.106.110.119

# Confirm ports are listening
ss -tlnp | grep -E '876[567]'

# If ufw is active, allow the ports
sudo ufw status
sudo ufw allow 8765/tcp comment 'A.L.I.C.E. STT'
sudo ufw allow 8766/tcp comment 'A.L.I.C.E. TTS Kokoro'
sudo ufw allow 8767/tcp comment 'A.L.I.C.E. TTS Piper'
sudo ufw reload
```

#### Step 2.11 — End-to-End Smoke Test from any node

```bash
# From MacBook Air or any node:
# STT test (requires a short WAV file — generate a sine wave tone for testing)
# Using the Orin as the test source itself:

ssh rob@100.106.110.119

# Health checks
curl -s http://localhost:8765/health
curl -s http://localhost:8766/health
curl -s http://localhost:8767/health

# TTS primary test
curl -s -X POST http://localhost:8766/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "A.L.I.C.E. voice pipeline is online.", "voice": "af_bella"}' \
  -o /tmp/test_out.wav \
  && file /tmp/test_out.wav \
  && ls -lh /tmp/test_out.wav

# TTS fallback test
curl -s -X POST http://localhost:8767/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing the piper fallback."}' \
  -o /tmp/test_fallback.wav \
  && file /tmp/test_fallback.wav

# STT test (use ffmpeg to generate a test WAV)
ffmpeg -f lavfi -i "sine=frequency=440:duration=3" -ar 16000 -ac 1 /tmp/test_tone.wav -y
curl -s -X POST http://localhost:8765/transcribe?language=en \
  --data-binary @/tmp/test_tone.wav \
  -H "Content-Type: audio/wav" | python3 -m json.tool
```

**Phase 2 Rollback:**
```bash
ssh rob@100.106.110.119
sudo systemctl disable --now alice-stt alice-tts
sudo rm /etc/systemd/system/alice-stt.service /etc/systemd/system/alice-tts.service
sudo systemctl daemon-reload
# Optionally remove the venv and models:
# sudo rm -rf /opt/voice-pipeline
```

**Capabilities unlocked:** Real-time voice input (STT) and voice output (TTS) across the A.L.I.C.E. network. Agents can speak to users. Orin handles all voice processing at the edge.

---

### Phase 3 — Infrastructure Services on Ubuntu Desktop (Docker)

**Node:** Ubuntu Desktop (100.76.82.8)  
**SSH:** `ssh rob@100.76.82.8`  
**Risk:** Medium — Docker containers, port bindings, data volumes  
**Rollback:** `docker compose down -v` (deletes volumes), or `docker stop <container>`

Services: Qdrant (6333), Redis (6379), Prometheus (9090), Grafana (3000).

#### Step 3.1 — Docker Readiness Check

```bash
ssh rob@100.76.82.8

# Verify Docker
docker --version          # Confirm Docker is installed
docker compose version    # Confirm compose v2 plugin available

# Check NVIDIA runtime (CUDA is on this machine)
docker run --rm --gpus all nvidia/cuda:12.6.0-base-ubuntu22.04 \
  nvidia-smi --format=csv,noheader

# If 'nvidia' runtime is not listed, register it:
# cat /etc/docker/daemon.json
# Should contain: {"default-runtime": "nvidia", ...}
```

#### Step 3.2 — Docker Compose File for All Infra Services

```bash
ssh rob@100.76.82.8

mkdir -p ~/alice-infra
cd ~/alice-infra

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # --- Qdrant Vector Database ---
  qdrant:
    image: qdrant/qdrant:v1.7.4
    container_name: alice-qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"   # REST API
      - "6334:6334"   # gRPC
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__LOG_LEVEL=INFO
    # GPU acceleration is not available in Qdrant community image;
    # use nvidia-container-runtime for future qdrant-standalone if needed
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 0
              capabilities: [gpu]

  # --- Redis (cache + session store) ---
  redis:
    image: redis:7.4-alpine
    container_name: alice-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 4gb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # --- Prometheus (metrics collection) ---
  prometheus:
    image: prom/prometheus:v2.51.0
    container_name: alice-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'  # Allows reload via POST without restart
    extra_hosts:
      - "host.docker.internal:host-gateway"

  # --- Grafana (dashboards) ---
  grafana:
    image: grafana/grafana:10.4.2
    container_name: alice-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-alice-grafana-dev}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=http://localhost:3000
    depends_on:
      - prometheus

volumes:
  qdrant_data:
  redis_data:
  prometheus_data:
  grafana_data:
EOF
```

#### Step 3.3 — Prometheus Configuration

```bash
ssh rob@100.76.82.8
cd ~/alice-infra

cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers: []

rule_files: []

scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Ollama exporters (if installed on each node)
  # Add one entry per node
  - job_name: 'ollama-nodes'
    static_configs:
      - targets:
          - '100.115.74.106:6060'   # Mac Studio
          - '100.107.132.71:6060'  # Mac Mini
          - '100.106.110.119:6060' # Orin
          - '100.76.82.8:6060'     # Ubuntu Desktop
        labels:
          network: 'alice'
    scrape_interval: 30s

  # OpenClaw agent metrics (if exposed)
  - job_name: 'openclaw'
    static_configs:
      - targets: ['100.101.241.124:9091']

  # Infrastructure containers
  - job_name: 'infra'
    static_configs:
      - targets:
          - 'qdrant:6333'
          - 'redis:6379'
EOF
```

#### Step 3.4 — Grafana Provisioning (datasources + dashboard)

```bash
ssh rob@100.76.82.8
cd ~/alice-infra

mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards

# Datasource provisioning (auto-connect Prometheus)
cat > grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF

# Dashboard provisioning
cat > grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'A.L.I.C.E.'
    orgId: 1
    folder: ''
    folderUid: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Create a basic A.L.I.C.E. overview dashboard JSON
cat > grafana/provisioning/dashboards/alice-overview.json << 'EOF'
{
  "dashboard": {
    "title": "A.L.I.C.E. Network Overview",
    "uid": "alice-overview",
    " panels": [
      {
        "title": "Ollama Node Health",
        "type": "stat",
        "gridPos": {"h": 6, "w": 12, "x": 0, "y": 0},
        "targets": [{"expr": "up{job='ollama-nodes'}", "legendFormat": "{{instance}}"}]
      },
      {
        "title": "Qdrant Collection Count",
        "type": "stat",
        "gridPos": {"h": 6, "w": 6, "x": 12, "y": 0},
        "targets": [{"expr": "qdrantCollections", "legendFormat": "collections"}]
      },
      {
        "title": "Redis Connected Clients",
        "type": "graph",
        "gridPos": {"h": 6, "w": 12, "x": 0, "y": 6},
        "targets": [{"expr": "redis_connected_clients", "legendFormat": "clients"}]
      },
      {
        "title": "Prometheus tsdb_size",
        "type": "graph",
        "gridPos": {"h": 6, "w": 12, "x": 12, "y": 6},
        "targets": [{"expr": "prometheus_tsdb_storage_blocks_bytes", "legendFormat": "storage_bytes"}]
      }
    ]
  }
}
EOF
```

#### Step 3.5 — NVIDIA NIM Containers (Optional — CUDA node)

> **Note:** NVIDIA NIM (Inference Microservices) containers require an NGC API key and are primarily for enterprise models (NVIDIA-hosted or self-hosted). Given this is a dev environment on Ubuntu Desktop, evaluate whether NIM containers add value vs. Ollama running natively.

If NIM is desired (e.g., for NVIDIA NIM LLM endpoints for embeddings/llm):

```bash
ssh rob@100.76.82.8

# Authenticate to NGC (requires API key from ngc.nvidia.com)
# docker login nvcr.io

# Example: NVIDIA NIM for embeddings (if API key available)
# docker run --rm --gpus all \
#   -e NGC_API_KEY=$NGC_API_KEY \
#   -p 8080:8080 \
#   nvcr.io/nim/nvidia/embeddings:1.0

# Example: NIM for a specific model (check NGC for current image)
# docker run --rm --gpus all \
#   -e NGC_API_KEY=$NGC_API_KEY \
#   -p 8000:8000 \
#   nvcr.io/nim/nvidia/llm:1.0

# For now, skip NIM unless Rob provides NGC credentials.
echo "NIM containers skipped — awaiting NGC API key"
```

#### Step 3.6 — Start Services

```bash
ssh rob@100.76.82.8
cd ~/alice-infra

# Set Grafana password (export before running compose)
export GRAFANA_PASSWORD="alice-grafana-dev"   # Change in prod

# Pull images (run first to catch any image errors early)
docker compose pull

# Start all services
docker compose up -d

# Wait and check health
sleep 10
docker compose ps

# Tail logs for first 30s
docker compose logs --tail=30
```

#### Step 3.7 — Verify All Services

```bash
ssh rob@100.76.82.8

# Qdrant — REST API
curl -s http://localhost:6333/collections | python3 -m json.tool
# Expected: {"result":{"collections":[]},"status":"ok"}

# Qdrant — Health
curl -s http://localhost:6333/health | python3 -m json.tool

# Redis
docker exec alice-redis redis-cli ping
# Expected: PONG

redis-cli info clients
# Check connected clients

# Prometheus
curl -s http://localhost:9090/-/healthy
# Expected: Prometheus is Healthy.

curl -s http://localhost:9090/api/v1/status/targets | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Active targets: {sum(1 for t in d[\"data\"][\"activeTargets\"])}')"

# Prometheus — Grafana datasource test
curl -s http://admin:alice-grafana-dev@localhost:3000/api/datasources/1/health
# Expected: {"status": "OK"}

# Grafana
curl -s http://localhost:3000/api/health | python3 -m json.tool
# Expected: {"commit":"...","database":"ok","version":"10.4.2"}
```

**Phase 3 Rollback:**
```bash
ssh rob@100.76.82.8
cd ~/alice-infra

# Stop all containers (preserves volumes)
docker compose stop

# OR destroy everything (including data volumes — WARNING: loses all data):
# docker compose down -v

# Remove images if desired:
# docker compose down --rmi all
```

**Capabilities unlocked:** Vector storage (Qdrant) for RAG pipelines, caching/sessions (Redis), metrics collection (Prometheus), and observability dashboards (Grafana).

---

### Phase 4 — Ubuntu Desktop: Small GPU Models via Ollama

**Node:** Ubuntu Desktop (100.76.82.8)  
**SSH:** `ssh rob@100.76.82.8`  
**Risk:** Low — read-only model pulls, small files  
**Rollback:** `ollama delete <model>`

#### Step 4.1 — Verify Ollama + GPU Access

```bash
ssh rob@100.76.82.8

ollama --version
nvidia-smi
# Confirm GPU is visible to Ollama
```

#### Step 4.2 — Pull GPU-Accelerated Models

```bash
ssh rob@100.76.82.8

# phi-4-mini — Microsoft Small Language Model (~2.5GB)
# Excellent for classification, function calling, low-latency tasks
ollama pull phi-4-mini

# llama3.2:3b — lightweight general-purpose (~2GB)
# Good for fast responses where full capacity is overkill
ollama pull llama3.2:3b

# Optional: verify GPU acceleration is being used
# Run a quick benchmark:
time ollama run phi-4-mini "Count to 10:" --verbose
```

#### Step 4.3 — Register in Ollama (already automatic)

```bash
ssh rob@100.76.82.8

# List all models to confirm
ollama list

# Expected output:
# NAME                SIZE      MODIFIED
# phi-4-mini:latest   2.5GB     <timestamp>
# llama3.2:3b          2.0GB     <timestamp>
# [other existing models...]

# Test each
ollama run phi-4-mini "What is 2+2?" --verbose
ollama run llama3.2:3b "What is 2+2?" --verbose
```

**Phase 4 Rollback:**
```bash
ollama delete phi-4-mini
ollama delete llama3.2:3b
```

**Capabilities unlocked:** Ultra-fast local inference on Ubuntu Desktop's 8GB VRAM GPU for phi-4-mini (SLM, function calling) and lightweight general chat via llama3.2:3b. Reduces load on Mac Studio for simple tasks.

---

### Phase 5 — OpenClaw Config Updates

**Node:** MacBook Air (100.101.241.124) — the OpenClaw host  
**Risk:** Low — config file update, no services restarted  
**Rollback:** Restore previous `~/.openclaw/config.json`

#### Step 5.1 — Locate and Read Current Config

```bash
# From MacBook Air (or wherever OpenClaw config lives)
ssh rob@100.101.241.124

# Find config location
openclaw config show 2>/dev/null || \
  cat ~/.openclaw/config.json 2>/dev/null || \
  find ~ -name "config.json" -path "*/openclaw/*" 2>/dev/null | head -5

# Read current config
cat ~/.openclaw/config.json | python3 -m json.tool | head -100
```

#### Step 5.2 — JSON Config Patch

The exact patch depends on the current config schema. Below is a **representative patch** — verify against the actual `~/.openclaw/config.json` before applying.

```bash
ssh rob@100.101.241.124

# Backup current config
cp ~/.openclaw/config.json ~/.openclaw/config.json.bak.$(date +%Y%m%d%H%M%S)

# Apply patches using python3 for atomic update
python3 << 'EOF'
import json
import sys

CONFIG_PATH = "/Users/rob/.openclaw/config.json"

with open(CONFIG_PATH, "r") as f:
    cfg = json.load(f)

# === PATCH 1: Register new models in model catalog ===
# Mac Studio: llama-guard3:8b added (already exists via ollama pull)
# Mac Mini: llama-guard3:8b added
# Ubuntu Desktop: phi-4-mini, llama3.2:3b added

# The exact schema varies by OpenClaw version. Below uses a common pattern:
# Look for a "models" or "endpoints" or "agents" section.

# Example schema (verify before applying):
# cfg.setdefault("models", {})["catalog"] = cfg["models"].get("catalog", {})
# cfg["models"]["catalog"]["llama-guard3:8b"] = {
#     "provider": "ollama",
#     "node": "mac-studio",
#     "address": "http://100.115.74.106:11434",
#     "enabled": True,
#     "safety": True,  # Safety model flag
# }

# === PATCH 2: Register voice endpoints ===
# cfg.setdefault("voice", {})
# cfg["voice"]["stt_endpoint"] = "http://100.106.110.119:8765/transcribe"
# cfg["voice"]["tts_primary"] = "http://100.106.110.119:8766/synthesize"
# cfg["voice"]["tts_fallback"] = "http://100.106.110.119:8767/synthesize"
# cfg["voice"]["tts_default_voice"] = "af_bella"

# === PATCH 3: Register infra endpoints ===
# cfg.setdefault("services", {})
# cfg["services"]["qdrant"] = "http://100.76.82.8:6333"
# cfg["services"]["redis"] = "redis://100.76.82.8:6379"
# cfg["services"]["prometheus"] = "http://100.76.82.8:9090"
# cfg["services"]["grafana"] = "http://100.76.82.8:3000"

with open(CONFIG_PATH, "w") as f:
    json.dump(cfg, f, indent=2)

print("Config patched OK")
EOF
```

#### Step 5.3 — Verify OpenClaw Sees New Config

```bash
ssh rob@100.101.241.124

# Validate config syntax
openclaw config validate 2>/dev/null || \
  python3 -c "import json; json.load(open('/Users/rob/.openclaw/config.json'))" && \
  echo "Config JSON valid"

# Reload OpenClaw to pick up changes
openclaw gateway restart

# Check status
openclaw gateway status
```

**Phase 5 Rollback:**
```bash
ssh rob@100.101.241.124
cp ~/.openclaw/config.json.bak.$(ls -t ~/.openclaw/config.json.bak.* | head -1 | sed 's/.*config.json.bak.//') ~/.openclaw/config.json
openclaw gateway restart
```

---

## C. Risk + Rollback Summary Table

| Phase | Risk Level | Key Risk | Rollback Command |
|---|---|---|---|
| 1. Safety layer | Low | Disk space (~5GB per node) | `ollama delete llama-guard3:8b` |
| 2. Voice pipeline | Medium | Package install conflicts, systemd failures | `sudo systemctl disable --now alice-stt alice-tts` |
| 3. Infra Docker | Medium | Port conflicts (6333/6379/9090/3000), Docker daemon issues | `docker compose stop` (preserves volumes) |
| 4. GPU models | Low | Disk space (~4.5GB), GPU memory pressure | `ollama delete phi-4-mini llama3.2:3b` |
| 5. OpenClaw config | Low | Config syntax error breaks gateway | `cp ~/.openclaw/config.json.bak.* ~/.openclaw/config.json && openclaw gateway restart` |

---

## D. OpenClaw Config Changes — Exact JSON Patches

> **IMPORTANT:** These patches are representative. Read the actual `~/.openclaw/config.json` first and adjust the paths/keys to match the real schema.

### D.1 — Model Registrations

```json
// Add to models catalog (under appropriate section)
"models": {
  "catalog": {
    "llama-guard3:8b": {
      "provider": "ollama",
      "node": "mac-studio",
      "address": "http://100.115.74.106:11434",
      "enabled": true,
      "safety_model": true,
      "capabilities": ["safety", "content-moderation"]
    },
    "llama-guard3:8b-macmini": {
      "provider": "ollama",
      "node": "mac-mini",
      "address": "http://100.107.132.71:11434",
      "enabled": true,
      "safety_model": true,
      "capabilities": ["safety", "content-moderation"]
    },
    "phi-4-mini": {
      "provider": "ollama",
      "node": "ubuntu-desktop",
      "address": "http://100.76.82.8:11434",
      "enabled": true,
      "gpu_accelerated": true,
      "capabilities": ["completion", "function_calling", "classification"],
      "vram_estimate_gb": 2.5
    },
    "llama3.2:3b": {
      "provider": "ollama",
      "node": "ubuntu-desktop",
      "address": "http://100.76.82.8:11434",
      "enabled": true,
      "gpu_accelerated": true,
      "capabilities": ["completion", "chat"],
      "vram_estimate_gb": 2.0
    }
  }
}
```

### D.2 — Voice Endpoints

```json
"voice": {
  "enabled": true,
  "stt": {
    "endpoint": "http://100.106.110.119:8765/transcribe",
    "engine": "faster-whisper-tensorrt",
    "model": "base",
    "default_language": "en",
    "vad": "silero-vad"
  },
  "tts": {
    "primary": {
      "endpoint": "http://100.106.110.119:8766/synthesize",
      "engine": "kokoro-cuda",
      "default_voice": "af_bella",
      "available_voices": ["af_bella", "af_nicole", "af_sarah", "am_adam", "am_michael"],
      "gpu_accelerated": true
    },
    "fallback": {
      "endpoint": "http://100.106.110.119:8767/synthesize",
      "engine": "piper",
      "default_voice": "en_US-lessac-medium",
      "gpu_accelerated": false
    }
  }
}
```

### D.3 — Infrastructure Service Endpoints

```json
"services": {
  "qdrant": {
    "address": "http://100.76.82.8:6333",
    "rest_port": 6333,
    "grpc_port": 6334,
    "purpose": "vector_storage"
  },
  "redis": {
    "address": "redis://100.76.82.8:6379",
    "port": 6379,
    "purpose": "cache_session",
    "maxmemory": "4gb",
    "maxmemory_policy": "allkeys-lru"
  },
  "prometheus": {
    "address": "http://100.76.82.8:9090",
    "port": 9090,
    "purpose": "metrics",
    "retention_days": 30,
    "scrape_interval": "15s"
  },
  "grafana": {
    "address": "http://100.76.82.8:3000",
    "port": 3000,
    "purpose": "observability",
    "default_user": "admin"
  }
}
```

### D.4 — Node Inventory (optional — for OpenClaw's awareness)

```json
"nodes": {
  "mac-studio": {
    "tailscale_ip": "100.115.74.106",
    "os": "macos",
    "ram_gb": 36,
    "role": "inference_primary",
    "models": ["lfm2:24b", "deepseek-r1:14b", "qwen3.5:35b", "qwen3-coder:30b", "llama-guard3:8b"]
  },
  "mac-mini": {
    "tailscale_ip": "100.107.132.71",
    "os": "macos",
    "ram_gb": 24,
    "role": "inference_relay",
    "models": ["qwen3.5:27b", "llama-guard3:8b"]
  },
  "orin": {
    "tailscale_ip": "100.106.110.119",
    "os": "ubuntu-arm",
    "ram_gb": 64,
    "role": "voice_edge",
    "cuda_version": "12.6",
    "services": ["stt:8765", "tts:8766/tts-fallback:8767"]
  },
  "ubuntu-desktop": {
    "tailscale_ip": "100.76.82.8",
    "os": "ubuntu-x86",
    "ram_gb": 64,
    "vram_gb": 8,
    "role": "infrastructure_gpu",
    "cuda_version": "12.x",
    "models": ["phi-4-mini", "llama3.2:3b"],
    "services": ["qdrant:6333", "redis:6379", "prometheus:9090", "grafana:3000"]
  },
  "macbook-air": {
    "tailscale_ip": "100.101.241.124",
    "os": "macos",
    "ram_gb": 24,
    "role": "orchestration_only"
  }
}
```

---

## E. Validation & Testing Steps

### Pre-flight (all nodes)

```bash
# From MacBook Air (orchestrator), verify all nodes are reachable:
for ip in 100.115.74.106 100.107.132.71 100.106.110.119 100.76.82.8; do
  echo "=== Pinging $ip ==="
  ping -c 2 -W 2 $ip && echo "OK" || echo "FAIL"
done
```

### Phase 1 Validation

```bash
# Test safety model on Mac Studio
ssh rob@100.115.74.106 "ollama run llama-guard3:8b 'You are a helpful assistant.' --verbose" | head -5

# Test safety model on Mac Mini
ssh rob@100.107.132.71 "ollama run llama-guard3:8b 'You are a helpful assistant.' --verbose" | head -5
```

### Phase 2 Validation

```bash
# All from Orin
ssh rob@100.106.110.119

# Systemd services up
systemctl is-active alice-stt  # should print "active"
systemctl is-active alice-tts   # should print "active"

# HTTP health endpoints
curl -s http://localhost:8765/health | python3 -m json.tool
curl -s http://localhost:8766/health | python3 -m json.tool
curl -s http://localhost:8767/health | python3 -m json.tool

# STT functional test (requires test WAV)
curl -s -X POST http://localhost:8765/transcribe \
  -H "Content-Type: audio/wav" \
  --data-binary @/tmp/test_tone.wav | python3 -m json.tool

# TTS functional test
curl -s -X POST http://localhost:8766/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Devon online. Voice pipeline confirmed.","voice":"af_bella"}' \
  -o /tmp/devon_voice.wav
file /tmp/devon_voice.wav

# Remote test (from MacBook Air)
curl -s http://100.106.110.119:8765/health
curl -s -X POST http://100.106.110.119:8766/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Testing from MacBook Air.","voice":"af_bella"}' -o /tmp/remote_test.wav
file /tmp/remote_test.wav
```

### Phase 3 Validation

```bash
# All from Ubuntu Desktop
ssh rob@100.76.82.8

# Container health
docker compose ps

# Individual service checks
curl -sf http://localhost:6333/health || echo "QDRANT FAIL"
docker exec alice-redis redis-cli ping || echo "REDIS FAIL"
curl -sf http://localhost:9090/-/healthy || echo "PROMETHEUS FAIL"
curl -sf http://localhost:3000/api/health || echo "GRAFANA FAIL"

# Prometheus targets
curl -s http://localhost:9090/api/v1/targets | python3 -c \
  "import sys,json; d=json.load(sys.stdin); [print(t['labels']['job'], t['health']) for t in d['data']['activeTargets']]"

# Grafana login
curl -s -u admin:alice-grafana-dev http://localhost:3000/api/health | python3 -m json.tool
```

### Phase 4 Validation

```bash
ssh rob@100.76.82.8

ollama list | grep -E 'phi-4-mini|llama3.2:3b'

# GPU inference test
time ollama run phi-4-mini "What is the capital of France?" --verbose
time ollama run llama3.2:3b "What is 2+2?" --verbose
```

### Phase 5 Validation

```bash
ssh rob@100.101.241.124

# Config valid
python3 -c "import json; json.load(open('/Users/rob/.openclaw/config.json'))" && echo "JSON OK"

# Gateway up
openclaw gateway status

# List registered models
openclaw models list 2>/dev/null || openclaw model list 2>/dev/null || echo "Check model list via web UI"
```

---

## F. Capabilities Unlocked by Phase

| Phase | Capability Added | Who's Empowered |
|---|---|---|
| **1** | Content safety + moderation on all Mac Studio + Mac Mini inference | All agents |
| **2** | Real-time voice STT + TTS at the network edge (Orin) | Voice agents, accessibility |
| **2** | VAD-based voice activity detection | Voice pipeline |
| **3** | Vector storage (Qdrant) — RAG at scale | Knowledge agents |
| **3** | Redis caching — session persistence, rate limiting | All agents |
| **3** | Prometheus metrics — per-node, per-model | Devon (observability) |
| **3** | Grafana dashboards — visual health monitoring | Rob, Devon |
| **4** | Ultra-fast phi-4-mini GPU inference on Ubuntu Desktop | Fast-response agents |
| **4** | Lightweight llama3.2:3b GPU inference | Lightweight tasks |
| **5** | OpenClaw aware of all new models, voice endpoints, infra services | Full A.L.I.C.E. stack |

---

## G. SSH Quick Reference (Tailscale IPs)

```bash
# MacBook Air (orchestration host — likely the machine you're running from)
ssh rob@100.101.241.124

# Mac Studio (always-on inference)
ssh rob@100.115.74.106

# Mac Mini (inference relay)
ssh rob@100.107.132.71

# Alpha/AGX Orin (voice pipeline)
ssh rob@100.106.110.119

# Ubuntu Desktop (infra + GPU models)
ssh rob@100.76.82.8

# SSH with identity file (if not using SSH agent):
ssh -i ~/.ssh/id_ed25519 rob@<tailscale-ip>

# Batch run same command on all nodes:
for ip in 100.115.74.106 100.107.132.71 100.106.110.119 100.76.82.8; do
  echo "=== $ip ===" && ssh rob@$ip "uptime" && echo ""
done
```

---

## H. Implementation Order Recommendation

```
Week 1, Day 1:
  └─ Phase 1 (Safety)        — 15 min, low risk, easy rollback
  └─ Phase 4 (GPU models)    — 10 min, parallel with Phase 1

Week 1, Day 2:
  └─ Phase 3 (Infra Docker)  — 30 min, do first so Prometheus starts collecting early
  └─ Phase 2 (Voice pipeline) — 60-90 min, most complex, do last

Week 1, Day 3:
  └─ Phase 5 (OpenClaw config) — 15 min, final integration
  └─ Full validation run

Or: run Phases 1+4 in parallel (same day), then 2+3 in parallel, then 5.
```

---

## I. Post-Implementation Checklist

- [ ] All 5 nodes reachable via Tailscale SSH
- [ ] `llama-guard3:8b` present and responsive on Mac Studio + Mac Mini
- [ ] Voice STT endpoint returns correct JSON on Orin (port 8765)
- [ ] Voice TTS Kokoro returns WAV on Orin (port 8766)
- [ ] Voice TTS Piper fallback returns audio on Orin (port 8767)
- [ ] All systemd voice services `active (running)`
- [ ] Qdrant responding on 6333 (Ubuntu Desktop)
- [ ] Redis `PONG` on 6379
- [ ] Prometheus `/-/healthy` on 9090
- [ ] Grafana `database: ok` on 3000
- [ ] `phi-4-mini` and `llama3.2:3b` listed in `ollama list` on Ubuntu Desktop
- [ ] OpenClaw config passes JSON validation
- [ ] OpenClaw gateway `status: running`
- [ ] Prometheus scraping at least one target
- [ ] Grafana connected to Prometheus datasource
- [ ] Document service accounts + any new ports opened in network firewall docs

---

*End of Implementation Plan — Devon, A.L.I.C.E. DevOps*
