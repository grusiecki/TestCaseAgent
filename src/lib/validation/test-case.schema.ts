import { z } from 'zod';

// Validation schema for creating a new test case
export const createTestCaseSchema = z.object({
  title: z.string()
    .min(1, 'Test case title is required')
    .max(255, 'Test case title must be less than 255 characters'),
  preconditions: z.string()
    .max(1000, 'Preconditions must be less than 1000 characters')
    .optional(),
  steps: z.string()
    .min(1, 'Test case steps are required')
    .max(5000, 'Test case steps must be less than 5000 characters'),
  expected_result: z.string()
    .min(1, 'Expected result is required')
    .max(5000, 'Expected result must be less than 5000 characters'),
  order_index: z.number()
    .int('Order index must be an integer')
    .min(0, 'Order index must be non-negative')
    .optional(),
});

// Validation schema for updating a test case
export const updateTestCaseSchema = z.object({
  title: z.string()
    .min(1, 'Test case title is required')
    .max(255, 'Test case title must be less than 255 characters')
    .optional(),
  preconditions: z.string()
    .max(1000, 'Preconditions must be less than 1000 characters')
    .nullable()
    .optional(),
  steps: z.string()
    .min(1, 'Test case steps are required')
    .max(5000, 'Test case steps must be less than 5000 characters')
    .optional(),
  expected_result: z.string()
    .min(1, 'Expected result is required')
    .max(5000, 'Expected result must be less than 5000 characters')
    .optional(),
  order_index: z.number()
    .int('Order index must be an integer')
    .min(0, 'Order index must be non-negative')
    .optional(),
});

// Type inference from the schemas
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
