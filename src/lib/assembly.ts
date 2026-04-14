import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

function msToTime(ms: number) {
    const seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}m: ${remainingSeconds.toString().padStart(2, "0")}s`;
}

export const processMeeting = async (meetingUrl: string) => {
    const transcript = await client.transcripts.transcribe({
        audio_url: meetingUrl,
        auto_chapters: true,
        auto_highlights: true,
        entity_detection: true,
        sentiment_analysis: true,
        word_boost: [
            "AI",
            "Artificial Intelligence",
            "Machine Learning",
            "Blockchain",
            "Cryptocurrency",
            "Metaverse",
            "NFTs",
            "Web3",
        ],
    });

    const summaries =
        transcript.chapters?.map((chapter) => ({
            start: msToTime(chapter.start),
            end: msToTime(chapter.end),
            summary: chapter.summary,
            headline: chapter.headline,
            gist: chapter.gist,
        })) || [];

    if (!transcript.id) throw new Error("No Transcript found");

    return {
        summaries,
    };
};