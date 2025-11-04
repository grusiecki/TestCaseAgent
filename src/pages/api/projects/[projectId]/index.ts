import type { APIRoute } from "astro";
import { ProjectService } from "../../../../lib/services/project.service";
import { rateLimit } from "../../../../middleware/rate-limit";
import { logger } from "../../../../lib/logging/logger";
import { formatErrorResponse } from "../../../../lib/errors/api-errors";

export const GET: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      return await rateLimit()(context, async () => {
        const { locals, params } = context;

        // Ensure project ID is provided
        const projectId = params.projectId;
        if (!projectId) {
          logger.warn('get-project_validation_error', {
            error: 'Project ID is required',
            params
          });
          return new Response(JSON.stringify({ error: "Project ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        logger.debug('get-project_fetch', { projectId });

        // Get project with test cases using service
        const projectService = new ProjectService(locals.supabase);
        const projectData = await projectService.exportProject(projectId);

        logger.info('get-project_success', {
          projectId,
          testCaseCount: projectData.testCases.length
        });

        // Return successful response
        return new Response(JSON.stringify(projectData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });
    } catch (error) {
      logger.error('get-project_error', error as Error, {
        method: 'GET',
        url: '/api/projects/[projectId]'
      });
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
        const projectId = params.projectId;
        if (!projectId) {
          logger.warn('delete-project_validation_error', {
            error: 'Project ID is required',
            params
          });
          return new Response(JSON.stringify({ error: "Project ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        logger.debug('delete-project_start', { projectId });

        // Delete project using service
        const projectService = new ProjectService(locals.supabase);
        await projectService.deleteProject(projectId);

        logger.info('delete-project_success', {
          projectId
        });

        // Return successful response
        return new Response(JSON.stringify({ message: "Project deleted successfully" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });
    } catch (error) {
      logger.error('delete-project_error', error as Error, {
        method: 'DELETE',
        url: '/api/projects/[projectId]'
      });
      return formatErrorResponse(error as Error);
    }
  });
};
