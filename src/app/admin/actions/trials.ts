"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

type TrialActionState = { error?: string; success?: boolean } | null;

export async function createTrialCoupon(_prev: TrialActionState, formData: FormData): Promise<TrialActionState> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }
  const raw = (formData.get("code") as string) ?? "";
  const referenceNote = (formData.get("referenceNote") as string)?.trim() || null;
  const code = normalizeCode(raw);
  if (code.length < 4) {
    return { error: "Code must be at least 4 characters (letters/numbers)." };
  }
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return { error: "Use only letters, numbers, hyphens, and underscores." };
  }
  try {
    await prisma.trialCoupon.create({
      data: { code, referenceNote },
    });
    revalidatePath("/admin/trials");
    return { success: true };
  } catch (e: unknown) {
    const dup = e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002";
    if (dup) return { error: "That code already exists." };
    return { error: "Could not create coupon." };
  }
}

export async function deleteTrialCoupon(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    return;
  }
  const id = formData.get("id") as string;
  if (!id) return;
  const row = await prisma.trialCoupon.findUnique({ where: { id } });
  if (!row || row.usedAt) return;
  await prisma.trialCoupon.delete({ where: { id } });
  revalidatePath("/admin/trials");
}
