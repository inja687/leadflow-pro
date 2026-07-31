import { statusBadgeClass, statusDotClass } from "../../lib/uiClasses";

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  lost: "Lost",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset backdrop-blur-sm ${statusBadgeClass(status)} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full animate-[pulse-subtle_2s_ease-in-out_infinite] rounded-full ${statusDotClass(status)} opacity-60`}
        />
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`}
        />
      </span>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
