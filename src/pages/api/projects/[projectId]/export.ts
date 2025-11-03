import type { APIRoute } from "astro";
import { ProjectService } from "../../../../lib/services/project.service";
import { rateLimit } from "../../../../middleware/rate-limit";
import { logger } from "../../../../lib/logging/logger";
import { formatErrorResponse } from "../../../../lib/errors/api-errors";

export const GET: APIRoute = async (context) => {
  return logger.logRequest(context, async () => {
    try {
      logger.info('export_start', {
        method: 'GET',
        url: '/api/projects/[projectId]/export'
      });

      // Apply rate limit middleware
      return await rateLimit()(context, async () => {
        const { locals, params } = context;

        // Ensure project ID is provided
        const projectId = params.projectId;
        if (!projectId) {
          logger.warn('export_validation_error', {
            error: 'Project ID is required',
            params
          });
          return new Response(JSON.stringify({ error: "Project ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        logger.debug('export_project_fetch', { projectId });

        // Export project data using service
        const projectService = new ProjectService(locals.supabase);
        const exportData = await projectService.exportProject(projectId);

        // Generate CSV content
        const csvContent = generateCSV(exportData.testCases);

        logger.info('export_success', {
          projectId,
          testCaseCount: exportData.testCases.length,
          csvSize: csvContent.length
        });

        // Return CSV file as download
        return new Response(csvContent, {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${exportData.project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_test_cases.csv"`,
          },
        });
      });
    } catch (error) {
      logger.error('export_error', error as Error, {
        method: 'GET',
        url: '/api/projects/[projectId]/export'
      });
      return formatErrorResponse(error as Error);
    }
  });
};

// Generate CSV content compatible with TestRail format
function generateCSV(testCases: any[]): string {
  logger.debug('csv_generation_start', { testCaseCount: testCases.length });

  // CSV header row
  const headers = ['Title', 'Steps', 'Expected Result', 'Preconditions'];

  // Convert test cases to CSV rows
  const rows = testCases.map(testCase => [
    escapeCSV(testCase.title),
    escapeCSV(testCase.steps),
    escapeCSV(testCase.expected_result),
    escapeCSV(testCase.preconditions || '')
  ]);

  // Combine headers and rows
  const csvData = [headers, ...rows];

  // Convert to CSV string
  const csvString = csvData.map(row =>
    row.map(field => `"${field}"`).join(',')
  ).join('\n');

  logger.debug('csv_generation_complete', {
    testCaseCount: testCases.length,
    csvLines: csvData.length
  });

  return csvString;
}

// Escape CSV field to handle quotes and newlines
function escapeCSV(field: string): string {
  if (!field) return '';

  // Replace double quotes with double double quotes and wrap in quotes if contains comma, quote, or newline
  const needsQuotes = field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r');

  if (needsQuotes) {
    return field.replace(/"/g, '""');
  }

  return field;
}
