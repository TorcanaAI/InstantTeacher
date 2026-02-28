import { auth } from "@/auth";
import { Role } from "@prisma/client";
import type { Session } from "next-auth";

/**
 * Server-side admin guard. Call at the start of admin API routes or server code.
 * Throws if the user is not signed in or not an admin (hard lock).
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  const role = session?.user ? (session.user as { role?: Role }).role : undefined;
  if (!session || role !== Role.ADMIN) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
