"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  sessionId: string;
  role: "teacher" | "student";
  durationMinutes: number;
  studentName: string;
  teacherName: string;
  waitingForTeacher?: boolean;
}

type ConnectionStatus = "loading" | "waiting_for_teacher" | "teacher_joined" | "call_connected" | "reconnecting" | "error";

export default function SessionRoom({ sessionId, role, durationMinutes, studentName, teacherName, waitingForTeacher = false }: Props) {
  const router = useRouter();
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(durationMinutes * 60);
  const [started, setStarted] = useState(false);
  const [remoteParticipantCount, setRemoteParticipantCount] = useState(0);
  const roomRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/session/${sessionId}/token`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to join");
          setStatus("error");
          return;
        }
        const { token, roomName } = data;

        const twilioVideo = await import("twilio-video");
        const { connect, createLocalTracks } = twilioVideo;
        let tracks: unknown[] = [];
        try {
          tracks = await createLocalTracks({ audio: true, video: true });
        } catch {
          tracks = await createLocalTracks({ audio: true, video: false });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const room = await connect(token, { name: roomName, tracks } as any);
        roomRef.current = room;

        const localPart = (room as { localParticipant?: { trackPublications?: Map<string, { track?: { attach?: (el: HTMLElement) => void } }> } }).localParticipant;
        if (localPart?.trackPublications && localRef.current) {
          localPart.trackPublications.forEach((pub) => {
            const track = pub.track;
            if (track?.attach) {
              const el = document.createElement("div");
              localRef.current!.appendChild(el);
              track.attach(el);
            }
          });
        }

        const updateRemoteCount = () => {
          const r = roomRef.current as { participants?: Map<string, unknown> } | null;
          const count = r?.participants?.size ?? 0;
          setRemoteParticipantCount(count);
          if (mounted) {
            if (count > 0) setStatus((s) => (s === "waiting_for_teacher" ? "teacher_joined" : "call_connected"));
            else if (role === "student" && waitingForTeacher) setStatus("waiting_for_teacher");
          }
        };

        room.on("participantConnected", (participant: { sid: string; trackPublications?: Map<string, { track?: { attach?: (el: HTMLElement) => void } }> }) => {
          if (participant.trackPublications && remoteRef.current) {
            participant.trackPublications.forEach((pub) => {
              if (pub.track?.attach) {
                const el = document.createElement("div");
                el.id = `remote-${participant.sid}`;
                remoteRef.current!.appendChild(el);
                pub.track.attach(el);
              }
            });
          }
          updateRemoteCount();
        });
        room.on("participantDisconnected", () => updateRemoteCount());
        room.on("reconnecting", () => mounted && setStatus("reconnecting"));
        room.on("reconnected", () => mounted && setStatus("call_connected"));

        const initialRemote = (room as { participants?: Map<string, unknown> }).participants?.size ?? 0;
        if (mounted) {
          setStarted(true);
          if (role === "student" && waitingForTeacher && initialRemote === 0) {
            setStatus("waiting_for_teacher");
          } else if (initialRemote > 0) {
            setStatus(role === "student" ? "teacher_joined" : "call_connected");
          } else {
            setStatus("call_connected");
          }
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to join");
          setStatus("error");
        }
      }
    })();
    return () => {
      mounted = false;
      const room = roomRef.current as { disconnect: () => void } | null;
      if (room?.disconnect) room.disconnect();
    };
  }, [sessionId, role, waitingForTeacher]);

  useEffect(() => {
    if (!started || status !== "connected") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          router.push(`/session/${sessionId}/end`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, status, sessionId, router]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Could not join</CardTitle>
            <CardContent className="p-0 pt-2">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/parent/dashboard")}>
                Back to dashboard
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusMessage =
    status === "loading"
      ? "Joining…"
      : status === "waiting_for_teacher"
        ? "Waiting for teacher…"
        : status === "teacher_joined"
          ? "Teacher joined"
          : status === "call_connected"
            ? "Call connected"
            : status === "reconnecting"
              ? "Reconnecting…"
              : null;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-white">
        <p>Joining session…</p>
        <p className="text-sm text-slate-400">{statusMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2 text-white">
        <div className="flex flex-col gap-0.5">
          <span>
            {role === "teacher" ? studentName : teacherName} · {mins}:{secs.toString().padStart(2, "0")} left
          </span>
          {statusMessage && (
            <span className="text-xs font-medium text-green-400">{statusMessage}</span>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => router.push("/parent/dashboard")}
        >
          End session
        </Button>
      </header>
      <div className="flex flex-1 gap-4 p-4">
        <div ref={localRef} className="w-1/2 rounded-lg border border-slate-600 bg-slate-800" />
        <div ref={remoteRef} className="w-1/2 rounded-lg border border-slate-600 bg-slate-800" />
      </div>
    </div>
  );
}
