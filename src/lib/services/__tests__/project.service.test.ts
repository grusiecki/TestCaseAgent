import { describe, it, expect, vi } from 'vitest';
import { ProjectService } from '../project.service';
import { createProjectSchema } from '../../validation/project.schema';

describe('ProjectService', () => {
  // Mock Supabase client
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  };

  const projectService = new ProjectService(mockSupabase as any);

  describe('createProject', () => {
    it('should create a project without initial test cases', async () => {
      // Arrange
      const input = {
        name: 'Test Project'
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: '123',
          name: 'Test Project',
          created_at: '2025-10-20T10:00:00Z',
          final_score: null
        },
        error: null
      });

      // Act
      const result = await projectService.createProject(input, 'user-123');

      // Assert
      expect(result).toEqual({
        id: '123',
        name: 'Test Project',
        created_at: '2025-10-20T10:00:00Z',
        rating: null,
        testCaseCount: 0
      });
    });
//TODO - FIX THIS TEST
    // it('should create a project with initial test cases', async () => {
    //   // Arrange
    //   const input = {
    //     name: 'Test Project',
    //     initialTitles: ['Test Case 1', 'Test Case 2']
    //   };

    //   mockSupabase.single.mockResolvedValueOnce({
    //     data: {
    //       id: '123',
    //       name: 'Test Project',
    //       created_at: '2025-10-20T10:00:00Z',
    //       final_score: null
    //     },
    //     error: null
    //   });

    //   mockSupabase.insert.mockResolvedValueOnce({
    //     data: null,
    //     error: null
    //   });

    //   // Act
    //   const result = await projectService.createProject(input, 'user-123');

    //   // Assert
    //   expect(result).toEqual({
    //     id: '123',
    //     name: 'Test Project',
    //     created_at: '2025-10-20T10:00:00Z',
    //     rating: null,
    //     testCaseCount: 2
    //   });
    // });
  });
});

describe('createProjectSchema', () => {
  it('should validate valid input', () => {
    // Arrange
    const input = {
      name: 'Test Project',
      initialTitles: ['Test Case 1', 'Test Case 2']
    };

    // Act & Assert
    expect(() => createProjectSchema.parse(input)).not.toThrow();
  });

  it('should reject empty project name', () => {
    // Arrange
    const input = {
      name: '',
      initialTitles: ['Test Case 1']
    };

    // Act & Assert
    expect(() => createProjectSchema.parse(input)).toThrow();
  });

  it('should reject more than 20 initial titles', () => {
    // Arrange
    const input = {
      name: 'Test Project',
      initialTitles: Array(21).fill('Test Case')
    };

    // Act & Assert
    expect(() => createProjectSchema.parse(input)).toThrow();
  });
});
