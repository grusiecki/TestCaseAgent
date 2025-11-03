import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateProjectInput } from '../validation/project.schema';
import type { ProjectDTO, UpdateProjectCommand, TestCaseDTO } from '../../types';
import { createProjectSchema } from '../validation/project.schema';

export class ProjectService {
  constructor(private readonly supabase: SupabaseClient) {
    console.log('ProjectService initialized with Supabase client:', {
      hasSupabase: !!supabase,
      hasAuth: !!supabase?.auth,
      hasFrom: !!supabase?.from
    });
  }

  async createProject(input: CreateProjectInput, userId: string): Promise<ProjectDTO> {
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
        user_id: userId,
      })
      .select('id, name, created_at, final_score')
      .single();

    if (projectError) {
      console.error('Failed to create project:', projectError);
      throw new Error('Failed to create project: ' + projectError.message);
    }

    console.log('Project created successfully:', project);

    // Create test cases - either from complete testCases or from initialTitles
    let testCaseCount = 0;

    if (validatedData.testCases?.length) {
      // Create complete test cases with all details
      console.log('Creating complete test cases with details...');
      const testCases = validatedData.testCases.map((tc, index) => ({
        project_id: project.id,
        title: tc.title,
        preconditions: tc.preconditions,
        steps: tc.steps,
        expected_result: tc.expected_result,
        order_index: tc.order_index,
      }));

      const { error: testCasesError } = await this.supabase
        .from('test_cases')
        .insert(testCases);

      if (testCasesError) {
        console.error('Failed to create test cases:', testCasesError);
        throw new Error('Failed to create test cases: ' + testCasesError.message);
      }

      testCaseCount = testCases.length;
      console.log(`Created ${testCaseCount} complete test cases`);
    } else if (validatedData.initialTitles?.length) {
      // Legacy: create test cases from titles only (for backward compatibility)
      console.log('Creating test cases from titles only...');
      const testCases = validatedData.initialTitles.map((title, index) => ({
        project_id: project.id,
        title,
        order_index: index,
        steps: '',
        expected_result: '',
        preconditions: '',
      }));

      const { error: testCasesError } = await this.supabase
        .from('test_cases')
        .insert(testCases);

      if (testCasesError) {
        console.error('Failed to create test cases:', testCasesError);
        throw new Error('Failed to create test cases: ' + testCasesError.message);
      }

      testCaseCount = testCases.length;
      console.log(`Created ${testCaseCount} test cases from titles`);
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

  async exportProject(id: string): Promise<{ project: ProjectDTO; testCases: TestCaseDTO[] }> {
    console.log(`Exporting project ${id}...`);

    // First, verify project exists and get project data
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('id, name, created_at, final_score')
      .eq('id', id)
      .single();

    if (projectError) {
      console.error('Failed to fetch project for export:', projectError);
      throw new Error('Failed to fetch project: ' + projectError.message);
    }

    if (!project) {
      console.error('Project not found for export:', id);
      throw new Error('Project not found');
    }

    // Get all test cases for the project
    const { data: testCases, error: testCasesError } = await this.supabase
      .from('test_cases')
      .select('id, title, order_index, preconditions, steps, expected_result')
      .eq('project_id', id)
      .order('order_index', { ascending: true });

    if (testCasesError) {
      console.error('Failed to fetch test cases for export:', testCasesError);
      throw new Error('Failed to fetch test cases: ' + testCasesError.message);
    }

    const projectDTO: ProjectDTO = {
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount: testCases.length
    };

    const testCaseDTOs: TestCaseDTO[] = testCases.map(tc => ({
      id: tc.id,
      title: tc.title,
      order_index: tc.order_index,
      preconditions: tc.preconditions,
      steps: tc.steps,
      expected_result: tc.expected_result
    }));

    console.log(`Successfully exported project ${id} with ${testCases.length} test cases`);
    return { project: projectDTO, testCases: testCaseDTOs };
  }
}