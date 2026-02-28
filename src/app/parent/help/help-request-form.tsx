"use client";

import { useState, useEffect } from "react";
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
type SectionType = (typeof import("@/lib/constants").SECTION_TYPES)[number];

interface Props {
  students: StudentProfile[];
  selectedStudentId: string;
  section: SectionType;
  /** When true, yearLevel and subject are pre-filled from flow (year/subject selects hidden). */
  preFilledFromFlow?: boolean;
  yearLevel?: number;
  subject?: string;
  durations: readonly Duration[];
  helpTypes: readonly HelpType[];
  subjects: readonly Subject[];
  defaultYearLevel: number;
}

export default function HelpRequestForm({
  students,
  selectedStudentId,
  section,
  preFilledFromFlow,
  yearLevel: preFilledYearLevel,
  subject: preFilledSubject,
  durations,
  helpTypes,
  subjects,
  defaultYearLevel,
}: Props) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(selectedStudentId);
  const [subject, setSubject] = useState(preFilledSubject ?? "");
  const [yearLevel, setYearLevel] = useState(String(preFilledYearLevel ?? defaultYearLevel));
  const [durationMinutes, setDurationMinutes] = useState<number>(durations[0].minutes);
  const [helpType, setHelpType] = useState<string>(helpTypes[0] ?? "");
  const [studentPrompt, setStudentPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync when parent changes selected student (e.g. from URL or dropdown elsewhere)
  useEffect(() => {
    setStudentId(selectedStudentId);
  }, [selectedStudentId]);

  // When student changes, update year level to match that student (if not pre-filled from flow)
  useEffect(() => {
    if (preFilledFromFlow) return;
    const student = students.find((s) => s.id === studentId);
    if (student) setYearLevel(String(student.schoolYear));
  }, [studentId, students, preFilledFromFlow]);

  // Keep subject/year in sync with flow when pre-filled
  useEffect(() => {
    if (preFilledFromFlow && preFilledSubject) setSubject(preFilledSubject);
    if (preFilledFromFlow && preFilledYearLevel != null) setYearLevel(String(preFilledYearLevel));
  }, [preFilledFromFlow, preFilledSubject, preFilledYearLevel]);

  const effectiveSubject = preFilledFromFlow ? preFilledSubject! : subject;
  const effectiveYearLevel = preFilledFromFlow ? String(preFilledYearLevel) : yearLevel;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("studentId", studentId);
      formData.set("subject", effectiveSubject);
      formData.set("section", section);
      formData.set("yearLevel", effectiveYearLevel);
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
          {preFilledFromFlow && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">
                {section} · Year {preFilledYearLevel} · {preFilledSubject}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger aria-label="Select student">
                <SelectValue placeholder="Choose student" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.fullName} (Year {s.schoolYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!preFilledFromFlow && (
            <>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject} required>
                  <SelectTrigger aria-label="Subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
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
                  <SelectTrigger aria-label="Year level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Help type</Label>
            <Select value={helpType} onValueChange={setHelpType} required>
              <SelectTrigger aria-label="What do you need?">
                <SelectValue placeholder="What do you need?" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
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
              <SelectTrigger aria-label="Session length">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
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
