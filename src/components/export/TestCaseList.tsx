import { Card, CardContent } from '@/components/ui/card';
import { csvExportLogger } from '@/lib/logging/csv-export.logger';
import type { TestCaseDTO } from '@/types';

interface TestCaseListProps {
  testCases: TestCaseDTO[];
}

export function TestCaseList({ testCases }: TestCaseListProps) {
  csvExportLogger.componentLifecycle('render', {
    component: 'TestCaseList',
    testCaseCount: testCases.length,
    testCaseData: testCases.map(tc => ({
      id: tc.id,
      title: tc.title,
      hasPreconditions: !!tc.preconditions,
      hasSteps: !!tc.steps,
      hasExpectedResult: !!tc.expected_result
    }))
  });
  if (!testCases.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No test cases found for this project.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {testCases.map((testCase, index) => (
        <Card key={testCase.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900 flex-1 pr-4">
                  {index + 1}. {testCase.title}
                </h4>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  ID: {testCase.id.slice(0, 8)}...
                </span>
              </div>

              {testCase.preconditions && (
                <div className="space-y-1">
                  <h5 className="text-sm font-medium text-gray-700">Preconditions:</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {testCase.preconditions}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h5 className="text-sm font-medium text-gray-700">Steps:</h5>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                  {testCase.steps}
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="text-sm font-medium text-gray-700">Expected Result:</h5>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                  {testCase.expected_result}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
