import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import AddLead from "./AddLead";
import api from "../../services/api";

vi.mock("../../services/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe("AddLead", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { members: [{ _id: "member-1", name: "Ava Patel", email: "ava@example.com", role: "member" }] } });
    api.post.mockResolvedValue({ data: { success: true } });
  });

  test("loads members and creates a lead", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AddLead /></MemoryRouter>);

    expect(await screen.findByRole("option", { name: /Ava Patel/ })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/email address/i), "jordan@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "555-0100");
    await user.selectOptions(screen.getByLabelText(/assign to/i), "member-1");
    await user.click(screen.getByRole("button", { name: "Save Lead" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/leads", expect.objectContaining({ name: "Jordan Lee", email: "jordan@example.com", phone: "555-0100", assignedTo: "member-1", status: "new" })));
    expect(await screen.findByText(/Lead added successfully/)).toBeInTheDocument();
  });
});
