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
      <div className="h-6">
        <h1 className='text-xl font-semibold'>
          Meetings
        </h1>
        {meetings && meetings.length === 0 && (
          <div className='text-sm text-muted-foreground'>No meetings found. Upload a meeting to get started.</div>
        )}
        {isLoading && (
          <div className='text-sm text-muted-foreground'>Loading meetings...</div>
        )}
        <ul className='divide-y divide-border/60 mt-3'>
        {meetings && meetings.length > 0 && (
          <div className='mt-4 space-y-4'>
            {meetings?.map((meeting) => (
              <li key={meeting.id} className='flex justify-between items-center rounded-xl border border-border/60 bg-card/40 px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] gap-x-6'>
                <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/meetings/${meeting.id}`} className="text-sm font-semibold text-foreground hover:underline">
                      {meeting.name}
                    </Link>
                    {meeting.status === 'PROCESSING' && (
                      <Badge className="bg-yellow-500 text-white">
                        Processing...
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-xs text-muted-foreground gap-x-2">
                  <p className="whitespace-nowrap">
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </p>
                  <p className="truncate">{meeting.issues.length} issues</p>
                </div>

                </div>
                <div className='flex items-center flex-none gap-x-4'>
                  <Link href={`/meetings/${meeting.id}`} className="text-sm text-primary hover:underline">
                    <Button variant="outline">
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
                 > Delete Meeting</Button>
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