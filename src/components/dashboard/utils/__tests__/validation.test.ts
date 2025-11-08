import { describe, it, expect } from 'vitest';
import { validateProject, ValidationError } from '../validation';
import type { ProjectDTO } from '../../../../types';

describe('validateProject', () => {
  // Helper function to create valid project data
  const createValidProject = (overrides?: Partial<ProjectDTO>): ProjectDTO => ({
    id: 'test-id-123',
    name: 'Test Project',
    created_at: '2024-01-01T00:00:00.000Z',
    rating: 5,
    testCaseCount: 10,
    ...overrides,
  });

  describe('Valid project data', () => {
    it('should return true for a valid project with all fields', () => {
      const project = createValidProject();
      expect(validateProject(project)).toBe(true);
    });

    it('should accept rating as null', () => {
      const project = createValidProject({ rating: null });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept rating as 0', () => {
      const project = createValidProject({ rating: 0 });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept negative rating', () => {
      const project = createValidProject({ rating: -5 });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept testCaseCount as 0', () => {
      const project = createValidProject({ testCaseCount: 0 });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept large testCaseCount', () => {
      const project = createValidProject({ testCaseCount: 999999 });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept empty string as project name', () => {
      const project = createValidProject({ name: '' });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept very long project name', () => {
      const project = createValidProject({ name: 'A'.repeat(1000) });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept project name with special characters', () => {
      const project = createValidProject({ name: '!@#$%^&*()_+-={}[]|\\:";\'<>?,./' });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept project name with unicode characters', () => {
      const project = createValidProject({ name: 'Projekt Testowy 测试项目 🚀' });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept various valid ISO date formats', () => {
      const validDates = [
        '2024-01-01T00:00:00.000Z',
        '2024-12-31T23:59:59.999Z',
        '2024-06-15T12:30:45Z',
        '2024-01-01T00:00:00+00:00',
        '2024-01-01',
      ];

      validDates.forEach((date) => {
        const project = createValidProject({ created_at: date });
        expect(validateProject(project)).toBe(true);
      });
    });

    it('should accept floating point rating', () => {
      const project = createValidProject({ rating: 4.5 });
      expect(validateProject(project)).toBe(true);
    });
  });

  describe('Invalid project structure', () => {
    it('should throw ValidationError for null input', () => {
      expect(() => validateProject(null)).toThrow(ValidationError);
      expect(() => validateProject(null)).toThrow('Invalid project data structure');
    });

    it('should throw ValidationError for undefined input', () => {
      expect(() => validateProject(undefined)).toThrow(ValidationError);
      expect(() => validateProject(undefined)).toThrow('Invalid project data structure');
    });

    it('should throw ValidationError for non-object input', () => {
      expect(() => validateProject('string')).toThrow(ValidationError);
      expect(() => validateProject('string')).toThrow('Invalid project data structure');
    });

    it('should throw ValidationError for number input', () => {
      expect(() => validateProject(123)).toThrow(ValidationError);
      expect(() => validateProject(123)).toThrow('Invalid project data structure');
    });

    it('should throw ValidationError for boolean input', () => {
      expect(() => validateProject(true)).toThrow(ValidationError);
      expect(() => validateProject(true)).toThrow('Invalid project data structure');
    });

    it('should throw ValidationError for array input', () => {
      // Arrays are objects in JavaScript, so they pass the typeof check
      // but fail on the id validation
      expect(() => validateProject([])).toThrow(ValidationError);
      expect(() => validateProject([])).toThrow('Project ID must be a string');
    });

    it('should throw ValidationError for empty object', () => {
      expect(() => validateProject({})).toThrow(ValidationError);
    });
  });

  describe('Invalid id field', () => {
    it('should throw ValidationError when id is missing', () => {
      const project = createValidProject();
      delete (project as any).id;
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project ID must be a string');
    });

    it('should throw ValidationError when id is null', () => {
      const project = createValidProject({ id: null as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project ID must be a string');
    });

    it('should throw ValidationError when id is a number', () => {
      const project = createValidProject({ id: 123 as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project ID must be a string');
    });

    it('should throw ValidationError when id is an object', () => {
      const project = createValidProject({ id: {} as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project ID must be a string');
    });

    it('should throw ValidationError when id is an array', () => {
      const project = createValidProject({ id: [] as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project ID must be a string');
    });

    it('should accept empty string as id', () => {
      const project = createValidProject({ id: '' });
      expect(validateProject(project)).toBe(true);
    });
  });

  describe('Invalid name field', () => {
    it('should throw ValidationError when name is missing', () => {
      const project = createValidProject();
      delete (project as any).name;
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project name must be a string');
    });

    it('should throw ValidationError when name is null', () => {
      const project = createValidProject({ name: null as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project name must be a string');
    });

    it('should throw ValidationError when name is a number', () => {
      const project = createValidProject({ name: 123 as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project name must be a string');
    });

    it('should throw ValidationError when name is an object', () => {
      const project = createValidProject({ name: {} as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project name must be a string');
    });

    it('should throw ValidationError when name is an array', () => {
      const project = createValidProject({ name: [] as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project name must be a string');
    });

    it('should throw ValidationError when name is boolean', () => {
      const project = createValidProject({ name: true as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project name must be a string');
    });
  });

  describe('Invalid created_at field', () => {
    it('should throw ValidationError when created_at is missing', () => {
      const project = createValidProject();
      delete (project as any).created_at;
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is null', () => {
      const project = createValidProject({ created_at: null as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is a number', () => {
      const project = createValidProject({ created_at: 123456789 as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is an invalid date string', () => {
      const project = createValidProject({ created_at: 'invalid-date' });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is empty string', () => {
      const project = createValidProject({ created_at: '' });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is malformed ISO string', () => {
      const project = createValidProject({ created_at: '2024-13-45T99:99:99Z' });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is an object', () => {
      const project = createValidProject({ created_at: {} as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });

    it('should throw ValidationError when created_at is a Date object', () => {
      const project = createValidProject({ created_at: new Date() as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Invalid project creation date');
    });
  });

  describe('Invalid rating field', () => {
    it('should throw ValidationError when rating is a string', () => {
      const project = createValidProject({ rating: '5' as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project rating must be a number or null');
    });

    it('should throw ValidationError when rating is an object', () => {
      const project = createValidProject({ rating: {} as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project rating must be a number or null');
    });

    it('should throw ValidationError when rating is an array', () => {
      const project = createValidProject({ rating: [] as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project rating must be a number or null');
    });

    it('should throw ValidationError when rating is boolean', () => {
      const project = createValidProject({ rating: true as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project rating must be a number or null');
    });

    it('should throw ValidationError when rating is undefined', () => {
      const project = createValidProject({ rating: undefined as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Project rating must be a number or null');
    });

    it('should accept NaN as rating (typeof NaN is number)', () => {
      const project = createValidProject({ rating: NaN });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept Infinity as rating', () => {
      const project = createValidProject({ rating: Infinity });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept -Infinity as rating', () => {
      const project = createValidProject({ rating: -Infinity });
      expect(validateProject(project)).toBe(true);
    });
  });

  describe('Invalid testCaseCount field', () => {
    it('should throw ValidationError when testCaseCount is missing', () => {
      const project = createValidProject();
      delete (project as any).testCaseCount;
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should throw ValidationError when testCaseCount is null', () => {
      const project = createValidProject({ testCaseCount: null as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should throw ValidationError when testCaseCount is a string', () => {
      const project = createValidProject({ testCaseCount: '10' as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should throw ValidationError when testCaseCount is an object', () => {
      const project = createValidProject({ testCaseCount: {} as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should throw ValidationError when testCaseCount is an array', () => {
      const project = createValidProject({ testCaseCount: [] as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should throw ValidationError when testCaseCount is boolean', () => {
      const project = createValidProject({ testCaseCount: true as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should throw ValidationError when testCaseCount is undefined', () => {
      const project = createValidProject({ testCaseCount: undefined as any });
      expect(() => validateProject(project)).toThrow(ValidationError);
      expect(() => validateProject(project)).toThrow('Test case count must be a number');
    });

    it('should accept negative testCaseCount', () => {
      const project = createValidProject({ testCaseCount: -5 });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept floating point testCaseCount', () => {
      const project = createValidProject({ testCaseCount: 10.5 });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept NaN as testCaseCount (typeof NaN is number)', () => {
      const project = createValidProject({ testCaseCount: NaN });
      expect(validateProject(project)).toBe(true);
    });

    it('should accept Infinity as testCaseCount', () => {
      const project = createValidProject({ testCaseCount: Infinity });
      expect(validateProject(project)).toBe(true);
    });
  });

  describe('Edge cases and type coercion', () => {
    it('should not accept project with extra fields but still validate required fields', () => {
      const project = {
        ...createValidProject(),
        extraField: 'should be ignored',
        anotherExtra: 123,
      };
      expect(validateProject(project)).toBe(true);
    });

    it('should validate all fields in order and throw on first error', () => {
      const project = {
        id: 123, // invalid
        name: 456, // invalid
        created_at: 'invalid',
        rating: 'invalid',
        testCaseCount: 'invalid',
      };
      // Should throw on first validation error (id)
      expect(() => validateProject(project)).toThrow('Project ID must be a string');
    });

    it('should handle object with Symbol properties', () => {
      const project = createValidProject();
      const symbolKey = Symbol('test');
      (project as any)[symbolKey] = 'value';
      expect(validateProject(project)).toBe(true);
    });

    it('should handle frozen objects', () => {
      const project = Object.freeze(createValidProject());
      expect(validateProject(project)).toBe(true);
    });

    it('should handle sealed objects', () => {
      const project = Object.seal(createValidProject());
      expect(validateProject(project)).toBe(true);
    });

    it('should handle objects with null prototype', () => {
      const project = Object.create(null);
      Object.assign(project, createValidProject());
      expect(validateProject(project)).toBe(true);
    });
  });

  describe('Type guard behavior', () => {
    it('should narrow type when used as type guard', () => {
      const unknownData: unknown = createValidProject();
      
      if (validateProject(unknownData)) {
        // TypeScript should recognize this as ProjectDTO
        const project: ProjectDTO = unknownData;
        expect(project.id).toBe('test-id-123');
        expect(project.name).toBe('Test Project');
      }
    });

    it('should work with type assertion after validation', () => {
      const data: unknown = createValidProject();
      expect(validateProject(data)).toBe(true);
      
      // After validation, we can safely assert the type
      const project = data as ProjectDTO;
      expect(project.testCaseCount).toBe(10);
    });
  });

  describe('ValidationError properties', () => {
    it('should throw error with correct name property', () => {
      try {
        validateProject(null);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).name).toBe('ValidationError');
      }
    });

    it('should throw error that is instance of Error', () => {
      try {
        validateProject(null);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should preserve error message in ValidationError', () => {
      const testCases = [
        { input: null, expectedMessage: 'Invalid project data structure' },
        { input: { id: 123 }, expectedMessage: 'Project ID must be a string' },
        { input: { id: 'test', name: 123 }, expectedMessage: 'Project name must be a string' },
      ];

      testCases.forEach(({ input, expectedMessage }) => {
        try {
          validateProject(input);
          // Should not reach here
          expect(true).toBe(false);
        } catch (error) {
          expect((error as ValidationError).message).toBe(expectedMessage);
        }
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('should validate data from API response', () => {
      const apiResponse = {
        id: 'uuid-v4-string',
        name: 'Production Project',
        created_at: '2024-11-08T10:30:00.000Z',
        rating: 4.5,
        testCaseCount: 42,
      };
      expect(validateProject(apiResponse)).toBe(true);
    });

    it('should validate project with no rating yet', () => {
      const newProject = {
        id: 'new-project-id',
        name: 'Newly Created Project',
        created_at: new Date().toISOString(),
        rating: null,
        testCaseCount: 0,
      };
      expect(validateProject(newProject)).toBe(true);
    });

    it('should validate project with maximum realistic values', () => {
      const largeProject = {
        id: 'a'.repeat(100),
        name: 'Very Long Project Name '.repeat(50),
        created_at: '2024-12-31T23:59:59.999Z',
        rating: 10,
        testCaseCount: 10000,
      };
      expect(validateProject(largeProject)).toBe(true);
    });

    it('should reject malformed API response', () => {
      const malformedResponse = {
        id: 'test-id',
        name: 'Test Project',
        created_at: 'not-a-date',
        rating: null,
        testCaseCount: 5,
      };
      expect(() => validateProject(malformedResponse)).toThrow('Invalid project creation date');
    });

    it('should reject response with missing required fields', () => {
      const incompleteResponse = {
        id: 'test-id',
        name: 'Test Project',
        // missing created_at, rating, testCaseCount
      };
      expect(() => validateProject(incompleteResponse)).toThrow(ValidationError);
    });
  });
});

