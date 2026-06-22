import NextAuth, { type NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

// Kept Prisma-free so it stays edge-safe for middleware (proxy.ts).
// Role is derived from the ADMIN_EMAILS env allowlist; access is gated by
// ALLOWED_EMAIL_DOMAIN. User persistence (DB) is not needed for v1.

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "")
  .trim()
  .toLowerCase();

function roleFor(email?: string | null): "ADMIN" | "MEMBER" {
  if (email && adminEmails.includes(email.toLowerCase())) return "ADMIN";
  return "MEMBER";
}

function emailAllowed(email?: string | null): boolean {
  if (!email) return false;
  if (!allowedDomain) return true;
  return email.toLowerCase().endsWith(`@${allowedDomain}`);
}

const providers: NextAuthConfig["providers"] = [];

// Real corporate SSO — enabled when Azure env vars are set.
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_TENANT_ID) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    })
  );
}

// Local dev bypass — sign in as a mock admin without Azure.
if (process.env.DEV_AUTH_BYPASS === "1") {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev login",
      credentials: {},
      async authorize() {
        const email = process.env.DEV_AUTH_EMAIL || "dev@example.com";
        return {
          id: email,
          email,
          name: process.env.DEV_AUTH_NAME || "Dev User",
        };
      },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 10 * 60 * 60 },
  providers,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      // Dev bypass always allowed; otherwise enforce domain allowlist.
      if (process.env.DEV_AUTH_BYPASS === "1") return true;
      return emailAllowed(user?.email);
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.role = roleFor(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? session.user.id;
        session.user.role = (token.role as "ADMIN" | "MEMBER") ?? "MEMBER";
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});

export function isAdmin(
  session: { user?: { role?: string } } | null
): boolean {
  return session?.user?.role === "ADMIN";
}
