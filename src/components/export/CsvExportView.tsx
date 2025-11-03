import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSummary } from './ProjectSummary';
import { TestCaseList } from './TestCaseList';
import { ExportButton } from './ExportButton';
import { FeedbackMessage } from './FeedbackMessage';
import { useCsvExport } from './hooks/useCsvExport';
import { csvExportLogger } from '@/lib/logging/csv-export.logger';
import type { ProjectDTO, TestCaseDTO } from '@/types';

interface CsvExportViewProps {
  projectId: string;
}

export function CsvExportView({ projectId }: CsvExportViewProps) {
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [testCases, setTestCases] = useState<TestCaseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  const { exportStatus, feedbackMessage, handleExport } = useCsvExport(projectId);

  // Error boundary for component errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('CsvExportView error:', event.error);
      setComponentError(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (componentError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Component Error</h2>
            <p className="text-gray-600">{componentError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        csvExportLogger.componentLifecycle('mount', {
          projectId,
          action: 'fetching-project-data'
        });

        setIsLoading(true);
        setError(null);

        // Fetch project details with test cases
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const projectData = await response.json();
        const { project, testCases } = projectData;

        setProject(project);
        setTestCases(testCases);
        setIsLoading(false);

        csvExportLogger.componentLifecycle('data-loaded', {
          projectId,
          testCaseCount: testCases.length,
          projectName: project.name
        });
      } catch (err) {
        csvExportLogger.componentLifecycle('error', {
          projectId,
          error: err instanceof Error ? err.message : 'Unknown error'
        });

        setError(err instanceof Error ? err.message : 'An error occurred while fetching project data');
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Loading Project Data</h2>
          <p className="text-gray-500">Preparing export view...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Error Loading Project</h2>
            <p className="text-gray-600">{error || 'Project not found'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Export Test Cases to CSV</CardTitle>
          <p className="text-gray-600">
            Review your project details and test cases before exporting to a TestRail-compatible CSV file.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProjectSummary project={project} />

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Test Cases ({testCases.length})</h3>
            <TestCaseList testCases={testCases} />
          </div>

          <div className="border-t pt-6 space-y-4">
            <ExportButton
              onExport={() => handleExport()}
              loading={exportStatus === 'loading'}
              disabled={testCases.length === 0}
            />

            {feedbackMessage && (
              <FeedbackMessage
                message={feedbackMessage}
                type={exportStatus === 'success' ? 'success' : exportStatus === 'error' ? 'error' : 'info'}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
