import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  X, 
  Eye, 
  Check, 
  XCircle, 
  AlertCircle,
  Inbox,
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  ChevronRight,
  Filter
} from "lucide-react";
import api from "../../services/api";
import { TableRowSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import {
  cardInteractive,
  pageTitle,
  pageSubtitle,
  label as labelClass,
  select as selectClass,
  btnPrimary,
  btnSecondary,
  btnGhost,
  alertError,
  alertSuccess,
  paginationBtn,
  tableHeader,
  tableCell,
} from "../../lib/uiClasses";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const REQUEST_STATUS_COLORS = {
  pending: "bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-600/10",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-600/10",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-600/10",
};

const REQUEST_STATUS_DOTS = {
  pending: "bg-blue-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Filter & Pagination States
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // Default to pending
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  // Approval Form State
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [approveForm, setApproveForm] = useState({ assignedTo: "", status: "new" });
  const [approveError, setApproveError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounced Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get("/requests", { params });
      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch Members List for assignment
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const { data } = await api.get("/leads/members");
      setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  // Toast Helper
  const triggerToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  // Handle Request Details View
  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  // Handle Reject Action
  const handleReject = async (id) => {
    const confirmed = window.confirm("Are you sure you want to reject this lead request?");
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const { data } = await api.post(`/requests/${id}/reject`);
      triggerToast("Request rejected successfully.");
      
      // Update local state status or refresh
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
      );
      
      setIsDetailsOpen(false);
      fetchRequests();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to reject request.", false);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Approve Trigger (Opens Modal)
  const handleOpenApprove = (request) => {
    setSelectedRequest(request);
    setApproveForm({ assignedTo: "", status: "new" });
    setApproveError(null);
    fetchMembers();
    setIsApproveOpen(true);
  };

  // Confirm Approval (Saves Lead, marks Request Approved)
  const handleConfirmApprove = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      setApproveError(null);

      const payload = {
        status: approveForm.status,
      };
      if (approveForm.assignedTo) {
        payload.assignedTo = approveForm.assignedTo;
      }

      await api.post(`/requests/${selectedRequest._id}/approve`, payload);
      triggerToast("Request approved and converted to lead.");
      
      setIsApproveOpen(false);
      setIsDetailsOpen(false);
      fetchRequests();
    } catch (err) {
      setApproveError(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  // Date Formatting Helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 animate-[fade-in-up_0.3s_ease-out]">
          <div className={alertSuccess}>
            <span>🎉</span>
            <div>{successMsg}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={pageTitle}>Incoming Requests</h1>
          <p className={pageSubtitle}>Review and approve lead submissions from the public website contact form.</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`${alertError} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={fetchRequests} 
            className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                statusFilter === opt.value
                  ? "bg-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table/Grid Display */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <TableRowSkeleton key={i} cols={6} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <EmptyState
            icon={<Inbox className="h-10 w-10 text-slate-400" />}
            title="No requests found"
            description={search ? "Try adjusting your search criteria or checking other status filters." : "You have no incoming contact requests in this filter tab."}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className={tableHeader}>Name</th>
                  <th className={tableHeader}>Email</th>
                  <th className={tableHeader}>Phone</th>
                  <th className={tableHeader}>Company</th>
                  <th className={tableHeader}>Status</th>
                  <th className={tableHeader}>Submitted Time</th>
                  <th className={`${tableHeader} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {requests.map((req) => (
                  <tr key={req._id} className="group transition-colors duration-150 hover:bg-violet-50/20">
                    <td className={`${tableCell} font-semibold text-slate-800`}>{req.name}</td>
                    <td className={`${tableCell} text-slate-500`}>{req.email}</td>
                    <td className={`${tableCell} text-slate-500`}>{req.phone}</td>
                    <td className={`${tableCell} text-slate-500`}>{req.company || "—"}</td>
                    <td className={tableCell}>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset backdrop-blur-sm ${REQUEST_STATUS_COLORS[req.status] || ""}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${REQUEST_STATUS_DOTS[req.status] || "bg-slate-400"}`} />
                        {req.status}
                      </span>
                    </td>
                    <td className={`${tableCell} text-xs text-slate-400`}>{formatDateTime(req.createdAt)}</td>
                    <td className={`${tableCell} text-right`}>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(req)}
                          className={`${btnGhost} h-8 w-8 !p-0 rounded-lg`}
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        {req.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenApprove(req)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80 transition-all duration-200"
                              title="Approve Request"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(req._id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/80 transition-all duration-200"
                              title="Reject Request"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 divide-y divide-slate-100 md:hidden">
            {requests.map((req) => (
              <div key={req._id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-slate-800">{req.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{req.company || "No Company"}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${REQUEST_STATUS_COLORS[req.status] || ""}`}>
                    {req.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />{req.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{req.phone}</p>
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />{formatDateTime(req.createdAt)}</p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(req)}
                    className={`${btnSecondary} !py-1.5 !px-3 text-xs`}
                  >
                    View Details
                  </button>
                  {req.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(req._id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenApprove(req)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-5">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`${paginationBtn} ${
              page === 1
                ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
            }`}
          >
            ← Previous
          </button>
          <span className="text-xs font-semibold text-slate-600">
            Page <span className="text-slate-900">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`${paginationBtn} ${
              page === totalPages
                ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
            }`}
          >
            Next →
          </button>
        </div>
      )}

      {/* DETAILS VIEW MODAL */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/60 bg-white p-6 shadow-2xl animate-[scale-up_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Request Information</h2>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="mt-5 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                {selectedRequest.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{selectedRequest.name}</h3>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mt-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${REQUEST_STATUS_COLORS[selectedRequest.status]}`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Details Fields */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5 flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email Address</span>
                <span className="font-semibold text-slate-800 break-all">{selectedRequest.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5 flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
                <span className="font-semibold text-slate-800">{selectedRequest.phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5 flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> Company</span>
                <span className="font-semibold text-slate-800">{selectedRequest.company || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Submitted Time</span>
                <span className="font-semibold text-slate-800">{formatDateTime(selectedRequest.createdAt)}</span>
              </div>
              {selectedRequest.subject && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Subject</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.subject}</span>
                </div>
              )}
              <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Message / Inquiry</span>
                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>

              {selectedRequest.status !== "pending" && (
                <div className="sm:col-span-2 border-t border-dashed border-slate-100 pt-3 flex flex-wrap justify-between text-xs text-slate-400">
                  <span>Reviewed By: <strong className="text-slate-600">{selectedRequest.reviewedBy?.name || "System"}</strong></span>
                  <span>Reviewed At: <strong className="text-slate-600">{formatDateTime(selectedRequest.reviewedAt)}</strong></span>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className={`${btnSecondary} !py-2 !px-4 text-xs`}
              >
                Close
              </button>
              {selectedRequest.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(selectedRequest._id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 text-xs font-semibold hover:bg-rose-100"
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4" /> Reject Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenApprove(selectedRequest)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-900/10"
                    disabled={actionLoading}
                  >
                    <Check className="h-4 w-4" /> Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL DIALOG MODAL */}
      {isApproveOpen && selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 shadow-2xl animate-[scale-up_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Approve Lead & Assign</h2>
              <button
                onClick={() => setIsApproveOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApprove} className="mt-5 space-y-4">
              {approveError && (
                <div className={`${alertError} p-3 text-xs`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{approveError}</span>
                </div>
              )}

              {/* Assignment Dropdown */}
              <div className="space-y-1.5">
                <label htmlFor="assign-member-select" className={labelClass}>Assign Lead To</label>
                <select
                  id="assign-member-select"
                  value={approveForm.assignedTo}
                  onChange={(e) => setApproveForm({ ...approveForm, assignedTo: e.target.value })}
                  className={selectClass}
                  disabled={membersLoading}
                >
                  <option value="">Do not assign (Keep unassigned)</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                {membersLoading && (
                  <p className="text-[11px] text-slate-400 animate-pulse">Loading list of sales agents...</p>
                )}
              </div>

              {/* Initial Status */}
              <div className="space-y-1.5">
                <label htmlFor="initial-status-select" className={labelClass}>Initial Lead Status</label>
                <select
                  id="initial-status-select"
                  value={approveForm.status}
                  onChange={(e) => setApproveForm({ ...approveForm, status: e.target.value })}
                  className={selectClass}
                >
                  <option value="new">New (Awaiting first contact)</option>
                  <option value="contacted">Contacted (In conversation)</option>
                  <option value="qualified">Qualified (Sales opportunity)</option>
                  <option value="lost">Lost (Dropped deal)</option>
                </select>
              </div>

              {/* Requester Summary Sheet */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5 text-slate-600">
                <p><strong>Lead Requester:</strong> {selectedRequest.name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsApproveOpen(false)}
                  className={`${btnSecondary} !py-2.5 !px-4.5`}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Confirm Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
