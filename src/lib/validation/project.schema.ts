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
  testCases: z.array(z.object({
    title: z.string().min(1, 'Test case title is required').max(255, 'Test case title must be less than 255 characters'),
    preconditions: z.string().max(1000, 'Preconditions must be less than 1000 characters'),
    steps: z.string().min(1, 'Test case steps are required').max(5000, 'Test case steps must be less than 5000 characters'),
    expected_result: z.string().min(1, 'Expected result is required').max(5000, 'Expected result must be less than 5000 characters'),
    order_index: z.number().int().min(0)
  }))
    .max(20, 'Maximum 20 test cases allowed')
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
