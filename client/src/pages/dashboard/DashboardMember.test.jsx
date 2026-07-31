import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Dashboard from "./Dashboard";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

vi.mock("../../hooks/useAuth", () => ({
  default: vi.fn()
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn()
  }
}));

const mockPerformanceData = {
  success: true,
  stats: {
    totalLeads: 5,
    newLeads: 1,
    contactedLeads: 1,
    qualifiedLeads: 2,
    lostLeads: 1,
    conversionRate: 40,
    completionRate: 60
  },
  monthlyActivities: [
    { label: "Feb", count: 0 },
    { label: "Mar", count: 1 },
    { label: "Apr", count: 3 },
    { label: "May", count: 2 },
    { label: "Jun", count: 0 },
    { label: "Jul", count: 5 }
  ],
  todaysTasks: [
    { _id: "lead-new-1", name: "Bruce Wayne", email: "bruce@wayne.com", phone: "555-0199", company: "Wayne Enterprises", message: "Outreach test" }
  ],
  pendingFollowUps: [
    { _id: "lead-contacted-1", name: "Clark Kent", email: "clark@dailyplanet.com", phone: "555-0200", company: "Daily Planet", notes: [{ text: "Spoke about subscription rates" }] }
  ]
};

describe("Member Performance Dashboard", () => {
  beforeEach(() => {
    api.get.mockReset();
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      isAdmin: false,
      user: { name: "Diana Prince", role: "member" }
    });
    api.get.mockResolvedValue({ data: mockPerformanceData });
  });

  test("renders personal performance workspace statistics cards", async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(await screen.findByText("My Workspace")).toBeInTheDocument();
    expect(screen.getByText("Track your personal conversion funnel, pending tasks, and monthly sales activities.")).toBeInTheDocument();

    // Stats Cards Check
    expect(screen.getByText("Assigned Leads")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument(); // Conversion
    expect(screen.getByText("60%")).toBeInTheDocument(); // Completion
    expect(screen.getAllByText("1")[0]).toBeInTheDocument(); // New/Contacted/Lost values
  });

  test("renders custom pie/donut chart and monthly activity labels", async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(await screen.findByText("Status Pie Chart")).toBeInTheDocument();
    // Donut Total Leads count text
    expect(screen.getAllByText("5")[0]).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();

    // Monthly Activity Chart
    expect(screen.getByText("Monthly Activity Chart")).toBeInTheDocument();
    expect(screen.getByText("Jul")).toBeInTheDocument();
    expect(screen.getByText("Apr")).toBeInTheDocument();
  });

  test("renders Today's Tasks list and Pending Follow Ups lists with outreach action buttons", async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    // Tasks check
    expect(await screen.findByText("Bruce Wayne")).toBeInTheDocument();
    expect(screen.getByText("Wayne Enterprises · 555-0199")).toBeInTheDocument();
    const outreachBtn = screen.getByRole("link", { name: "Outreach" });
    expect(outreachBtn).toHaveAttribute("href", "/dashboard/leads/lead-new-1/edit");

    // Follow-ups check
    expect(screen.getByText("Clark Kent")).toBeInTheDocument();
    expect(screen.getByText("\"Spoke about subscription rates\"")).toBeInTheDocument();
    const followBtn = screen.getByRole("link", { name: "Follow Up" });
    expect(followBtn).toHaveAttribute("href", "/dashboard/leads/lead-contacted-1/edit");
  });
});
