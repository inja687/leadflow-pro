import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// BUG FIX: status default was "New" (capital) — Mongoose enum only accepts lowercase
const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "lost", label: "Lost" },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "new", // FIX: lowercase
  assignedTo: "",
};

const inputClasses = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400";

export default function AddLead() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch members for assign dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get("/leads/members");
        setMembers(data.members || []);
      } catch (err) {
        console.error("Failed to load members", err);
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const submitData = { ...formData };
      // Don't send empty assignedTo
      if (!submitData.assignedTo) {
        delete submitData.assignedTo;
      }

      await api.post("/leads", submitData);

      setSuccess(true);
      setTimeout(() => navigate("/dashboard/leads"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add lead. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Add New Lead</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Fill in the details below to create a new lead.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" aria-hidden="true" />
        <div className="p-8">
          {/* Success Banner */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-500 rounded-xl text-emerald-700 flex items-center gap-2 text-sm font-medium animate-[fade-in-up_0.3s_ease-out]">
              ✅ Lead added successfully! Redirecting...
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
              <label htmlFor="lead-name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="lead-name"
                name="name"
                placeholder="e.g. John Smith"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="lead-email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="lead-email"
                name="email"
                placeholder="e.g. john@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="lead-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="lead-phone"
                name="phone"
                placeholder="e.g. +1 555 000 1234"
                value={formData.phone}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="lead-company" className="block text-sm font-semibold text-slate-700 mb-2">
                Company <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="lead-company"
                name="company"
                placeholder="e.g. Acme Corp"
                value={formData.company}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="lead-status" className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                id="lead-status"
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

            {/* Assign To */}
            <div>
              <label htmlFor="lead-assignee" className="block text-sm font-semibold text-slate-700 mb-2">
                Assign To{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                name="assignedTo"
                id="lead-assignee"
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
                    Saving...
                  </span>
                ) : (
                  "Save Lead"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
