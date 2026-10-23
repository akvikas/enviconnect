import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { EnviConnect, ProjectCard } from "../routes/index";
import { Project, seedProjects } from "../lib/projects";

describe("EnviConnect Component Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders header, stats, and initial seed projects", async () => {
    render(<EnviConnect />);

    // Header and Hero
    expect(screen.getByText("EnviConnect")).toBeInTheDocument();
    expect(screen.getByText("Make your corner of the world")).toBeInTheDocument();

    // Stats
    expect(screen.getByText("active projects")).toBeInTheDocument();
    expect(screen.getByText("participants")).toBeInTheDocument();
    expect(screen.getByText("hours pledged")).toBeInTheDocument();

    // Seed projects rendered
    await waitFor(() => {
      expect(
        screen.getByText("Riverside Park Clean-up")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Community Vegetable Garden")
      ).toBeInTheDocument();
    });
  });

  it("filters projects by category and restores with 'All'", async () => {
    render(<EnviConnect />);

    // Filter by clean-up
    const cleanupFilter = screen.getByTestId("filter-cleanup");
    fireEvent.click(cleanupFilter);

    expect(screen.getByText("Riverside Park Clean-up")).toBeInTheDocument();
    expect(screen.getByText("Beach Plastic Sweep")).toBeInTheDocument();
    expect(
      screen.queryByText("Community Vegetable Garden")
    ).not.toBeInTheDocument();

    // Filter by all
    const allFilter = screen.getByTestId("filter-all");
    fireEvent.click(allFilter);
    expect(
      screen.getByText("Community Vegetable Garden")
    ).toBeInTheDocument();
  });

  it("toggles join and leave state on project cards", async () => {
    render(<EnviConnect />);

    const seedOneToggle = screen.getByTestId("toggle-join-seed-1");
    expect(seedOneToggle).toHaveTextContent("Join project");

    // Click join
    fireEvent.click(seedOneToggle);
    expect(seedOneToggle).toHaveTextContent("Joined · Leave");
    expect(
      screen.getByText(/Joined "Riverside Park Clean-up"!/i)
    ).toBeInTheDocument();

    // Click leave
    fireEvent.click(seedOneToggle);
    expect(seedOneToggle).toHaveTextContent("Join project");
    expect(
      screen.getByText(/Left "Riverside Park Clean-up"./i)
    ).toBeInTheDocument();
  });

  it("validates form fields when submitting empty draft", async () => {
    render(<EnviConnect />);

    const startBtn = screen.getByTestId("start-project-btn");
    fireEvent.click(startBtn);

    const submitBtn = screen.getByTestId("submit-project-btn");
    fireEvent.click(submitBtn);

    // Assert validation error messages appear
    expect(
      screen.getByText("Project title must be at least 3 characters.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Description must be at least 10 characters.")
    ).toBeInTheDocument();
    expect(screen.getByText("Please select a category.")).toBeInTheDocument();
    expect(
      screen.getByText("Enter a whole number between 1 and 40 hours.")
    ).toBeInTheDocument();
  });

  it("creates a new project and pledges creator when valid data is entered", async () => {
    render(<EnviConnect />);

    // Open modal
    fireEvent.click(screen.getByTestId("start-project-btn"));

    // Fill inputs
    fireEvent.change(screen.getByPlaceholderText(/Community Herb Garden/i), {
      target: { value: "Solar Microgrid Workshop" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Tell neighbours what to bring/i),
      {
        target: {
          value: "Hands-on DIY solar generator building session for community resilience.",
        },
      }
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "education" },
    });
    fireEvent.change(screen.getByPlaceholderText("1–40"), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Neighbourhood, park/i), {
      target: { value: "Central Youth Center" },
    });

    // Submit
    fireEvent.click(screen.getByTestId("submit-project-btn"));

    // Modal closes and new card appears
    await waitFor(() => {
      expect(
        screen.getByText("Solar Microgrid Workshop")
      ).toBeInTheDocument();
      expect(screen.getByText("Central Youth Center")).toBeInTheDocument();
      expect(screen.getByText("6 estimated hours")).toBeInTheDocument();
    });
  });

  it("handles empty filtered state gracefully with a reset action", async () => {
    // Save empty list in localStorage
    localStorage.setItem(
      "enviconnect-v1",
      JSON.stringify({ projects: [], joinedIds: [] })
    );

    render(<EnviConnect />);

    await waitFor(() => {
      expect(
        screen.getByText("No active projects in your community")
      ).toBeInTheDocument();
    });

    // Click load sample projects
    fireEvent.click(screen.getByText("Load sample projects"));
    expect(
      screen.getByText("Riverside Park Clean-up")
    ).toBeInTheDocument();
  });
});
