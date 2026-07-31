import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Inbox,
  UserCheck,
  Repeat,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";

function formatRelativeTime(date) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "Just now";
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getNotificationIcon(type) {
  switch (type) {
    case "NEW_LEAD_REQUEST":
      return <Inbox className="h-5 w-5 text-blue-600" />;
    case "LEAD_ASSIGNED":
      return <UserCheck className="h-5 w-5 text-emerald-600" />;
    case "LEAD_REASSIGNED":
      return <Repeat className="h-5 w-5 text-amber-600" />;
    case "STATUS_UPDATED":
      return <RefreshCw className="h-5 w-5 text-purple-600" />;
    case "NOTE_ADDED":
      return <FileText className="h-5 w-5 text-indigo-600" />;
    default:
      return <Sparkles className="h-5 w-5 text-violet-600" />;
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/notifications", {
        params: { page, limit, filter },
      });
      if (data.success) {
        setNotifications(data.notifications || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setDeletingId(id);
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }
    const leadId = notif.relatedLead?._id || notif.relatedLead;
    if (leadId) {
      navigate(`/dashboard/leads/${leadId}/edit`);
    } else if (notif.type === "NEW_LEAD_REQUEST") {
      navigate("/dashboard/requests");
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Stay updated with lead activities, assignments, status changes, and form submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
            >
              <CheckCheck className="h-4 w-4 text-violet-600" />
              Mark All as Read
            </button>
          )}
          <button
            type="button"
            onClick={fetchNotifications}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-[0.97]"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <Filter className="h-4 w-4 text-slate-400 mr-1" />
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread" },
          { id: "read", label: "Read" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              filter === tab.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchNotifications}
            className="font-semibold text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Notifications List Container */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`group flex items-start justify-between gap-4 p-4 transition-all duration-200 cursor-pointer hover:bg-slate-50/80 ${
                  !notif.isRead ? "bg-violet-50/30" : "bg-transparent"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Icon */}
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      !notif.isRead
                        ? "bg-violet-100 ring-violet-200"
                        : "bg-slate-100 ring-slate-200/60"
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3
                        className={`text-sm font-bold truncate ${
                          !notif.isRead ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-violet-600 shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-slate-400">
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                      {notif.relatedLead && (
                        <span className="inline-flex items-center gap-1 text-violet-600 hover:underline">
                          View Lead <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(notif._id, e)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(notif._id, e)}
                    disabled={deletingId === notif._id}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 mb-4 ring-1 ring-violet-100">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              No notifications found
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {filter === "unread"
                ? "You're all caught up! No unread notifications at the moment."
                : filter === "read"
                ? "No read notifications found."
                : "You don't have any notifications right now."}
            </p>
          </div>
        )}

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <p className="text-xs text-slate-500 font-medium">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
