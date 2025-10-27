import type { TestCaseDetailsDTO } from '@/types';

export type TestCaseStatus = 'pending' | 'loading' | 'error' | 'completed';

export interface TestCaseViewModel extends TestCaseDetailsDTO {
  id: string;
  title: string;
  status: TestCaseStatus;
  errorMessage?: string;
  isDirty?: boolean; // Tracks if the test case has been manually edited
}

export interface GenerationProgress {
  current: number;
  total: number;
  status: string;
}

export interface GenerateDetailsState {
  testCases: TestCaseViewModel[];
  currentIndex: number;
  isLoading: boolean;
  error: Error | null;
  generationProgress: GenerationProgress;
}

export interface AutosaveData {
  testCases: TestCaseViewModel[];
  currentIndex: number;
  projectId: string;
  lastSaved: string;
}
