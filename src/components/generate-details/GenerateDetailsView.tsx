import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TestCaseList } from './TestCaseList';
import { ProgressIndicator } from './ProgressIndicator';
import { NavigationButtons } from './NavigationButtons';
import { ErrorFallback } from './ErrorFallback';
import { useGenerateDetails } from './hooks/useGenerateDetails';
import { useTestCaseNavigation } from './hooks/useTestCaseNavigation';
import { useAutosave } from './hooks/useAutosave';
import type { TestCaseViewModel } from './types';

interface GenerateDetailsViewProps {
  projectId: string;
}

export function GenerateDetailsView({ projectId }: GenerateDetailsViewProps) {
  const {
    testCases,
    isLoading,
    error,
    handleRetry,
    handleTestCaseUpdate,
    handleFinishAndExport
  } = useGenerateDetails(projectId);

  const {
    currentIndex,
    isLastItem,
    canNavigateNext,
    canNavigatePrevious,
    navigateNext,
    navigatePrevious,
    handleFinish
  } = useTestCaseNavigation({
    testCases,
    projectId,
    onFinish: handleFinishAndExport
  });

  // Initialize autosave
  useAutosave(projectId, testCases);

  if (error) {
    return <ErrorFallback onRetry={handleRetry} error={error} />;
  }

  if (isLoading) {
    const { current, total, status } = testCases.length > 0 ? {
      current: testCases.filter(tc => tc.status === 'completed').length,
      total: testCases.length,
      status: 'Generating test case details...'
    } : {
      current: 0,
      total: 0,
      status: 'Initializing...'
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Generating Test Cases</h2>
          <p className="text-gray-500">{status}</p>
          {total > 0 && (
            <div className="w-64">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${(current / total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {current} of {total} test cases generated
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <ProgressIndicator 
          currentIndex={currentIndex} 
          total={testCases.length} 
          isLoading={isLoading} 
        />
        
        <TestCaseList
          testCases={testCases}
          currentIndex={currentIndex}
          onTestCaseUpdate={handleTestCaseUpdate}
        />

        <NavigationButtons
          currentIndex={currentIndex}
          total={testCases.length}
          onPrevious={navigatePrevious}
          onNext={navigateNext}
          onFinish={handleFinish}
          isLastItem={isLastItem}
          disabled={{
            previous: !canNavigatePrevious,
            next: !canNavigateNext
          }}
        />
      </CardContent>
    </Card>
  );
}
