"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, GraduationCap } from "lucide-react";
import { SUBJECTS } from "@/lib/constants";

const TILE_CLASS =
  "group flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm transition hover:border-[hsl(var(--hero-teal))] hover:shadow-md sm:p-8";

const NAPLAN_TILE = {
  title: "NAPLAN Assistance",
  subtitle: "Years 3, 5, 7 & 9 support",
  href: "/help/naplan",
  icon: ClipboardList,
};

const ATAR_TILE = {
  title: "ATAR Support",
  subtitle: "Years 10–12 exam & assignment help",
  href: "/help/atar",
  icon: GraduationCap,
};

export default function SubjectSection() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {SUBJECTS.map((subject) => (
        <Link
          key={subject}
          href={`/help/study?subject=${encodeURIComponent(subject)}`}
          className={TILE_CLASS}
        >
          <BookOpen className="mx-auto h-10 w-10 text-[hsl(var(--hero-teal))] transition group-hover:scale-110 sm:h-12 sm:w-12" />
          <span className="mt-3 block font-semibold text-slate-800 group-hover:text-[hsl(var(--hero-teal))]">
            {subject}
          </span>
          <span className="mt-1 block text-sm text-slate-600">Homework & study help</span>
        </Link>
      ))}
      <Link href={NAPLAN_TILE.href} className={TILE_CLASS}>
        <NAPLAN_TILE.icon className="mx-auto h-10 w-10 text-[hsl(var(--hero-teal))] transition group-hover:scale-110 sm:h-12 sm:w-12" />
        <span className="mt-3 block font-semibold text-slate-800 group-hover:text-[hsl(var(--hero-teal))]">
          {NAPLAN_TILE.title}
        </span>
        <span className="mt-1 block text-sm text-slate-600">{NAPLAN_TILE.subtitle}</span>
      </Link>
      <Link href={ATAR_TILE.href} className={TILE_CLASS}>
        <ATAR_TILE.icon className="mx-auto h-10 w-10 text-[hsl(var(--hero-teal))] transition group-hover:scale-110 sm:h-12 sm:w-12" />
        <span className="mt-3 block font-semibold text-slate-800 group-hover:text-[hsl(var(--hero-teal))]">
          {ATAR_TILE.title}
        </span>
        <span className="mt-1 block text-sm text-slate-600">{ATAR_TILE.subtitle}</span>
      </Link>
    </div>
  );
}
