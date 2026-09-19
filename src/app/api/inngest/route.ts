import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processAudioFile, generateGuide, regenerateStaleSections } from "@/inngest";

const handler = serve({
  client: inngest,
  functions: [
    processAudioFile,
    generateGuide,
    regenerateStaleSections,
  ],
});

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
