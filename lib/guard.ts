import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") throw new Error("Forbidden: admin only");
  return session;
}
