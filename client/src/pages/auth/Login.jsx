import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 flex-col justify-center items-center px-16 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(99,102,241,0.15),transparent)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <div className="max-w-sm text-center relative">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-xl shadow-violet-900/50 ring-1 ring-white/10">
            LF
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">LeadFlow Pro</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your all-in-one CRM platform. Manage leads, track conversions, and
            grow your pipeline — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: "📊", label: "Dashboard Analytics" },
              { icon: "👥", label: "Lead Management" },
              { icon: "🔍", label: "Smart Search" },
              { icon: "🔒", label: "Secure & Fast" },
            ].map((f) => (
              <div
                key={f.label}
                className="group bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 hover:shadow-lg hover:shadow-violet-900/10"
              >
                <p className="text-xl mb-1.5 transition-transform duration-200 group-hover:scale-110">{f.icon}</p>
                <p className="text-white text-xs font-medium">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
              LF
            </div>
            <span className="font-display text-xl font-bold text-slate-900">LeadFlow Pro</span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Sign in to your account to continue
          </p>

          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" aria-hidden="true" />
            <div className="p-8">
              {error && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl text-red-700 text-sm flex items-center gap-2 animate-[fade-in-up_0.3s_ease-out]">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-b from-violet-500 to-violet-600 text-white font-semibold text-sm rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
