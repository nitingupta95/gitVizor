import {z} from "zod";
import {NextResponse, type NextRequest  } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { processMeeting } from "@/lib/third-party/assembly";

const bodyParser= z.object({
    meetingUrl: z.string(),
    projectId: z.string(),
    meetingId: z.string(),
});



export const maxDuration= 300; // 15 minutes in seconds




import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
    const {userId}= await auth();
    if(!userId) return NextResponse.json({error:"Unauthorized"}, {status:401});
    try {
        const body= await request.json();
        const {meetingUrl, projectId, meetingId}= bodyParser.parse(body);
        
        // Trigger background job instead of blocking
        await inngest.send({
            name: "meeting/process",
            data: { meetingUrl, projectId, meetingId }
        });

        return NextResponse.json({message:"Meeting processing started successfully"}, {status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"}, {status:500});
    }
}

