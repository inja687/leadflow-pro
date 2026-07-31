import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import Profile from "./Profile";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

vi.mock("../../hooks/useAuth", () => ({
  default: vi.fn()
}));

vi.mock("../../services/api", () => ({
  default: {
    put: vi.fn()
  }
}));

const mockUser = {
  _id: "user-1",
  name: "Diana Prince",
  email: "diana@justice.com",
  role: "member",
  createdAt: "2026-07-31T05:00:00Z"
};

describe("Profile Page", () => {
  beforeEach(() => {
    api.put.mockReset();
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  test("loads and renders user profile metadata card", async () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);

    expect(screen.getAllByText("Diana Prince")[0]).toBeInTheDocument();
    expect(screen.getByText("diana@justice.com")).toBeInTheDocument();
    expect(screen.getAllByText("member")[0]).toBeInTheDocument();
    expect(screen.getByText("July 31, 2026")).toBeInTheDocument();
  });

  test("supports updating password successfully", async () => {
    const user = userEvent.setup();
    api.put.mockResolvedValue({ data: { success: true } });

    render(<MemoryRouter><Profile /></MemoryRouter>);

    const currentInput = screen.getByLabelText("Current Password");
    const newInput = screen.getByLabelText("New Password");
    const confirmInput = screen.getByLabelText("Confirm Password");
    const submitBtn = screen.getByRole("button", { name: "Change Password" });

    await user.type(currentInput, "password123");
    await user.type(newInput, "newpassword456");
    await user.type(confirmInput, "newpassword456");

    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "password123",
        newPassword: "newpassword456",
        confirmPassword: "newpassword456"
      });
    });

    expect(await screen.findByText("Password changed successfully!")).toBeInTheDocument();
  });

  test("handles frontend validation password mismatch", async () => {
    const user = userEvent.setup();

    render(<MemoryRouter><Profile /></MemoryRouter>);

    const currentInput = screen.getByLabelText("Current Password");
    const newInput = screen.getByLabelText("New Password");
    const confirmInput = screen.getByLabelText("Confirm Password");
    const submitBtn = screen.getByRole("button", { name: "Change Password" });

    await user.type(currentInput, "password123");
    await user.type(newInput, "newpassword456");
    await user.type(confirmInput, "mismatching");

    await user.click(submitBtn);

    expect(await screen.findByText("New password and confirm password do not match.")).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
});
