import { auth } from "@/auth";
import { Role } from "@prisma/client";
import type { Session } from "next-auth";

/**
 * Use in admin API routes for explicit auth: returns the session only if the user is an admin.
 * Returns null if unauthenticated or not ADMIN (caller should return 401).
 */
export async function getAdminSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: Role }).role;
  if (role !== Role.ADMIN) return null;
  return session;
}
