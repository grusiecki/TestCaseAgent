import { useState, useEffect } from 'react';
import { TitlesList } from './TitlesList';
import { AddTitleButton } from './AddTitleButton';
import { TitlesValidator } from './TitlesValidator';
import { useNavigate } from '@/lib/hooks/useNavigate';
import { newProjectLogger } from '@/lib/logging/new-project.logger';
import { useTitlesValidation } from './hooks/useTitlesValidation';
import { useAutosave } from './hooks/useAutosave';
import { TitlesService } from '@/lib/services/titles.service';
import { AIService } from '@/lib/services/ai.service';

/**
 * Interface representing the view model for the EditTitlesView component.
 * Contains all the state needed to manage the test case titles editing process.
 */
interface EditTitlesViewModel {
  /** Array of test case titles being edited */
  titles: string[];
  /** Error message to display, if any */
  errorMessage: string | null;
  /** Flag indicating if changes are being saved */
  isAutosaving: boolean;
  /** Flag indicating if titles are being generated */
  isGenerating: boolean;
  /** Generation progress status message */
  generationStatus: string;
  /** Documentation text used for generating titles */
  documentation: string;
  /** Optional project name */
  projectName?: string;
  /** Flag to prevent multiple simultaneous generations */
  isGenerationLocked: boolean;
}

/**
 * EditTitlesView Component
 * 
 * A component that allows users to edit, add, and delete test case titles.
 * Features include:
 * - AI-powered test case title generation
 * - Real-time validation of titles
 * - Automatic saving of changes
 * - Limit enforcement (min 1, max 20 titles)
 * - Error handling and user feedback
 * 
 * The component manages its own state and persists changes to localStorage.
 * It uses AIService for generating titles and TitlesService for persistence.
 */

