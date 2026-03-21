"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";
import { SUBJECTS } from "@/lib/constants";

const TILE_CLASS =
  "group flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-card p-6 text-center shadow-sm transition hover:border-primary/40 hover:shadow-md sm:p-8";

export default function SubjectSection() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {SUBJECTS.map((subject) => (
        <Link
          key={subject}
          href="/signup"
          className={TILE_CLASS}
        >
          <BookOpen className="mx-auto h-10 w-10 text-primary transition group-hover:scale-110 sm:h-12 sm:w-12" />
          <span className="mt-3 block font-semibold text-card-foreground group-hover:text-primary">
            {subject}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">Homework & exam help</span>
        </Link>
      ))}
      <Link href="/signup" className={TILE_CLASS}>
        <ClipboardList className="mx-auto h-10 w-10 text-primary transition group-hover:scale-110 sm:h-12 sm:w-12" />
        <span className="mt-3 block font-semibold text-card-foreground group-hover:text-primary">
          NAPLAN
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">Years 3, 5, 7 & 9</span>
      </Link>
      <Link href="/signup" className={TILE_CLASS}>
        <GraduationCap className="mx-auto h-10 w-10 text-primary transition group-hover:scale-110 sm:h-12 sm:w-12" />
        <span className="mt-3 block font-semibold text-card-foreground group-hover:text-primary">
          ATAR
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">Years 10–12</span>
      </Link>
    </div>
  );
}
