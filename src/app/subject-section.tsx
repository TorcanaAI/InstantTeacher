"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import { SUBJECTS, SUBJECT_DESCRIPTIONS } from "@/lib/constants";
import type { SubjectKey } from "@/lib/constants";

export default function SubjectSection({
  subjects,
  isLoggedIn,
}: {
  subjects: readonly SubjectKey[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SubjectKey | null>(null);

  const description = selected ? SUBJECT_DESCRIPTIONS[selected] ?? "Get help from a qualified teacher." : "";

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {subjects.map((subject) => (
          <button
            key={subject}
            type="button"
            onClick={() => {
              setSelected(subject);
              setOpen(true);
            }}
            className="group rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-[hsl(var(--hero-teal))] hover:shadow-md"
          >
            <BookOpen className="mx-auto h-8 w-8 text-[hsl(var(--hero-teal))] transition group-hover:scale-110" />
            <span className="mt-2 block font-medium text-slate-800 group-hover:text-[hsl(var(--hero-teal))]">
              {subject}
            </span>
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ?? "Subject"}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <p className="text-sm font-medium text-slate-700">Connect now for instant help.</p>
          <Button asChild className="w-full rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
            <Link href={isLoggedIn ? "/parent/help" : "/signup"} onClick={() => setOpen(false)}>
              {isLoggedIn ? "Find a teacher" : "Continue"}
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
