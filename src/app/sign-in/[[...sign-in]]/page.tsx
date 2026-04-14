import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b]">
      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" aria-hidden />

      {/* ── Sign-In Card ── */}
      <div className="relative z-10 w-full max-w-[440px] mx-4">
        <div className="rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/40 overflow-hidden">
          {/* ── Logo + Header ── */}
          <div className="flex flex-col items-center pt-10 pb-2 px-8">
            {/* Logo mark */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Sign in to GitVizor
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* ── Clerk Component ── */}
          <div className="px-6 pb-6 pt-2">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent w-full p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footer: "hidden",
                  formButtonPrimary:
                    "bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm",
                  formFieldInput:
                    "border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400 bg-gray-50/50 py-2.5",
                  formFieldLabel: "text-gray-700 font-medium text-sm",
                  socialButtonsBlockButton:
                    "border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl py-2.5 transition-all hover:border-gray-300",
                  socialButtonsBlockButtonText: "text-sm font-medium text-gray-700",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-400 text-sm",
                  formField: "mb-1",
                  footerActionText: "text-gray-500",
                  footerActionLink:
                    "text-indigo-600 hover:text-indigo-700 font-semibold",
                },
              }}
            />
          </div>

          {/* ── Bottom footer bar ── */}
          <div className="border-t border-gray-100 bg-gray-50/80 py-4 text-center">
            <p className="text-xs text-gray-400 font-medium">
              © {new Date().getFullYear()} GitVizor. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
