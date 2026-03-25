import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

// One secret for signing JWTs — middleware must decode with the same value
const _secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (_secret) {
  process.env.AUTH_SECRET ??= _secret;
  process.env.NEXTAUTH_SECRET ??= _secret;
}

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is required in production. Add it in Vercel: Project → Settings → Environment Variables. Use a long random string (e.g. run: openssl rand -base64 32)."
  );
}

// Canonical URL for Auth.js (CSRF, cookies, redirects). Wrong host = login "works" but session is lost on custom domains.
// Prefer explicit AUTH_URL / NEXTAUTH_URL, then public app URL (production domain), then Vercel deployment URL.
if (!process.env.NEXTAUTH_URL && !process.env.AUTH_URL) {
  const fromPublic =
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("http") === true
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "";
  if (fromPublic) {
    process.env.NEXTAUTH_URL = fromPublic;
    process.env.AUTH_URL = fromPublic;
  } else if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
} else if (process.env.AUTH_URL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.AUTH_URL;
} else if (process.env.NEXTAUTH_URL && !process.env.AUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // JWT + credentials only — no PrismaAdapter. Adapter is for DB sessions / OAuth linking and can
  // conflict with credentials sign-in in Auth.js v5; we still use Prisma inside `authorize`.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Login attempt: email or password missing");
          return null;
        }
        const email = String(credentials.email).trim().toLowerCase();
        const inputPassword = String(credentials.password);
        console.log("[Auth] Login attempt email:", email);

        try {
          let user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) {
            try {
              user = await prisma.user.findFirst({
                where: { email: { equals: email, mode: "insensitive" } },
              });
            } catch {
              // mode: "insensitive" may not be supported in some Postgres setups; ignore
            }
          }
          if (!user) {
            console.log("[Auth] User found: no");
            return null;
          }
          console.log("[Auth] User found: yes, id:", user.id);
          console.log("[Auth] PasswordHash exists:", !!user.passwordHash);
          if (!user.passwordHash) {
            console.log("[Auth] Login failed: no password set for user");
            return null;
          }
          if (user.banned) {
            console.log("[Auth] User banned");
            return null;
          }
          const bcrypt = (await import("bcryptjs")).default;
          const valid = await bcrypt.compare(inputPassword, user.passwordHash);
          console.log("[Auth] Password match:", valid);
          console.log("[Auth] Role:", user.role);
          if (!valid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email ?? email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (err) {
          console.error("[Auth] authorize() database error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; role: Role };
        token.sub = u.id;
        token.id = u.id;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as Role) ?? "PARENT";
      }
      return session;
    },
  },
});
