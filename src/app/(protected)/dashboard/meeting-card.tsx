"use client";

import { Card } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { useDropzone } from "react-dropzone";
import React from "react";
import { Presentation, Upload } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { env } from "~/env";

const MeetingCard = () => {
  const { project } = useProject();
  const [isUploading, setIsUploading] = React.useState(false);
  const createMeeting = api.meeting.createMeeting.useMutation();
  const getCloudinarySignature =
    api.meeting.createCloudinarySignature.useMutation();
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024, // 500MB
    onDrop: async (acceptedFiles) => {
      if (!project) {
        toast.error("Please select a project before uploading a meeting.");
        return;
      }
      setIsUploading(true);

      const file = acceptedFiles[0];
      if (!file) {
        setIsUploading(false);
        return;
      }

      try {
        // 1. Get signature from our server
        const { signature, timestamp } =
          await getCloudinarySignature.mutateAsync();

        // 2. Upload directly to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;

        const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);

        const { secure_url, public_id } = cloudinaryResponse.data;

        // 3. Save meeting details to our database
        createMeeting.mutate(
          {
            name: file.name,
            cloudinaryUrl: secure_url,
            cloudinaryPublicId: public_id,
            projectId: project.id,
          },
          {
            onSuccess: () => {
              toast.success("Meeting uploaded successfully!");
              router.push(`/meetings`);
            },
            onError: (error) => {
              toast.error("Error saving meeting: " + error.message);
            },
            onSettled: () => {
              setIsUploading(false);
            },
          }
        );
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(
          "An error occurred during upload. Please check the console and try again."
        );
        setIsUploading(false);
      }
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center p-10 border border-dashed border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 cursor-pointer group"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Upload className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground tracking-tight">
            Upload a meeting
          </h3>
          <p className="mt-1 text-xs text-muted-foreground text-center max-w-[200px]">
            Drop a video or audio file here, or click to select
          </p>
        </>
      )}
    </Card>
  );
};

export default MeetingCard;
