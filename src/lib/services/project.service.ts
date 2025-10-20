import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateProjectInput } from '../validation/project.schema';
import type { ProjectDTO, UpdateProjectCommand } from '../../types';
import { createProjectSchema } from '../validation/project.schema';

export class ProjectService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createProject(input: CreateProjectInput): Promise<ProjectDTO> {
    // Validate input
    const validatedData = createProjectSchema.parse(input);

    // Start a transaction
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .insert({
        name: validatedData.name,
      })
      .select('id, name, created_at, final_score')
      .single();

    if (projectError) {
      throw new Error('Failed to create project: ' + projectError.message);
    }

    // Create test cases if initialTitles are provided
    let testCaseCount = 0;
    if (validatedData.initialTitles?.length) {
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
        throw new Error('Failed to create test cases: ' + testCasesError.message);
      }

      testCaseCount = testCases.length;
    }

    // Return ProjectDTO
    return {
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount,
    };
  }

  async getProjects(): Promise<ProjectDTO[]> {
    const { data: projects, error } = await this.supabase
      .from('projects')
      .select('id, name, created_at, final_score, test_cases(count)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch projects: ' + error.message);
    }

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount: project.test_cases?.[0]?.count ?? 0,
    }));
  }

  async updateProject(id: string, input: UpdateProjectCommand): Promise<ProjectDTO> {
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
      throw new Error('Failed to update project: ' + updateError.message);
    }

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      created_at: project.created_at,
      rating: project.final_score,
      testCaseCount: project.test_cases?.[0]?.count ?? 0,
    };
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Failed to delete project: ' + error.message);
    }
  }
}
