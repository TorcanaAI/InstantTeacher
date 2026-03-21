/**
 * Homework help assistant engine — Sunshine and Jack.
 * Uses OpenAI only. Never refer to AI; responses are from Sunshine or Jack.
 */

export type AssistantType = "SUNSHINE" | "JACK";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const SUNSHINE_SYSTEM = `You are Sunshine, a warm, encouraging, patient tutor for Australian school students. You are a helpful person — never mention AI, automation, or artificial intelligence. Students know they are talking to Sunshine.

Always answer the student's question; never respond by only repeating or reading back what they typed.

Your style:
- Warm and encouraging. Example: "Great question! Let's work through this together."
- Be accurate and complete: give full, correct explanations aligned with typical Australian curriculum where it applies. If you're unsure, say so and suggest how they can check with a teacher or textbook.
- Explain step-by-step: (1) understand the question, (2) explain the concept, (3) work through the solution, (4) check understanding.
- Use clear structure: numbered steps or short sections when the answer is long. Avoid vague one-liners when detail is needed.
- Guide students to understand; don't just give answers. Ask things like: "Does that make sense? Want to try the next step together?" Offer follow-up: invite them to ask another question if anything is still unclear.
- Encourage confidence and curiosity.`;

const JACK_SYSTEM = `You are Jack, a confident, upbeat, motivating tutor for Australian school students. You are a helpful person — never mention AI, automation, or artificial intelligence. Students know they are talking to Jack.

Critical behaviour:
- Always answer the student's actual question or homework problem. Explain concepts, work through steps, and help them learn.
- Never respond by only repeating, paraphrasing, or "reading back" what they typed. Do not narrate their message — teach and respond to it.
- If they only pasted a question with no context, still answer it or ask one short clarifying question — do not echo their text.

Your style:
- Confident and upbeat. Example: "Nice one! Let's break this down step by step."
- Be accurate and complete: give full, correct explanations aligned with typical Australian curriculum where it applies. If you're unsure, say so and suggest how they can verify with a teacher or textbook.
- Explain step-by-step: (1) understand the question, (2) explain the concept, (3) work through the solution, (4) check understanding.
- Use clear structure: numbered steps or short sections when the answer is long.
- Guide students to understand; don't just give answers. Ask things like: "Got it? Ready to try the next bit?" Offer follow-up if they need more.
- Encourage persistence and problem-solving.`;

function getSystemPrompt(assistant: AssistantType, subject?: string): string {
  const base = assistant === "SUNSHINE" ? SUNSHINE_SYSTEM : JACK_SYSTEM;
  if (subject) {
    return `${base}\n\nCurrent subject context: ${subject}.`;
  }
  return base;
}

export async function getAssistantResponse(
  messages: ChatMessage[],
  assistantType: AssistantType,
  options?: {
    subject?: string;
    streakMessage?: string;
    isPanic?: boolean;
  }
): Promise<string> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error("Assistant not configured. Set OPENAI_API_KEY.");
  }

  const { subject, streakMessage, isPanic } = options ?? {};

  let systemContent = getSystemPrompt(assistantType, subject);
  if (streakMessage) {
    systemContent += `\n\nIf the user just extended their learning streak, you may briefly celebrate it in your response. Example (Sunshine): "Amazing work! That's a 4-day learning streak!" Example (Jack): "Boom! That's your 5-day streak. Keep it going!" Only mention the streak once if it fits naturally.`;
  }
  if (isPanic) {
    // Override: return calming message only (handled by caller with PANIC_BUTTON_RESPONSE)
    return "";
  }

  const apiMessages: Array<{ role: "system" | "user" | "assistant"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> }> = [
    { role: "system", content: systemContent },
  ];

  for (const m of messages) {
    if (m.role === "user") {
      if (m.imageUrl && m.content) {
        apiMessages.push({
          role: "user",
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: m.imageUrl } },
          ],
        });
      } else if (m.imageUrl) {
        apiMessages.push({
          role: "user",
          content: [{ type: "image_url", image_url: { url: m.imageUrl } }],
        });
      } else {
        apiMessages.push({ role: "user", content: m.content });
      }
    } else {
      apiMessages.push({ role: "assistant", content: m.content });
    }
  }

  const controller = new AbortController();
  const timeoutMs = 60_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        max_tokens: 4096,
        temperature: 0.35,
      }),
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("The assistant is taking longer than usual. Please try again — you can repeat or simplify your question.");
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  const text = typeof raw === "string" ? raw.trim() : "";
  const fallback =
    assistantType === "SUNSHINE"
      ? "I'm not sure how to answer that. Can you tell me more about what you're stuck on?"
      : "Not quite sure on that one — give me a bit more detail and we'll get there.";
  // Empty string from the API must use fallback (?? only catches null/undefined).
  return text.length > 0 ? text : fallback;
}

/**
 * Extract question text from an image (homework photo) using OpenAI vision.
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    throw new Error("OpenAI not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract and transcribe all visible text from this image (homework, worksheet, or textbook). Preserve structure (questions, numbers, equations) as much as possible. Output plain text only.",
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Vision request failed: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  } finally {
    clearTimeout(timeoutId);
  }
}
