import type { APIRoute } from "astro";
import { ProjectService } from "../../lib/services/project.service";
import { createProjectSchema, updateProjectSchema } from "../../lib/validation/project.schema";
import { rateLimit } from "../../middleware/rate-limit";
import { checkPayloadSize } from "../../middleware/payload-limit";
import { logger } from "../../lib/logging/logger";
import { formatErrorResponse } from "../../lib/errors/api-errors";

export const GET: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      console.log('GET /api/projects - Start');

      // Apply rate limit middleware
      console.log('Applying rate limit middleware...');
      return await rateLimit()(context, async () => {
        console.log('Handling GET projects request...');
        const { locals } = context;

        // Fetch projects using service
        console.log('Creating ProjectService instance...');
        const projectService = new ProjectService(locals.supabase);
        console.log('Fetching projects...');
        const projects = await projectService.getProjects();
        console.log(`Successfully fetched ${projects.length} projects`);

        // Get pagination parameters from query
        const url = new URL(context.request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);

        // Return successful response with pagination
        return new Response(JSON.stringify({
          projects,
          page,
          limit,
          total: projects.length // For now, total is same as length since we're not paginating in DB yet
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });
    } catch (error) {
      console.error('Error in GET /api/projects:', error);
      return formatErrorResponse(error as Error);
    }
  });
};

export const POST: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      return await rateLimit()(context, async () => {
        return await checkPayloadSize(context, async () => {
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
        });
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};

export const PUT: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      return await rateLimit()(context, async () => {
        return await checkPayloadSize(context, async () => {
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
        });
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};

export const DELETE: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      return await rateLimit()(context, async () => {
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
      });
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  });
};