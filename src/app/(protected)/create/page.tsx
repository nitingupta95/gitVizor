"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info, Loader2, GitBranch, Link2, Key } from "lucide-react";
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-4xl">
        {/* Left Visual */}
        <div className="hidden md:flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl"></div>
            <div className="relative flex h-48 w-48 items-center justify-center rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
              <GitBranch className="h-24 w-24 text-primary/60" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Connect & Analyze</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
              Link your GitHub repository and let AI index every file
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 space-y-6 rounded-2xl border border-border/40 bg-card/60 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Link your GitHub Repository
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the URL of your repository to link it to GitVizor
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary"></span>
                Project Name
              </label>
              <Input
                {...register("projectName", { required: true })}
                placeholder="My Awesome Project"
                required
                disabled={isProcessing}
                className="border-border/40 bg-background/50 focus:border-primary/30 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Link2 className="h-3 w-3" />
                GitHub URL
              </label>
              <Input
                {...register("repoUrl", { required: true })}
                placeholder="https://github.com/user/repo"
                type="url"
                required
                disabled={isProcessing}
                className="border-border/40 bg-background/50 focus:border-primary/30 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                GitHub Token
              </label>
              <Input
                {...register("githubToken", { required: true })}
                placeholder="ghp_xxxxxxxxxxxx"
                required
                disabled={isProcessing}
                className="border-border/40 bg-background/50 focus:border-primary/30 transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
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
              className={`flex items-center gap-2 text-sm rounded-lg p-3 ${
                hasEnoughCredits 
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                  : "text-red-400 bg-red-500/10 border border-red-500/20"
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
              className="w-full border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all"
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
