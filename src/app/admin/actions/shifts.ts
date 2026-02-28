"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function deleteShift(shiftId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }

  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
  });
  if (!shift) return { error: "Shift not found" };

  await prisma.shift.delete({
    where: { id: shiftId },
  });
  return {};
}
