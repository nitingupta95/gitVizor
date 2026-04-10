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
    const {data: meetings,isLoading} = api.project.getMeetings.useQuery({
        projectId: project?.id || ""
    },{
        refetchInterval: 4000,
    })

    const deleteMeeting= api.project.deleteMeeting.useMutation()
      const refetch= useRefetch();

    
  return (
    <>
      <MeetingCard/>
      <div className="h-6">
        <h1 className='text-xl font-semibold'>
          Meetings
        </h1>
        {meetings && meetings.length === 0 && (
          <div className='text-sm text-gray-500'>No meetings found. Upload a meeting to get started.</div>
        )}
        {isLoading && (
          <div className='text-sm text-gray-500'>Loading meetings...</div>
        )}
        <ul className='divide-y divide-gray-200'>
        {meetings && meetings.length > 0 && (
          <div className='mt-4 space-y-4'>
            {meetings?.map((meeting) => (
              <li key={meeting.id} className='flex justify-between items-center py-5 gap-x-6'>
                <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/meetings/${meeting.id}`} className="text-sm font-semibold">
                      {meeting.name}
                    </Link>
                    {meeting.status === 'PROCESSING' && (
                      <Badge className="bg-yellow-500 text-white">
                        Processing...
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-500 gap-x-2">
                  <p className="whitespace-nowrap">
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </p>
                  <p className="truncate">{meeting.issues.length} issues</p>
                </div>

                </div>
                <div className='flex items-center flex-none gap-x-4'>
                  <Link href={`/meetings/${meeting.id}`} className="text-sm text-blue-500 hover:underline">
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