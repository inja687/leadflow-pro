import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, List, Activity, CheckCircle2 } from "lucide-react";
import { fadeUp } from "./motion";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline", icon: List },
  { id: "activity", label: "Activity", icon: Activity },
];

function DashboardPreview() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Total Leads", v: "248", c: "text-violet-600" },
          { l: "New", v: "42", c: "text-blue-600" },
          { l: "Qualified", v: "86", c: "text-emerald-600" },
          { l: "Win Rate", v: "34%", c: "text-amber-600" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{s.l}</p>
            <p className={`font-display mt-1 text-2xl font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-slate-500">Pipeline Overview</p>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[35%] bg-blue-400" />
          <div className="h-full w-[28%] bg-amber-400" />
          <div className="h-full w-[22%] bg-emerald-400" />
          <div className="h-full w-[15%] bg-rose-300" />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> New</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Contacted</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Qualified</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-300" /> Lost</span>
        </div>
      </div>
    </div>
  );
}

function PipelinePreview() {
  const cols = [
    { title: "New", color: "border-t-blue-400", items: ["Acme Corp", "Brightline"] },
    { title: "Contacted", color: "border-t-amber-400", items: ["Vertex Labs", "ScaleForge"] },
    { title: "Qualified", color: "border-t-emerald-400", items: ["Orbit AI", "Pulse Digital"] },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 p-6">
      {cols.map((col) => (
        <div key={col.title} className={`rounded-xl border border-slate-100 border-t-2 ${col.color} bg-slate-50/50 p-3`}>
          <p className="mb-3 text-xs font-semibold text-slate-600">{col.title}</p>
          <div className="space-y-2">
            {col.items.map((item) => (
              <div key={item} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-800">{item}</p>
                <p className="mt-1 text-[10px] text-slate-400">$12k – $32k</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPreview() {
  const events = [
    { action: "Sarah changed status to Qualified", time: "2m ago", icon: CheckCircle2 },
    { action: "Marcus assigned lead to Priya", time: "15m ago", icon: Activity },
    { action: "New lead captured from website", time: "1h ago", icon: List },
    { action: "Note added to Acme Corp", time: "2h ago", icon: Activity },
  ];

  return (
    <div className="space-y-1 p-6">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50">
          <div className="mt-0.5 rounded-lg bg-violet-50 p-2 text-violet-600">
            <e.icon className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">{e.action}</p>
            <p className="text-[10px] text-slate-400">{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const PREVIEWS = {
  dashboard: DashboardPreview,
  pipeline: PipelinePreview,
  activity: ActivityPreview,
};

export default function ProductPreviewSection() {
  const [active, setActive] = useState("dashboard");
  const Preview = PREVIEWS[active];

  return (
    <section id="product" className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Product
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A CRM your team will love using
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            Clean interfaces, powerful insights, and workflows designed for speed —
            see why teams switch from legacy tools.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mt-12"
        >
          <div
            role="tablist"
            aria-label="Product views"
            className="mx-auto flex w-fit flex-wrap justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActive(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative mt-8">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-200/40 via-indigo-100/30 to-cyan-200/30 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/50">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-xs text-slate-400">app.leadflow.pro</span>
              </div>

              <div
                role="tabpanel"
                id={`panel-${active}`}
                aria-labelledby={`tab-${active}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Preview />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
