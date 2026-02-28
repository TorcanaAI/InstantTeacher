"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deletePendingSession } from "../actions/sessions";

export function DeleteSessionButton({
  sessionId,
  disabled,
}: {
  sessionId: string;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (disabled || loading) return;
    if (!confirm("Permanently delete this pending session? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    const result = await deletePendingSession(sessionId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  if (disabled) return null;
  return (
    <span className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Deleting…" : "Delete"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
