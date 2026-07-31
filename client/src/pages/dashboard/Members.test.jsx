import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Members from "./Members";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

vi.mock("../../services/api", () => ({ 
  default: { 
    get: vi.fn(), 
    patch: vi.fn(), 
    put: vi.fn() 
  } 
}));
vi.mock("../../hooks/useAuth", () => ({ default: vi.fn() }));

const mockMember = {
  _id: "member-1",
  name: "Alice Member",
  email: "alice@example.com",
  role: "member",
  status: "active",
  totalLeads: 2,
  createdAt: "2026-07-31T05:00:00Z"
};

describe("Members Page", () => {
  beforeEach(() => {
    api.get.mockReset();
    if (api.post) api.post.mockReset();
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: "admin-id", role: "admin" } });
    api.get.mockImplementation(() => Promise.resolve({ data: { members: [mockMember], total: 1, totalPages: 1 } }));
  });

  test("loads and renders members list", async () => {
    render(<MemoryRouter><Members /></MemoryRouter>);

    expect(await screen.findByText("Alice Member")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("member")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("handles member search", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Members /></MemoryRouter>);

    expect(await screen.findByText("Alice Member")).toBeInTheDocument();
    
    await user.type(screen.getByPlaceholderText(/search by name/i), "Alice");
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/members", { params: { page: 1, limit: 9, search: "Alice" } }), { timeout: 1000 });
  });

  test("allows deactivating a member status", async () => {
    const user = userEvent.setup();
    api.patch.mockImplementation(() => Promise.resolve({ data: { member: { ...mockMember, status: "inactive" } } }));
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    render(<MemoryRouter><Members /></MemoryRouter>);

    expect(await screen.findByText("Alice Member")).toBeInTheDocument();

    const deactivateBtn = screen.getByTitle("Deactivate Member");
    await user.click(deactivateBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.patch).toHaveBeenCalledWith("/members/member-1/status", { status: "inactive" });
  });

  test("allows viewing member profile details", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Members /></MemoryRouter>);

    expect(await screen.findByText("Alice Member")).toBeInTheDocument();

    const viewBtn = screen.getByTitle("View Profile");
    await user.click(viewBtn);

    expect(await screen.findByText("Member Profile")).toBeInTheDocument();
    expect(screen.getAllByText("Alice Member").length).toBeGreaterThan(1);
  });

  test("allows admin to open add member modal and create a new member", async () => {
    const user = userEvent.setup();
    api.post = vi.fn().mockImplementation(() => Promise.resolve({ 
      data: { 
        success: true, 
        member: { _id: "member-2", name: "Bob New", email: "bob@new.com", role: "member", status: "active" },
        credentials: { email: "bob@new.com", temporaryPassword: "generatedPwd123!" }
      } 
    }));

    render(<MemoryRouter><Members /></MemoryRouter>);

    // Open add member modal
    const addBtn = screen.getByRole("button", { name: /add member/i });
    await user.click(addBtn);

    expect(await screen.findByText("Add New Team Member")).toBeInTheDocument();

    // Fill form
    await user.type(screen.getByPlaceholderText(/e.g. John Doe/i), "Bob New");
    await user.type(screen.getByPlaceholderText(/e.g. john@company.com/i), "bob@new.com");

    // Click Set Manually for temporary password
    const manualRadio = screen.getByText(/Set Manually/i);
    await user.click(manualRadio);

    // Enter manual password
    const pwdInput = screen.getByPlaceholderText(/Min 6 characters/i);
    await user.type(pwdInput, "generatedPwd123!");

    // Submit
    const submitBtn = screen.getByRole("button", { name: /create member/i });
    await user.click(submitBtn);

    // Verify API call
    expect(api.post).toHaveBeenCalledWith("/members", {
      name: "Bob New",
      email: "bob@new.com",
      password: "generatedPwd123!"
    });

    // Verify credentials display modal is shown
    expect(await screen.findByText("Member Created Successfully")).toBeInTheDocument();
    expect(screen.getByText("bob@new.com")).toBeInTheDocument();
    expect(screen.getByText("generatedPwd123!")).toBeInTheDocument();
  });
});
