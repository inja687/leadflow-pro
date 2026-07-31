import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg shadow-violet-900/50">
        LF
      </div>
      <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
        Welcome to{" "}
        <span className="text-violet-400">LeadFlow Pro</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
        A production-ready CRM to manage, track, and convert your leads — built
        with the MERN stack.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 active:scale-95 transition-all shadow-lg shadow-violet-900/40 text-sm"
        >
          Sign In →
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 active:scale-95 transition-all border border-white/10 text-sm"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}