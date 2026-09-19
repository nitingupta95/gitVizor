import { db } from "@/server/db";
import PublicGuideClient from "./public-guide-client";
import Link from "next/link";

export const dynamic = "force-dynamic"; // never cache — disabled shares must 404 immediately

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PublicSharePage({ params }: Props) {
  const { token } = await params;

  const share = await db.publicShare.findUnique({
    where: { token },
    select: {
      enabled: true,
      qaCreditsCap: true,
      qaCreditsUsed: true,
      project: {
        select: {
          name: true,
          githubUrl: true,
          DocSection: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
              sourceFileRefs: true,
              order: true,
              status: true,
              // NOT: relatedMeetingIds, projectId, githubToken, or any user/billing data
            },
          },
        },
      },
    },
  });

  if (!share?.enabled) {
    return <NotAvailable />;
  }

  return (
    <PublicGuideClient
      token={token}
      projectName={share.project.name}
      githubUrl={share.project.githubUrl}
      sections={share.project.DocSection}
      capUsed={share.qaCreditsUsed}
      capTotal={share.qaCreditsCap}
    />
  );
}

function NotAvailable() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Guide not available</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            This project guide isn&apos;t available right now. The owner may have disabled public sharing or the link may be invalid.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Build your own with GitVizor →
        </Link>
      </div>
    </div>
  );
}
