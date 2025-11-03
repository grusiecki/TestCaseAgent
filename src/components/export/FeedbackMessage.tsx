import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { csvExportLogger } from '@/lib/logging/csv-export.logger';

interface FeedbackMessageProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function FeedbackMessage({ message, type }: FeedbackMessageProps) {
  csvExportLogger.componentLifecycle('render', {
    component: 'FeedbackMessage',
    type,
    messageLength: message.length
  });

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'success':
      case 'info':
      default:
        return 'default';
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600';
    }
  };

  return (
    <Alert variant={getVariant()} className={getAlertClass()}>
      {getIcon()}
      <AlertDescription className="text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
}
