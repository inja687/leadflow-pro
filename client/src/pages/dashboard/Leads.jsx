import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

const STATUS_OPTIONS = ["", "new", "contacted", "qualified", "lost"];

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  lost: "Lost",
};

const STATUS_COLORS = {
  new: "bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-600/10",
  contacted: "bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-600/10",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-600/10",
  lost: "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-600/10",
};

const STATUS_DOT = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  qualified: "bg-emerald-500",
  lost: "bg-rose-500",
};

export default function Leads() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search + Filter + Pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get("/leads", { params });
      // BUG FIX: correct key prop placement
      setLeads(data.leads || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete lead.");
    }
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            {isAdmin ? "Lead Management" : "My Leads"}
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {loading ? "Loading..." : `${total} lead${total !== 1 ? "s" : ""} total`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/dashboard/leads/new")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-xl font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] active:scale-[0.97] transition-all duration-200 text-sm"
          >
            ➕ Add Lead
          </button>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm shadow-sm transition-all duration-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 bg-white text-slate-700"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          onClick={fetchLeads}
          className="px-4 py-2.5 bg-white text-slate-700 rounded-xl text-sm font-medium border border-slate-200 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.97]"
          title="Refresh"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl text-red-700 text-sm flex items-center gap-2 animate-[fade-in-up_0.3s_ease-out]">
          ⚠️ {error}
          <button
            onClick={fetchLeads}
            className="ml-auto underline text-red-600 hover:text-red-800 decoration-red-300 underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100/60 last:border-0">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-4 w-1/4 overflow-hidden rounded-md bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-4 w-1/5 overflow-hidden rounded-md bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-4 w-1/6 overflow-hidden rounded-md bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-6 w-16 ml-auto overflow-hidden rounded-full bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 animate-[fade-in-up_0.4s_ease-out]">
            <div className="relative mb-5">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-violet-100/60 to-indigo-100/40 blur-lg" aria-hidden="true" />
              <div className="relative text-5xl">📭</div>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">
              {search || statusFilter
                ? "No leads match your filters"
                : isAdmin
                ? "No leads yet"
                : "No leads assigned to you"}
            </h3>
            <p className="text-slate-400 text-sm mb-7 max-w-xs leading-relaxed">
              {search || statusFilter
                ? "Try adjusting your search or filter criteria."
                : isAdmin
                ? "Get started by adding your first lead to the CRM."
                : "Contact your admin to get leads assigned to you."}
            </p>
            {!search && !statusFilter && isAdmin && (
              <button
                onClick={() => navigate("/dashboard/leads/new")}
                className="px-6 py-2.5 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-xl font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] transition-all duration-200 text-sm active:scale-[0.97]"
              >
                ➕ Add Your First Lead
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    {isAdmin && <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned To</th>}
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {/* BUG FIX: key prop is now correctly on <tr key=...> */}
                  {leads.map((lead, index) => (
                    <tr
                      key={lead._id}
                      className={`group transition-colors duration-150 hover:bg-violet-50/40 ${index % 2 === 1 ? "bg-slate-50/30" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
                            {lead.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.email}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.phone}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{lead.company || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/10"}`}>
                          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                            <span className={`absolute inline-flex h-full w-full animate-[pulse-subtle_2s_ease-in-out_infinite] rounded-full ${STATUS_DOT[lead.status] || "bg-slate-400"} opacity-60`} />
                            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${STATUS_DOT[lead.status] || "bg-slate-400"}`} />
                          </span>
                          {STATUS_LABELS[lead.status] || lead.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-slate-500 text-sm">
                          {lead.assignedTo ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-6 h-6 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-[10px] ring-1 ring-violet-100">
                                {lead.assignedTo.name?.charAt(0).toUpperCase()}
                              </span>
                              {lead.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">Unassigned</span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}
                            className="px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg transition-all duration-200 hover:bg-violet-100 hover:border-violet-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                          >
                            ✏️ {isAdmin ? "Edit" : "View"}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(lead._id, lead.name)}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg transition-all duration-200 hover:bg-rose-100 hover:border-rose-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100/60">
              {leads.map((lead) => (
                <div key={lead._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700 ring-1 ring-violet-100">
                        {lead.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{lead.name}</p>
                        <p className="text-xs text-slate-400 truncate">{lead.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-600 border-slate-200 ring-slate-600/10"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[lead.status] || "bg-slate-400"}`} />
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-400">Phone: </span><span className="text-slate-600">{lead.phone}</span></div>
                    <div><span className="text-slate-400">Company: </span><span className="text-slate-600">{lead.company || "—"}</span></div>
                    {isAdmin && lead.assignedTo && (
                      <div className="col-span-2"><span className="text-slate-400">Assigned: </span><span className="text-slate-600">{lead.assignedTo.name}</span></div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/dashboard/leads/${lead._id}/edit`)}
                      className="flex-1 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg transition-all duration-200 hover:bg-violet-100 text-center"
                    >
                      ✏️ {isAdmin ? "Edit" : "View"}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(lead._id, lead.name)}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg transition-all duration-200 hover:bg-rose-100"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 bg-white shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-sm disabled:hover:border-slate-200 active:scale-[0.97]"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  page === i + 1
                    ? "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)]"
                    : "border border-slate-200 text-slate-700 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.97]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 bg-white shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-sm disabled:hover:border-slate-200 active:scale-[0.97]"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}