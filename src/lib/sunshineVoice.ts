/**
 * Sunshine AI Voice — OpenAI answer + locked ElevenLabs TTS (sunshineTTS).
 * No audio stored. All speech uses the locked voice ID (no frontend override).
 */

import { getAssistantResponse } from "./assistant";
import { generateAssistantSpeech, generateSunshineSpeech } from "./sunshineTTS";

/**
 * Same tutor brain as homework: full in-depth Sunshine answers via getAssistantResponse, then TTS.
 * (Previously this path was capped at ~50 words; that made Sunshine sound shallow vs Jack.)
 */
export async function sunshineAnswerStream(
  question: string,
  subject: string,
  imageUrl?: string
): Promise<ReadableStream<Uint8Array>> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error("Sunshine voice not configured. Set OPENAI_API_KEY in .env or Vercel.");
  }
  requireSunshineVoiceEnv();

  const generatedText = await getAssistantResponse(
    [{ role: "user", content: question, imageUrl }],
    "SUNSHINE",
    { subject: subject?.trim() || undefined }
  );

  const audio = await generateSunshineSpeech(generatedText);
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg" } })
    .body as ReadableStream<Uint8Array>;
}

export function requireSunshineVoiceEnv(): void {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("Sunshine voice not configured. Set ELEVENLABS_API_KEY in .env or Vercel.");
  }
}

/**
 * Jack: same pipeline as homework help — OpenAI tutor answer + locked Jack ElevenLabs voice.
 * Used for admin "Ask Jack" tests (not TTS-only).
 */
export async function jackAnswerStream(
  question: string,
  subject: string,
  imageUrl?: string
): Promise<ReadableStream<Uint8Array>> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error("Jack voice not configured. Set OPENAI_API_KEY in .env or Vercel.");
  }
  requireSunshineVoiceEnv();

  const generatedText = await getAssistantResponse(
    [{ role: "user", content: question, imageUrl }],
    "JACK",
    { subject: subject?.trim() || undefined }
  );

  const audio = await generateAssistantSpeech(generatedText, "JACK");
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg" } })
    .body as ReadableStream<Uint8Array>;
}
