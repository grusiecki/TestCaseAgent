import { supabase } from '@/db/supabase.client';
import { ProjectService } from './project.service';

// Create a singleton instance of ProjectService
export const projectService = new ProjectService(supabase);
