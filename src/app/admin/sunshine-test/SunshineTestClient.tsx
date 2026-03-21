"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Volume2, MessageCircle, Loader2, Zap } from "lucide-react";

type Tab = "speak" | "ask" | "jack";

export default function SunshineTestClient() {
  const [tab, setTab] = useState<Tab>("ask");
  const [speakText, setSpeakText] = useState("Hello! I'm Sunshine. Ask me a question or let's read a book together.");
  const [askQuestion, setAskQuestion] = useState("What is the capital of Australia?");
  const [askSubject, setAskSubject] = useState("English");
  const [jackSpeakText, setJackSpeakText] = useState("Nice one! Let's break this down step by step.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function playAudioFromResponse(res: Response) {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Request failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    }
  }

  async function handleSpeak() {
    const text = speakText.trim();
    if (!text) {
      setError("Enter some text to speak.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sunshine/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      await playAudioFromResponse(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speak failed");
    }
    setLoading(false);
  }

  async function handleAsk() {
    const question = askQuestion.trim();
    if (!question) {
      setError("Enter a question.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sunshine/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          subject: askSubject,
          studentId: null,
        }),
      });
      await playAudioFromResponse(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ask Sunshine failed");
    }
    setLoading(false);
  }

  async function handleJackSpeak() {
    const text = jackSpeakText.trim();
    if (!text) {
      setError("Enter text for Jack.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, assistant: "JACK" }),
      });
      await playAudioFromResponse(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Jack speak failed");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => { setTab("speak"); setError(null); }}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === "speak" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-600 hover:text-slate-900"}`}
        >
          Sunshine: Type & Speak
        </button>
        <button
          type="button"
          onClick={() => { setTab("ask"); setError(null); }}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === "ask" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-600 hover:text-slate-900"}`}
        >
          Ask Sunshine
        </button>
        <button
          type="button"
          onClick={() => { setTab("jack"); setError(null); }}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === "jack" ? "border-blue-500 text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900"}`}
        >
          Test Jack
        </button>
      </div>

      {tab === "speak" && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="h-5 w-5 text-amber-600" />
              Type & Speak
            </CardTitle>
            <CardDescription>
              Type any text and hear it in the locked Sunshine voice (TTS only).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="speak-text">Text to speak</Label>
              <textarea
                id="speak-text"
                className="min-h-[120px] w-full rounded-lg border-2 border-amber-200 bg-white px-3 py-2 text-sm"
                placeholder="Enter text..."
                value={speakText}
                onChange={(e) => setSpeakText(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="button"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={handleSpeak}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
              Speak
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === "ask" && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-amber-600" />
              Ask Sunshine
            </CardTitle>
            <CardDescription>
              Ask a question; Sunshine answers with OpenAI + the locked voice (admin bypass, no payment).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ask-subject">Subject</Label>
              <Input
                id="ask-subject"
                className="max-w-xs"
                value={askSubject}
                onChange={(e) => setAskSubject(e.target.value)}
                placeholder="English"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ask-question">Question</Label>
              <textarea
                id="ask-question"
                className="min-h-[80px] w-full rounded-lg border-2 border-amber-200 bg-white px-3 py-2 text-sm"
                placeholder="e.g. What is photosynthesis?"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="button"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={handleAsk}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sun className="mr-2 h-4 w-4" />}
              Ask Sunshine
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === "jack" && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-600" />
              Test Jack (voice)
            </CardTitle>
            <CardDescription>
              Type text and hear it in Jack&apos;s voice (confident male). TTS only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jack-text">Text for Jack</Label>
              <textarea
                id="jack-text"
                className="min-h-[100px] w-full rounded-lg border-2 border-blue-200 bg-white px-3 py-2 text-sm"
                placeholder="e.g. Nice one! Let's break this down step by step."
                value={jackSpeakText}
                onChange={(e) => setJackSpeakText(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleJackSpeak}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
              Jack speak
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="rounded-lg border bg-white p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Playback</p>
        <audio ref={audioRef} controls className="w-full" />
      </div>
    </div>
  );
}
