/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardView } from "../DashboardView";
import { vi } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock project data
const mockProjects = [
  {
    id: "1",
    name: "Test Project 1",
    created_at: "2025-01-01T00:00:00.000Z",
    rating: 4.5,
    testCaseCount: 10,
  },
  {
    id: "2",
    name: "Test Project 2",
    created_at: "2025-01-02T00:00:00.000Z",
    rating: null,
    testCaseCount: 5,
  },
];

describe.skip("DashboardView", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders loading state initially", () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<DashboardView />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders projects when loaded successfully", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            projects: mockProjects,
            page: 1,
            limit: 10,
            total: 2,
          }),
      })
    );

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project 1")).toBeInTheDocument();
      expect(screen.getByText("Test Project 2")).toBeInTheDocument();
    });
  });

  it("renders error state when API call fails", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch projects")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });

  it("handles pagination correctly", async () => {
    const firstPageResponse = {
      projects: [mockProjects[0]],
      page: 1,
      limit: 1,
      total: 2,
    };

    const secondPageResponse = {
      projects: [mockProjects[1]],
      page: 2,
      limit: 1,
      total: 2,
    };

    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(firstPageResponse),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(secondPageResponse),
        })
      );

    render(<DashboardView />);

    // Wait for first page to load
    await waitFor(() => {
      expect(screen.getByText("Test Project 1")).toBeInTheDocument();
    });

    // Click next page
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));

    // Wait for second page to load
    await waitFor(() => {
      expect(screen.getByText("Test Project 2")).toBeInTheDocument();
    });
  });

  it("handles project deletion", async () => {
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              projects: mockProjects,
              page: 1,
              limit: 10,
              total: 2,
            }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              projects: [mockProjects[1]],
              page: 1,
              limit: 10,
              total: 1,
            }),
        })
      );

    render(<DashboardView />);

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText("Test Project 1")).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Confirm deletion
    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));

    // Wait for project to be removed
    await waitFor(() => {
      expect(screen.queryByText("Test Project 1")).not.toBeInTheDocument();
    });
  });
});
