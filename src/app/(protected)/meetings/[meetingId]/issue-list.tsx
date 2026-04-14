"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api, type RouterOutputs } from '@/trpc/react'
import { VideoIcon } from 'lucide-react'
import React from 'react'

type Props={
    meetingId: string
}

const IssueList = ({ meetingId }: Props) => {
    const {data:meeting, isLoading} = api.project.getMeetingById.useQuery({meetingId},{
        refetchInterval: 4000,
    })

    if(isLoading || !meeting) {
        return <div>Loading...</div>
    }
  return (
    <div className='p-8'>
        <div className='mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b border-border/60 pb-6 lg:mx-0 lg:max-w-none'>
            <div className="flex items-center gap-x-8">
                <div className="rounded-full border border-border/60 bg-card/60 p-3 shadow-sm">
                    <VideoIcon className='h-6 w-6'></VideoIcon>

                </div>
                <h1>
                    <div className="text-sm leading-6 text-muted-foreground">
                        Meeting on {""}{new Date(meeting.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-1 text-base font-semibold leading-6 text-foreground ">
                        {meeting.name}
                    </div>
                </h1>
            </div>

        </div>
        <div className="h-4">
            <div className="grid grid-cols-1 gap-2 sm:grdi-cols-3">
                {/* {meeting.issues.map((issue)=>(
                    ))} */}
            </div>
        </div>
        
    </div>
  )


}


function IssueCard({issue}: {issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number]}) {
    const [open, setOpen] = React.useState(false);
    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {issue.gist}
                    </DialogTitle>
                    <DialogDescription>
                        {new Date(issue.createdAt).toLocaleDateString()}
                    </DialogDescription>
                    <p className='mt-2 border-l-4 border-border bg-muted p-4'>
                        
                        {issue.headline}
                    </p>
                    <blockquote className='mt-2 border-l-4 border-border bg-muted p-4'>
                        <span className='text-sm text-muted-foreground'>{issue.start} - {issue.end}</span>
                        <p className="font-medium italic leading-relaxed text-foreground">
                            {issue.Summary}
                        </p>
                    </blockquote> 

                </DialogHeader>
            </DialogContent>
        </Dialog>
         <Card className='relative'>
            <CardHeader>
                <CardTitle className='text-sm font-medium'>{issue.gist}</CardTitle>
                <div className="border-b">

                </div>
                <CardDescription>
                    {issue.headline}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={()=>setOpen(true)}>Details</Button>
            </CardContent>
         </Card>
        </>
    )
}


export default IssueList