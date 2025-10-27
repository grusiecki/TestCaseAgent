import { useState, useEffect } from 'react';
import { TitlesService } from '@/lib/services/titles.service';
import { AIService } from '@/lib/services/ai.service';
import type { TestCaseViewModel, GenerateDetailsState } from '../types';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { generateDetailsLogger } from '@/lib/logging/generate-details.logger';

const AUTOSAVE_KEY = 'testCaseDetails';

export function useGenerateDetails(projectId: string) {
  const navigate = useNavigate();
  const [state, setState] = useState<GenerateDetailsState>({
    testCases: [],
    currentIndex: 0,
    isLoading: true,
    error: null,
    generationProgress: {
      current: 0,
      total: 0,
      status: ''
    }
  });

  // Load titles and initialize test cases
  useEffect(() => {
    const initializeAndGenerateTestCases = async () => {
      try {
        // Check if we have both titles and project context
        const titles = TitlesService.loadTitles();
        if (!titles || titles.length === 0) {
          navigate('/new', { replace: true });
          return;
        }

        if (!TitlesService.hasProjectContext()) {
          navigate('/new', { replace: true });
          return;
        }

        // Try to load any saved progress from localStorage
        const savedProgress = localStorage.getItem(AUTOSAVE_KEY);
        let initialTestCases: TestCaseViewModel[] = [];

        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            if (parsed.projectId === projectId) {
              initialTestCases = parsed.testCases;
              // If we have saved progress and all test cases are completed, just show them
              if (initialTestCases.every(tc => tc.status === 'completed')) {
                setState(prev => ({
                  ...prev,
                  testCases: initialTestCases,
                  isLoading: false
                }));
                return;
              }
            }
          } catch (e) {
            console.error('Failed to parse saved progress:', e);
          }
        }

        // Initialize fresh test cases
        initialTestCases = titles.map((title, index) => ({
          id: `${index}`,
          title,
          status: 'pending',
          preconditions: '',
          steps: '',
          expected_result: ''
        }));

        setState(prev => ({
          ...prev,
          testCases: initialTestCases,
          isLoading: true
        }));

        // Generate all test cases in sequence
        const { documentation, projectName } = TitlesService.loadProjectContext();
        
        for (let i = 0; i < initialTestCases.length; i++) {
          const testCase = initialTestCases[i];
          try {
            const result = await AIService.generateDetails({
              title: testCase.title,
              context: `Test case ${i + 1} of ${initialTestCases.length}`,
              projectName,
              documentation,
              testCaseIndex: i,
              totalTestCases: initialTestCases.length,
              allTitles: titles
            });

            initialTestCases[i] = {
              ...testCase,
              ...result,
              status: 'completed'
            };

            // Update state after each test case is generated
            setState(prev => ({
              ...prev,
              testCases: [...initialTestCases],
              isLoading: i < initialTestCases.length - 1 // Only set to false after last test case
            }));

            // Save progress after each test case
            const autosaveData = {
              projectId,
              testCases: initialTestCases,
              lastSaved: new Date().toISOString()
            };
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(autosaveData));

          } catch (error) {
            console.error(`Failed to generate test case ${i + 1}:`, error);
            initialTestCases[i] = {
              ...testCase,
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Failed to generate details'
            };
          }
        }

        // Final state update
        setState(prev => ({
          ...prev,
          testCases: initialTestCases,
          isLoading: false
        }));

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to initialize test cases'),
          isLoading: false
        }));
      }
    };

    initializeAndGenerateTestCases();
  }, [projectId, navigate]);

  // Autosave to localStorage whenever test cases change
  useEffect(() => {
    if (state.testCases.length > 0) {
      try {
        const autosaveData = {
          projectId,
          testCases: state.testCases,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(autosaveData));
        
        generateDetailsLogger.autosaveEvent({
          projectId,
          currentIndex: state.currentIndex,
          totalTestCases: state.testCases.length,
          status: 'success'
        });
      } catch (error) {
        generateDetailsLogger.autosaveError({
          projectId,
          currentIndex: state.currentIndex,
          totalTestCases: state.testCases.length,
          error,
          status: 'error'
        });
      }
    }
  }, [state.testCases, projectId, state.currentIndex]);

  const handleTestCaseUpdate = (index: number, updates: Partial<TestCaseViewModel>) => {
    generateDetailsLogger.manualEdit({
      projectId,
      testCaseId: state.testCases[index].id,
      testCaseTitle: state.testCases[index].title,
      currentIndex: index,
      totalTestCases: state.testCases.length,
      status: 'edited'
    });

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

  const handleRetry = () => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    // Re-initialize the test cases
    const titles = TitlesService.loadTitles();
    if (titles && titles.length > 0) {
      const freshTestCases = titles.map((title, index) => ({
        id: `${index}`,
        title,
        status: 'pending',
        preconditions: '',
        steps: '',
        expected_result: ''
      }));
      setState(prev => ({
        ...prev,
        testCases: freshTestCases,
        isLoading: false
      }));
    }
  };

  const generateTestCaseDetails = async (testCase: TestCaseViewModel, index: number) => {
    const startTime = Date.now();
    generateDetailsLogger.generationStarted({
      projectId,
      testCaseId: testCase.id,
      testCaseTitle: testCase.title,
      currentIndex: index,
      totalTestCases: state.testCases.length
    });

    try {
      setState(prev => {
        const newTestCases = [...prev.testCases];
        newTestCases[index] = { ...newTestCases[index], status: 'loading' };
        return { ...prev, testCases: newTestCases };
      });

      // Get project documentation from titles service
      const { documentation, projectName } = TitlesService.loadProjectContext();

      const result = await AIService.generateDetails({
        title: testCase.title,
        context: `Test case ${index + 1} of ${state.testCases.length}`,
        projectName,
        documentation,
        testCaseIndex: index,
        totalTestCases: state.testCases.length
      });

      const generationDuration = Date.now() - startTime;
      generateDetailsLogger.generationCompleted({
        projectId,
        testCaseId: testCase.id,
        testCaseTitle: testCase.title,
        currentIndex: index,
        totalTestCases: state.testCases.length,
        generationDuration,
        status: 'completed'
      });

      setState(prev => {
        const newTestCases = [...prev.testCases];
        newTestCases[index] = {
          ...newTestCases[index],
          ...result,
          status: 'completed'
        };
        return { ...prev, testCases: newTestCases };
      });
    } catch (error) {
      const generationDuration = Date.now() - startTime;
      generateDetailsLogger.generationError({
        projectId,
        testCaseId: testCase.id,
        testCaseTitle: testCase.title,
        currentIndex: index,
        totalTestCases: state.testCases.length,
        generationDuration,
        error,
        status: 'error'
      });

      setState(prev => {
        const newTestCases = [...prev.testCases];
        newTestCases[index] = {
          ...newTestCases[index],
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Failed to generate details'
        };
        return { ...prev, testCases: newTestCases };
      });
    }
  };

  // No longer need the effect for generating current test case
  // as we generate all test cases at initialization

  const handleFinishAndExport = async () => {
    // TODO: Implement export functionality
    // For now, just clear the localStorage
    localStorage.removeItem(AUTOSAVE_KEY);
    TitlesService.clearTitles();
    
    // Navigate to dashboard or next step
    navigate('/dashboard');
  };

  return {
    ...state,
    setCurrentIndex: (index: number) => setState(prev => ({ ...prev, currentIndex: index })),
    handleTestCaseUpdate,
    handleRetry,
    handleFinishAndExport
  };
}
