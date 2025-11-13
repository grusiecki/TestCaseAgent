import type { APIRoute } from "astro";
import { TestCaseService } from "../../../../lib/services/test-case.service";
import { z } from "zod";
import { rateLimit } from "../../../../middleware/rate-limit";
import { checkPayloadSize } from "../../../../middleware/payload-limit";
import { logger } from "../../../../lib/logging/logger";
import { formatErrorResponse } from "../../../../lib/errors/api-errors";

// Schema for bulk update - array of test cases with their IDs
const bulkUpdateSchema = z.array(
  z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    preconditions: z.string().nullable().optional(),
    steps: z.string().optional(),
    expected_result: z.string().optional(),
    order_index: z.number().int().min(0).optional()
  })
).min(0).max(20); // Max 20 test cases per project

export const PUT: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      return await rateLimit()(context, async () => {
        return await checkPayloadSize(context, async () => {
          const { request, locals, params } = context;
          const { projectId } = params;

          if (!projectId) {
            return new Response(JSON.stringify({ error: "Project ID is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Parse and validate request body
          const body = await request.json();
          const validatedData = bulkUpdateSchema.parse(body);

          logger.info('bulk-update-testcases_start', {
            projectId,
            testCaseCount: validatedData.length
          });

          // Get user ID from session
          const userId = locals.user?.id;
          if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Use atomic bulk update via PostgreSQL function
          const testCaseService = new TestCaseService(locals.supabase);
          
          try {
            const updatedTestCases = await testCaseService.bulkUpdateTestCases(
              projectId,
              userId,
              validatedData
            );

            logger.info('bulk-update-testcases_complete', {
              projectId,
              totalCount: validatedData.length,
              successCount: updatedTestCases.length,
              failCount: 0
            });

            // Return success results
            const results = updatedTestCases.map(tc => ({
              id: tc.id,
              success: true,
              data: tc
            }));

            return new Response(
              JSON.stringify({
                success: true,
                successCount: updatedTestCases.length,
                failCount: 0,
                results
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          } catch (error) {
            logger.error('bulk-update-testcases_error', error as Error, {
              projectId
            });

            // If bulk update fails, all fail together (atomicity)
            return new Response(
              JSON.stringify({
                success: false,
                successCount: 0,
                failCount: validatedData.length,
                error: error instanceof Error ? error.message : 'Unknown error'
              }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        });
      });
    } catch (error) {
      logger.error('bulk-update-testcases_error', error as Error, {
        method: 'PUT',
        url: '/api/projects/[projectId]/testcases'
      });
      return formatErrorResponse(error as Error);
    }
  });
};

