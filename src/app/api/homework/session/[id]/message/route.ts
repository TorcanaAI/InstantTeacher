import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAssistantResponse } from "@/lib/assistant";
import { updateStreak, checkBadges, countQuestionsAsked } from "@/lib/streaks-badges";
import { PANIC_BUTTON_RESPONSE } from "@/lib/constants";

/** Allow long OpenAI responses (Vercel Pro+; ignored on Hobby). */
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const homeworkSession = await prisma.homeworkSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!homeworkSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (homeworkSession.requestedByUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (homeworkSession.status !== "ACTIVE") {
      return NextResponse.json({ error: "Session is not active" }, { status: 400 });
    }
    const now = new Date();
    if (homeworkSession.endsAt && now > homeworkSession.endsAt) {
      await prisma.homeworkSession.update({
        where: { id },
        data: { status: "ENDED" },
      });
      return NextResponse.json({ error: "Session has ended" }, { status: 400 });
    }

    const body = (await req.json()) as {
      content?: string;
      imageUrl?: string;
      panic?: boolean;
      subject?: string;
    };
    const { content, imageUrl, panic, subject: messageSubject } = body;

    const userContent = (content ?? "").trim();
    if (!panic && !userContent && !imageUrl) {
      return NextResponse.json({ error: "content or imageUrl or panic required" }, { status: 400 });
    }

    const userMessageContent = panic
      ? "[Student pressed the panic button — they need a calming response.]"
      : userContent || "[Image of a question]";

    await prisma.homeworkSessionMessage.create({
      data: {
        sessionId: id,
        role: "USER",
        content: userMessageContent,
        imageUrl: imageUrl ?? undefined,
      },
    });

    if (messageSubject && !homeworkSession.subject) {
      await prisma.homeworkSession.update({
        where: { id },
        data: { subject: messageSubject },
      });
      homeworkSession.subject = messageSubject;
    }

    let assistantText: string;
    if (panic) {
      assistantText = PANIC_BUTTON_RESPONSE;
    } else {
      const chatMessages = homeworkSession.messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
        imageUrl: m.imageUrl ?? undefined,
      }));
      chatMessages.push({
        role: "user",
        content: userMessageContent,
        imageUrl: imageUrl ?? undefined,
      });

      const { newStreak, streakMessage } = await updateStreak(homeworkSession.studentId);
      const totalQuestions = await countQuestionsAsked(homeworkSession.studentId);
      await checkBadges(homeworkSession.studentId, {
        totalQuestionsAsked: totalQuestions,
        streakCurrent: newStreak,
        examQuestionsCompleted: undefined,
        completedPracticeTest: false,
      });

      assistantText = await getAssistantResponse(
        chatMessages,
        homeworkSession.assistantType,
        {
          subject: homeworkSession.subject ?? undefined,
          streakMessage: streakMessage ? `${newStreak}-day streak` : undefined,
          isPanic: false,
        }
      );
    }

    const assistantMsg = await prisma.homeworkSessionMessage.create({
      data: {
        sessionId: id,
        role: "ASSISTANT",
        content: assistantText,
      },
    });

    return NextResponse.json({
      message: {
        id: assistantMsg.id,
        role: "ASSISTANT",
        content: assistantText,
        createdAt: assistantMsg.createdAt,
      },
    });
  } catch (err) {
    console.error("Homework message error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
