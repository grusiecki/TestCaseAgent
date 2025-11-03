import { useState } from 'react';
import { csvExportLogger } from '@/lib/logging/csv-export.logger';

export type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export function useCsvExport(projectId: string) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [hasExportedSuccessfully, setHasExportedSuccessfully] = useState<boolean>(false);

  const handleExport = async (): Promise<void> => {
    csvExportLogger.exportAction('start', {
      projectId,
      action: 'handleExport-called'
    });

    setExportStatus('loading');
    setFeedbackMessage('');

    try {
      csvExportLogger.apiCall('start', {
        projectId,
        endpoint: `/api/projects/${projectId}/export`,
        method: 'GET'
      });

      // Make the API call to export endpoint
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });

      csvExportLogger.apiCall('success', {
        projectId,
        status: response.status,
        contentType: response.headers.get('content-type')
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'test_cases.csv'
        : 'test_cases.csv';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      csvExportLogger.exportAction('success', {
        projectId,
        filename,
        blobSize: blob.size
      });

      setExportStatus('success');
      setHasExportedSuccessfully(true);
      setFeedbackMessage(`Successfully exported ${filename}`);

      // Clear success message after 5 seconds, but keep export status as success
      setTimeout(() => {
        setFeedbackMessage('');
        // Don't reset to 'idle' - keep success status for the button
      }, 5000);

    } catch (error) {
      csvExportLogger.exportAction('error', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred during export';

      setExportStatus('error');
      setFeedbackMessage(`Export failed: ${errorMessage}`);
    }
  };

  return {
    exportStatus,
    feedbackMessage,
    hasExportedSuccessfully,
    handleExport
  };
}
