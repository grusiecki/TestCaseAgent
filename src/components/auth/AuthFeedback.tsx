import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CircleAlert } from 'lucide-react';

interface AuthFeedbackProps {
  error?: string | null;
  success?: string | null;
  loading?: boolean;
  loadingMessage?: string;
}

export function AuthFeedback({
  error,
  success,
  loading = false,
  loadingMessage = 'Processing...'
}: AuthFeedbackProps) {
  if (loading) {
    return (
      <div className="w-full p-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full">
        <CircleAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert className="w-full border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
        <AlertTitle className="text-green-800 dark:text-green-400">Success</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
