const STORAGE_KEY = 'generatedTitles';
const PROJECT_CONTEXT_KEY = 'projectContext';

interface ProjectContext {
  projectName: string;
  documentation: string;
}

export class TitlesService {
  static saveTitles(titles: string[]): void {
    console.log('Saving titles to localStorage:', { count: titles.length, titles });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
      console.log('Titles saved successfully');
    } catch (error) {
      console.error('Failed to save titles to localStorage:', error);
      throw new Error('Failed to save titles');
    }
  }

  static loadTitles(): string[] {
    console.log('Loading titles from localStorage');
    try {
      const savedTitles = localStorage.getItem(STORAGE_KEY);
      if (!savedTitles) {
        console.log('No saved titles found');
        return [];
      }
      const titles = JSON.parse(savedTitles);
      console.log('Loaded titles:', { count: titles.length, titles });
      return titles;
    } catch (error) {
      console.error('Failed to load titles from localStorage:', error);
      return [];
    }
  }

  static clearTitles(): void {
    console.log('Clearing titles from localStorage');
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROJECT_CONTEXT_KEY);
      console.log('Titles and project context cleared successfully');
    } catch (error) {
      console.error('Failed to clear titles from localStorage:', error);
    }
  }

  static saveProjectContext(context: ProjectContext): void {
    console.log('Saving project context to localStorage:', context);
    try {
      localStorage.setItem(PROJECT_CONTEXT_KEY, JSON.stringify(context));
      console.log('Project context saved successfully');
    } catch (error) {
      console.error('Failed to save project context to localStorage:', error);
      throw new Error('Failed to save project context');
    }
  }

  static hasProjectContext(): boolean {
    const savedContext = localStorage.getItem(PROJECT_CONTEXT_KEY);
    if (!savedContext) return false;
    try {
      const context = JSON.parse(savedContext);
      return !!(context.projectName && context.documentation);
    } catch {
      return false;
    }
  }

  static loadProjectContext(): ProjectContext {
    console.log('Loading project context from localStorage');
    try {
      const savedContext = localStorage.getItem(PROJECT_CONTEXT_KEY);
      if (!savedContext) {
        console.log('No saved project context found');
        throw new Error('Project context not found. Please go back and provide project documentation.');
      }
      const context = JSON.parse(savedContext);
      if (!context.projectName || !context.documentation) {
        throw new Error('Invalid project context. Please go back and provide project documentation.');
      }
      console.log('Loaded project context:', context);
      return context;
    } catch (error) {
      console.error('Failed to load project context from localStorage:', error);
      throw error instanceof Error ? error : new Error('Failed to load project context');
    }
  }
}