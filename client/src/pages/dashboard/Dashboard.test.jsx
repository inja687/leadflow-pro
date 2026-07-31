import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Dashboard from "./Dashboard";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

vi.mock("../../services/api", () => ({ default: { get: vi.fn() } }));
vi.mock("../../hooks/useAuth", () => ({ default: vi.fn() }));

const recentLead = { _id: "lead-1", name: "Jordan Lee", email: "jordan@example.com", status: "new" };

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ isAdmin: true, user: { name: "Admin User" } });
    api.get.mockImplementation((url, config) => {
      if (url === "/leads/dashboard/stats") return Promise.resolve({ data: { stats: { totalLeads: 10, myLeads: 3, newLeads: 4, contactedLeads: 2, qualifiedLeads: 3, lostLeads: 1 } } });
      if (url === "/leads/dashboard/activities") return Promise.resolve({ data: { activities: [{ _id: "activity-1", action: "note_added", timestamp: new Date().toISOString(), lead: { name: "Jordan Lee" }, performedBy: { name: "Ava Patel" } }] } });
      return Promise.resolve({ data: { leads: config?.params?.mine ? [recentLead] : [recentLead] } });
    });
  });

  test("renders dashboard cards, lead sections, status chart, and activity", async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    expect(await screen.findByText("Total Leads")).toBeInTheDocument();
    expect(screen.getAllByText("My Leads").length).toBeGreaterThan(0);
    expect(screen.getByText("Status chart")).toBeInTheDocument();
    expect(screen.getByText("Recent Leads")).toBeInTheDocument();
    expect(screen.getByText("Latest Activities")).toBeInTheDocument();
    expect(screen.getAllByText("Jordan Lee").length).toBeGreaterThan(0);
    expect(screen.getByText(/Ava Patel/)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/leads/dashboard/activities", { params: { limit: 6 } });
  });
});
