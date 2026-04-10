"use client"

import { Card } from '@/components/ui/card';
import useProject from '@/hooks/use-project'
import {useDropzone} from 'react-dropzone';
import React from 'react'
import { uploadFile } from '@/lib/firebase';
import { Presentation, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {CircularProgressbar, buildStyles} from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const MeetingCard = () => {
  const processMeeting = useMutation({
    mutationFn: async (data:{meetingUrl: string, meetingId: string, projectId:string}) => {
      const {meetingUrl, meetingId, projectId} = data
      const response = await axios.post('/api/process-meeting', {
        meetingUrl,
        meetingId,
        projectId
      });
      return response.data;
    },
    onError: (error: any) => {
      toast.error('Failed to process meeting', { description: error.response?.data?.error || error.message });
    }
  });

  const { project } = useProject();
  const [progress, setProgress] = React.useState(0);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const [isUploading, setIsUploading] = React.useState(false);
  const router = useRouter();

  const {getRootProps, getInputProps} = useDropzone({
    accept:{
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async(acceptedFiles) => {
      if(!project) {
        toast.error("Please select a project before uploading a meeting.");
        return;
      }
      setIsUploading(true);
      
      const file = acceptedFiles[0];
      if(!file) return;

      try {
        const downloadURL = await uploadFile(file as File, setProgress) as string;

        // Use a single, correctly structured mutate call with a single onSuccess callback.
        uploadMeeting.mutate({
          meetingUrl: downloadURL,
          projectId: project.id,
          name: file.name
        },{
          onError: (error) => {
            toast.error("Error uploading meeting: " + error.message);
            setIsUploading(false);
          },
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully! Processing has started.");
            router.push(`/meetings`);

            // Check if meeting and its id exist before calling mutateAsync
            if (meeting?.id) {
              processMeeting.mutateAsync({
                meetingUrl: downloadURL,
                meetingId: meeting.id,
                projectId: project.id
              });
            } else {
              toast.error("Error: Meeting ID not found after upload.");
            }
            setIsUploading(false);
          }
        });
      } catch (error) {
        toast.error("An error occurred during file upload. Please try again.");
        setIsUploading(false);
      }
    }
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Dionysus.
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
        <div className='w-16'>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className='size-20'
            styles={buildStyles({
              pathColor: 'blue',
              trailColor: 'lightgray',
            })}
          />
          <p className="mt-2 text-sm text-gray-500 text-center">Uploading your meeting...</p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
