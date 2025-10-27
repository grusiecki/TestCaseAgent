import { useEffect, useRef } from 'react';
import { generateDetailsLogger } from '@/lib/logging/generate-details.logger';
import type { TestCaseViewModel } from '../types';

const AUTOSAVE_DELAY = 500; // ms

interface AutosaveData {
  projectId: string;
  testCases: TestCaseViewModel[];
  lastSaved: string;
}

export function useAutosave(projectId: string, testCases: TestCaseViewModel[]) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (testCases.length === 0) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for autosave
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const autosaveData: AutosaveData = {
          projectId,
          testCases,
          lastSaved: new Date().toISOString()
        };

        localStorage.setItem('testCaseDetails', JSON.stringify(autosaveData));
        
        generateDetailsLogger.autosaveEvent({
          projectId,
          totalTestCases: testCases.length,
          status: 'success'
        });
      } catch (error) {
        generateDetailsLogger.autosaveError({
          projectId,
          totalTestCases: testCases.length,
          error,
          status: 'error'
        });
      }
    }, AUTOSAVE_DELAY);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [testCases, projectId]);

  // Function to load saved data
  const loadSavedData = (): AutosaveData | null => {
    try {
      const savedData = localStorage.getItem('testCaseDetails');
      if (!savedData) return null;

      const parsedData = JSON.parse(savedData) as AutosaveData;
      
      // Only return data if it matches the current project
      if (parsedData.projectId === projectId) {
        generateDetailsLogger.info('autosave-loaded', {
          projectId,
          totalTestCases: parsedData.testCases.length,
          lastSaved: parsedData.lastSaved
        });
        return parsedData;
      }
      
      return null;
    } catch (error) {
      generateDetailsLogger.error('autosave-load-error', {
        projectId,
        error
      });
      return null;
    }
  };

  // Function to clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem('testCaseDetails');
      generateDetailsLogger.info('autosave-cleared', { projectId });
    } catch (error) {
      generateDetailsLogger.error('autosave-clear-error', {
        projectId,
        error
      });
    }
  };

  return {
    loadSavedData,
    clearSavedData
  };
}
