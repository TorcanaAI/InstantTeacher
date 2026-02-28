"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, BookOpen, Volume2, Mic, MicOff } from "lucide-react";

const READING_MINUTES = 12;
const COMPREHENSION_MINUTES = 5;
const CHUNK_MS = 2000; // Send audio to transcribe every 2 seconds so Sunshine responds quickly
const ENCOURAGEMENT_EVERY_WORDS = 20; // Sunshine says a short encouragement every N words

function tokenizeBookText(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

function normalizeWord(w: string): string {
  return w.replace(/[.,!?;:'"()]/g, "").toLowerCase().trim();
}

/** Edit distance (Levenshtein) for fuzzy match. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** Exact or close match so STT slip-ups don't trigger false corrections. */
function wordsMatch(a: string, b: string): boolean {
  const na = normalizeWord(a);
  const nb = normalizeWord(b);
  if (na === nb) return true;
  if (na.length === 0 || nb.length === 0) return false;
  const maxDist = na.length <= 4 ? 1 : 2;
  return editDistance(na, nb) <= maxDist;
}

type ReadingContext = {
  bookTitle: string;
  contentText: string;
  pdfUrl: string | null;
};

type ComprehensionQuestion = { question: string; options?: string[] };

function getParamsFromUrl(): { sessionId: string | null; studentId: string | null } {
  if (typeof window === "undefined") return { sessionId: null, studentId: null };
  const params = new URLSearchParams(window.location.search);
  return {
    sessionId: params.get("sessionId"),
    studentId: params.get("studentId"),
  };
}

/** Build a WAV blob from mono Float32 PCM (so ElevenLabs STT accepts it; webm chunks are often invalid). */
function float32ToWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataLength = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const write = (offset: number, value: string | number, type: "string" | "uint32" | "uint16" = "uint32") => {
    if (type === "string") {
      for (let i = 0; i < (value as string).length; i++) view.setUint8(offset + i, (value as string).charCodeAt(i));
    } else if (type === "uint32") view.setUint32(offset, value as number, true);
    else view.setUint16(offset, value as number, true);
  };
  write(0, "RIFF", "string");
  write(4, 36 + dataLength);
  write(8, "WAVE", "string");
  write(12, "fmt ", "string");
  write(16, 16);
  write(20, 1, "uint16");
  write(22, numChannels, "uint16");
  write(24, sampleRate);
  write(28, sampleRate * numChannels * bytesPerSample);
  write(32, numChannels * bytesPerSample, "uint16");
  write(34, bitsPerSample, "uint16");
  write(36, "data", "string");
  write(40, dataLength);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function SunshineReadingContent() {
  const searchParams = useSearchParams();
  const [urlFallback, setUrlFallback] = useState<{ sessionId: string | null; studentId: string | null } | null>(null);
  const sessionIdFromUrl = searchParams.get("sessionId") ?? urlFallback?.sessionId ?? null;
  const studentId = searchParams.get("studentId") ?? urlFallback?.studentId ?? null;
  const [sessionIdFromApi, setSessionIdFromApi] = useState<string | null>(null);
  const sessionId = sessionIdFromUrl ?? sessionIdFromApi;
  const [phase, setPhase] = useState<"reading" | "comprehension" | "done">("reading");
  const [secondsLeft, setSecondsLeft] = useState(READING_MINUTES * 60);
  const [started, setStarted] = useState(!!sessionIdFromUrl);

  // Fallback: if searchParams are empty (e.g. after full-page nav before hydrate), read from window.location once
  useEffect(() => {
    if ((!sessionIdFromUrl && !studentId) && typeof window !== "undefined") {
      const fromUrl = getParamsFromUrl();
      if (fromUrl.sessionId || fromUrl.studentId) setUrlFallback(fromUrl);
    }
  }, [sessionIdFromUrl, studentId]);
  const [context, setContext] = useState<ReadingContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [comprehensionQuestions, setComprehensionQuestions] = useState<ComprehensionQuestion[]>([]);
  const [comprehensionIndex, setComprehensionIndex] = useState(0);
  const [playingQuestion, setPlayingQuestion] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [correctionMessage, setCorrectionMessage] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [volumeBars, setVolumeBars] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wordsRef = useRef<string[]>([]);
  const currentWordIndexRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const pcmBufferRef = useRef<Float32Array | null>(null);
  const pcmIndexRef = useRef(0);
  const chunkQueueRef = useRef<Blob[]>([]);
  const transcribeInFlightRef = useRef(false);
  const playingCorrectionRef = useRef(false);
  const processNextChunkRef = useRef<() => void>(() => {});
  const lastWordAdvancedAtRef = useRef<number>(0);
  const needHelpCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bookTextContainerRef = useRef<HTMLDivElement>(null);
  const currentWordSpanRef = useRef<HTMLSpanElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimationRef = useRef<number>(0);
  const wordsSinceEncouragementRef = useRef(0);
  const NUM_VOLUME_BARS = 12;

  // Sync started when sessionId is available from URL or fallback (e.g. after full-page nav or client nav)
  useEffect(() => {
    if (sessionIdFromUrl ?? urlFallback?.sessionId) setStarted(true);
  }, [sessionIdFromUrl, urlFallback?.sessionId]);

  // When we have sessionId in URL we're already started. Otherwise claim/start session (parent or admin).
  useEffect(() => {
    if (sessionIdFromUrl || !studentId || started) return;
    (async () => {
      const res = await fetch("/api/sunshine/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (data.sessionId) setSessionIdFromApi(data.sessionId);
      setStarted(true);
    })();
  }, [sessionIdFromUrl, studentId, started]);

  // Fetch reading context (book content, PDF URL) when we have sessionId
  useEffect(() => {
    if (!sessionId || !started) return;
    setContextError(null);
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/sunshine/reading-context?sessionId=${encodeURIComponent(sessionId)}`, { credentials: "same-origin" });
      if (cancelled) return;
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setContextError(data.error ?? `Failed to load book (${res.status})`);
        return;
      }
      const data = await res.json();
      if (!cancelled) {
        const ctx = { bookTitle: data.bookTitle ?? "", contentText: data.contentText ?? "", pdfUrl: data.pdfUrl ?? null };
        setContext(ctx);
        const words = tokenizeBookText(ctx.contentText);
        wordsRef.current = words;
        currentWordIndexRef.current = 0;
        setCurrentWordIndex(0);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, started]);

  // Intro is played only when user clicks "Start listening" (user gesture required for audio to play in browsers)

  useEffect(() => {
    if (phase === "done") return;
    const total = phase === "reading" ? READING_MINUTES * 60 : COMPREHENSION_MINUTES * 60;
    setSecondsLeft(total);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase((p) => (p === "reading" ? "comprehension" : "done"));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  async function playTTS(text: string) {
    setPlayingQuestion(true);
    try {
      const res = await fetch("/api/sunshine/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } finally {
      setPlayingQuestion(false);
    }
  }

  const playCorrectionTTS = useCallback(async (text: string) => {
    if (playingCorrectionRef.current) return;
    playingCorrectionRef.current = true;
    setCorrectionMessage(text);
    try {
      const res = await fetch("/api/sunshine/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await new Promise<void>((resolve) => {
          if (!audioRef.current) return resolve();
          audioRef.current.onended = () => resolve();
          audioRef.current.onerror = () => resolve();
          audioRef.current.play().catch(resolve);
        });
      }
    } finally {
      playingCorrectionRef.current = false;
      setCorrectionMessage(null);
    }
  }, []);

  const processTranscript = useCallback(
    async (transcript: string) => {
      const words = wordsRef.current;
      let idx = currentWordIndexRef.current;
      if (words.length === 0 || idx >= words.length) return;

      const saidWords = tokenizeBookText(transcript);
      for (const saidWord of saidWords) {
        if (saidWord.length === 0) continue;
        const expected = words[idx];
        if (!expected) break;
        if (wordsMatch(saidWord, expected)) {
          idx += 1;
          currentWordIndexRef.current = idx;
          setCurrentWordIndex(idx);
          lastWordAdvancedAtRef.current = Date.now();
          wordsSinceEncouragementRef.current += 1;
          if (wordsSinceEncouragementRef.current >= ENCOURAGEMENT_EVERY_WORDS) {
            wordsSinceEncouragementRef.current = 0;
            if (!playingCorrectionRef.current && audioRef.current) {
              const phrases = ["You're doing great!", "Nice reading!", "Keep going!", "I'm right here with you."];
              const msg = phrases[Math.floor(Math.random() * phrases.length)];
              fetch("/api/sunshine/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ text: msg }),
              })
                .then((r) => r.ok ? r.blob() : null)
                .then((blob) => {
                  if (!blob || playingCorrectionRef.current) return;
                  const url = URL.createObjectURL(blob);
                  if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play().catch(() => {});
                  }
                })
                .catch(() => {});
            }
          }
        } else {
          const res = await fetch("/api/sunshine/reading-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ said: saidWord, expected }),
          });
          if (res.ok) {
            const data = await res.json();
            const correction = data.correction ?? `Try saying "${expected}".`;
            await playCorrectionTTS(correction);
            if (data.wordToSpeak && typeof data.wordToSpeak === "string") {
              const wordRes = await fetch("/api/sunshine/speak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ text: data.wordToSpeak }),
              });
              if (wordRes.ok) {
                const wordBlob = await wordRes.blob();
                const wordUrl = URL.createObjectURL(wordBlob);
                if (audioRef.current) {
                  audioRef.current.src = wordUrl;
                  await new Promise<void>((resolve) => {
                    if (!audioRef.current) return resolve();
                    audioRef.current.onended = () => resolve();
                    audioRef.current.onerror = () => resolve();
                    audioRef.current.play().catch(resolve);
                  });
                }
              }
            }
          }
          idx += 1;
          currentWordIndexRef.current = idx;
          setCurrentWordIndex(idx);
          lastWordAdvancedAtRef.current = Date.now();
        }
      }
    },
    [playCorrectionTTS]
  );

  const processNextChunk = useCallback(async () => {
    if (transcribeInFlightRef.current || chunkQueueRef.current.length === 0) return;
    const blob = chunkQueueRef.current.shift()!;
    transcribeInFlightRef.current = true;
    setTranscribeError(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "chunk.wav");
      const res = await fetch("/api/sunshine/transcribe", { method: "POST", credentials: "same-origin", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTranscribeError(data.error ?? `Listening failed (${res.status}). Set ELEVENLABS_API_KEY for speech-to-text.`);
        return;
      }
      const text = (data.text ?? "").trim();
      if (text) {
        setLastTranscript(text);
        await processTranscript(text);
      }
    } finally {
      transcribeInFlightRef.current = false;
      if (chunkQueueRef.current.length > 0) {
        processNextChunkRef.current();
      }
    }
  }, [processTranscript]);

  processNextChunkRef.current = processNextChunk;

  const startListening = useCallback(async () => {
    setVoiceError(null);
    setTranscribeError(null);
    try {
      lastWordAdvancedAtRef.current = Date.now();
      const intro = "Hi! I'm Sunshine. I'm right here with you. Read aloud from the page — I'll follow along and if you say a word wrong, I'll gently correct you. If you're stuck, I'll help. Let's go!";
      const goRes = await fetch("/api/sunshine/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text: intro }),
      });
      if (goRes.ok) {
        const blob = await goRes.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          await new Promise<void>((resolve) => {
            if (!audioRef.current) return resolve();
            audioRef.current.onended = () => resolve();
            audioRef.current.onerror = () => resolve();
            audioRef.current.play().catch(resolve);
          });
        }
      } else {
        const errData = await goRes.json().catch(() => ({}));
        setVoiceError(errData.error ?? "Sunshine voice isn't available. Set ELEVENLABS_API_KEY in Vercel.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setListening(true);
      setVolumeBars(Array(NUM_VOLUME_BARS).fill(0));
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      const sampleRate = ctx.sampleRate;
      const samplesPerChunk = Math.floor(sampleRate * (CHUNK_MS / 1000));
      pcmBufferRef.current = new Float32Array(samplesPerChunk);
      pcmIndexRef.current = 0;
      const scriptNode = ctx.createScriptProcessor(4096, 1, 1);
      scriptNodeRef.current = scriptNode;
      source.connect(scriptNode);
      scriptNode.connect(ctx.destination);
      scriptNode.onaudioprocess = (e: AudioProcessingEvent) => {
        const buf = pcmBufferRef.current;
        if (!buf) return;
        const input = e.inputBuffer.getChannelData(0);
        for (let i = 0; i < input.length; i++) {
          buf[pcmIndexRef.current++] = input[i];
          if (pcmIndexRef.current >= buf.length) {
            const wavBlob = float32ToWavBlob(buf, sampleRate);
            chunkQueueRef.current.push(wavBlob);
            processNextChunkRef.current();
            pcmIndexRef.current = 0;
          }
        }
      };
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current || !audioContextRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / NUM_VOLUME_BARS);
        const bars = Array.from({ length: NUM_VOLUME_BARS }, (_, i) => {
          const start = i * step;
          let sum = 0;
          for (let j = 0; j < step && start + j < dataArray.length; j++) sum += dataArray[start + j];
          return Math.min(100, Math.round((sum / step) * 1.2));
        });
        setVolumeBars(bars);
        volumeAnimationRef.current = requestAnimationFrame(updateVolume);
      };
      volumeAnimationRef.current = requestAnimationFrame(updateVolume);
    } catch (err) {
      console.error("Mic access failed:", err);
      setVoiceError(err instanceof Error ? err.message : "Microphone access failed.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (volumeAnimationRef.current) {
      cancelAnimationFrame(volumeAnimationRef.current);
      volumeAnimationRef.current = 0;
    }
    scriptNodeRef.current?.disconnect();
    scriptNodeRef.current = null;
    pcmBufferRef.current = null;
    pcmIndexRef.current = 0;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setVolumeBars([]);
    if (needHelpCheckIntervalRef.current) {
      clearInterval(needHelpCheckIntervalRef.current);
      needHelpCheckIntervalRef.current = null;
    }
    const stream = streamRef.current;
    stream?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setListening(false);
  }, []);

  // When listening, offer help if no progress for 8 seconds (Sunshine asks "Do you need help with this word?")
  useEffect(() => {
    if (!listening || !context?.contentText) return;
    const NEED_HELP_INTERVAL_MS = 8000;
    needHelpCheckIntervalRef.current = setInterval(async () => {
      if (playingCorrectionRef.current) return;
      const words = wordsRef.current;
      const idx = currentWordIndexRef.current;
      if (idx >= words.length) return;
      const elapsed = Date.now() - lastWordAdvancedAtRef.current;
      if (elapsed < NEED_HELP_INTERVAL_MS) return;
      lastWordAdvancedAtRef.current = Date.now();
      const expected = words[idx];
      const res = await fetch("/api/sunshine/reading-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ expected, needHelp: true }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const correction = data.correction ?? `Would you like help? The word is "${expected}".`;
      await playCorrectionTTS(correction);
      if (data.wordToSpeak && typeof data.wordToSpeak === "string") {
        const wordRes = await fetch("/api/sunshine/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ text: data.wordToSpeak }),
        });
        if (wordRes.ok) {
          const wordBlob = await wordRes.blob();
          const wordUrl = URL.createObjectURL(wordBlob);
          if (audioRef.current) {
            audioRef.current.src = wordUrl;
            audioRef.current.play().catch(() => {});
          }
        }
      }
    }, NEED_HELP_INTERVAL_MS);
    return () => {
      if (needHelpCheckIntervalRef.current) {
        clearInterval(needHelpCheckIntervalRef.current);
        needHelpCheckIntervalRef.current = null;
      }
    };
  }, [listening, context?.contentText, playCorrectionTTS]);

  useEffect(() => {
    return () => {
      if (volumeAnimationRef.current) cancelAnimationFrame(volumeAnimationRef.current);
      scriptNodeRef.current?.disconnect();
      audioContextRef.current?.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (needHelpCheckIntervalRef.current) {
        clearInterval(needHelpCheckIntervalRef.current);
      }
    };
  }, []);

  // Scroll current word into view so the text panel follows along with what they're reading
  useEffect(() => {
    currentWordSpanRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentWordIndex]);

  function startComprehension() {
    setPhase("comprehension");
    setSecondsLeft(COMPREHENSION_MINUTES * 60);
  }

  // When entering comprehension phase, fetch questions and play first
  useEffect(() => {
    if (phase !== "comprehension" || !sessionId || comprehensionQuestions.length > 0) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/sunshine/comprehension-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const questions = data.questions ?? [];
      if (cancelled) return;
      setComprehensionQuestions(questions);
      setComprehensionIndex(0);
      if (questions.length > 0) {
        await playTTS(questions[0].question);
      }
    })();
    return () => { cancelled = true; };
  }, [phase, sessionId, comprehensionQuestions.length]);

  async function handleNextQuestion() {
    if (comprehensionIndex + 1 < comprehensionQuestions.length) {
      const next = comprehensionIndex + 1;
      setComprehensionIndex(next);
      await playTTS(comprehensionQuestions[next].question);
    } else {
      await handleComplete();
    }
  }

  async function handleComplete() {
    if (!sessionId) return;
    await fetch("/api/sunshine/complete-reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sessionId }),
    });
    setPhase("done");
  }

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const timeStr = `${m}:${s.toString().padStart(2, "0")}`;

  if (!sessionId || !studentId) {
    const loadingParams = sessionId || studentId;
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            {loadingParams ? (
              <p className="text-muted-foreground">Loading session…</p>
            ) : (
              <>
                <p className="text-destructive">Missing session or student. Use the back button and try again, or go to dashboard.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Back
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/parent/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/sunshine-reading-test">Admin: Reading test</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contextError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive">{contextError}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The session may be invalid or the book may have no content. Try starting again from the reading test page.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              <Button asChild variant="outline">
                <Link href="/admin/sunshine-reading-test">Admin: Reading test</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/parent/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
        <Card className="w-full max-w-md border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-6 w-6 text-amber-500" />
              <CardTitle>Reading session complete</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Great job! Sunshine listened while you read, gave gentle corrections, and asked comprehension questions. No audio is stored.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/parent/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "comprehension") {
    const current = comprehensionQuestions[comprehensionIndex];
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-amber-500" />
                Comprehension
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Question {comprehensionIndex + 1} of {comprehensionQuestions.length || 1}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio ref={audioRef} onEnded={() => setPlayingQuestion(false)} />
              {current ? (
                <>
                  <p className="text-lg font-medium">{current.question}</p>
                  {current.options && current.options.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {current.options.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => playTTS(current.question)} disabled={playingQuestion}>
                      {playingQuestion ? "Playing…" : "Play question again"}
                    </Button>
                    <Button onClick={handleNextQuestion}>
                      {comprehensionIndex + 1 < comprehensionQuestions.length ? "Next question" : "Finish"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No questions loaded.</p>
              )}
              <div className="font-mono text-amber-600">{timeStr}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reading phase: show PDF (if any), book text, timer, End reading
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Sunshine presence: clear banner when she's listening */}
        {listening && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200">
              <Sun className="h-5 w-5 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-900">Sunshine is listening</p>
              <p className="text-sm text-amber-800">
                Read aloud — she's following along, will correct words if needed, and will offer help if you're stuck.
              </p>
            </div>
            <div className="flex items-end gap-0.5 h-8 shrink-0">
              {volumeBars.length === NUM_VOLUME_BARS
                ? volumeBars.map((level, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-amber-500 transition-all duration-75 ease-out min-h-[4px]"
                      style={{ height: `${Math.max(4, (level / 100) * 28)}px` }}
                    />
                  ))
                : null}
            </div>
          </div>
        )}

        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-500" />
              <CardTitle>{context?.bookTitle ?? "Reading with Sunshine"}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {listening
                ? "Sunshine is with you. Keep reading from the book — the highlight shows where she thinks you are."
                : "Click the button below to start. Sunshine will say hello, then listen to every word you read and help when you're stuck."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {context && !context.contentText?.trim() && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2">
                This book has no text for Sunshine to follow. Add the book text in Admin → Books → Edit (paste the story content so Sunshine can listen and correct).
              </p>
            )}
            {context && context.contentText?.trim() && tokenizeBookText(context.contentText).length === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2">
                Book text is empty. Add content in Admin → Books so Sunshine can follow and correct.
              </p>
            )}
            {context?.contentText?.trim() && context.contentText.includes("[Paste content") && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2">
                This book still has placeholder text. Replace it with the real book content in Admin → Books → Edit so Sunshine can follow what you read and correct you.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-2xl font-bold text-amber-600">{timeStr}</span>
              <div className="flex items-center gap-2">
                {listening ? (
                  <Button variant="secondary" onClick={stopListening}>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop listening
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="default"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={startListening}
                    disabled={!context?.contentText?.trim() || tokenizeBookText(context?.contentText ?? "").length === 0}
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start reading with Sunshine
                  </Button>
                )}
                <Button onClick={() => startComprehension()}>End reading → Comprehension</Button>
              </div>
            </div>
            {listening && (
              <div className="rounded-md bg-slate-100 px-3 py-2">
                <p className="text-xs font-medium text-slate-500">What Sunshine heard:</p>
                <p className="text-sm text-slate-800 min-h-[1.25rem]">
                  {lastTranscript || "Listening…"}
                </p>
              </div>
            )}
            {voiceError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
                {voiceError}
              </p>
            )}
            {transcribeError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
                Listening: {transcribeError}
              </p>
            )}
            {correctionMessage && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1">
                <Sun className="inline h-4 w-4 mr-1 text-amber-500" />
                Sunshine: {correctionMessage}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {context?.pdfUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">View PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src={context.pdfUrl}
                  title={context.bookTitle}
                  className="w-full h-[500px] rounded border bg-white"
                />
              </CardContent>
            </Card>
          )}
          <Card className={context?.pdfUrl ? "" : "lg:col-span-2"}>
            <CardHeader>
              <CardTitle className="text-base">Book text</CardTitle>
              {context?.contentText && (() => {
                const words = tokenizeBookText(context.contentText);
                return words.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Word {Math.min(currentWordIndex + 1, words.length)} of {words.length}
                  </p>
                ) : null;
              })()}
            </CardHeader>
            <CardContent>
              <div ref={bookTextContainerRef} className="max-h-[500px] overflow-y-auto text-sm text-slate-700">
                {context?.contentText ? (
                  tokenizeBookText(context.contentText).map((word, i) =>
                    i === currentWordIndex ? (
                      <mark
                        key={i}
                        ref={currentWordSpanRef}
                        className="bg-amber-200 rounded px-0.5"
                      >
                        {word}{" "}
                      </mark>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )
                ) : (
                  "Loading…"
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="ghost">
            <Link href="/parent/dashboard">Exit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SunshineReadingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SunshineReadingContent />
    </Suspense>
  );
}
