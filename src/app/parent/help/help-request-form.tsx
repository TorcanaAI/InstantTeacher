"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudentProfile } from "@prisma/client";
import { requestSession } from "@/app/actions/session";
import { toast } from "sonner";

type Duration = { minutes: number; label: string; priceCents: number; priceLabel: string };
type HelpType = (typeof import("@/lib/constants").HELP_TYPES)[number];
type Subject = (typeof import("@/lib/constants").SUBJECTS)[number];

interface Props {
  students: StudentProfile[];
  selectedStudentId: string;
  durations: readonly Duration[];
  helpTypes: readonly HelpType[];
  subjects: readonly Subject[];
  yearLevels: readonly number[];
  defaultYearLevel: number;
}

export default function HelpRequestForm({
  students,
  selectedStudentId,
  durations,
  helpTypes,
  subjects,
  yearLevels,
  defaultYearLevel,
}: Props) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(selectedStudentId);
  const [subject, setSubject] = useState("");
  const [yearLevel, setYearLevel] = useState(String(defaultYearLevel));
  const [durationMinutes, setDurationMinutes] = useState<number>(durations[0].minutes);
  const [helpType, setHelpType] = useState("");
  const [studentPrompt, setStudentPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("studentId", studentId);
      formData.set("subject", subject);
      formData.set("yearLevel", yearLevel);
      formData.set("durationMinutes", String(durationMinutes));
      formData.set("helpType", helpType);
      formData.set("studentPrompt", studentPrompt);

      const result = await requestSession(formData);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      if (result?.sessionId) {
        router.push(`/parent/checkout?sessionId=${result.sessionId}`);
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  }

  const durationConfig = durations.find((d) => d.minutes === durationMinutes);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Request help</CardTitle>
        <CardDescription>Pay to confirm your request; a teacher will accept and join the session.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.fullName} (Year {s.schoolYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject} required>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year level</Label>
            <Select value={yearLevel} onValueChange={setYearLevel} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearLevels.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Help type</Label>
            <Select value={helpType} onValueChange={setHelpType} required>
              <SelectTrigger>
                <SelectValue placeholder="What do you need?" />
              </SelectTrigger>
              <SelectContent>
                {helpTypes.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Session length</Label>
            <Select
              value={String(durationMinutes)}
              onValueChange={(v) => setDurationMinutes(Number(v))}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.minutes} value={String(d.minutes)}>
                    {d.label} — {d.priceLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">What do you need help with?</Label>
            <Input
              id="prompt"
              name="studentPrompt"
              placeholder="e.g. Stuck on quadratic equations, need to understand the formula"
              value={studentPrompt}
              onChange={(e) => setStudentPrompt(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Total: {durationConfig?.priceLabel ?? ""} — pay to confirm, then a teacher will accept.
          </p>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating request…" : "Continue to payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
