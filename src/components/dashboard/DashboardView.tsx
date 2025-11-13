import { DashboardStats } from "./DashboardStats";
import { ProjectList } from "./ProjectList";
import { Pagination } from "./Pagination";
import { NewProjectButton } from "./NewProjectButton";
import { LogoutButton } from "./LogoutButton";
import { useDashboard } from "./hooks/useDashboard";
import { useAuthGuard } from "../../lib/hooks/useAuthGuard";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";

export function DashboardView() {
  useAuthGuard();
  const [
    { projects, stats, isLoading, error, page, limit, total },
    { fetchProjects, deleteProject, exportProject, editProject, setPage },
  ] = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20">
            <p className="text-center">{error}</p>
          </div>
          <div className="text-center">
            <Button
              onClick={() => fetchProjects()}
              variant="outline"
              className="hover:bg-muted/50 dark:hover:bg-muted/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-muted-foreground">Manage and monitor your test case projects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <NewProjectButton />
          <LogoutButton />
        </div>
      </div>

      <div className="space-y-8">
        <DashboardStats stats={stats} isLoading={isLoading} />

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          <ProjectList
            projects={projects}
            isLoading={isLoading}
            onExport={exportProject}
            onDelete={deleteProject}
            onEdit={editProject}
          />
        </div>

        {!isLoading && projects.length > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
