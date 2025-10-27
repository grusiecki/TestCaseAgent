import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDetailsLogger } from '@/lib/logging/generate-details.logger';
import type { TestCaseViewModel } from './types';

interface TestCaseItemProps {
  testCase: TestCaseViewModel;
  onUpdate: (updates: Partial<TestCaseViewModel>) => void;
}

export function TestCaseItem({ testCase, onUpdate }: TestCaseItemProps) {
  const isLoading = testCase.status === 'loading';
  const isError = testCase.status === 'error';
  const isCompleted = testCase.status === 'completed';

  // Refs for tracking previous values
  const prevPreconditionsRef = useRef(testCase.preconditions);
  const prevStepsRef = useRef(testCase.steps);
  const prevExpectedResultRef = useRef(testCase.expected_result);

  // Log changes when values are updated
  useEffect(() => {
    const changes: string[] = [];
    if (prevPreconditionsRef.current !== testCase.preconditions) {
      changes.push('preconditions');
      prevPreconditionsRef.current = testCase.preconditions;
    }
    if (prevStepsRef.current !== testCase.steps) {
      changes.push('steps');
      prevStepsRef.current = testCase.steps;
    }
    if (prevExpectedResultRef.current !== testCase.expected_result) {
      changes.push('expected_result');
      prevExpectedResultRef.current = testCase.expected_result;
    }

    if (changes.length > 0) {
      generateDetailsLogger.manualEdit({
        testCaseId: testCase.id,
        testCaseTitle: testCase.title,
        status: 'edited',
        changes
      });
    }
  }, [testCase.preconditions, testCase.steps, testCase.expected_result, testCase.id, testCase.title]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            {testCase.title}
            {isLoading && (
              <span className="text-blue-600 text-sm" role="status">
                (Generating...)
              </span>
            )}
            {isCompleted && (
              <span className="text-green-600 text-sm" role="status">
                (Generated ✓)
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent 
        className="space-y-6"
        role="form"
        aria-label={`Test case details for ${testCase.title}`}
      >
        {/* Preconditions */}
        <div className="space-y-2">
          <Label htmlFor={`preconditions-${testCase.id}`}>
            Preconditions
            {isLoading && <span className="sr-only">(Loading...)</span>}
          </Label>
          {isLoading ? (
            <Skeleton className="h-24 w-full" aria-hidden="true" />
          ) : (
            <textarea
              id={`preconditions-${testCase.id}`}
              className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={testCase.preconditions}
              onChange={(e) => onUpdate({ preconditions: e.target.value })}
              placeholder="Enter preconditions..."
              disabled={testCase.status === 'loading'}
              aria-invalid={isError}
              aria-describedby={testCase.errorMessage ? `error-${testCase.id}` : undefined}
            />
          )}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <Label htmlFor={`steps-${testCase.id}`}>
            Steps
            {isLoading && <span className="sr-only">(Loading...)</span>}
          </Label>
          {isLoading ? (
            <Skeleton className="h-32 w-full" aria-hidden="true" />
          ) : (
            <textarea
              id={`steps-${testCase.id}`}
              className="w-full min-h-[150px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={testCase.steps}
              onChange={(e) => onUpdate({ steps: e.target.value })}
              placeholder="Enter test steps..."
              disabled={testCase.status === 'loading'}
              aria-invalid={isError}
              aria-describedby={testCase.errorMessage ? `error-${testCase.id}` : undefined}
            />
          )}
        </div>

        {/* Expected Result */}
        <div className="space-y-2">
          <Label htmlFor={`expected-${testCase.id}`}>
            Expected Result
            {isLoading && <span className="sr-only">(Loading...)</span>}
          </Label>
          {isLoading ? (
            <Skeleton className="h-24 w-full" aria-hidden="true" />
          ) : (
            <textarea
              id={`expected-${testCase.id}`}
              className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={testCase.expected_result}
              onChange={(e) => onUpdate({ expected_result: e.target.value })}
              placeholder="Enter expected result..."
              disabled={testCase.status === 'loading'}
              aria-invalid={isError}
              aria-describedby={testCase.errorMessage ? `error-${testCase.id}` : undefined}
            />
          )}
        </div>

        {testCase.errorMessage && (
          <div 
            id={`error-${testCase.id}`}
            className="text-red-600 text-sm mt-2"
            role="alert"
          >
            {testCase.errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
