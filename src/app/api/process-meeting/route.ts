import {z} from "zod";
import {NextResponse, NextRequest  } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
const bodyParser= z.object({
    meetingUrl: z.string(),
    projectId: z.string(),
    meetingId: z.string(),
});



export const maxDuration= 300; // 15 minutes in seconds




export async function POST(request: NextRequest) {
    const {userId}= await auth();
    if(!userId) return NextResponse.json({error:"Unauthorized"}, {status:401});
    try {
        const body= await request.json();
        const {meetingUrl, projectId, meetingId}= bodyParser.parse(body);
        const {summaries}= await processMeeting(meetingUrl)
        await db.issue.createMany({
            data: summaries.map((summary:any)=>({
                meetingId, 
                start: summary.start,
                end: summary.end,
                headline: summary.headline,
                Summary: summary.summary,
                gist: summary.gist,
            }))
        })  
        await db.meeting.update({
            where:{id: meetingId},
            data:{
                status:"COMPLETED",
                name: summaries[0]?.headline || "Untitled Meeting",           
            }
        })
        return NextResponse.json({message:"Meeting processed successfully"}, {status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"}, {status:500});
    }
}

