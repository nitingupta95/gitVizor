import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from 'usehooks-ts';

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();

  // Use empty string as default so TRPC z.string() never receives null
  const [projectId, setProjectId] = useLocalStorage<string>('githubSaas', '');

  const project = projects?.find((project) => project.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId
  };
};

export default useProject;