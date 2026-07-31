/** Shared Tailwind class presets — presentation only, no logic */

export const card =
  "rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-200";

export const cardInteractive =
  "rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06),0_2px_8px_rgba(139,92,246,0.06)]";

export const cardPadding = "p-6";

export const pageTitle = "font-display text-3xl font-bold tracking-tight text-slate-900";

export const pageSubtitle = "mt-1 text-sm leading-relaxed text-slate-500";

export const sectionTitle = "font-display text-lg font-bold tracking-tight text-slate-900";

export const label =
  "mb-2 block text-sm font-semibold text-slate-700";

export const input =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";

export const select =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10";

export const textarea =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10";

export const readOnlyField =
  "w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2";

export const btnDangerSoft =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 transition-all duration-200 hover:bg-rose-100 hover:border-rose-200 hover:text-rose-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2";

export const btnVioletSoft =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 transition-all duration-200 hover:bg-violet-100 hover:border-violet-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2";

export const alertError =
  "flex items-start gap-3 rounded-xl border-l-4 border-l-rose-500 border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700";

export const alertSuccess =
  "flex items-start gap-3 rounded-xl border-l-4 border-l-emerald-500 border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700";

export const skeletonBar = "h-4 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse";

export const skeletonBlock = "rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse";

export const tableHeader =
  "text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider";

export const tableCell =
  "px-5 py-4 text-sm";

export const paginationBtn =
  "px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2";

export const badge =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

export const STATUS_BADGE = {
  new: "bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-600/10",
  contacted: "bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-600/10",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-600/10",
  lost: "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-600/10",
};

export const STATUS_DOT = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  qualified: "bg-emerald-500",
  lost: "bg-rose-500",
};

export function statusBadgeClass(status) {
  return STATUS_BADGE[status] || "bg-slate-50 text-slate-600 border-slate-200 ring-slate-600/10";
}

export function statusDotClass(status) {
  return STATUS_DOT[status] || "bg-slate-400";
}
