import { useState, useCallback } from 'react';
import { generateDetailsLogger } from '@/lib/logging/generate-details.logger';
import type { TestCaseViewModel } from '../types';

interface UseTestCaseNavigationProps {
  testCases: TestCaseViewModel[];
  projectId: string;
  onFinish: () => Promise<void>;
}

interface UseTestCaseNavigationResult {
  currentIndex: number;
  isLastItem: boolean;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
  navigateNext: () => void;
  navigatePrevious: () => void;
  handleFinish: () => Promise<void>;
}

export function useTestCaseNavigation({
  testCases,
  projectId,
  onFinish
}: UseTestCaseNavigationProps): UseTestCaseNavigationResult {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastItem = currentIndex === testCases.length - 1;
  const canNavigateNext = !isLastItem && testCases[currentIndex]?.status !== 'error';
  const canNavigatePrevious = currentIndex > 0;

  const navigateNext = useCallback(() => {
    if (canNavigateNext) {
      const nextIndex = Math.min(testCases.length - 1, currentIndex + 1);
      setCurrentIndex(nextIndex);

      generateDetailsLogger.navigationEvent({
        projectId,
        currentIndex: nextIndex,
        totalTestCases: testCases.length,
        direction: 'next',
        testCaseId: testCases[nextIndex].id,
        testCaseTitle: testCases[nextIndex].title
      });
    }
  }, [canNavigateNext, currentIndex, testCases, projectId]);

  const navigatePrevious = useCallback(() => {
    if (canNavigatePrevious) {
      const prevIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(prevIndex);

      generateDetailsLogger.navigationEvent({
        projectId,
        currentIndex: prevIndex,
        totalTestCases: testCases.length,
        direction: 'previous',
        testCaseId: testCases[prevIndex].id,
        testCaseTitle: testCases[prevIndex].title
      });
    }
  }, [canNavigatePrevious, currentIndex, testCases, projectId]);

  const handleFinish = useCallback(async () => {
    // Check if all test cases are completed
    const hasIncompleteTestCases = testCases.some(
      tc => tc.status !== 'completed' && tc.status !== 'error'
    );

    if (hasIncompleteTestCases) {
      generateDetailsLogger.warn('finish-attempted-with-incomplete', {
        projectId,
        totalTestCases: testCases.length,
        completedCount: testCases.filter(tc => tc.status === 'completed').length,
        errorCount: testCases.filter(tc => tc.status === 'error').length
      });
    }

    generateDetailsLogger.exportStarted({
      projectId,
      totalTestCases: testCases.length
    });

    try {
      await onFinish();
      generateDetailsLogger.exportCompleted({
        projectId,
        totalTestCases: testCases.length
      });
    } catch (error) {
      generateDetailsLogger.exportError({
        projectId,
        totalTestCases: testCases.length,
        error
      });
      throw error; // Re-throw to be handled by the UI
    }
  }, [testCases, projectId, onFinish]);

  return {
    currentIndex,
    isLastItem,
    canNavigateNext,
    canNavigatePrevious,
    navigateNext,
    navigatePrevious,
    handleFinish
  };
}
