import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Requests from "./Requests";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

const mockRequest = {
  _id: "req-1",
  name: "Visitor Doe",
  email: "visitor@example.com",
  phone: "555-0100",
  company: "Visitor Co",
  subject: "Service Inquiry",
  message: "I would like a proposal.",
  status: "pending",
  createdAt: "2026-07-31T05:00:00Z"
};

const mockMember = {
  _id: "member-1",
  name: "Alice Sales",
  role: "member"
};

describe("Requests Page", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/requests") {
        return Promise.resolve({ data: { requests: [mockRequest], total: 1, totalPages: 1 } });
      }
      if (url === "/leads/members") {
        return Promise.resolve({ data: { members: [mockMember] } });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  test("loads and renders incoming requests", async () => {
    render(<MemoryRouter><Requests /></MemoryRouter>);

    expect((await screen.findAllByText("Visitor Doe"))[0]).toBeInTheDocument();
    expect(screen.getAllByText("visitor@example.com")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Visitor Co")[0]).toBeInTheDocument();
    expect(screen.getAllByText("pending")[0]).toBeInTheDocument();
  });

  test("supports status filter tab clicks", async () => {
    render(<MemoryRouter><Requests /></MemoryRouter>);

    expect((await screen.findAllByText("Visitor Doe"))[0]).toBeInTheDocument();

    const approvedTab = screen.getByRole("button", { name: "Approved" });
    fireEvent.click(approvedTab);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/requests", {
        params: { page: 1, limit: 8, status: "approved" }
      });
    });
  });

  test("opens details modal and allows rejection", async () => {
    const user = userEvent.setup();
    api.post.mockImplementation(() => Promise.resolve({ data: { success: true } }));
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    render(<MemoryRouter><Requests /></MemoryRouter>);

    expect((await screen.findAllByText("Visitor Doe"))[0]).toBeInTheDocument();

    // Click View Details
    const viewBtn = screen.getAllByTitle("View Details")[0];
    await user.click(viewBtn);

    expect(await screen.findByText("Request Information")).toBeInTheDocument();
    expect(screen.getByText("I would like a proposal.")).toBeInTheDocument();

    // Click Reject on details modal specifically
    const rejectBtn = screen.getByText("Reject Request");
    await user.click(rejectBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith("/requests/req-1/reject");
  });

  test("opens details modal and allows approval and assignment", async () => {
    const user = userEvent.setup();
    api.post.mockImplementation(() => Promise.resolve({ data: { success: true } }));

    render(<MemoryRouter><Requests /></MemoryRouter>);

    expect((await screen.findAllByText("Visitor Doe"))[0]).toBeInTheDocument();

    // Click Approve directly
    const approveBtn = screen.getByTitle("Approve Request");
    await user.click(approveBtn);

    expect(await screen.findByText("Approve Lead & Assign")).toBeInTheDocument();

    // Select Member from list
    const selectMember = screen.getByRole("combobox", { name: /assign lead to/i });
    fireEvent.change(selectMember, { target: { value: "member-1" } });

    // Select Initial Status
    const selectStatus = screen.getByRole("combobox", { name: /initial lead status/i });
    fireEvent.change(selectStatus, { target: { value: "qualified" } });

    // Submit Approval
    const submitBtn = screen.getByRole("button", { name: /confirm approval/i });
    await user.click(submitBtn);

    expect(api.post).toHaveBeenCalledWith("/requests/req-1/approve", {
      assignedTo: "member-1",
      status: "qualified"
    });
  });
});
