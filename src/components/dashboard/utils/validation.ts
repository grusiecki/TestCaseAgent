import type { ProjectDTO, ProjectsListResponse } from "../../../types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateProject(project: unknown): project is ProjectDTO {
  if (!project || typeof project !== "object") {
    throw new ValidationError("Invalid project data structure");
  }

  const p = project as Partial<ProjectDTO>;

  if (typeof p.id !== "string") {
    throw new ValidationError("Project ID must be a string");
  }

  if (typeof p.name !== "string") {
    throw new ValidationError("Project name must be a string");
  }

  if (typeof p.created_at !== "string" || isNaN(Date.parse(p.created_at))) {
    throw new ValidationError("Invalid project creation date");
  }

  if (p.rating !== null && typeof p.rating !== "number") {
    throw new ValidationError("Project rating must be a number or null");
  }

  if (typeof p.testCaseCount !== "number") {
    throw new ValidationError("Test case count must be a number");
  }

  return true;
}

export function validateProjectsResponse(data: unknown): data is ProjectsListResponse {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid response data structure");
  }

  const response = data as Partial<ProjectsListResponse>;

  if (!Array.isArray(response.projects)) {
    throw new ValidationError("Projects must be an array");
  }

  if (typeof response.page !== "number" || response.page < 1) {
    throw new ValidationError("Page must be a positive number");
  }

  if (typeof response.limit !== "number" || response.limit < 1) {
    throw new ValidationError("Limit must be a positive number");
  }

  if (typeof response.total !== "number" || response.total < 0) {
    throw new ValidationError("Total must be a non-negative number");
  }

  // Validate each project in the array
  response.projects.forEach((project, index) => {
    try {
      validateProject(project);
    } catch (error) {
      throw new ValidationError(`Invalid project at index ${index}: ${error.message}`);
    }
  });

  return true;
}
