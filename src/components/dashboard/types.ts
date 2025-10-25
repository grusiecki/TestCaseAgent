import type { ProjectDTO } from "../../types";

export interface DashboardStatsViewModel {
  totalProjects: number;
  totalTestCases: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

// Helper function to calculate dashboard stats from projects
export function calculateDashboardStats(projects: ProjectDTO[]): DashboardStatsViewModel {
  const totalProjects = projects.length;
  const totalTestCases = projects.reduce((sum, project) => sum + project.testCaseCount, 0);

  return {
    totalProjects,
    totalTestCases,
  };
}