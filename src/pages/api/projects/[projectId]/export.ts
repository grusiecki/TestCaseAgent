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

  // Convert test cases to CSV rows - using multi-row format for TestRail
  const rows: string[][] = [];

  testCases.forEach(testCase => {
    const steps = parseStepsAndResults(testCase.steps);
    const expectedResults = parseStepsAndResults(testCase.expected_result);

    // Determine the maximum number of rows needed for this test case
    const maxRows = Math.max(steps.length, expectedResults.length, 1);

    for (let i = 0; i < maxRows; i++) {
      const isFirstRow = i === 0;

      rows.push([
        // Title only in first row
        isFirstRow ? escapeCSV(testCase.title) : '',
        // Steps - one per row
        escapeCSV(steps[i] || ''),
        // Expected Result - one per row
        escapeCSV(expectedResults[i] || ''),
        // Preconditions only in first row
        isFirstRow ? escapeCSV(testCase.preconditions || '') : ''
      ]);
    }
  });

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

// Parse steps and expected results into individual items for multi-row CSV format
function parseStepsAndResults(field: string): string[] {
  if (!field) return [];

  // If field contains newlines, split by newlines
  if (field.includes('\n')) {
    return field.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  }

  // Split by numbered items (1. , 2. , 3. , etc.)
  const items = field.split(/(\d+\.\s)/).filter(item => item.trim().length > 0);

  // Reconstruct items by combining numbers with their text
  const result: string[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const numberPart = items[i];
    const textPart = items[i + 1];
    if (textPart) {
      result.push((numberPart + textPart).trim());
    } else {
      // If no text part, it might be just the number part
      result.push(numberPart.trim());
    }
  }

  return result.length > 0 ? result : [field];
}

// Format steps and expected results to ensure each step/result is on a separate line
function formatStepsAndResults(field: string): string {
  if (!field) return '';

  // If the field already contains newlines, return as is
  if (field.includes('\n')) {
    return field;
  }

  // Add newlines before numbered steps/results (e.g., "1. Step one 2. Step two" -> "1. Step one\n2. Step two")
  return field.replace(/(\d+\.\s)/g, '\n$1').trim();
}

// Escape CSV field to handle quotes and newlines
function escapeCSV(field: string): string {
  if (!field) return '';

  // Always escape double quotes by replacing them with double double quotes
  // This ensures proper CSV formatting for fields that will be wrapped in quotes
  return field.replace(/"/g, '""');
}
