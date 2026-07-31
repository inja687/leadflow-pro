import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit2, 
  Eye, 
  UserCheck, 
  UserMinus, 
  X, 
  AlertCircle,
  UserPlus,
  Copy,
  CheckCircle2
} from "lucide-react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { MemberCardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import {
  cardInteractive,
  pageTitle,
  pageSubtitle,
  label as labelClass,
  input as inputClass,
  select as selectClass,
  btnPrimary,
  btnSecondary,
  btnGhost,
  alertError,
  alertSuccess,
  paginationBtn,
} from "../../lib/uiClasses";

export default function Members() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Pagination State
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [selectedMember, setSelectedMember] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State for editing
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [formError, setFormError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Add Member Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", passwordType: "auto", customPassword: "" });
  const [addFormError, setAddFormError] = useState(null);
  const [addSubmitLoading, setAddSubmitLoading] = useState(false);
  const [newMemberCredentials, setNewMemberCredentials] = useState(null);


  // Debounced Search Input (400ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Members List
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 9 };
      if (search) params.search = search;

      const { data } = await api.get("/members", { params });
      setMembers(data.members || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load team members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle Toast Messages
  const triggerToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  // Toggle Activate / Deactivate status
  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === "inactive" ? "active" : "inactive";
    const statusText = nextStatus === "active" ? "activate" : "deactivate";

    // Prevent deactivating own account
    if (member._id === currentUser?.id && nextStatus === "inactive") {
      triggerToast("You cannot deactivate your own admin account.", false);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${statusText} "${member.name}"?`
    );
    if (!confirmed) return;

    try {
      const { data } = await api.patch(`/members/${member._id}/status`, { status: nextStatus });
      setMembers((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, status: data.member.status } : m))
      );
      triggerToast(`Successfully updated ${member.name}'s status to ${data.member.status}.`);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to update member status.", false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (member) => {
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role,
    });
    setSelectedMember(member);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Form Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setFormError("Name and Email fields are required.");
      return;
    }

    try {
      setSubmitLoading(true);
      setFormError(null);
      const { data } = await api.put(`/members/${selectedMember._id}`, editForm);

      setMembers((prev) =>
        prev.map((m) =>
          m._id === selectedMember._id
            ? { ...m, name: data.member.name, email: data.member.email, role: data.member.role }
            : m
        )
      );

      setIsEditModalOpen(false);
      triggerToast(`Member "${data.member.name}" updated successfully.`);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update member.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open View Profile Modal
  const handleOpenView = (member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  // Open Add Member Modal
  const handleOpenAdd = () => {
    setAddForm({ name: "", email: "", passwordType: "auto", customPassword: "" });
    setAddFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle Add Member Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      setAddFormError("Full Name and Email fields are required.");
      return;
    }

    if (addForm.passwordType === "manual" && !addForm.customPassword.trim()) {
      setAddFormError("Please enter a temporary password.");
      return;
    }

    try {
      setAddSubmitLoading(true);
      setAddFormError(null);

      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
      };

      if (addForm.passwordType === "manual") {
        payload.password = addForm.customPassword;
      }

      const { data } = await api.post("/members", payload);

      // Save credentials for the success modal
      setNewMemberCredentials(data.credentials);

      // Close Form Modal, Open Success Modal
      setIsAddModalOpen(false);
      setIsSuccessModalOpen(true);

      // Trigger list refresh
      fetchMembers();
    } catch (err) {
      setAddFormError(err.response?.data?.message || "Failed to create member.");
    } finally {
      setAddSubmitLoading(false);
    }
  };

  // Copy Credentials to Clipboard
  const handleCopyCredentials = () => {
    if (!newMemberCredentials) return;
    const textToCopy = `Email: ${newMemberCredentials.email}\nTemporary Password: ${newMemberCredentials.temporaryPassword}`;
    navigator.clipboard.writeText(textToCopy);
    triggerToast("Credentials copied to clipboard!");
  };


  // Formatted joined date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate dynamic gradient for avatar
  const getAvatarGradient = (name) => {
    const colors = [
      "from-violet-500 to-indigo-600",
      "from-emerald-400 to-teal-600",
      "from-amber-400 to-orange-500",
      "from-blue-500 to-cyan-600",
      "from-rose-500 to-pink-600",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 animate-[fade-in-up_0.3s_ease-out]">
          <div className={alertSuccess}>
            <span>🎉</span>
            <div>{successMsg}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={pageTitle}>Team Members</h1>
          <p className={pageSubtitle}>Manage sales agents, update roles, and review workload distributions.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className={`${btnPrimary} py-2.5 px-4 text-xs font-semibold`}
        >
          <UserPlus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={`${alertError} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={fetchMembers} 
            className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters/Search Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/60 bg-white p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`${inputClass} pl-10.5 py-2.5`}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="text-xs font-medium text-slate-500 sm:text-right">
          Total: <span className="font-semibold text-slate-800">{total}</span> team members
        </div>
      </div>

      {/* Grid of Members */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <MemberCardSkeleton key={i} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <EmptyState
            icon="👥"
            title="No team members found"
            description={search ? "Try adjusting your search keywords to find the user." : "There are currently no registered team members."}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member._id}
              className={`${cardInteractive} flex flex-col justify-between p-6 ${
                member.status === "inactive" ? "opacity-75 bg-slate-50/50" : ""
              }`}
            >
              <div>
                {/* Card Header Profile */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                        member.name
                      )} text-sm font-bold text-white shadow-sm`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="truncate text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      member.role === "admin"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    <Shield className="h-2.5 w-2.5" />
                    {member.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      member.status === "inactive"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        member.status === "inactive" ? "bg-rose-500" : "bg-green-500"
                      }`}
                    />
                    {member.status || "active"}
                  </span>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="mt-6 border-t border-slate-100/80 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Assigned Leads</p>
                  <p className="mt-0.5 font-display text-base font-bold text-slate-900">{member.totalLeads ?? 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Joined Date</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">{formatDate(member.createdAt)}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3.5 border-t border-dashed border-slate-100 flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  title="View Profile"
                  onClick={() => handleOpenView(member)}
                  className={`${btnGhost} h-8 w-8 !p-0 rounded-lg`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Edit Member"
                  onClick={() => handleOpenEdit(member)}
                  className={`${btnGhost} h-8 w-8 !p-0 rounded-lg`}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title={member.status === "inactive" ? "Activate Member" : "Deactivate Member"}
                  onClick={() => handleToggleStatus(member)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                    member.status === "inactive"
                      ? "text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80"
                      : "text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/80"
                  }`}
                >
                  {member.status === "inactive" ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
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

      {/* VIEW PROFILE MODAL */}
      {isViewModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 shadow-2xl animate-[scale-up_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Member Profile</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Avatar Header */}
            <div className="mt-5 flex flex-col items-center text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(
                  selectedMember.name
                )} text-xl font-bold text-white shadow-md`}
              >
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-3.5 font-display text-base font-bold text-slate-900">{selectedMember.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 justify-center">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {selectedMember.email}
              </p>
            </div>

            {/* Details Fields */}
            <div className="mt-6 space-y-3.5 border-t border-dashed border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Role
                </span>
                <span className={`font-semibold capitalize text-slate-800`}>
                  {selectedMember.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    selectedMember.status === "inactive" ? "bg-rose-500" : "bg-green-500"
                  }`} /> Status
                </span>
                <span
                  className={`font-semibold capitalize ${
                    selectedMember.status === "inactive" ? "text-rose-600" : "text-green-600"
                  }`}
                >
                  {selectedMember.status || "active"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Joined Date
                </span>
                <span className="font-semibold text-slate-800">{formatDate(selectedMember.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  👤 Assigned Leads
                </span>
                <span className="font-semibold text-slate-800">{selectedMember.totalLeads ?? 0}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className={`${btnSecondary} !py-2 !px-4 text-xs`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 shadow-2xl animate-[scale-up_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Edit Member Details</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              {formError && (
                <div className={`${alertError} p-3 text-xs`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              {/* Role Select Field */}
              <div className="space-y-1.5">
                <label className={labelClass}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className={selectClass}
                >
                  <option value="member">Member (Sales Agent)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`${btnSecondary} !py-2.5 !px-4.5`}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={submitLoading}
                >
                  {submitLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADD MEMBER FORM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 shadow-2xl animate-[scale-up_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Add New Team Member</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              {addFormError && (
                <div className={`${alertError} p-3 text-xs`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{addFormError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@company.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              {/* Password Mode Selector */}
              <div className="space-y-2">
                <label className={labelClass}>Temporary Password</label>
                <div className="grid grid-cols-2 gap-3.5">
                  <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-slate-50/50 ${
                    addForm.passwordType === "auto" 
                      ? "border-violet-500 bg-violet-50/20 text-violet-700" 
                      : "border-slate-200 text-slate-500"
                  }`}>
                    <input 
                      type="radio" 
                      name="passwordType" 
                      value="auto"
                      checked={addForm.passwordType === "auto"}
                      onChange={() => setAddForm({ ...addForm, passwordType: "auto" })}
                      className="sr-only"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Auto-generate</span>
                    <span className="mt-0.5 text-xs font-semibold text-center opacity-85">Strong random pwd</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-slate-50/50 ${
                    addForm.passwordType === "manual" 
                      ? "border-violet-500 bg-violet-50/20 text-violet-700" 
                      : "border-slate-200 text-slate-500"
                  }`}>
                    <input 
                      type="radio" 
                      name="passwordType" 
                      value="manual"
                      checked={addForm.passwordType === "manual"}
                      onChange={() => setAddForm({ ...addForm, passwordType: "manual" })}
                      className="sr-only"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Set Manually</span>
                    <span className="mt-0.5 text-xs font-semibold text-center opacity-85">Define manual pwd</span>
                  </label>
                </div>
              </div>

              {/* Manual Password Input (Conditional) */}
              {addForm.passwordType === "manual" && (
                <div className="space-y-1.5 animate-[fade-in-up_0.2s_ease-out]">
                  <label className={labelClass}>Manual Temporary Password</label>
                  <input
                    type="text"
                    placeholder="Min 6 characters"
                    value={addForm.customPassword}
                    onChange={(e) => setAddForm({ ...addForm, customPassword: e.target.value })}
                    className={inputClass}
                    required={addForm.passwordType === "manual"}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`${btnSecondary} !py-2.5 !px-4.5`}
                  disabled={addSubmitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={addSubmitLoading}
                >
                  {addSubmitLoading ? "Creating..." : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS DISPLAY MODAL */}
      {isSuccessModalOpen && newMemberCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 shadow-2xl animate-[scale-up_0.3s_ease-out]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-base font-bold text-slate-900">Member Created Successfully</h2>
              <p className="mt-1.5 text-xs text-slate-500">Copy the credentials below and share them securely with the user.</p>
            </div>

            {/* Credentials Fields Container */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3.5">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 break-all select-all">{newMemberCredentials.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Temporary Password</p>
                <p className="mt-0.5 text-sm font-mono font-semibold text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-lg select-all">{newMemberCredentials.temporaryPassword}</p>
              </div>
            </div>

            {/* Warning Message Alert */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] leading-relaxed text-amber-800 flex gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
              <span>
                <strong>Important:</strong> Copy these credentials now. The temporary password is encrypted and cannot be displayed again.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className={`${btnGhost} text-xs gap-1.5 px-3 py-2`}
              >
                <Copy className="h-3.5 w-3.5" /> Copy Credentials
              </button>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className={`${btnPrimary} !py-2 !px-4 text-xs font-semibold`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
