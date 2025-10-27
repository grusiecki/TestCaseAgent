import { TestCaseItem } from './TestCaseItem';
import type { TestCaseViewModel } from './types';

interface TestCaseListProps {
  testCases: TestCaseViewModel[];
  currentIndex: number;
  onTestCaseUpdate: (index: number, updates: Partial<TestCaseViewModel>) => void;
}

export function TestCaseList({ testCases, currentIndex, onTestCaseUpdate }: TestCaseListProps) {
  if (!testCases.length) {
    return null;
  }

  // Only show the current test case
  const currentTestCase = testCases[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Test Case {currentIndex + 1} of {testCases.length}
        </h2>
        <div className="text-sm text-gray-500">
          {currentTestCase.status === 'pending' && 'Waiting to generate...'}
          {currentTestCase.status === 'loading' && 'Generating...'}
          {currentTestCase.status === 'completed' && 'Generated ✓'}
          {currentTestCase.status === 'error' && 'Generation failed'}
        </div>
      </div>

      <TestCaseItem
        testCase={currentTestCase}
        onUpdate={(updates) => onTestCaseUpdate(currentIndex, updates)}
      />
    </div>
  );
}
