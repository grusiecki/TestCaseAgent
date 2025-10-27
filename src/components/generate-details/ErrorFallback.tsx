import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-red-600">Error Generating Test Cases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          {error.message || 'An error occurred while generating test case details.'}
        </p>
        <div className="flex justify-center">
          <Button
            variant="default"
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
