import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Target, Star, BarChart3, ClipboardList, CheckSquare, RefreshCw } from "lucide-react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

const STATUS_META = {
  new: { label: "New", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600", text: "text-blue-700", soft: "bg-blue-50", border: "border-blue-200/80", ring: "ring-blue-600/10" },
  contacted: { label: "Contacted", color: "bg-amber-500", gradient: "from-amber-500 to-amber-600", text: "text-amber-700", soft: "bg-amber-50", border: "border-amber-200/80", ring: "ring-amber-600/10" },
  qualified: { label: "Qualified", color: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600", text: "text-emerald-700", soft: "bg-emerald-50", border: "border-emerald-200/80", ring: "ring-emerald-600/10" },
  lost: { label: "Lost", color: "bg-rose-500", gradient: "from-rose-500 to-rose-600", text: "text-rose-700", soft: "bg-rose-50", border: "border-rose-200/80", ring: "ring-rose-600/10" },
};

const activityLabels = {
  lead_created: "created a lead",
  lead_assigned: "updated an assignment",
  status_changed: "changed a status",
  note_added: "added a note",
  lead_updated: "updated lead details",
  lead_deleted: "deleted a lead",
};

function Icon({ name, className = "w-5 h-5" }) {
  const paths = {
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m17-9a4 4 0 0 0 0-8m-3-3.5a4 4 0 1 1 0 7M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m12 8 3-3m-6 0 3 3" /></>,
    spark: <path d="m12 3-1.7 5.3L5 10l5.3 1.7L12 17l1.7-5.3L19 10l-5.3-1.7L12 3Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14m-7-7h14" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-8-7-2 2-2-2H2a2 2 0 0 0-2 2v4h24V7a2 2 0 0 0-2-2h-10Z" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function formatTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100/80">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
        <div className="relative h-5 w-14 overflow-hidden rounded-full bg-slate-100/80">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
      </div>
      <div className="relative mt-6 h-4 w-24 overflow-hidden rounded-md bg-slate-100/80">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      </div>
      <div className="relative mt-3 h-9 w-16 overflow-hidden rounded-lg bg-slate-100/80">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    stats: null,
    monthlyActivities: [],
    todaysTasks: [],
    pendingFollowUps: [],
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAdmin) {
        // Load personal performance stats for Member
        const { data } = await api.get("/leads/dashboard/performance");
        setPerformanceData({
          stats: data.stats,
          monthlyActivities: data.monthlyActivities || [],
          todaysTasks: data.todaysTasks || [],
          pendingFollowUps: data.pendingFollowUps || [],
        });
      } else {
        // Load Admin global view
        const [statsResponse, leadsResponse, myLeadsResponse, activitiesResponse] = await Promise.all([
          api.get("/leads/dashboard/stats"),
          api.get("/leads", { params: { page: 1, limit: 5 } }),
          api.get("/leads", { params: { page: 1, limit: 4, mine: true } }),
          api.get("/leads/dashboard/activities", { params: { limit: 6 } }),
        ]);
        setStats(statsResponse.data.stats);
        setLeads(leadsResponse.data.leads || []);
        setMyLeads(myLeadsResponse.data.leads || []);
        setActivities(activitiesResponse.data.activities || []);

        if (statsResponse.data.stats?.pendingRequests !== undefined) {
          try {
            const reqsResponse = await api.get("/requests", { params: { page: 1, limit: 5, status: "pending" } });
            setRecentRequests(reqsResponse.data.requests || []);
          } catch (reqErr) {
            console.error("Failed to load dashboard recent requests:", reqErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setError("Failed to load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const cards = [
    { label: "Total Leads", value: stats?.totalLeads, icon: "users", iconClass: "from-violet-500/20 to-violet-600/10 text-violet-600", iconBg: "bg-gradient-to-br" },
    { label: "My Leads", value: stats?.myLeads, icon: "target", iconClass: "from-sky-500/20 to-sky-600/10 text-sky-600", iconBg: "bg-gradient-to-br" },
    { label: "New Leads", value: stats?.newLeads, icon: "spark", iconClass: "from-blue-500/20 to-blue-600/10 text-blue-600", iconBg: "bg-gradient-to-br" },
    { label: "Qualified", value: stats?.qualifiedLeads, icon: "check", iconClass: "from-emerald-500/20 to-emerald-600/10 text-emerald-600", iconBg: "bg-gradient-to-br" },
  ];

  if (isAdmin) {
    cards.push(
      { label: "Pending Requests", value: stats?.pendingRequests, icon: "inbox", iconClass: "from-blue-500/20 to-indigo-600/10 text-indigo-600", iconBg: "bg-gradient-to-br" },
      { label: "Approved Today", value: stats?.approvedToday, icon: "check", iconClass: "from-emerald-500/20 to-teal-600/10 text-emerald-600", iconBg: "bg-gradient-to-br" },
      { label: "Rejected Today", value: stats?.rejectedToday, icon: "x", iconClass: "from-rose-500/20 to-pink-600/10 text-rose-600", iconBg: "bg-gradient-to-br" }
    );
  }
  const total = stats?.totalLeads || 0;

  // Member Dashboard Render
  if (!isAdmin) {
    const memberStats = performanceData.stats;
    const memberTotal = memberStats?.totalLeads || 0;

    const newPct = memberTotal ? Math.round(((memberStats?.newLeads || 0) / memberTotal) * 100) : 0;
    const contactedPct = memberTotal ? Math.round(((memberStats?.contactedLeads || 0) / memberTotal) * 100) : 0;
    const qualifiedPct = memberTotal ? Math.round(((memberStats?.qualifiedLeads || 0) / memberTotal) * 100) : 0;
    const lostPct = memberTotal ? Math.round(((memberStats?.lostLeads || 0) / memberTotal) * 100) : 0;

    const conicDonutStyle = memberTotal
      ? {
          background: `conic-gradient(
            #3b82f6 0% ${newPct}%,
            #f59e0b ${newPct}% ${newPct + contactedPct}%,
            #10b981 ${newPct + contactedPct}% ${newPct + contactedPct + qualifiedPct}%,
            #ef4444 ${newPct + contactedPct + qualifiedPct}% 100%
          )`,
        }
      : { background: "#f1f5f9" };

    const memberCards = [
      { label: "Assigned Leads", value: memberStats?.totalLeads ?? 0, icon: "users", iconClass: "from-violet-500/20 to-violet-600/10 text-violet-600", iconBg: "bg-gradient-to-br" },
      { label: "New Leads", value: memberStats?.newLeads ?? 0, icon: "spark", iconClass: "from-blue-500/20 to-blue-600/10 text-blue-600", iconBg: "bg-gradient-to-br" },
      { label: "Contacted", value: memberStats?.contactedLeads ?? 0, icon: "target", iconClass: "from-sky-500/20 to-sky-600/10 text-sky-600", iconBg: "bg-gradient-to-br" },
      { label: "Qualified", value: memberStats?.qualifiedLeads ?? 0, icon: "check", iconClass: "from-emerald-500/20 to-emerald-600/10 text-emerald-600", iconBg: "bg-gradient-to-br" },
      { label: "Lost Leads", value: memberStats?.lostLeads ?? 0, icon: "x", iconClass: "from-rose-500/20 to-pink-600/10 text-rose-600", iconBg: "bg-gradient-to-br" },
      { label: "Conversion Rate", value: `${memberStats?.conversionRate ?? 0}%`, icon: "activity", iconClass: "from-violet-500/20 to-violet-600/10 text-violet-600", iconBg: "bg-gradient-to-br" },
      { label: "Completion Rate", value: `${memberStats?.completionRate ?? 0}%`, icon: "check", iconClass: "from-emerald-500/20 to-emerald-600/10 text-emerald-600", iconBg: "bg-gradient-to-br" },
    ];

    const maxActivityCount = Math.max(...(performanceData.monthlyActivities || []).map((a) => a.count), 1);

    return (
      <div className="space-y-8 animate-[fade-in-up_0.4s_ease-out]">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">My Workspace</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900">Good to see you, {user?.name?.split(" ")[0] || "there"}</h1>
            <p className="mt-1.5 text-sm text-slate-500">Track your personal conversion funnel, pending tasks, and monthly sales activities.</p>
          </div>
          <button 
            onClick={loadDashboard} 
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.97]"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-4 py-3.5 text-sm text-red-700 animate-[fade-in-up_0.3s_ease-out]">
            <span>⚠️ {error}</span>
            <button onClick={loadDashboard} className="font-semibold text-red-600 underline decoration-red-300 underline-offset-2 transition-colors hover:text-red-800">Retry</button>
          </div>
        )}

        {/* Member Performance Stats Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {loading ? [...Array(7)].map((_, index) => <StatSkeleton key={index} />) : memberCards.map((card) => (
            <div key={card.label} className="group rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} ${card.iconClass}`}>
                  <Icon name={card.icon} className="h-5 w-5" />
                </div>
                {card.label.includes("Rate") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-600/10">
                    <Star className="h-2.5 w-2.5" /> Rate
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500 tracking-wide uppercase">{card.label}</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
            </div>
          ))}
        </section>

        {/* Charts: Donut Status + Monthly Activity */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Status Pie Chart */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Status Pie Chart</h2>
                <p className="mt-1 text-sm text-slate-500">Funnel distribution of assigned leads</p>
              </div>
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600 ring-1 ring-violet-100"><Target className="h-4.5 w-4.5" /></div>
            </div>

            {loading ? (
              <div className="flex h-56 items-center justify-center">
                <div className="h-32 w-32 rounded-full border-4 border-slate-100 border-t-violet-500 animate-spin" />
              </div>
            ) : !memberTotal ? (
              <div className="flex flex-col items-center justify-center py-10 text-center h-56">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm text-slate-400">No leads distribution statistics.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center sm:flex-row sm:justify-around gap-6 h-fit pt-2">
                {/* Conic donut render */}
                <div className="relative h-36 w-36 shrink-0 rounded-full border border-slate-100/50 shadow-inner flex items-center justify-center" style={conicDonutStyle}>
                  <div className="h-24 w-24 rounded-full bg-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-slate-800">{memberTotal}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Leads</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 text-xs font-semibold text-slate-700 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> New</span>
                    <span className="text-slate-500">{memberStats?.newLeads} ({newPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Contacted</span>
                    <span className="text-slate-500">{memberStats?.contactedLeads} ({contactedPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Qualified</span>
                    <span className="text-slate-500">{memberStats?.qualifiedLeads} ({qualifiedPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Lost</span>
                    <span className="text-slate-500">{memberStats?.lostLeads} ({lostPct}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Activity Chart */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] xl:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Monthly Activity Chart</h2>
                <p className="mt-1 text-sm text-slate-500">Your logged activity updates over the last 6 months</p>
              </div>
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600 ring-1 ring-violet-100"><BarChart3 className="h-4.5 w-4.5" /></div>
            </div>

            {loading ? (
              <div className="flex h-56 items-end gap-4 px-4 pt-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-t-lg flex-1 h-32 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex h-52 items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
                {performanceData.monthlyActivities.map((act) => {
                  const pctHeight = (act.count / maxActivityCount) * 80; // max 80% height for margin space
                  return (
                    <div key={act.label} className="group flex flex-col items-center gap-2 flex-1">
                      <div className="relative w-full flex justify-center">
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap shadow-md">
                          {act.count} updates
                        </span>
                        <div
                          className="w-7 rounded-t-md bg-gradient-to-t from-violet-500 to-indigo-500 group-hover:from-violet-600 group-hover:to-indigo-600 transition-all duration-300 shadow-[0_-2px_6px_rgba(139,92,246,0.1)]"
                          style={{ height: `${Math.max(pctHeight, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{act.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Today's Tasks & Pending Follow Ups Cards */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Today's Tasks Feed */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] flex flex-col h-[350px]">
            <div className="mb-5 flex items-center gap-2.5 shrink-0">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600 ring-1 ring-blue-100"><ClipboardList className="h-4.5 w-4.5" /></div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">Today's Tasks</h2>
                <p className="text-xs text-slate-400">Outreach pending for new assigned leads ({performanceData.todaysTasks.length})</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 flex-1 overflow-hidden">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : performanceData.todaysTasks.length ? (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1.5 scrollbar-thin">
                {performanceData.todaysTasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between gap-3 p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{task.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{task.company || "No Company"} · {task.phone}</p>
                    </div>
                    <Link
                      to={`/dashboard/leads/${task._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-xl bg-violet-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-violet-700 shadow-sm transition-all duration-200"
                    >
                      Outreach
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm font-semibold text-slate-700">No new outreach tasks!</p>
                <p className="text-xs text-slate-400 mt-0.5">You're fully caught up on first touches.</p>
              </div>
            )}
          </div>

          {/* Pending Follow Ups Feed */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] flex flex-col h-[350px]">
            <div className="mb-5 flex items-center gap-2.5 shrink-0">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 ring-1 ring-amber-100"><CheckSquare className="h-4.5 w-4.5" /></div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">Pending Follow Ups</h2>
                <p className="text-xs text-slate-400">Ongoing engagements awaiting updates ({performanceData.pendingFollowUps.length})</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 flex-1 overflow-hidden">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : performanceData.pendingFollowUps.length ? (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1.5 scrollbar-thin">
                {performanceData.pendingFollowUps.map((lead) => {
                  const latestNote = lead.notes?.[lead.notes.length - 1]?.text;
                  return (
                    <div key={lead._id} className="flex items-center justify-between gap-3 p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
                          <span className="text-[10px] text-slate-400 truncate">{lead.company}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic truncate mt-1">
                          {latestNote ? `"${latestNote}"` : "No notes yet. Schedule next touch."}
                        </p>
                      </div>
                      <Link
                        to={`/dashboard/leads/${lead._id}/edit`}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0"
                      >
                        Follow Up
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                <div className="text-3xl mb-2">🤝</div>
                <p className="text-sm font-semibold text-slate-700">All follow ups completed!</p>
                <p className="text-xs text-slate-400 mt-0.5">Keep filling the pipeline with new leads.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-600">{isAdmin ? "Sales overview" : "Your workspace"}</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900">Good to see you, {user?.name?.split(" ")[0] || "there"}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{isAdmin ? "Here's what's happening across your pipeline." : "Here's what's happening with your assigned leads."}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Link to="/dashboard/leads/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] active:scale-[0.97]">
              <Icon name="plus" className="h-4 w-4" />Add lead
            </Link>
          )}
          <button onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.97]">Refresh</button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-4 py-3.5 text-sm text-red-700 animate-[fade-in-up_0.3s_ease-out]">
          <span>⚠️ {error}</span>
          <button onClick={loadDashboard} className="font-semibold text-red-600 underline decoration-red-300 underline-offset-2 transition-colors hover:text-red-800">Retry</button>
        </div>
      )}

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? [...Array(isAdmin ? 7 : 4)].map((_, index) => <StatSkeleton key={index} />) : cards.map((card) => (
          <div key={card.label} className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06),0_2px_8px_rgba(139,92,246,0.06)]">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconClass}`}>
                <Icon name={card.icon} />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-600/10">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-[pulse-subtle_2s_ease-in-out_infinite]" />
                Live
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">{card.value ?? 0}</p>
          </div>
        ))}
      </section>

      {/* Status Chart + My Leads */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Status Chart */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] xl:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Status chart</h2>
              <p className="mt-1 text-sm text-slate-500">Your current pipeline distribution</p>
            </div>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600 ring-1 ring-violet-100"><Icon name="activity" className="h-4 w-4" /></div>
          </div>
          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <div className="relative mb-2.5 h-4 w-28 overflow-hidden rounded-md bg-slate-100/80">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-100/80">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(STATUS_META).map(([status, meta]) => {
                const value = stats?.[`${status}Leads`] || 0;
                const percentage = total ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2.5 font-medium text-slate-700">
                        <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${meta.gradient}`} />
                        {meta.label}
                      </span>
                      <span className="font-medium text-slate-500">{value} <span className="text-slate-300">·</span> {percentage}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} shadow-inner transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Leads */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">My Leads</h2>
              <p className="mt-1 text-sm text-slate-500">{isAdmin ? "Leads assigned to you" : "Your assigned leads"}</p>
            </div>
            <Link to="/dashboard/leads" className="text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="relative h-14 overflow-hidden rounded-xl bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
          ) : myLeads.length ? (
            <div className="space-y-1">
              {myLeads.map((lead) => {
                const meta = STATUS_META[lead.status] || STATUS_META.new;
                return (
                  <Link key={lead._id} to={`/dashboard/leads/${lead._id}/edit`} className="group flex items-center justify-between gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-slate-50/80">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{lead.name}</p>
                      <p className="truncate text-xs text-slate-400">{lead.company || lead.email}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.soft} ${meta.text} ${meta.border} ${meta.ring}`}>{meta.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 text-4xl">📋</div>
              <p className="text-sm text-slate-400">No leads assigned to you yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Leads + Activity */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Recent Leads */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Recent Leads</h2>
              <p className="mt-1 text-sm text-slate-500">Most recently added to the pipeline</p>
            </div>
            <Link to="/dashboard/leads" className="text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="relative h-16 overflow-hidden rounded-xl bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
          ) : leads.length ? (
            <div className="divide-y divide-slate-100/80">
              {leads.map((lead) => {
                const meta = STATUS_META[lead.status] || STATUS_META.new;
                return (
                  <Link key={lead._id} to={`/dashboard/leads/${lead._id}/edit`} className="group flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 transition-colors">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700 ring-2 ring-violet-50 transition-all duration-200 group-hover:ring-violet-200 group-hover:shadow-md group-hover:shadow-violet-100">
                        {lead.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{lead.name}</p>
                        <p className="truncate text-xs text-slate-400">{lead.email}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.soft} ${meta.text} ${meta.border} ${meta.ring}`}>{meta.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 text-4xl">📭</div>
              <p className="text-sm text-slate-400">No recent leads yet.</p>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 ring-1 ring-violet-100"><Icon name="activity" className="h-4 w-4" /></div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Latest Activities</h2>
              <p className="text-sm text-slate-500">Recent team updates</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="relative h-12 overflow-hidden rounded-xl bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
          ) : activities.length ? (
            <div className="relative space-y-4">
              {/* Timeline line */}
              <div className="absolute left-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-200 via-slate-200 to-transparent" aria-hidden="true" />
              {activities.map((activity) => (
                <div key={activity._id} className="relative flex gap-3.5 pl-1">
                  <div className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500 ring-4 ring-white" />
                  <div className="min-w-0">
                    <p className="text-sm leading-5 text-slate-700">
                      <span className="font-semibold">{activity.performedBy?.name || "A team member"}</span>{" "}
                      {activityLabels[activity.action] || "updated a lead"}
                      {activity.lead?.name && <> for <span className="font-semibold">{activity.lead.name}</span></>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 text-4xl">📝</div>
              <p className="text-sm text-slate-400">No activity recorded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Admin Only: Recent Pending Requests */}
      {isAdmin && (
        <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] animate-[fade-in-up_0.4s_ease-out]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Recent Pending Requests</h2>
              <p className="mt-1 text-sm text-slate-500">Incoming contact form submissions awaiting review</p>
            </div>
            <Link to="/dashboard/requests" className="text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="relative h-16 overflow-hidden rounded-xl bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              ))}
            </div>
          ) : recentRequests.length ? (
            <div className="divide-y divide-slate-100/80">
              {recentRequests.map((req) => (
                <div key={req._id} className="group flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{req.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{req.email} · {req.company || "No Company"}</p>
                  </div>
                  <Link to="/dashboard/requests" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                    Review <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 text-4xl">📨</div>
              <p className="text-sm text-slate-400">All caught up! No pending lead requests.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
