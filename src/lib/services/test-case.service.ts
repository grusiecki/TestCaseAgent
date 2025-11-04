import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateTestCaseInput, UpdateTestCaseInput } from '../validation/test-case.schema';
import type { TestCaseDTO } from '../../types';
import { createTestCaseSchema, updateTestCaseSchema } from '../validation/test-case.schema';

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedTestCases {
  testCases: TestCaseDTO[];
  total: number;
  page: number;
  limit: number;
}

export class TestCaseService {
  constructor(private readonly supabase: SupabaseClient) {
    console.log('TestCaseService initialized with Supabase client');
  }

  async getTestCases(projectId: string, options: PaginationOptions): Promise<PaginatedTestCases> {
    console.log('Getting test cases for project:', projectId, 'with options:', options);

    const { page, limit } = options;
    const offset = (page - 1) * limit;

    // Get test cases with pagination
    const { data: testCases, error, count } = await this.supabase
      .from('test_cases')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch test cases:', error);
      throw new Error('Failed to fetch test cases: ' + error.message);
    }

    const testCaseDTOs: TestCaseDTO[] = (testCases || []).map(tc => ({
      id: tc.id,
      title: tc.title,
      order_index: tc.order_index,
      preconditions: tc.preconditions,
      steps: tc.steps,
      expected_result: tc.expected_result
    }));

    return {
      testCases: testCaseDTOs,
      total: count || 0,
      page,
      limit
    };
  }

  async getTestCasesCount(projectId: string): Promise<number> {
    console.log('Getting test cases count for project:', projectId);

    const { count, error } = await this.supabase
      .from('test_cases')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .is('deleted_at', null);

    if (error) {
      console.error('Failed to count test cases:', error);
      throw new Error('Failed to count test cases: ' + error.message);
    }

    return count || 0;
  }

  async createTestCase(projectId: string, input: CreateTestCaseInput): Promise<TestCaseDTO> {
    console.log('Creating test case for project:', projectId, 'with input:', input);

    // Validate input
    const validatedData = createTestCaseSchema.parse(input);

    // Create test case
    const { data: testCase, error } = await this.supabase
      .from('test_cases')
      .insert({
        project_id: projectId,
        title: validatedData.title,
        preconditions: validatedData.preconditions,
        steps: validatedData.steps,
        expected_result: validatedData.expected_result,
        order_index: validatedData.order_index
      })
      .select('id, title, order_index, preconditions, steps, expected_result')
      .single();

    if (error) {
      console.error('Failed to create test case:', error);
      throw new Error('Failed to create test case: ' + error.message);
    }

    console.log('Test case created successfully:', testCase);
    return testCase;
  }

  async getTestCaseById(projectId: string, testCaseId: string): Promise<TestCaseDTO | null> {
    console.log('Getting test case by ID:', testCaseId, 'for project:', projectId);

    const { data: testCase, error } = await this.supabase
      .from('test_cases')
      .select('id, title, order_index, preconditions, steps, expected_result')
      .eq('id', testCaseId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Failed to fetch test case:', error);
      throw new Error('Failed to fetch test case: ' + error.message);
    }

    return testCase;
  }

  async updateTestCase(projectId: string, testCaseId: string, input: UpdateTestCaseInput): Promise<TestCaseDTO> {
    console.log('Updating test case:', testCaseId, 'for project:', projectId, 'with input:', input);

    // Validate input
    const validatedData = updateTestCaseSchema.parse(input);

    // Update test case
    const { data: testCase, error } = await this.supabase
      .from('test_cases')
      .update({
        title: validatedData.title,
        preconditions: validatedData.preconditions,
        steps: validatedData.steps,
        expected_result: validatedData.expected_result,
        order_index: validatedData.order_index
      })
      .eq('id', testCaseId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .select('id, title, order_index, preconditions, steps, expected_result')
      .single();

    if (error) {
      console.error('Failed to update test case:', error);
      throw new Error('Failed to update test case: ' + error.message);
    }

    if (!testCase) {
      throw new Error('Test case not found');
    }

    console.log('Test case updated successfully:', testCase);
    return testCase;
  }

  async softDeleteTestCase(projectId: string, testCaseId: string): Promise<void> {
    console.log('Soft deleting test case:', testCaseId, 'for project:', projectId);

    const { error } = await this.supabase
      .from('test_cases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', testCaseId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Failed to soft delete test case:', error);
      throw new Error('Failed to soft delete test case: ' + error.message);
    }

    console.log('Test case soft deleted successfully');
  }
}
