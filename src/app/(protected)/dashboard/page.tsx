'use client'
import useProject from '@/hooks/use-project';
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import dynamic from 'next/dynamic';
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import ArchiveButton from './archive-button';
import TeamMember from './team-member';

const InviteButton = dynamic(() => import('./invite-button'), { ssr: false });

const DashboardPage = () => {
    const {project}= useProject();
    
  return (
    <div className="space-y-6">  
      {/* {project?.id} */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* GitHub Link Pill */}
        <div className="group flex items-center rounded-full border border-border/40 bg-card/60 px-4 py-2 shadow-sm backdrop-blur-md transition-all hover:bg-accent/40 hover:shadow-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Github className="size-4 text-primary" />
          </div>
          <div className="ml-3 flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">
              Linked to
            </span>
            <Link
              href={project?.githubUrl ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              {project?.githubUrl?.replace('https://github.com/', '')}
              <ExternalLink className="ml-1 size-3.5 opacity-50 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TeamMember />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>


      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
         <AskQuestionCard/>
          <MeetingCard/>
        </div>
      </div>

      <div>
        <CommitLog/>
      </div>


    </div>
  )
}

export default DashboardPage