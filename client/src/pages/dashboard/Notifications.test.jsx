import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Notifications from "./Notifications";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockNotifications = [
  {
    _id: "notif-1",
    title: "New Lead Request",
    message: "John submitted a contact request",
    type: "NEW_LEAD_REQUEST",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "notif-2",
    title: "Lead Assigned",
    message: "You were assigned lead Jane",
    type: "LEAD_ASSIGNED",
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

describe("Notifications Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        success: true,
        notifications: mockNotifications,
        total: 2,
        totalPages: 1,
        unreadCount: 1,
      },
    });
  });

  test("renders Notifications page header and list", async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(await screen.findByText("New Lead Request")).toBeInTheDocument();
    expect(screen.getByText("Lead Assigned")).toBeInTheDocument();
  });

  test("allows marking a notification as read", async () => {
    api.patch.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const markReadBtn = await screen.findByTitle("Mark as read");
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/notifications/notif-1/read");
    });
  });

  test("allows deleting a notification", async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const deleteBtn = (await screen.findAllByTitle("Delete notification"))[0];
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/notifications/notif-1");
    });
  });
});
