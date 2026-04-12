# Voice Pipeline Skill

Speech-to-text and text-to-speech using Whisper + Piper running on the **Jetson AGX Orin** node, callable from any OpenClaw agent session.

## Architecture

```
[Input Audio] → MacBook Air → SCP to AGX Orin → whisper (STT)
                                              ↓
                                      text transcript
                                              ↓
                                      piper TTS (AGX Orin)
                                              ↓
                                      audio WAV file
                                              ↓
                              SCP back to MacBook Air → play / send
```

## Prerequisites

- whisper on AGX Orin: `/home/alice/.local/bin/whisper`
- piper on AGX Orin: `/usr/local/bin/piper`
- Piper model: `/home/alice/piper-voices/en_US-lessac-high.onnx`
- SSH key: `~/.ssh/alice_auto` (passphraseless) for `alice@agx-orin`

## Usage

### Transcribe (STT)
```bash
voice-pipeline.sh transcribe /path/to/audio.wav
# Returns: transcribed text
```

### Speak (TTS)
```bash
voice-pipeline.sh respond "Text to speak"
# Returns: /tmp/voice_response.wav
```

### Full pipeline test
```bash
~/.openclaw/workspace-olivia/bin/voice-pipeline.sh transcribe /tmp/test2.wav
~/.openclaw/workspace-olivia/bin/voice-pipeline.sh respond "Hello from Alice"
```

## Telegram Integration

To handle Telegram voice notes:
1. Receive the `file_id` from the incoming message
2. Download: `https://api.telegram.org/bot<TOKEN>/getFile?file_id=<file_id>`
3. Get download URL: `https://api.telegram.org/file/bot<TOKEN>/<file_path>`
4. Download audio → convert to 16kHz WAV
5. Run `voice-pipeline.sh transcribe`
6. Process transcript as normal text
7. Run `voice-pipeline.sh respond "<text>"`
8. Send voice note back via `message action=send ... asVoice=true`

## Files

- Script: `~/.openclaw/workspace-olivia/bin/voice-pipeline.sh`
- SSH key: `~/.ssh/alice_auto`
- AGX Orin: `agx-orin` (in ~/.ssh/config)
