import { useState, useCallback, useEffect } from "react";
import type { ProjectDTO, ProjectsListResponse } from "../../../types";
import { calculateDashboardStats } from "../types";
import type { DashboardStatsViewModel } from "../types";
import { validateProjectsResponse, ValidationError } from "../utils/validation";

interface DashboardState {
  projects: ProjectDTO[];
  stats: DashboardStatsViewModel;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
}

interface DashboardActions {
  fetchProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  exportProject: (projectId: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Invalid data received from server: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function useDashboard(): [DashboardState, DashboardActions] {
  const [state, setState] = useState<DashboardState>({
    projects: [],
    stats: {
      totalProjects: 0,
      totalTestCases: 0,
    },
    isLoading: true,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchProjects = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/projects?page=${state.page}&limit=${state.limit}`);
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "No projects found"
            : response.status === 401
              ? "Please log in to view projects"
              : "Failed to fetch projects"
        );
      }

      const rawData = await response.json();

      // Validate response data
      validateProjectsResponse(rawData);
      const data = rawData as ProjectsListResponse;

      const stats = calculateDashboardStats(data.projects);

      setState((prev) => ({
        ...prev,
        projects: data.projects,
        stats,
        total: data.total,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(error),
        isLoading: false,
      }));
    }
  }, [state.page, state.limit]);

  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Project not found"
              : response.status === 401
                ? "You don't have permission to delete this project"
                : "Failed to delete project"
          );
        }

        // Refresh projects after deletion
        await fetchProjects();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: getErrorMessage(error),
          isLoading: false,
        }));
      }
    },
    [fetchProjects]
  );

  const exportProject = useCallback((projectId: string) => {
    // Navigate to export view instead of downloading
    window.location.href = `/projects/${projectId}/export`;
  }, []);

  const setPage = useCallback((page: number) => {
    if (page < 1) {
      setState((prev) => ({
        ...prev,
        error: "Invalid page number",
      }));
      return;
    }
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    if (limit < 1) {
      setState((prev) => ({
        ...prev,
        error: "Invalid page size",
      }));
      return;
    }
    setState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return [
    state,
    {
      fetchProjects,
      deleteProject,
      exportProject,
      setPage,
      setLimit,
    },
  ];
}
