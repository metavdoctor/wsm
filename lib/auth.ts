import NextAuth, { type NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";

// Kept Prisma-free so it stays edge-safe for middleware (proxy.ts).
// Access policy: ANY user who authenticates via Azure may enter — no domain
// allowlist, no whitelist. Everyone gets full access (ADMIN), so there is no
// role-based gating in this app.

const providers: NextAuthConfig["providers"] = [];

// Real corporate SSO — enabled when Azure env vars are set.
// Explicit endpoints (mirrors the working config in the promisys app on the
// HCML tenant) instead of the issuer/discovery shorthand.
if (
  process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_TENANT_ID
) {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      authorization: {
        url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        params: { scope: "openid profile email" },
      },
      token: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      userinfo: "https://graph.microsoft.com/oidc/userinfo",
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
    async signIn() {
      // Open access: anyone who authenticates (Azure or dev bypass) may enter.
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        // No role-based access in this app — everyone gets full access.
        token.role = "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? session.user.id;
        session.user.role = (token.role as "ADMIN" | "MEMBER") ?? "ADMIN";
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
