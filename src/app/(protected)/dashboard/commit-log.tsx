"use client"
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import React, { useEffect } from 'react'
import { cn } from '@/lib/utils' // make sure this exists

const CommitLog = () => {
  const { projectId, project } = useProject()
  const { data: commits = [], error } = api.project.getCommits.useQuery({ projectId: projectId as string })

  useEffect(() => {
    if (error) {
      toast.error('Failed to load commits', {
        description: error.data?.code === 'TOO_MANY_REQUESTS' || error.message.includes('quota') 
          ? 'GitHub API rate limit exhausted. Please check your GitHub token.'
          : error.message
      })
    }
  }, [error])

  return (
    <div>
      <ul className="space-y-6">
        {commits.map((commit, index) => (
          <li key={commit.id} className="relative flex gap-4">
            <div
              className={cn(
                index === commits.length - 1 ? "h-8" : "-bottom-8",
                "absolute left-0 top-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px translate-x-1 bg-border"></div>
            </div>

            <img
              src={commit.commitAuthorAvatar}
              alt="commit avatar"
              className="relative mt-4 size-8 flex-none rounded-full bg-muted"
            />

            <div className="flex-auto rounded-lg bg-card/50 p-4 ring-1 ring-inset ring-border/60 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <div className="flex justify-between gap-x-4">
                <Link
                  target="_blank"
                  href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                  className="py-0.5 text-xs leading-5 text-muted-foreground"
                >
                  <span className="font-medium text-foreground">
                    {commit.commitAuthorName}
                  </span>{" "}
                  <span className="inline-flex items-center">
                    committed
                    <ExternalLink className="ml-1 size-4" />
                  </span>
                </Link>
              </div>

                <div className='font-semibold'>
                    {commit.commitMessage}
                </div>
                <pre className='mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground'>
                    {commit.summary}
                </pre>

            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CommitLog
