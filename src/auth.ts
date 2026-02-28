import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is required in production. Add it in Vercel: Project → Settings → Environment Variables. Use a long random string (e.g. run: openssl rand -base64 32)."
  );
}

// On Vercel, NEXTAUTH_URL is often missing; derive from VERCEL_URL so callbacks and cookies work
if (process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma User has role; adapter types conflict
  adapter: PrismaAdapter(prisma) as any,
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
        const email = (credentials.email as string).trim().toLowerCase();
        const inputPassword = credentials.password as string;
        console.log("[Auth] Login attempt email:", email);

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
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
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
