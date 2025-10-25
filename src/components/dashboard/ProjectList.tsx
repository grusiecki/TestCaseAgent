import type { ProjectDTO } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { Skeleton } from "../ui/skeleton";

interface ProjectListProps {
  projects: ProjectDTO[];
  isLoading?: boolean;
  onExport: (projectId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onSelect: (projectId: string) => void;
}

export function ProjectList({ projects, isLoading = false, onExport, onDelete, onSelect }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
        <p className="text-sm text-muted-foreground">Create your first project to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onExport={onExport} onDelete={onDelete} onSelect={onSelect} />
      ))}
    </div>
  );
}
