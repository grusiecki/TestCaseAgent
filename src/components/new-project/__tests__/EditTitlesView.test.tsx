/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EditTitlesView } from '../EditTitlesView';
import { useNavigate } from '@/lib/hooks/useNavigate';

// Mock the useNavigate hook
vi.mock('@/lib/hooks/useNavigate', () => ({
  useNavigate: vi.fn()
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe.skip('EditTitlesView', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    // vi.clearAllMocks();
    // (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
  });

  it('should load initial titles from localStorage', () => {
    const mockTitles = ['Test Case 1', 'Test Case 2'];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTitles));

    render(<EditTitlesView />);

    expect(screen.getByText('Test Case 1')).toBeInTheDocument();
    expect(screen.getByText('Test Case 2')).toBeInTheDocument();
  });

  it('should navigate away if no titles are found', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<EditTitlesView />);

    expect(mockNavigate).toHaveBeenCalledWith('/new');
  });

  it('should allow adding new titles', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['Initial Title']));

    render(<EditTitlesView />);

    const addButton = screen.getByText(/Add New Test Case Title/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Test Case')).toBeInTheDocument();
    });
  });

  it('should prevent adding more than 20 titles', async () => {
    const mockTitles = Array(20).fill('Test Case').map((title, i) => `${title} ${i + 1}`);
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTitles));

    render(<EditTitlesView />);

    const addButton = screen.getByText(/Add New Test Case Title/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Maximum 20 titles allowed')).toBeInTheDocument();
    });
  });

  it('should allow editing titles', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['Test Case 1']));

    render(<EditTitlesView />);

    const editButton = screen.getByLabelText('Edit title');
    fireEvent.click(editButton);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Updated Test Case' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Updated Test Case')).toBeInTheDocument();
    });
  });

  it('should prevent deleting the last title', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['Test Case 1']));

    render(<EditTitlesView />);

    const deleteButton = screen.getByLabelText('Delete title');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('At least one title is required')).toBeInTheDocument();
    });
  });

  it('should autosave changes', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['Test Case 1']));

    render(<EditTitlesView />);

    const editButton = screen.getByLabelText('Edit title');
    fireEvent.click(editButton);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Updated Test Case' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'generatedTitles',
        JSON.stringify(['Updated Test Case'])
      );
    });
  });
});
