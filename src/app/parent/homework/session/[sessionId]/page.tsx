"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Volume2, Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { BADGES, SUNSHINE_AVATAR_URL, JACK_AVATAR_URL } from "@/lib/constants";

type Message = { id: string; role: string; content: string; imageUrl?: string | null; createdAt: string };

export default function HomeworkSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const paymentDone = searchParams.get("payment") === "done";

  const [status, setStatus] = useState<string | null>(null);
  const [assistantType, setAssistantType] = useState<"SUNSHINE" | "JACK">("SUNSHINE");
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [panicSent, setPanicSent] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [badges, setBadges] = useState<Array<{ badgeId: string; unlockedAt: string }>>([]);
  const [subject, setSubject] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/homework/session/${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    setStatus(data.status);
    setStudentId(data.studentId ?? null);
    setAssistantType(data.assistantType ?? "SUNSHINE");
    setEndsAt(data.endsAt ?? null);
    setMessages(data.messages ?? []);
    setSubject(data.subject ?? null);
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    if (paymentDone || status === "PENDING_PAYMENT") {
      const t = setInterval(fetchSession, 2000);
      return () => clearInterval(t);
    }
  }, [sessionId, paymentDone, fetchSession, status]);

  useEffect(() => {
    if (status !== "ACTIVE" || !studentId) return;
    fetch(`/api/homework/student/${studentId}/stats`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setStreak(d.streakCurrent ?? null);
          setBadges(d.badges ?? []);
        }
      });
  }, [status, studentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeLeft = (() => {
    if (!endsAt || status !== "ACTIVE") return null;
    const end = new Date(endsAt).getTime();
    const now = Date.now();
    if (now >= end) return "0:00";
    const s = Math.floor((end - now) / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  })();

  async function sendMessage(content?: string, imageUrl?: string, panic?: boolean) {
    if (sending || status !== "ACTIVE") return;
    setSending(true);
    try {
      const res = await fetch(`/api/homework/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content ?? "",
          imageUrl: imageUrl ?? undefined,
          panic: panic ?? false,
          subject: subject ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSending(false);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: "u", role: "USER", content: content || (panic ? "[Panic button]" : "[Image]"), imageUrl: imageUrl ?? undefined, createdAt: new Date().toISOString() },
        { id: data.message.id, role: "ASSISTANT", content: data.message.content, createdAt: data.message.createdAt },
      ]);
      setInput("");
      if (panic) setPanicSent(true);
      // Defer refetch so the UI can paint the new messages first (doesn't block send latency).
      queueMicrotask(() => {
        void fetchSession();
      });
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || sending) return;
    sendMessage(t);
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      sendMessage("Can you help me with this question?", dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function playSpeech(text: string) {
    try {
      const res = await fetch("/api/assistant/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, assistant: assistantType }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
    } catch {}
  }

  if (status === null && !paymentDone) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "PENDING_PAYMENT") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-muted-foreground">Confirming payment…</p>
        <p className="text-sm text-muted-foreground">This page will update when your session is ready.</p>
      </div>
    );
  }

  if (status === "ENDED" || status === "CANCELLED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="font-medium">Session ended</p>
            <p className="text-sm text-muted-foreground mt-1">You can start a new session anytime.</p>
            <Button asChild className="mt-4">
              <Link href="/parent/homework">Back to homework</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {assistantType === "SUNSHINE" ? (
            <>
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-amber-200">
                <Image src={SUNSHINE_AVATAR_URL} alt="Sunshine" fill className="object-cover" sizes="32px" />
              </div>
              <span className="font-semibold">Sunshine</span>
            </>
          ) : (
            <>
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-blue-200">
                <Image src={JACK_AVATAR_URL} alt="Jack" fill className="object-cover" sizes="32px" />
              </div>
              <span className="font-semibold">Jack</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {streak != null && streak > 0 && (
            <span className="text-sm text-muted-foreground">🔥 {streak} day streak</span>
          )}
          {timeLeft !== null && (
            <span className={`rounded px-2 py-1 text-sm font-mono ${timeLeft === "0:00" ? "bg-red-100 text-red-800" : "bg-slate-100"}`}>
              {timeLeft}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  m.role === "USER"
                    ? "bg-teal-500 text-white"
                    : assistantType === "SUNSHINE"
                    ? "bg-amber-50 text-slate-900 border border-amber-100"
                    : "bg-blue-50 text-slate-900 border border-blue-100"
                }`}
              >
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt="Uploaded" className="mb-2 max-h-40 rounded-lg object-contain" />
                )}
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                {m.role === "ASSISTANT" && (
                  <button
                    type="button"
                    onClick={() => playSpeech(m.content)}
                    className="mt-2 flex items-center gap-1 text-xs opacity-80 hover:opacity-100"
                  >
                    <Volume2 className="h-3 w-3" /> Play
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-white p-4">
        <div className="mx-auto max-w-2xl">
          {badges.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {badges.slice(-3).map((b) => {
                const def = BADGES.find((x) => x.id === b.badgeId);
                return (
                  <span key={b.badgeId} className="rounded bg-amber-100 px-2 py-0.5 text-xs">
                    {def?.emoji} {def?.name}
                  </span>
                );
              })}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </form>
          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => sendMessage(undefined, undefined, true)}
              disabled={panicSent || sending}
            >
              <AlertCircle className="mr-1 h-4 w-4" /> Panic button
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
