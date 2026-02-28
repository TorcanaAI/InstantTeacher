"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ExtendSessionButton from "@/components/ExtendSessionButton";

/**
 * Daily Prebuilt embed: iframe with roomUrl + token.
 * Token is fetched server-side via /api/video/create-session; API key never exposed.
 * Role should be passed as ?role=teacher or ?role=student so we call create-session once.
 */
export default function SessionVideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = typeof params.id === "string" ? params.id : "";
  const roleParam = searchParams.get("role");
  const role: "teacher" | "student" | null =
    roleParam === "teacher" ? "teacher" : roleParam === "student" ? "student" : null;
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState<"teacher" | "student" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setError("Missing session");
      setLoading(false);
      return;
    }
    if (!role) {
      setError("Missing role. Use ?role=teacher or ?role=student");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/video/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to join video session");
        setLoading(false);
        return;
      }
      setRoomUrl(data.roomUrl);
      setToken(data.token);
      setResolvedRole(role);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [sessionId, role]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const leaveUrl = resolvedRole === "teacher" ? "/teacher/dashboard" : "/dashboard";

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-white">
        <p className="text-lg">Loading video session…</p>
      </div>
    );
  }

  if (error || !roomUrl || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-white">
        <h1 className="text-2xl font-bold">InstantTeacher Video Session</h1>
        <p className="mt-4 rounded-lg bg-red-900/50 p-4 text-center text-red-100">
          {error ?? "Missing room or token"}
        </p>
        <Button asChild className="mt-6" variant="secondary">
          <Link href={sessionId ? `/session/${sessionId}` : "/dashboard"}>Back to session</Link>
        </Button>
      </div>
    );
  }

  const iframeSrc = `${roomUrl}?t=${encodeURIComponent(token)}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
        <h1 className="text-lg font-semibold text-white">InstantTeacher Video Session</h1>
        <div className="flex items-center gap-2">
          {resolvedRole === "teacher" && <ExtendSessionButton sessionId={sessionId} />}
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-slate-700">
            <Link href={leaveUrl}>Leave Call</Link>
          </Button>
        </div>
      </header>
      <iframe
        src={iframeSrc}
        allow="camera; microphone; autoplay; fullscreen"
        className="h-full min-h-[calc(100vh-56px)] w-full flex-1 border-0"
        title="Daily video call"
      />
    </div>
  );
}
