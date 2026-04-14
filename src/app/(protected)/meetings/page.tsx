"use client"
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';
import React from 'react'
import MeetingCard from '../dashboard/meeting-card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Calendar, AlertCircle, Presentation } from 'lucide-react';

const MeetingsPage = () => {
    const {project} = useProject();
    const {data: meetings,isLoading} = api.meeting.getMeetings.useQuery({
        projectId: project?.id || ""
    },{
        enabled: !!project?.id,
        refetchInterval: 4000,
    })

    const deleteMeeting= api.meeting.deleteMeeting.useMutation()
      const refetch= useRefetch();

    
  return (
    <>
      <MeetingCard/>
      <div className="mt-8">
        <h1 className='text-xl font-semibold tracking-tight flex items-center gap-2'>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Presentation className="h-3.5 w-3.5 text-primary" />
          </div>
          Meetings
        </h1>
        {meetings && meetings.length === 0 && (
          <div className='mt-3 flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 p-4 text-sm text-muted-foreground'>
            <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
            No meetings found. Upload a meeting to get started.
          </div>
        )}
        {isLoading && (
          <div className='mt-3 flex items-center gap-2 text-sm text-muted-foreground'>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
            Loading meetings...
          </div>
        )}
        <ul className='divide-y divide-border/30 mt-3'>
        {meetings && meetings.length > 0 && (
          <div className='mt-4 space-y-3'>
            {meetings?.map((meeting) => (
              <li key={meeting.id} className='flex justify-between items-center rounded-xl border border-border/40 bg-card/60 px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:border-border/60 transition-all duration-300 gap-x-6'>
                <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/meetings/${meeting.id}`} className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors">
                      {meeting.name}
                    </Link>
                    {meeting.status === 'PROCESSING' && (
                      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20">
                        Processing...
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-xs text-muted-foreground gap-x-3 mt-1.5">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </span>
                  <span className="truncate">{meeting.issues.length} issues</span>
                </div>

                </div>
                <div className='flex items-center flex-none gap-x-3'>
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button variant="outline" size="sm" className="border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all">
                      View Meeting
                    </Button>
                </Link> 
                 <Button disabled={deleteMeeting.isPending} variant="destructive" size="sm" onClick={()=>{
                   deleteMeeting.mutate({meetingId: meeting.id},{
                    onSuccess:()=>{
                      toast.success("Meeting deleted successfully");
                      refetch();
                    }
                   });
                  }}
                 >Delete</Button>
                </div>
                    
                 
              </li>
            ))}
          </div>
        )}
         </ul>

      </div>

    </>
  )
}

export default MeetingsPage