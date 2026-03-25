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
  const maxUsesRaw = parseInt(String(formData.get("maxUses") ?? "1"), 10);
  const expiryDaysRaw = parseInt(String(formData.get("expiryDays") ?? "7"), 10);
  const maxUses = Number.isFinite(maxUsesRaw) && maxUsesRaw >= 1 ? maxUsesRaw : 1;
  const expiryDays =
    Number.isFinite(expiryDaysRaw) && expiryDaysRaw >= 1 && expiryDaysRaw <= 365 ? expiryDaysRaw : 7;
  const code = normalizeCode(raw);
  if (code.length < 4) {
    return { error: "Code must be at least 4 characters (letters/numbers)." };
  }
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return { error: "Use only letters, numbers, hyphens, and underscores." };
  }
  try {
    await prisma.trialCoupon.create({
      data: { code, referenceNote, maxUses, expiryDays, usedCount: 0 },
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
  const row = await prisma.trialCoupon.findUnique({
    where: { id },
    include: { _count: { select: { redemptions: true } } },
  });
  if (!row || row.usedCount > 0 || row._count.redemptions > 0 || row.usedAt) return;
  await prisma.trialCoupon.delete({ where: { id } });
  revalidatePath("/admin/trials");
}
