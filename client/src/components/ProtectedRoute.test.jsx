import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import useAuth from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({ default: vi.fn() }));

function renderRoute(auth) {
  useAuth.mockReturnValue(auth);
  render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/private" element={<ProtectedRoute><p>Private content</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  test("shows a loading state while authentication is checked", () => {
    renderRoute({ loading: true, isAuthenticated: false });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects unauthenticated visitors to login", () => {
    renderRoute({ loading: false, isAuthenticated: false });
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  test("renders protected content for authenticated users", () => {
    renderRoute({ loading: false, isAuthenticated: true });
    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});
