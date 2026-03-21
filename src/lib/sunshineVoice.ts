/**
 * Sunshine AI Voice — OpenAI answer + locked ElevenLabs TTS (sunshineTTS).
 * No audio stored. All speech uses the locked voice ID (no frontend override).
 */

import { getAssistantResponse } from "./assistant";
import { generateAssistantSpeech, generateSunshineSpeech } from "./sunshineTTS";

/**
 * Generate a short, supportive answer using OpenAI then return audio stream.
 * TTS uses the locked Sunshine voice (ELEVENLABS_VOICE_ID) via generateSunshineSpeech().
 */
export async function sunshineAnswerStream(
  question: string,
  subject: string
): Promise<ReadableStream<Uint8Array>> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error("Sunshine voice not configured. Set OPENAI_API_KEY in .env or Vercel.");
  }

  const systemPrompt = `You are Sunshine, a calm, friendly, supportive female tutor for Australian school students. 
Answer in 2-4 short sentences (under 50 words total). Be warm and encouraging. 
Subject context: ${subject}. Do not use markdown or lists. Plain speech only.`;

  const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 120,
    }),
  });

  if (!completionRes.ok) {
    const err = await completionRes.text();
    throw new Error(`OpenAI request failed: ${completionRes.status} ${err}`);
  }

  const data = (await completionRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const generatedText =
    data.choices?.[0]?.message?.content?.trim() ?? "I'm not sure how to answer that. Try asking in another way.";

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
  subject: string
): Promise<ReadableStream<Uint8Array>> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error("Jack voice not configured. Set OPENAI_API_KEY in .env or Vercel.");
  }
  requireSunshineVoiceEnv();

  const generatedText = await getAssistantResponse(
    [{ role: "user", content: question }],
    "JACK",
    { subject: subject?.trim() || undefined }
  );

  const audio = await generateAssistantSpeech(generatedText, "JACK");
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg" } })
    .body as ReadableStream<Uint8Array>;
}
