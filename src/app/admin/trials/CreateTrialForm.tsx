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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="referenceNote">Club / internal note</Label>
          <Input id="referenceNote" name="referenceNote" placeholder="e.g. Currambine Netball Club" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxUses">Max redemptions</Label>
          <Input
            id="maxUses"
            name="maxUses"
            type="number"
            min={1}
            defaultValue={250}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDays">Trial length (days)</Label>
          <Input
            id="expiryDays"
            name="expiryDays"
            type="number"
            min={1}
            max={365}
            defaultValue={7}
            required
          />
        </div>
      </div>
      <Button type="submit" className="rounded-full">
        Create code
      </Button>
    </form>
  );
}
