import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const devBypass = process.env.DEV_AUTH_BYPASS === "1";

  async function handleSignIn() {
    "use server";
    const provider =
      process.env.DEV_AUTH_BYPASS === "1" ? "dev" : "microsoft-entra-id";
    await signIn(provider, { redirectTo: "/dashboard" });
  }

  return (
    <div className="w-full max-w-sm">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
      >
        {/* Header */}
        <div
          className="px-8 py-8 text-center"
          style={{ backgroundColor: "#1E2F47", borderBottom: "3px solid #D7B377" }}
        >
          <h1 className="text-3xl font-bold tracking-widest text-white">WSM ACTION TRACKER</h1>
          <p className="text-xs mt-1 italic" style={{ color: "#D7B377" }}>
            Weekly Staff Meeting · Action Monitoring
          </p>
        </div>

        {/* Body */}
        <div
          className="px-8 py-8 flex flex-col gap-5"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "#2B4162" }}>
              Action Tracker Internal
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8F754F" }}>
              {devBypass
                ? "Mode pengembangan lokal — klik untuk masuk."
                : "Sign in with your corporate Microsoft account to access the dashboard."}
            </p>
          </div>

          <div className="h-px" style={{ backgroundColor: "#E5E3F0" }} />

          <form action={handleSignIn}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#D7B377", color: "#1E2F47" }}
            >
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#F35325" />
                <rect x="11" y="1" width="9" height="9" fill="#81BC06" />
                <rect x="1" y="11" width="9" height="9" fill="#05A6F0" />
                <rect x="11" y="11" width="9" height="9" fill="#FFBA08" />
              </svg>
              {devBypass ? "Masuk (Dev)" : "Sign in with Microsoft"}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: "#8F754F" }}>
            Authorized personnel only.
            <br />
            Access is managed through Azure Active Directory.
          </p>
        </div>
      </div>

      <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.35)" }}>
        WSM ACTION TRACKER · Internal Use Only
      </p>
    </div>
  );
}
