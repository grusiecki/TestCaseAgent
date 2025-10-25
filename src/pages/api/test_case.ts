import type { APIRoute } from "astro";
import { TestCaseService } from "../../lib/services/test-case.service";
import { createTestCaseSchema, updateTestCaseSchema } from "../../lib/validation/test-case.schema";
import { requireAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { checkPayloadSize } from "../../middleware/payload-limit";
import { logger } from "../../lib/logging/logger";
import { formatErrorResponse } from "../../lib/errors/api-errors";

export const GET: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      // Apply middleware
      await requireAuth(context);
      await rateLimit()(context);

      const { locals, params } = context;
      const { projectId } = params;

      if (!projectId) {
        return new Response(JSON.stringify({ error: "Project ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Get pagination parameters from query
      const url = new URL(context.request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");

      // Fetch test cases using service
      const testCaseService = new TestCaseService(locals.supabase);
      const testCases = await testCaseService.getTestCases(projectId, { page, limit });

      // Return successful response
      return new Response(JSON.stringify(testCases), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};

export const POST: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      // Apply middleware
      await requireAuth(context);
      await rateLimit()(context);
      await checkPayloadSize(context);

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
      const validatedData = createTestCaseSchema.parse(body);

      // Check test cases limit
      const testCaseService = new TestCaseService(locals.supabase);
      const existingCount = await testCaseService.getTestCasesCount(projectId);

      if (existingCount >= 20) {
        return new Response(JSON.stringify({ error: "Maximum number of test cases (20) reached" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Create test case using service
      const testCase = await testCaseService.createTestCase(projectId, validatedData);

      // Return successful response
      return new Response(JSON.stringify(testCase), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};

export const getTestCaseById: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      // Apply middleware
      await requireAuth(context);
      await rateLimit()(context);

      const { locals, params } = context;
      const { projectId, id } = params;

      if (!projectId || !id) {
        return new Response(JSON.stringify({ error: "Project ID and Test Case ID are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Fetch test case using service
      const testCaseService = new TestCaseService(locals.supabase);
      const testCase = await testCaseService.getTestCaseById(projectId, id);

      if (!testCase) {
        return new Response(JSON.stringify({ error: "Test case not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Return successful response
      return new Response(JSON.stringify(testCase), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};

export const PUT: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      // Apply middleware
      await requireAuth(context);
      await rateLimit()(context);
      await checkPayloadSize(context);

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
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};

export const DELETE: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      // Apply middleware
      await requireAuth(context);
      await rateLimit()(context);

      const { locals, params } = context;
      const { projectId, id } = params;

      if (!projectId || !id) {
        return new Response(JSON.stringify({ error: "Project ID and Test Case ID are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Soft delete test case using service
      const testCaseService = new TestCaseService(locals.supabase);
      await testCaseService.softDeleteTestCase(projectId, id);

      // Return successful response
      return new Response(null, { status: 204 });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};
