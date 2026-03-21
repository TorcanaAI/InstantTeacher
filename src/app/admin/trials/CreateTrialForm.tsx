"use client";

import { useFormState } from "react-dom";
import { createTrialCoupon } from "@/app/admin/actions/trials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateTrialForm() {
  const [state, formAction] = useFormState(createTrialCoupon, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-primary">Code created.</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          placeholder="e.g. TRIAL-PARENT-001"
          required
          className="font-mono uppercase"
          autoComplete="off"
        />
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="referenceNote">Internal note (optional)</Label>
        <Input id="referenceNote" name="referenceNote" placeholder="e.g. Smith family referral" />
      </div>
      <Button type="submit" className="rounded-full">
        Create code
      </Button>
      </div>
    </form>
  );
}
