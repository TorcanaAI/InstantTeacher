/**
 * Sunshine text-to-speech — locked to a single ElevenLabs voice.
 * No frontend voice selection; ELEVENLABS_VOICE_ID is server-only.
 */

const LOCKED_VOICE_ID = "hpp4J3VqNfWAUOO0d1Us";

function getVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID ?? LOCKED_VOICE_ID;
}

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error("Sunshine voice not configured. Set ELEVENLABS_API_KEY in .env or Vercel.");
  }
  return key;
}

export async function generateSunshineSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${getVoiceId()}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sunshine voice generation failed: ${response.status} ${err}`);
  }

  return await response.arrayBuffer();
}
