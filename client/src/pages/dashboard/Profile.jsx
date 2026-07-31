import { useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import {
  pageTitle,
  pageSubtitle,
  label as labelClass,
  input as inputClass,
  btnPrimary,
  alertError,
  alertSuccess,
} from "../../lib/uiClasses";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Input Change Handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMsg) setErrorMsg(null);
  };

  // Submit Password Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Client-side validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg("New password cannot be the same as your current password.");
      return;
    }

    try {
      setLoading(true);
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccessMsg("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Clear after 4 seconds
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-72 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 bg-slate-200 rounded-2xl lg:col-span-1" />
          <div className="h-96 bg-slate-200 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const roleColor = user.role === "admin"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-6 animate-[fade-in-up_0.4s_ease-out]">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 animate-[fade-in-up_0.3s_ease-out]">
          <div className={alertSuccess}>
            <span>🎉</span>
            <div>{successMsg}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className={pageTitle}>Profile Settings</h1>
        <p className={pageSubtitle}>Manage your user profile data and security settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info Details Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] h-fit space-y-6 lg:col-span-1">
          {/* Avatar Header */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-md ring-4 ring-violet-50">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h3 className="mt-4 font-display font-bold text-slate-800 text-lg">{user.name}</h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 mt-2 text-xs font-semibold capitalize ${roleColor}`}>
              {user.role}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-4.5 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                <UserIcon className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Full Name</span>
                <span className="font-semibold text-slate-700">{user.name}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Email Address</span>
                <span className="font-semibold text-slate-700 break-all">{user.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Workspace Role</span>
                <span className="font-semibold text-slate-700 capitalize">{user.role}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Joined Date</span>
                <span className="font-semibold text-slate-700">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
            <Lock className="h-5 w-5 text-violet-600" />
            <h2 className="font-display text-base font-bold text-slate-900">Change Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className={`${alertError} flex items-center gap-2 text-xs`}>
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className={labelClass}>Current Password</label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className={labelClass}>New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className={btnPrimary}
              >
                {loading ? "Updating password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
