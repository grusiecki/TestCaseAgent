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

        // Try to fetch existing test cases from database first
        try {
          console.log('Fetching existing test cases from database...');
          const response = await fetch(`/api/projects/${projectId}`);
          if (response.ok) {
            const projectData = await response.json();
            const existingTestCases = projectData.testCases || [];

            if (existingTestCases.length > 0) {
              console.log('Found existing test cases in database:', existingTestCases.length);

              // Check if test cases have details filled in
              const hasIncompleteDetails = existingTestCases.some((tc: any) =>
                !tc.steps || tc.steps.trim() === '' ||
                !tc.expected_result || tc.expected_result.trim() === ''
              );

              if (!hasIncompleteDetails) {
                // All test cases have complete details, show them as completed
                initialTestCases = existingTestCases.map((tc: any, index: number) => ({
                  id: tc.id,
                  title: tc.title,
                  status: 'completed',
                  preconditions: tc.preconditions || '',
                  steps: tc.steps || '',
                  expected_result: tc.expected_result || '',
                  order_index: tc.order_index
                }));

                setState(prev => ({
                  ...prev,
                  testCases: initialTestCases,
                  isLoading: false
                }));

                generateDetailsLogger.info('loaded-complete-existing-test-cases', {
                  projectId,
                  testCaseCount: initialTestCases.length
                });

                return; // Don't generate if we have complete data
              } else {
                // Some test cases are missing details, load them and generate missing details
                console.log('Found incomplete test cases, will generate missing details');
                initialTestCases = existingTestCases.map((tc: any, index: number) => ({
                  id: tc.id,
                  title: tc.title,
                  status: tc.steps && tc.expected_result ? 'completed' : 'pending',
                  preconditions: tc.preconditions || '',
                  steps: tc.steps || '',
                  expected_result: tc.expected_result || '',
                  order_index: tc.order_index
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error fetching existing test cases:', error);
        }

        // Initialize fresh test cases if no existing data found
        console.log('No existing test cases found, creating fresh ones');
        initialTestCases = titles.map((title, index) => ({
          id: `temp-${Date.now()}-${index}`, // Temporary ID until saved to DB
          title,
          status: 'pending',
          preconditions: '',
          steps: '',
          expected_result: '',
          order_index: index
        }));

        setState(prev => ({
          ...prev,
          testCases: initialTestCases,
          isLoading: true
        }));

        // Generate details only for test cases that need them (status: 'pending')
        const { documentation, projectName } = TitlesService.loadProjectContext();
        const pendingTestCases = initialTestCases.filter(tc => tc.status === 'pending');

        if (pendingTestCases.length > 0) {
          console.log(`Generating details for ${pendingTestCases.length} pending test cases`);

          for (let i = 0; i < initialTestCases.length; i++) {
            const testCase = initialTestCases[i];

            // Skip if already completed
            if (testCase.status === 'completed') {
              continue;
            }

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
                isLoading: initialTestCases.some(tc => tc.status === 'pending') // Still loading if any pending
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
        } else {
          console.log('All test cases already have details, skipping AI generation');
          setState(prev => ({
            ...prev,
            isLoading: false
          }));
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
    generateDetailsLogger.exportStarted({
      projectId,
      action: 'creating-project-and-navigating-to-export'
    });

    try {
      // Create complete project with all test case details
      const createdProject = await createCompleteProject();

      generateDetailsLogger.exportCompleted({
        projectId: createdProject.id,
        action: 'project-created-successfully'
      });

      // Navigate to export view with real project ID
      navigate(`/projects/${createdProject.id}/export`);
    } catch (error) {
      generateDetailsLogger.exportError({
        projectId,
        action: 'failed-to-create-project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  const createCompleteProject = async () => {
    generateDetailsLogger.info('creating-complete-project-start', {
      testCaseCount: state.testCases.length
    });

    try {
      // Get project context from localStorage
      const { documentation, projectName } = TitlesService.loadProjectContext();

      // Prepare complete project data
      const projectData = {
        name: projectName || 'Untitled Project',
        testCases: state.testCases.map(tc => ({
          title: tc.title,
          preconditions: tc.preconditions,
          steps: tc.steps,
          expected_result: tc.expected_result,
          order_index: tc.order_index
        }))
      };

      generateDetailsLogger.info('creating-project-with-data', {
        projectName: projectData.name,
        testCaseCount: projectData.testCases.length
      });

      // Create project via API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }

      const createdProject = await response.json();

      generateDetailsLogger.info('project-created-successfully', {
        projectId: createdProject.id,
        projectName: createdProject.name,
        testCaseCount: createdProject.testCaseCount
      });

      // Clear localStorage after successful creation
      localStorage.removeItem(AUTOSAVE_KEY);
      TitlesService.clearTitles();

      return createdProject;
    } catch (error) {
      generateDetailsLogger.error('project-creation-failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  return {
    ...state,
    setCurrentIndex: (index: number) => setState(prev => ({ ...prev, currentIndex: index })),
    handleTestCaseUpdate,
    handleRetry,
    handleFinishAndExport
  };
}
