import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "GitVizor — AI-Powered GitHub Repository Intelligence",
  description:
    "Decode your codebase with AI. Connect any GitHub repo, ask questions about your code using RAG, track commits in real-time, transcribe developer meetings, and collaborate with your team — all in one platform.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "GitVizor — AI-Powered GitHub Repository Intelligence",
    description:
      "Decode your codebase with AI. Connect any GitHub repo, ask questions, track commits, and transcribe meetings.",
    type: "website",
    siteName: "GitVizor",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitVizor — AI-Powered GitHub Repository Intelligence",
    description:
      "Decode your codebase with AI. Connect any GitHub repo, ask questions, track commits, and transcribe meetings.",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={geist.variable} suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
