import type { APIRoute } from "astro";
import { TestCaseService } from "../../../../../lib/services/test-case.service";
import { updateTestCaseSchema } from "../../../../../lib/validation/test-case.schema";
import { rateLimit } from "../../../../../middleware/rate-limit";
import { checkPayloadSize } from "../../../../../middleware/payload-limit";
import { logger } from "../../../../../lib/logging/logger";
import { formatErrorResponse } from "../../../../../lib/errors/api-errors";

export const PUT: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      return await rateLimit()(context, async () => {
        return await checkPayloadSize(context, async () => {
          const { request, locals, params } = context;
          const { projectId, id } = params;

          if (!projectId || !id) {
            return new Response(JSON.stringify({ error: "Project ID and Test Case ID are required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Parse and validate request body
          const body = await request.json();
          const validatedData = updateTestCaseSchema.parse(body);

          // Update test case using service
          const testCaseService = new TestCaseService(locals.supabase);
          const testCase = await testCaseService.updateTestCase(projectId, id, validatedData);

          // Return successful response
          return new Response(JSON.stringify(testCase), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        });
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};
