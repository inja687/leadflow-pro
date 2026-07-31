import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import { fadeUp, staggerContainer } from "./motion";

function DashboardMockup() {
  const leads = [
    { name: "Acme Corp", status: "Qualified", value: "$24k", color: "bg-emerald-400" },
    { name: "Vertex Labs", status: "Contacted", value: "$18k", color: "bg-amber-400" },
    { name: "Orbit AI", status: "New", value: "$32k", color: "bg-blue-400" },
    { name: "Pulse Digital", status: "Qualified", value: "$12k", color: "bg-emerald-400" },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-violet-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="ml-2 text-xs text-slate-500">LeadFlow Pro — Pipeline</span>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4">
          {[
            { label: "Total Leads", val: "248", change: "+12%" },
            { label: "Qualified", val: "86", change: "+8%" },
            { label: "Win Rate", val: "34%", change: "+3%" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="mt-1 font-display text-xl font-bold text-white">{s.val}</p>
              <p className="text-[10px] font-medium text-emerald-400">{s.change}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 px-4 pb-4">
          <p className="mb-2 pt-3 text-xs font-semibold text-slate-400">Recent Leads</p>
          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.name}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${lead.color}`} />
                  <span className="text-xs font-medium text-slate-200">{lead.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">{lead.status}</span>
                  <span className="text-xs font-semibold text-violet-300">{lead.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pb-32">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12"
        >
          <div>
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
                The CRM built for modern sales teams
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display mt-7 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]"
            >
              Turn every lead into a{" "}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                closed deal
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400"
            >
              LeadFlow Pro gives your revenue team the visibility, speed, and intelligence
              to close more deals — without the complexity of legacy CRMs.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition-all hover:shadow-violet-600/40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Start free trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href="#product"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                View product
              </a>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {["SC", "MR", "PN", "JD"].map((ini, i) => (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white"
                  >
                    {ini}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                Trusted by{" "}
                <strong className="font-semibold text-white">500+</strong> sales teams worldwide
              </p>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} custom={2} className="lg:pl-4">
            <DashboardMockup />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
