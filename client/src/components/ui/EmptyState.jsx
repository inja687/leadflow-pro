export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center animate-[fade-in-up_0.4s_ease-out]">
      <div className="relative mb-6">
        <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-violet-100/60 to-indigo-100/40 blur-lg" aria-hidden="true" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {icon}
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
