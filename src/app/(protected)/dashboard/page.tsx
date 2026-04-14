'use client'
import useProject from '@/hooks/use-project';
import { useUser } from '@clerk/nextjs'
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

const page = () => {
    const { user } = useUser();
    const {project}= useProject();
    
  return (
    <div className="space-y-6">  
      {/* {project?.id} */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <div className="rounded-xl border border-border/40 bg-card/60 px-5 py-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Github className='size-4 text-primary'/>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-foreground'>
                This project is linked to {''}
                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-primary hover:text-primary/80 hover:underline transition-colors'>
                  {project?.githubUrl}
                  <ExternalLink className='m-1 size-3.5'/>
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-3">
          <TeamMember/> 
          <InviteButton/>
          <ArchiveButton/>
          
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

export default page