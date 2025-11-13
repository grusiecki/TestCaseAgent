import { useState, useEffect } from 'react';
import type { TestCaseViewModel } from '../../generate-details/types';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { generateDetailsLogger } from '@/lib/logging/generate-details.logger';

const AUTOSAVE_KEY = 'editProjectTestCases';

interface EditProjectState {
  testCases: TestCaseViewModel[];
  currentIndex: number;
  isLoading: boolean;
  error: Error | null;
  projectName: string;
}

export function useEditProject(projectId: string) {
  const navigate = useNavigate();
  const [state, setState] = useState<EditProjectState>({
    testCases: [],
    currentIndex: 0,
    isLoading: true,
    error: null,
    projectName: ''
  });

  // Load test cases from database
  useEffect(() => {
    const loadTestCases = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Try to load saved progress from localStorage first
        const savedProgress = localStorage.getItem(`${AUTOSAVE_KEY}_${projectId}`);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            if (parsed.projectId === projectId) {
              setState(prev => ({
                ...prev,
                testCases: parsed.testCases,
                projectName: parsed.projectName || '',
                isLoading: false
              }));
              return;
            }
          } catch (e) {
            console.error('Failed to parse saved progress:', e);
          }
        }

        // Fetch test cases from database
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const projectData = await response.json();
        
        // Convert test cases to view models
        const testCases: TestCaseViewModel[] = (projectData.testCases || []).map((tc: any) => ({
          id: tc.id,
          title: tc.title,
          preconditions: tc.preconditions || '',
          steps: tc.steps || '',
          expected_result: tc.expected_result || '',
          order_index: tc.order_index,
          status: 'completed' as const,
          isDirty: false
        }));

        setState(prev => ({
          ...prev,
          testCases,
          projectName: projectData.name || '',
          isLoading: false
        }));

        generateDetailsLogger.info('loaded-test-cases-for-edit', {
          projectId,
          testCaseCount: testCases.length
        });

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to load test cases'),
          isLoading: false
        }));
      }
    };

    loadTestCases();
  }, [projectId]);

  // Autosave to localStorage whenever test cases change
  useEffect(() => {
    if (state.testCases.length > 0 && !state.isLoading) {
      try {
        const autosaveData = {
          projectId,
          projectName: state.projectName,
          testCases: state.testCases,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`${AUTOSAVE_KEY}_${projectId}`, JSON.stringify(autosaveData));
      } catch (error) {
        console.error('Failed to autosave:', error);
      }
    }
  }, [state.testCases, projectId, state.projectName, state.isLoading]);

  const handleTestCaseUpdate = (index: number, updates: Partial<TestCaseViewModel>) => {
    setState(prev => {
      const newTestCases = [...prev.testCases];
      newTestCases[index] = {
        ...newTestCases[index],
        ...updates,
        isDirty: true
      };
      return { ...prev, testCases: newTestCases };
    });
  };

  const handleRetry = async () => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    // Trigger reload by clearing error state
    const response = await fetch(`/api/projects/${projectId}`);
    if (response.ok) {
      const projectData = await response.json();
      const testCases: TestCaseViewModel[] = (projectData.testCases || []).map((tc: any) => ({
        id: tc.id,
        title: tc.title,
        preconditions: tc.preconditions || '',
        steps: tc.steps || '',
        expected_result: tc.expected_result || '',
        order_index: tc.order_index,
        status: 'completed' as const,
        isDirty: false
      }));

      setState(prev => ({
        ...prev,
        testCases,
        projectName: projectData.name || '',
        isLoading: false,
        error: null
      }));
    }
  };

  const handleFinishAndExport = async () => {
    generateDetailsLogger.exportStarted({
      projectId,
      action: 'updating-test-cases-and-navigating-to-export'
    });

    try {
      // Update only dirty test cases using bulk update
      const dirtyTestCases = state.testCases.filter(tc => tc.isDirty);
      
      if (dirtyTestCases.length > 0) {
        console.log(`Updating ${dirtyTestCases.length} test case(s) in bulk...`);

        // Prepare bulk update payload
        const bulkUpdatePayload = dirtyTestCases.map(tc => ({
          id: tc.id,
          title: tc.title,
          preconditions: tc.preconditions,
          steps: tc.steps,
          expected_result: tc.expected_result,
          order_index: tc.order_index
        }));

        // Send bulk update request
        const response = await fetch(`/api/projects/${projectId}/testcases`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bulkUpdatePayload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update test cases: ${response.status}`);
        }

        const result = await response.json();

        generateDetailsLogger.exportCompleted({
          projectId,
          action: 'test-cases-bulk-updated',
          updatedCount: result.successCount,
          failedCount: result.failCount
        });

        console.log(`✓ Bulk update complete: ${result.successCount} succeeded, ${result.failCount} failed`);

        // Continue to export even if some updates failed
        if (result.failCount > 0) {
          console.warn(`${result.failCount} test case(s) failed to update, but continuing to export`);
        }
      } else {
        console.log('No changes to save');
      }

      // Clear autosave after successful update
      localStorage.removeItem(`${AUTOSAVE_KEY}_${projectId}`);

      // Navigate to export view
      navigate(`/projects/${projectId}/export`);
    } catch (error) {
      generateDetailsLogger.exportError({
        projectId,
        action: 'failed-to-update-test-cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  return {
    testCases: state.testCases,
    isLoading: state.isLoading,
    error: state.error,
    projectName: state.projectName,
    handleTestCaseUpdate,
    handleRetry,
    handleFinishAndExport
  };
}
