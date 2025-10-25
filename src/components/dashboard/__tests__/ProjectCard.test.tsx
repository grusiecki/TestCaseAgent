import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectCard } from "../ProjectCard";
import { vi } from "vitest";

const mockProject = {
  id: "1",
  name: "Test Project",
  created_at: "2025-01-01T00:00:00.000Z",
  rating: 4.5,
  testCaseCount: 10,
};

describe("ProjectCard", () => {
  const mockOnExport = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnExport.mockReset();
    mockOnDelete.mockReset();
    mockOnSelect.mockReset();
  });

  it("renders project details correctly", () => {
    render(
      <ProjectCard project={mockProject} onExport={mockOnExport} onDelete={mockOnDelete} onSelect={mockOnSelect} />
    );

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText(/created on/i)).toBeInTheDocument();
  });

  it("handles null rating correctly", () => {
    const projectWithNullRating = { ...mockProject, rating: null };
    render(
      <ProjectCard
        project={projectWithNullRating}
        onExport={mockOnExport}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("calls onSelect when card is clicked", () => {
    render(
      <ProjectCard project={mockProject} onExport={mockOnExport} onDelete={mockOnDelete} onSelect={mockOnSelect} />
    );

    fireEvent.click(screen.getByRole("article"));
    expect(mockOnSelect).toHaveBeenCalledWith(mockProject.id);
  });

  it("shows delete confirmation dialog", async () => {
    render(
      <ProjectCard project={mockProject} onExport={mockOnExport} onDelete={mockOnDelete} onSelect={mockOnSelect} />
    );

    // Click delete button
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Check if confirmation dialog is shown
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Cancel deletion
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnDelete).not.toHaveBeenCalled();

    // Confirm deletion
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));
    expect(mockOnDelete).toHaveBeenCalledWith(mockProject.id);
  });

  it("handles export action", async () => {
    render(
      <ProjectCard project={mockProject} onExport={mockOnExport} onDelete={mockOnDelete} onSelect={mockOnSelect} />
    );

    // Click export button
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(mockOnExport).toHaveBeenCalledWith(mockProject.id);
  });

  it("shows loading state during actions", async () => {
    mockOnExport.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    mockOnDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(
      <ProjectCard project={mockProject} onExport={mockOnExport} onDelete={mockOnDelete} onSelect={mockOnSelect} />
    );

    // Test export loading state
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();

    // Test delete loading state
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));
    expect(screen.getByRole("button", { name: /delete project/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /export/i })).not.toBeDisabled();
    });
  });
});
