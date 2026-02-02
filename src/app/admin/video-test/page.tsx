"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { VideoTestRoom } from "./video-test-room";

export default function AdminVideoTestPage() {
  const [roomName, setRoomName] = useState<string | null>(null);
  const [joinToken, setJoinToken] = useState<{ token: string; roomName: string; role: "teacher" | "student" } | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<"teacher" | "student" | null>(null);

  async function createRoom() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/video-test?action=create", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create room");
      setRoomName(data.roomName);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function joinAs(role: "teacher" | "student") {
    if (!roomName) {
      alert("Create a test room first");
      return;
    }
    setJoining(role);
    try {
      const res = await fetch(`/api/admin/video-test?action=token&roomName=${encodeURIComponent(roomName)}&role=${role}`, { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get token");
      setJoinToken({ token: data.token, roomName: data.roomName, role });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
      setJoining(null);
    }
  }

  if (joinToken) {
    return (
      <VideoTestRoom
        token={joinToken.token}
        roomName={joinToken.roomName}
        role={joinToken.role}
        onLeave={() => setJoinToken(null)}
      />
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900">← Admin</Link>
        <h1 className="text-2xl font-bold mt-2">Video call test</h1>
        <p className="text-muted-foreground mt-1">
          Create a test room and join as Teacher or Student to validate Twilio Video.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Test room</CardTitle>
          <CardDescription>
            {roomName ? `Room: ${roomName}` : "Create a room, then join in two tabs (teacher + student)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={createRoom} disabled={creating}>
            {creating ? "Creating…" : "Create test room"}
          </Button>
          {roomName && (
            <>
              <Button variant="outline" onClick={() => joinAs("teacher")} disabled={joining !== null}>
                {joining === "teacher" ? "Joining…" : "Join as Teacher"}
              </Button>
              <Button variant="outline" onClick={() => joinAs("student")} disabled={joining !== null}>
                {joining === "student" ? "Joining…" : "Join as Student"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
