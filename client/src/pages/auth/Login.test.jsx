import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Login from "./Login";
import useAuth from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth", () => ({ default: vi.fn() }));

describe("Login", () => {
  const login = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login });
  });

  test("submits credentials and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({});
    render(<MemoryRouter initialEntries={["/login"]}><Routes><Route path="/login" element={<Login />} /><Route path="/dashboard" element={<p>Dashboard page</p>} /></Routes></MemoryRouter>);

    await user.type(screen.getByLabelText(/email address/i), "ava@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith("ava@example.com", "password123");
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
  });

  test("shows the API error when sign-in fails", async () => {
    const user = userEvent.setup();
    login.mockRejectedValue({ response: { data: { message: "Invalid email or password" } } });
    render(<MemoryRouter><Login /></MemoryRouter>);

    await user.type(screen.getByLabelText(/email address/i), "ava@example.com");
    await user.type(screen.getByLabelText(/^password/i), "bad-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password", { exact: false })).toBeInTheDocument();
  });
});
