'use client'
import useProject from '@/hooks/use-project';
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

import React from 'react'
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import ArchiveButton from './archive-button';
const InviteButton= dynamic(()=> import('./invite-button'),{ssr: false});
import TeamMember from './team-member';
import dynamic from 'next/dynamic';

const page = () => {
    const { user } = useUser();
    const {project}= useProject();
    
  return (
    <div className="space-y-6">  
      {/* {project?.id} */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
          <div className="flex items-center">
            <Github className='size-5 text-foreground'/>
            <div className='ml-2'>
              <p className='text-sm font-medium text-foreground'>
                This project is linked to {''}
                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-foreground/70 hover:text-foreground hover:underline'>
                  {project?.githubUrl}
                  <ExternalLink className='m-1 size-4'/>
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