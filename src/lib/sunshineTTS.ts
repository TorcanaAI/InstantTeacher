/**
 * Sunshine and Jack text-to-speech — ElevenLabs.
 * Sunshine: friendly female. Jack: confident male.
 * Voice IDs are server-only (ELEVENLABS_VOICE_ID, ELEVENLABS_JACK_VOICE_ID).
 */

const DEFAULT_SUNSHINE_VOICE_ID = "hpp4J3VqNfWAUOO0d1Us";
// Jack — ElevenLabs voice library (override with ELEVENLABS_JACK_VOICE_ID)
// https://elevenlabs.io/app/agents/voice-library?voiceId=CbQryPGe1i0tLYfqq2b3
const DEFAULT_JACK_VOICE_ID = "CbQryPGe1i0tLYfqq2b3";

export type AssistantVoice = "SUNSHINE" | "JACK";

function getVoiceId(voice: AssistantVoice): string {
  if (voice === "JACK") {
    return process.env.ELEVENLABS_JACK_VOICE_ID ?? DEFAULT_JACK_VOICE_ID;
  }
  return process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_SUNSHINE_VOICE_ID;
}

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error("Voice not configured. Set ELEVENLABS_API_KEY in .env or Vercel.");
  }
  return key;
}

const SUNSHINE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.75,
  style: 0.2,
  use_speaker_boost: true,
  speed: 1.08,
};

const JACK_SETTINGS = {
  stability: 0.48,
  similarity_boost: 0.72,
  style: 0.25,
  use_speaker_boost: true,
  speed: 1.02,
};

export async function generateSunshineSpeech(text: string): Promise<ArrayBuffer> {
  return generateAssistantSpeech(text, "SUNSHINE");
}

export async function generateJackSpeech(text: string): Promise<ArrayBuffer> {
  return generateAssistantSpeech(text, "JACK");
}

export async function generateAssistantSpeech(
  text: string,
  voice: AssistantVoice
): Promise<ArrayBuffer> {
  const voiceId = getVoiceId(voice);
  const settings = voice === "JACK" ? JACK_SETTINGS : SUNSHINE_SETTINGS;
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: settings,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Voice generation failed: ${response.status} ${err}`);
  }

  return await response.arrayBuffer();
}
