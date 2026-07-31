import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight, Inbox, Sparkles, UserCheck, RefreshCw, FileText, Repeat } from "lucide-react";
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
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getNotificationIcon(type) {
  switch (type) {
    case "NEW_LEAD_REQUEST":
      return <Inbox className="h-4 w-4 text-blue-600" />;
    case "LEAD_ASSIGNED":
      return <UserCheck className="h-4 w-4 text-emerald-600" />;
    case "LEAD_REASSIGNED":
      return <Repeat className="h-4 w-4 text-amber-600" />;
    case "STATUS_UPDATED":
      return <RefreshCw className="h-4 w-4 text-purple-600" />;
    case "NOTE_ADDED":
      return <FileText className="h-4 w-4 text-indigo-600" />;
    default:
      return <Sparkles className="h-4 w-4 text-violet-600" />;
  }
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications", {
        params: { page: 1, limit: 5 },
      });
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications bell data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    setIsOpen(false);

    const leadId = notif.relatedLead?._id || notif.relatedLead;
    if (leadId) {
      navigate(`/dashboard/leads/${leadId}/edit`);
    } else if (notif.type === "NEW_LEAD_REQUEST") {
      navigate("/dashboard/requests");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative rounded-xl p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-1 text-[10px] font-bold text-white shadow-md shadow-violet-500/30 ring-2 ring-white animate-in zoom-in duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/80 bg-white/95 p-0 shadow-2xl shadow-slate-900/10 backdrop-blur-xl ring-1 ring-slate-900/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition-colors hover:text-violet-700"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex cursor-pointer items-start gap-3 p-3.5 transition-all duration-200 hover:bg-slate-50/80 ${
                    !notif.isRead
                      ? "bg-violet-50/40"
                      : "bg-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Unread indicator bar */}
                  {!notif.isRead && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-violet-600" />
                  )}

                  {/* Icon badge */}
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      !notif.isRead
                        ? "bg-violet-100/80 ring-violet-200/80"
                        : "bg-slate-100 ring-slate-200/60"
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`truncate text-xs font-bold ${
                          !notif.isRead ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-medium text-slate-400">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  No notifications yet
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  We will notify you when events occur.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-center">
            <Link
              to="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              View All Notifications <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
