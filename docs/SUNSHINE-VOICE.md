# Sunshine AI Voice (ElevenLabs + OpenAI)

Ask Sunshine uses **OpenAI** for the answer and **ElevenLabs** for text-to-speech. No audio is stored.  
**Voice is locked** — no frontend voice selection; all speech uses `ELEVENLABS_VOICE_ID`.

## Environment variables

Add to `.env` (local) and **Vercel → Settings → Environment Variables** (production):

| Variable | Required | Description |
|----------|----------|-------------|
| `ELEVENLABS_API_KEY` | Yes | From [ElevenLabs API keys](https://elevenlabs.io/app/settings/api-keys). |
| `ELEVENLABS_VOICE_ID` | Yes | Locked voice ID: `p43fx6U8afP2xoq1Ai9f`. Do not override from frontend. |
| `OPENAI_API_KEY` | Yes | From [OpenAI API keys](https://platform.openai.com/api-keys). |

Then restart your dev server or redeploy on Vercel.

## Flow

1. User types a question on **Ask Sunshine**.
2. Backend: `POST /api/sunshine/voice` — OpenAI generates a short answer (2–4 sentences).
3. Backend: `generateSunshineSpeech()` (in `lib/sunshineTTS.ts`) converts text to MP3 using the **locked voice**.
4. Browser: Audio stream is played; nothing is stored.

**TTS-only:** `POST /api/sunshine/speak` with `{ "text": "..." }` returns raw MP3 (same locked voice). Auth required; no payment check.

## Admin bypass

If the logged-in user has role **ADMIN**, payment and question balance are skipped so you can test Sunshine voice without using a question block.

## Validation

If `ELEVENLABS_API_KEY` is missing, the API returns **503** with:  
`"Sunshine voice not configured. Set ELEVENLABS_API_KEY in .env or Vercel."`
