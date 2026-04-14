"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useProject from "@/hooks/use-project";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken: string;
};

const Createpage = () => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkcredits = api.project.checkCredits.useMutation();
  const [processingProjectId, setProcessingProjectId] = useState<string | null>(
    null
  );

  const { data: projectStatus } = api.project.getProjectStatus.useQuery(
    {
      projectId: processingProjectId!,
    },
    {
      enabled: !!processingProjectId,
      refetchInterval: 2000, // Poll every 2 seconds
    }
  );

  const { setProjectId } = useProject();
  const refetch = useRefetch();

  useEffect(() => {
    if (projectStatus === "COMPLETED") {
      toast.success("Project finished processing!");
      router.push("/dashboard");
      setProcessingProjectId(null);
    } else if (projectStatus === "FAILED") {
      toast.error("Project processing failed. Please try again.");
      setProcessingProjectId(null);
    }
  }, [projectStatus, router]);

  const onSubmit = async (data: FormInput) => {
    if (!!checkcredits.data) {
      if (!hasEnoughCredits) {
        toast.error("Not enough credits to create project");
        router.push("/billing");
        return;
      }
      await createProject.mutateAsync(
        {
          githubUrl: data.repoUrl,
          name: data.projectName,
          githubToken: data.githubToken,
        },
        {
          onSuccess: (project) => {
            toast.info("Project creation started. We'll notify you when it's ready.");
            setProjectId(project.id);
            setProcessingProjectId(project.id);
            refetch();
          },
          onError: () => {
            toast.error("Failed to create project");
          },
        }
      );
    } else {
      checkcredits.mutate(
        {
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        },
        {
          onError: (err) => {
            toast.error("Failed to check credits", {
              description: err.message,
            });
          },
        }
      );
    }
  };

  const hasEnoughCredits = checkcredits.data
    ? checkcredits.data.userCredits >= checkcredits.data.fileCount
    : true;

  const isProcessing = !!processingProjectId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 px-4">
      <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-4xl">
        {/* Left Image */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAEIqjyhIaPZHr1gpjcIOAIhHWq86nTxDz3g&s"
          alt="Developer"
          className="w-64 h-auto"
        />

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 space-y-6 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Link your GitHub Repository
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the URL of your repository to link it to Dionysus
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
              disabled={isProcessing}
            />
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              type="url"
              required
              disabled={isProcessing}
            />
            <Input
              {...register("githubToken", { required: true })}
              placeholder="Github Token"
              required
              disabled={isProcessing}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createProject.isPending || checkcredits.isPending || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
          {checkcredits.data && (
            <div
              className={`flex items-center gap-2 text-sm ${
                hasEnoughCredits ? "text-green-500" : "text-red-500"
              }`}
            >
              <Info size={16} />
              <span>
                This project will cost {checkcredits.data.fileCount} credits. You
                have {checkcredits.data.userCredits} credits remaining.
              </span>
            </div>
          )}
          {!checkcredits.data && (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleSubmit(onSubmit)}
              disabled={checkcredits.isPending || createProject.isPending || isProcessing}
            >
              Check required credits
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Createpage;