export const EditTitlesView = () => {
  const navigate = useNavigate();
  const [viewModel, setViewModel] = useState<EditTitlesViewModel>({
    titles: [],
    errorMessage: null,
    isAutosaving: false,
    isGenerating: false,
    generationStatus: '',
    documentation: '',
    projectName: undefined,
    isGenerationLocked: false
  });

  // Prevent leaving the page during generation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (viewModel.isGenerating) {
        e.preventDefault();
        e.returnValue = 'Generation in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [viewModel.isGenerating]);

  const generateTitles = async () => {
    // Prevent multiple simultaneous generations
    if (viewModel.isGenerationLocked) {
      return;
    }

    try {
      setViewModel(prev => ({
        ...prev,
        isGenerating: true,
        isGenerationLocked: true,
        errorMessage: null,
        generationStatus: 'Initializing generation...'
      }));

      // Add a small delay to show the initialization state
      await new Promise(resolve => setTimeout(resolve, 500));

      setViewModel(prev => ({
        ...prev,
        generationStatus: 'Analyzing documentation and generating titles...'
      }));

      const result = await AIService.generateTitles({
        documentation: viewModel.documentation,
        projectName: viewModel.projectName
      });

      setViewModel(prev => ({
        ...prev,
        generationStatus: 'Saving generated titles...'
      }));

      // Save generated titles
      await TitlesService.saveTitles(result.titles);

      // Add a small delay to show the success state
      await new Promise(resolve => setTimeout(resolve, 500));

      setViewModel(prev => ({
        ...prev,
        titles: result.titles,
        isGenerating: false,
        isGenerationLocked: false,
        generationStatus: '',
        errorMessage: null
      }));

      newProjectLogger.info('titles-generated', {
        count: result.titles.length,
        projectName: viewModel.projectName,
        documentationLength: viewModel.documentation.length
      });
    } catch (error) {
      newProjectLogger.error('generate-titles-error', { 
        error,
        documentationLength: viewModel.documentation.length,
        projectName: viewModel.projectName
      });

      // Add a small delay to show the error state
      await new Promise(resolve => setTimeout(resolve, 500));

      setViewModel(prev => ({
        ...prev,
        isGenerating: false,
        isGenerationLocked: false,
        generationStatus: '',
        errorMessage: error instanceof Error ? error.message : 'Failed to generate titles'
      }));
    }
  };

  useEffect(() => {
    // First try to get titles from URL parameters
    const params = new URLSearchParams(window.location.search);
    const titlesParam = params.get('titles');
    const projectName = params.get('name');

    if (titlesParam) {
      try {
        const titlesFromUrl = JSON.parse(titlesParam);
        if (Array.isArray(titlesFromUrl) && titlesFromUrl.length > 0) {
          setViewModel(prev => ({ 
            ...prev, 
            titles: titlesFromUrl,
            projectName: projectName || undefined
          }));
          // Save to localStorage for persistence
          TitlesService.saveTitles(titlesFromUrl);
          return;
        }
      } catch (error) {
        newProjectLogger.error('parse-url-titles-error', { error });
      }
    }

    // If no URL parameters, try loading from localStorage
    try {
      const savedTitles = TitlesService.loadTitles();
      if (savedTitles && savedTitles.length > 0) {
        setViewModel(prev => ({ ...prev, titles: savedTitles }));
      } else {
        newProjectLogger.warn('no-titles-found', { 
          hasUrlParams: !!titlesParam,
          hasProjectName: !!projectName
        });
        navigate('/new', { replace: true }); // Use replace to prevent back navigation
      }
    } catch (error) {
      newProjectLogger.error('edit-titles-load-error', { error });
      navigate('/new', { replace: true });
    }
  }, [navigate]);

  const handleTitleChange = (index: number, newTitle: string) => {
    setViewModel(prev => {
      const newTitles = [...prev.titles];
      newTitles[index] = newTitle;
      return { ...prev, titles: newTitles };
    });
  };

  const handleTitleDelete = (index: number) => {
    if (viewModel.titles.length <= 1) {
      setViewModel(prev => ({
        ...prev,
        errorMessage: 'At least one title is required'
      }));
      return;
    }

    setViewModel(prev => {
      const newTitles = prev.titles.filter((_, i) => i !== index);
      return {
        ...prev,
        titles: newTitles,
        errorMessage: null
      };
    });
  };

  const handleAddTitle = () => {
    if (viewModel.titles.length >= 20) {
      setViewModel(prev => ({
        ...prev,
        errorMessage: 'Maximum 20 titles allowed'
      }));
      return;
    }

    setViewModel(prev => ({
      ...prev,
      titles: [...prev.titles, 'New Test Case'],
      errorMessage: null
    }));
  };

  useEffect(() => {
    // Autosave to localStorage whenever titles change
    if (viewModel.titles.length > 0) {
      setViewModel(prev => ({ ...prev, isAutosaving: true }));
      
      const saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem('generatedTitles', JSON.stringify(viewModel.titles));
          setViewModel(prev => ({ ...prev, isAutosaving: false }));
        } catch (error) {
          newProjectLogger.error('edit-titles-autosave-error', { error });
          setViewModel(prev => ({
            ...prev,
            isAutosaving: false,
            errorMessage: 'Failed to save changes'
          }));
        }
      }, 500);

      return () => clearTimeout(saveTimeout);
    }
  }, [viewModel.titles]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Test Case Titles</h1>
      
      <div className="mb-6">
        <textarea
          className="w-full p-4 border rounded-lg"
          placeholder="Enter your test case documentation here..."
          value={viewModel.documentation}
          onChange={(e) => setViewModel(prev => ({ ...prev, documentation: e.target.value }))}
          rows={6}
          disabled={viewModel.isGenerating}
        />
        
        <div className="mt-4 flex items-center gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            onClick={generateTitles}
            disabled={viewModel.isGenerating || !viewModel.documentation || viewModel.isGenerationLocked}
          >
            {viewModel.isGenerating && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {viewModel.isGenerating ? 'Generating...' : 'Generate Titles'}
          </button>
          
          {viewModel.isGenerating && (
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{viewModel.generationStatus}</p>
            </div>
          )}
        </div>
      </div>

      <TitlesValidator 
        errorMessage={viewModel.errorMessage}
        titlesCount={viewModel.titles.length}
      />

      <TitlesList
        titles={viewModel.titles}
        onTitleChange={handleTitleChange}
        onTitleDelete={handleTitleDelete}
      />

      <div className="mt-4">
        <AddTitleButton 
          onAdd={handleAddTitle}
          disabled={viewModel.titles.length >= 20}
        />
      </div>

      {viewModel.isAutosaving && (
        <p className="text-sm text-gray-500 mt-2">Saving changes...</p>
      )}
    </div>
  );
};
