import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "lost", label: "Lost" },
];

const inputClasses = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400";
const readOnlyClasses = "w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600";

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "new",
    assignedTo: "",
  });
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Fetch lead by ID to pre-fill the form
  useEffect(() => {
    const fetchLead = async () => {
      try {
        setFetching(true);
        const { data } = await api.get(`/leads/${id}`);
        const { name, email, phone, company, status, assignedTo, notes: leadNotes } = data.lead;
        setFormData({
          name,
          email,
          phone,
          company: company || "",
          status,
          assignedTo: assignedTo?._id || "",
        });
        setNotes(leadNotes || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load lead. It may not exist."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchLead();
  }, [id]);

  // Fetch members list (admin only) for assign dropdown
  useEffect(() => {
    if (!isAdmin) return;

    const fetchMembers = async () => {
      try {
        const { data } = await api.get("/leads/members");
        setMembers(data.members || []);
      } catch (err) {
        console.error("Failed to load members", err);
      }
    };

    fetchMembers();
  }, [isAdmin]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (isAdmin) {
        // Admin: full update
        const updateData = { ...formData };
        // Handle assignedTo — send null if empty to unassign
        if (!updateData.assignedTo) {
          delete updateData.assignedTo;
        }
        await api.put(`/leads/${id}`, updateData);
      } else {
        // Member: only update status
        await api.put(`/leads/${id}`, { status: formData.status });
      }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard/leads"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update lead. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setNoteLoading(true);
      const { data } = await api.post(`/leads/${id}/notes`, {
        text: newNote.trim(),
      });
      setNotes(data.lead.notes || []);
      setNewNote("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add note. Please try again."
      );
    } finally {
      setNoteLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" aria-hidden="true" />
          <div className="p-8 space-y-6">
            <div className="relative h-8 w-1/3 overflow-hidden rounded-lg bg-slate-100/80">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2.5">
                <div className="relative h-4 w-28 overflow-hidden rounded-md bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
                <div className="relative h-12 overflow-hidden rounded-xl bg-slate-100/80">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <div className="relative h-12 flex-1 overflow-hidden rounded-xl bg-slate-100/80">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
              <div className="relative h-12 flex-1 overflow-hidden rounded-xl bg-slate-100/80">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/leads")}
          className="group inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-4 transition-colors duration-200"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          Back to Leads
        </button>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          {isAdmin ? "Edit Lead" : "Lead Details"}
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm">
          {isAdmin
            ? "Update the lead information below."
            : "View lead details, update status, and add notes."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" aria-hidden="true" />
        <div className="p-8">
          {/* Success Banner */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-xl text-emerald-700 flex items-center gap-2 text-sm font-medium animate-[fade-in-up_0.3s_ease-out]">
              ✅ Lead updated successfully! Redirecting...
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl text-red-700 flex items-center gap-2 text-sm animate-[fade-in-up_0.3s_ease-out]">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name {isAdmin && <span className="text-rose-500">*</span>}
              </label>
              {isAdmin ? (
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>
                  {formData.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address {isAdmin && <span className="text-rose-500">*</span>}
              </label>
              {isAdmin ? (
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>
                  {formData.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number {isAdmin && <span className="text-rose-500">*</span>}
              </label>
              {isAdmin ? (
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. +1 555 000 1234"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>
                  {formData.phone}
                </p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company{" "}
                {isAdmin && (
                  <span className="text-slate-400 font-normal">(optional)</span>
                )}
              </label>
              {isAdmin ? (
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                  className={inputClasses}
                />
              ) : (
                <p className={readOnlyClasses}>
                  {formData.company || "—"}
                </p>
              )}
            </div>

            {/* Status — editable for both roles */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`${inputClasses} bg-white`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign To — Admin only */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign To{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className={`${inputClasses} bg-white`}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email}) — {member.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard/leads")}
                className="flex-1 py-3 rounded-xl border border-slate-200/80 bg-white text-slate-700 font-semibold text-sm shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 py-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 text-white font-semibold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : isAdmin ? (
                  "Update Lead"
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-5">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            📝 Notes
          </h2>
        </div>

        <div className="p-8">
          {/* Existing Notes */}
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 text-3xl">💬</div>
              <p className="text-slate-400 text-sm">
                No notes yet. Add the first note below.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {notes
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((note, index) => (
                  <div
                    key={note._id || index}
                    className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
                  >
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {note.text}
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <span className="w-6 h-6 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-[10px] ring-1 ring-violet-100">
                        {note.addedBy?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {note.addedBy?.name || "Unknown"} ·{" "}
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Add Note Form */}
          <div className="space-y-3">
            {noteSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-xl text-emerald-700 text-sm font-medium animate-[fade-in-up_0.3s_ease-out]">
                ✅ Note added successfully!
              </div>
            )}
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 resize-none"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={noteLoading || !newNote.trim()}
              className="px-5 py-2.5 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-xl font-semibold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {noteLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Note"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
