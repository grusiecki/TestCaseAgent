import { useState, useEffect, useCallback } from 'react';
import { newProjectLogger } from '@/lib/logging/new-project.logger';

interface AutosaveState {
  isAutosaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

interface AutosaveOptions {
  key: string;
  debounceMs?: number;
  onError?: (error: Error) => void;
}

export const useAutosave = <T>(
  data: T,
  { key, debounceMs = 500, onError }: AutosaveOptions
) => {
  const [state, setState] = useState<AutosaveState>({
    isAutosaving: false,
    lastSavedAt: null,
    error: null
  });

  const save = useCallback(async (dataToSave: T) => {
    setState(prev => ({ ...prev, isAutosaving: true, error: null }));
    
    try {
      localStorage.setItem(key, JSON.stringify(dataToSave));
      
      setState(prev => ({
        ...prev,
        isAutosaving: false,
        lastSavedAt: new Date(),
        error: null
      }));

      newProjectLogger.info('autosave-success', {
        key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = 'Failed to save changes';
      newProjectLogger.error('autosave-error', { error, key });
      
      setState(prev => ({
        ...prev,
        isAutosaving: false,
        error: errorMessage
      }));

      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [key, onError]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      save(data);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [data, debounceMs, save]);

  const load = useCallback((): T | null => {
    try {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      newProjectLogger.error('autosave-load-error', { error, key });
      setState(prev => ({
        ...prev,
        error: 'Failed to load saved data'
      }));
      return null;
    }
  }, [key]);

  return {
    ...state,
    load
  };
};
