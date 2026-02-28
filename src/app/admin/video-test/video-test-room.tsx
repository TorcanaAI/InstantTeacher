"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function VideoTestRoom({
  token,
  roomName,
  role,
  onLeave,
}: {
  token: string;
  roomName: string;
  role: "teacher" | "student";
  onLeave: () => void;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (room as any).on("participantConnected", (participant: { trackPublications?: Map<string, { track?: { attach?: (el: HTMLElement) => void } }> }) => {
          if (participant.trackPublications && remoteRef.current) {
            participant.trackPublications.forEach((pub) => {
              if (pub.track?.attach) {
                const el = document.createElement("div");
                remoteRef.current!.appendChild(el);
                pub.track.attach(el);
              }
            });
          }
        });
        if (mounted) setStatus("connected");
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to join");
          setStatus("error");
        }
      }
    })();
    return () => {
      mounted = false;
      const room = roomRef.current as { disconnect?: () => void } | null;
      if (room?.disconnect) room.disconnect();
    };
  }, [token, roomName]);

  if (status === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={onLeave}>Back to test</Button>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p>Connecting as {role}…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-slate-800 px-4 py-2 text-white">
        <span>Video test · {role} · {roomName}</span>
        <Button variant="destructive" size="sm" onClick={onLeave}>Leave</Button>
      </header>
      <div className="flex flex-1 gap-4 p-4">
        <div ref={localRef} className="w-1/2 rounded-lg border bg-slate-800 p-2">
          <p className="text-xs text-slate-400">You ({role})</p>
        </div>
        <div ref={remoteRef} className="w-1/2 rounded-lg border bg-slate-800 p-2">
          <p className="text-xs text-slate-400">Remote</p>
        </div>
      </div>
    </div>
  );
}
