import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Leads from "./Leads";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

vi.mock("../../services/api", () => ({ default: { get: vi.fn(), delete: vi.fn() } }));
vi.mock("../../hooks/useAuth", () => ({ default: vi.fn() }));

const lead = { _id: "lead-1", name: "Acme Lead", email: "lead@acme.com", phone: "555-0100", company: "Acme", status: "new" };

describe("Leads", () => {
  beforeEach(() => {
    api.get.mockReset();
    vi.clearAllMocks();
    api.get.mockImplementation(() => Promise.resolve({ data: { leads: [lead], total: 11, totalPages: 2 } }));
  });

  test("supports search, filter, and pagination", async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ isAdmin: true });
    render(<MemoryRouter><Leads /></MemoryRouter>);

    expect((await screen.findAllByText("Acme Lead"))[0]).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/search by name/i), "Acme");
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/leads", { params: { page: 1, limit: 10, search: "Acme" } }), { timeout: 1000 });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "qualified" } });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/leads", { params: { page: 1, limit: 10, search: "Acme", status: "qualified" } }));

    await user.click(screen.getByRole("button", { name: "2" }));
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/leads", { params: { page: 2, limit: 10, search: "Acme", status: "qualified" } }));
  });

  test("hides admin controls for members", async () => {
    useAuth.mockReturnValue({ isAdmin: false });
    render(<MemoryRouter><Leads /></MemoryRouter>);

    expect(await screen.findByText("My Leads")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add lead/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Assigned To")).not.toBeInTheDocument();
  });
});
