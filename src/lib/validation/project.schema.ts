import { z } from 'zod';

// Validation schema for creating a new project
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  initialTitles: z.array(z.string()
    .min(1, 'Test case title cannot be empty')
    .max(200, 'Test case title must be less than 200 characters'))
    .max(20, 'Maximum 20 initial test cases allowed')
    .optional(),
});

// Validation schema for updating a project
export const updateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
});

// Type inference from the schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
