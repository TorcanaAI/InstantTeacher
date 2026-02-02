"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { refundSession } from "../actions/sessions";

export function RefundButton({
  sessionId,
  disabled,
}: {
  sessionId: string;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund() {
    if (disabled || loading) return;
    if (!confirm("Issue full refund for this session?")) return;
    setLoading(true);
    setError(null);
    const result = await refundSession(sessionId);
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
        variant="destructive"
        size="sm"
        onClick={handleRefund}
        disabled={loading}
      >
        {loading ? "Refunding…" : "Refund"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
