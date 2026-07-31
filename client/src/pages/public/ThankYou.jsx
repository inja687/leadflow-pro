import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(99,102,241,0.15),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      <div className="relative">
        {/* Success Icon */}
        <div className="relative mx-auto mb-6 w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-[glow-pulse_2s_ease-in-out_infinite]" />
          <div className="relative w-20 h-20 bg-emerald-500/15 border-2 border-emerald-400/30 rounded-full flex items-center justify-center text-4xl">
            ✅
          </div>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
            LF
          </div>
          <span className="font-display text-white font-bold text-lg">LeadFlow Pro</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
          Thank You!
        </h1>
        <p className="text-slate-300 text-lg max-w-md mb-3 leading-relaxed">
          Your message has been received. One of our team members will get back to
          you within{" "}
          <strong className="text-violet-300 font-semibold">1 business day</strong>.
        </p>
        <p className="text-slate-500 text-sm mb-10">
          In the meantime, feel free to explore what LeadFlow Pro can do for your
          team.
        </p>

        {/* What happens next */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 max-w-md w-full mb-10 text-left backdrop-blur-sm shadow-xl shadow-violet-950/20">
          <h2 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
            What happens next?
          </h2>
          <ol className="space-y-4">
            {[
              "We review your request and match you with the right team member.",
              "You'll receive a confirmation email within 1 hour.",
              "We'll schedule a free 30-minute call at your convenience.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-violet-900/30">
                  {i + 1}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-b from-violet-500 to-violet-600 text-white font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.3)] hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.4)] active:scale-[0.97] transition-all duration-200 text-sm"
          >
            ← Back to Home
          </Link>
          <Link
            to="/#contact"
            className="px-6 py-3 bg-white/[0.06] text-white font-semibold rounded-xl border border-white/10 hover:bg-white/[0.12] active:scale-[0.97] transition-all duration-200 text-sm backdrop-blur-sm"
          >
            Submit Another
          </Link>
        </div>
      </div>
    </div>
  );
}
