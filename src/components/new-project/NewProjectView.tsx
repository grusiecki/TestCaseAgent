import { useState, useEffect } from 'react';
import type { GenerateTitlesCommand, TitlesDTO } from '@/types';
import { NewProjectForm } from '@/components/new-project/NewProjectForm';
import { LoadingIndicator } from '@/components/new-project/LoadingIndicator';
import { ErrorMessage } from '@/components/new-project/ErrorMessage';
import { AIService } from '@/lib/services/ai.service';
import { TitlesService } from '@/lib/services/titles.service';
import { newProjectLogger } from '@/lib/logging/new-project.logger';
import { useNavigate } from '@/lib/hooks/useNavigate';

interface NewProjectViewModel {
  documentation: string;
  projectName?: string;
  charCount: number;
  isLoading: boolean;
  error?: string;
}

const initialState: NewProjectViewModel = {
  documentation: '',
  projectName: '',
  charCount: 0,
  isLoading: false,
};

export const NewProjectView = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<NewProjectViewModel>(initialState);
  const [mounted, setMounted] = useState(false);

  // Log component lifecycle
  useEffect(() => {
    newProjectLogger.componentLifecycle('mount', { state });
    setMounted(true);

    return () => {
      newProjectLogger.componentLifecycle('unmount', { state });
    };
  }, []);

  // Log render phase
  useEffect(() => {
    if (mounted) {
      newProjectLogger.componentLifecycle('render', { 
        state,
        mounted,
        documentBody: document.body.innerHTML.length,
        hydrated: Boolean((window as any).__ASTRO_HYDRATED)
      });
    }
  }, [state, mounted]);

  // Error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      newProjectLogger.componentLifecycle('error', {
        error: {
          message: event.error?.message,
          stack: event.error?.stack,
          type: event.type
        }
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  const handleSubmit = async (data: GenerateTitlesCommand) => {
    newProjectLogger.formInteraction('submit', {
      documentationLength: data.documentation.length,
      hasProjectName: !!data.projectName
    });

    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      newProjectLogger.aiServiceCall('start', {
        documentationLength: data.documentation.length,
        hasProjectName: !!data.projectName
      });

      const result = await AIService.generateTitles(data);
      
      newProjectLogger.aiServiceCall('success', {
        titlesCount: result.titles.length
      });

      // Save titles and project context to localStorage
      await TitlesService.saveTitles(result.titles);
      await TitlesService.saveProjectContext({
        projectName: data.projectName || '',
        documentation: data.documentation
      });
      const destination = '/new/edit-titles';
      newProjectLogger.navigationEvent(destination, {
        titlesCount: result.titles.length,
        hasProjectName: !!data.projectName
      });
      
      navigate(destination);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      newProjectLogger.aiServiceCall('error', {
        error: errorMessage,
        documentationLength: data.documentation.length
      });

      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      
      {state.error && <ErrorMessage message={state.error} className="mb-6" />}
      
      <NewProjectForm
        documentation={state.documentation}
        projectName={state.projectName}
        charCount={state.charCount}
        isLoading={state.isLoading}
        onSubmit={handleSubmit}
        onChange={(values) => {
          newProjectLogger.formInteraction('form-change', { ...values });
          setState(prev => ({ 
            ...prev, 
            ...values
          }));
        }}
      />
    </div>
  );
};
