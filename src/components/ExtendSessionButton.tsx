"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extendSession } from "@/app/actions/session-extension";
import { toast } from "sonner";

interface ExtendSessionButtonProps {
  sessionId: string;
}

const EXTENSION_OPTIONS = [
  { minutes: 10, label: "10 minutes", priceCents: 2000 },
  { minutes: 15, label: "15 minutes", priceCents: 3000 },
  { minutes: 30, label: "30 minutes", priceCents: 6000 },
] as const;

const MAX_TOTAL_EXTENSION_MINUTES = 60;

export default function ExtendSessionButton({ sessionId }: ExtendSessionButtonProps) {
  const [open, setOpen] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);
  const [extending, setExtending] = useState(false);
  const [sessionData, setSessionData] = useState<{
    startedAt: string;
    durationMinutes: number;
    totalExtendedMinutes: number;
    allowsIncrementalCharges: boolean;
  } | null>(null);

  // Fetch session data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/session/${sessionId}/extension-data`);
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
        }
      } catch (err) {
        console.error("Failed to fetch extension data:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  // Calculate remaining time
  useEffect(() => {
    if (!sessionData) return;

    const calculateRemaining = () => {
      const startedAt = new Date(sessionData.startedAt);
      const originalEndTime = new Date(
        startedAt.getTime() +
          sessionData.durationMinutes * 60 * 1000 +
          sessionData.totalExtendedMinutes * 60 * 1000
      );
      const now = new Date();
      const remaining = (originalEndTime.getTime() - now.getTime()) / (1000 * 60);
      setMinutesRemaining(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [sessionData]);

  if (!sessionData) {
    return null;
  }

  // Only show button if:
  // - Parent consented to incremental charges
  // - ≤5 minutes remaining
  // - Total extensions haven't exceeded max
  const canExtend =
    sessionData.allowsIncrementalCharges &&
    minutesRemaining !== null &&
    minutesRemaining <= 5 &&
    minutesRemaining > 0 &&
    sessionData.totalExtendedMinutes < MAX_TOTAL_EXTENSION_MINUTES;

  if (!canExtend) {
    return null;
  }

  const handleExtend = async (extensionMinutes: number) => {
    setExtending(true);
    try {
      const result = await extendSession(sessionId, extensionMinutes);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Session extended by ${extensionMinutes} minutes!`);
        setOpen(false);
        // Refresh the page to update the timer
        window.location.reload();
      }
      } catch {
        toast.error("Failed to extend session. Please try again.");
      } finally {
      setExtending(false);
    }
  };

  const availableOptions = EXTENSION_OPTIONS.filter(
    (opt) => sessionData.totalExtendedMinutes + opt.minutes <= MAX_TOTAL_EXTENSION_MINUTES
  );

  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="border-[hsl(var(--hero-amber))] text-[hsl(var(--hero-amber))] hover:bg-[hsl(var(--hero-amber))]/10"
      >
        Extend Session ({Math.ceil(minutesRemaining ?? 0)} min left)
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Session</DialogTitle>
            <DialogDescription>
              Select how many minutes to add. The parent&apos;s saved payment method will be charged automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {availableOptions.map((opt) => (
              <Button
                key={opt.minutes}
                onClick={() => handleExtend(opt.minutes)}
                disabled={extending}
                variant="outline"
                className="w-full justify-between"
              >
                <span>{opt.label}</span>
                <span className="font-semibold">${(opt.priceCents / 100).toFixed(2)}</span>
              </Button>
            ))}
            {extending && (
              <p className="text-center text-sm text-slate-500">Processing extension…</p>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Maximum total extensions: {MAX_TOTAL_EXTENSION_MINUTES} minutes. Already extended:{" "}
            {sessionData.totalExtendedMinutes} minutes.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
