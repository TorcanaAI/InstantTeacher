"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteShift } from "../actions/shifts";

export function DeleteShiftButton({ shiftId }: { shiftId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (loading) return;
    if (!confirm("Permanently delete this shift and its teacher assignments? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    const result = await deleteShift(shiftId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

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
