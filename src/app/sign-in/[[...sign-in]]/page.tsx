import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center text-white">
          <h1 className="text-3xl font-bold">GitVizor</h1>
          <p className="text-blue-100 mt-1">
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Clerk SignIn Form */}
        <div className="p-8">
          <SignIn
            appearance={{
              elements: {
                footer: "hidden",
                card: "shadow-none border-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary:
                  "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-all",
                formFieldInput:
                  "border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder:text-gray-400",
                formFieldLabel: "text-gray-700 font-medium",
                socialButtonsBlockButton:
                  "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium",
                socialButtonsBlockButtonText: "text-sm text-gray-700",
                footerActionText: "text-gray-500",
                footerActionLink:
                  "text-blue-600 hover:text-blue-700 font-medium",
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="bg-blue-50 border-t border-blue-100 py-4 text-center text-sm text-blue-500 font-medium">
          © {new Date().getFullYear()} GitVizor. All rights reserved.
        </div>
      </div>
    </div>
  );
}
