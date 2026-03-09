import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Prisma, no Node.js-only packages.
// Used by middleware only. Full config (with PrismaAdapter) is in src/lib/auth.ts
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CLIENT" | "INSPECTOR" | "ADMIN";
      }
      return session;
    },
  },
  providers: [], // providers are registered in src/lib/auth.ts
};
