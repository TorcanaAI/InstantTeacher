"use server";

import { requireAdmin } from "@/lib/adminGuard";
import { createDailyRoom } from "@/lib/daily";

export async function createTestVideoSession() {
  try {
    await requireAdmin();
    const room = await createDailyRoom();
    return {
      roomName: room.name,
      roomUrl: room.url,
    };
  } catch (err) {
    console.error("Error creating test video session:", err);
    throw err;
  }
}
