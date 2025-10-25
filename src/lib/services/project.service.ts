import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateProjectInput } from '../validation/project.schema';
import type { ProjectDTO, UpdateProjectCommand } from '../../types';
import { createProjectSchema } from '../validation/project.schema';

export class ProjectService {
  constructor(private readonly supabase: SupabaseClient) {
    console.log('ProjectService initialized with Supabase client:', {
      hasSupabase: !!supabase,
      hasAuth: !!supabase?.auth,
      hasFrom: !!supabase?.from
    });
  }

  async createProject(input: CreateProjectInput): Promise<ProjectDTO> {
    console.log('Creating project with input:', input);

    // Validate input
    const validatedData = createProjectSchema.parse(input);
    console.log('Input validation passed');

    // Start a transaction
    console.log('Inserting project into database...');
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .insert({
        name: validatedData.name,
      })
      .select('id, name, created_at, final_score')
      .single();

    if (projectError) {
      console.error('Failed to create project:', projectError);
      throw new Error('Failed to create project: ' + projectError.message);
    }

    console.log('Project created successfully:', project);

    // Create test cases if initialTitles are provided
    let testCaseCount = 0;
    if (validatedData.initialTitles?.length) {
      console.log('Creating test cases...');
      const testCases = validatedData.initialTitles.map((title, index) => ({
        project_id: project.id,
        title,
        order_index: index,
        steps: '',
        expected_result: '',
      }));

      const { error: testCasesError } = await this.supabase
        .from('test_cases')
        .insert(testCases);

      if (testCasesError) {
        console.error('Failed to create test cases:', testCasesError);
        throw new Error('Failed to create test cases: ' + testCasesError.message);
      }

      testCaseCount = testCases.length;
      console.log(`Created ${testCaseCount} test cases`);
    }

    // Return ProjectDTO
    const result = {
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount,
    };
    console.log('Returning project DTO:', result);
    return result;
  }

  async getProjects(): Promise<ProjectDTO[]> {
    console.log('Fetching projects...');
    console.log('Supabase client state:', {
      hasSupabase: !!this.supabase,
      hasFrom: !!this.supabase?.from
    });

    const { data: projects, error } = await this.supabase
      .from('projects')
      .select('id, name, created_at, final_score, test_cases(count)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch projects:', error);
      throw new Error('Failed to fetch projects: ' + error.message);
    }

    console.log('Raw projects data:', projects);

    const result = projects.map(project => ({
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount: project.test_cases?.[0]?.count ?? 0,
    }));

    console.log(`Successfully mapped ${result.length} projects`);
    return result;
  }

  async updateProject(id: string, input: UpdateProjectCommand): Promise<ProjectDTO> {
    console.log(`Updating project ${id} with:`, input);

    // Update project
    const { data: project, error: updateError } = await this.supabase
      .from('projects')
      .update({
        name: input.name,
      })
      .eq('id', id)
      .select('id, name, created_at, final_score, test_cases(count)')
      .single();

    if (updateError) {
      console.error('Failed to update project:', updateError);
      throw new Error('Failed to update project: ' + updateError.message);
    }

    if (!project) {
      console.error('Project not found:', id);
      throw new Error('Project not found');
    }

    const result = {
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount: project.test_cases?.[0]?.count ?? 0,
    };

    console.log('Project updated successfully:', result);
    return result;
  }

  async deleteProject(id: string): Promise<void> {
    console.log(`Deleting project ${id}...`);

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project: ' + error.message);
    }

    console.log(`Project ${id} deleted successfully`);
  }
}