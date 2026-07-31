import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const allNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊", end: true, roles: ["admin", "member"] },
  { to: "/dashboard/leads", label: "Leads", icon: "👥", end: false, roles: ["admin", "member"] },
  { to: "/dashboard/members", label: "Members", icon: "👤", end: false, roles: ["admin"] },
  { to: "/dashboard/requests", label: "Incoming Requests", icon: "📨", end: false, roles: ["admin"] },
  { to: "/dashboard/profile", label: "Profile", icon: "⚙️", end: false, roles: ["admin", "member"] },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleBadgeColor = isAdmin
    ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";

  const roleBadgeColorLight = isAdmin
    ? "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10"
    : "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10";

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="border-b border-white/[0.06] px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-900/40 ring-1 ring-white/10">
            LF
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              LeadFlow Pro
            </span>
            <p className="text-[11px] font-medium text-slate-500">Sales CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Dashboard">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-violet-600/90 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" aria-hidden="true" />
                )}
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3 ring-1 ring-white/[0.06]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-bold text-white ring-2 ring-violet-400/20">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name || "User"}</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${roleBadgeColor}`}
            >
              {user?.role || "member"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <span aria-hidden="true">🚪</span> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 flex-col border-r border-slate-800/40 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="absolute bottom-0 left-0 top-0 flex w-72 max-w-[85vw] flex-col border-r border-slate-800/40 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-2xl shadow-black/40 animate-[slide-in-left_0.3s_ease-out]"
            aria-label="Mobile navigation"
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 lg:hidden"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-display text-base font-bold text-slate-900 lg:hidden">
                LeadFlow Pro
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-xs font-bold text-violet-700 ring-2 ring-violet-100">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-900">{user?.name || "User"}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${roleBadgeColorLight}`}
                  >
                    {user?.role || "member"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <span aria-hidden="true">🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
