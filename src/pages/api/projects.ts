import type { APIRoute } from "astro";
import { ProjectService } from "../../lib/services/project.service";
import { createProjectSchema, updateProjectSchema } from "../../lib/validation/project.schema";
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

      const { locals } = context;

      // Fetch projects using service
      const projectService = new ProjectService(locals.supabase);
      const projects = await projectService.getProjects();

      // Return successful response
      return new Response(JSON.stringify(projects), {
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

      const { request, locals } = context;

      // Parse and validate request body
      const body = await request.json();
      const validatedData = createProjectSchema.parse(body);

      // Create project using service
      const projectService = new ProjectService(locals.supabase);
      const project = await projectService.createProject(validatedData);

      // Return successful response
      return new Response(JSON.stringify(project), {
        status: 201,
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

      // Ensure project ID is provided
      const projectId = params.id;
      if (!projectId) {
        return new Response(JSON.stringify({ error: "Project ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Parse and validate request body
      const body = await request.json();
      const validatedData = updateProjectSchema.parse(body);

      // Update project using service
      const projectService = new ProjectService(locals.supabase);
      const project = await projectService.updateProject(projectId, validatedData);

      // Return successful response
      return new Response(JSON.stringify(project), {
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

      // Ensure project ID is provided
      const projectId = params.id;
      if (!projectId) {
        return new Response(JSON.stringify({ error: "Project ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Delete project using service
      const projectService = new ProjectService(locals.supabase);
      await projectService.deleteProject(projectId);

      // Return successful response
      return new Response(null, { status: 204 });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};
