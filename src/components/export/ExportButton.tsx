import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { csvExportLogger } from '@/lib/logging/csv-export.logger';

interface ExportButtonProps {
  onExport: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export function ExportButton({ onExport, loading, disabled = false }: ExportButtonProps) {
  const handleExport = async () => {
    csvExportLogger.userInteraction('export-button-clicked', {
      loading,
      disabled,
      timestamp: new Date().toISOString()
    });

    if (loading || disabled) {
      csvExportLogger.userInteraction('export-button-click-prevented', {
        reason: loading ? 'already loading' : 'disabled',
        loading,
        disabled
      });
      return;
    }

    try {
      csvExportLogger.exportAction('start', {
        action: 'initiate-export'
      });

      await onExport();

      csvExportLogger.exportAction('success', {
        action: 'export-completed'
      });
    } catch (error) {
      csvExportLogger.exportAction('error', {
        action: 'export-failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Re-throw error to be handled by parent component
      throw error;
    }
  };

  const getButtonText = () => {
    if (loading) return 'Exporting...';
    return 'Export to CSV';
  };

  const getButtonVariant = () => {
    if (disabled) return 'secondary';
    return 'default';
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading || disabled}
      variant={getButtonVariant()}
      size="lg"
      className="w-full sm:w-auto"
      aria-label={loading ? 'Exporting test cases to CSV' : 'Export test cases to CSV'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      {getButtonText()}
    </Button>
  );
}
