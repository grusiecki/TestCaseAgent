import { Card, CardContent } from '@/components/ui/card';
import { TestCaseList } from '../generate-details/TestCaseList';
import { ProgressIndicator } from '../generate-details/ProgressIndicator';
import { NavigationButtons } from '../generate-details/NavigationButtons';
import { ErrorFallback } from '../generate-details/ErrorFallback';
import { useEditProject } from './hooks/useEditProject';
import { useTestCaseNavigation } from '../generate-details/hooks/useTestCaseNavigation';
import { useAutosave } from '../generate-details/hooks/useAutosave';

interface EditProjectViewProps {
  projectId: string;
}

export function EditProjectView({ projectId }: EditProjectViewProps) {
  const {
    testCases,
    isLoading,
    error,
    handleRetry,
    handleTestCaseUpdate,
    handleFinishAndExport
  } = useEditProject(projectId);

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Loading Test Cases</h2>
          <p className="text-gray-500">Please wait while we load your test cases...</p>
        </div>
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">No Test Cases Found</h2>
        <p className="text-gray-500">This project doesn't have any test cases yet.</p>
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
