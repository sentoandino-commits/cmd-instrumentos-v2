export function FactPill({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full border border-line bg-paper px-3 py-1 text-xs text-inkSoft">
      <strong className="font-semibold text-ink">{label}:</strong> {value}
    </span>
  );
}

export function Dato({
  label,
  value,
  full = false,
}: {
  label: string;
  value?: string | number | null;
  full?: boolean;
}) {
  return (
    <div className={`mb-2.5 ${full ? "col-span-2" : ""}`}>
      <div className="text-[11px] tracking-wide text-inkSoft">{label}</div>
      <div className="text-sm text-ink">{value || value === 0 ? value : "—"}</div>
    </div>
  );
}

export function CardSection({
  title,
  children,
  span = false,
}: {
  title: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-paperLight p-5 shadow-sm ${
        span ? "col-span-full" : ""
      }`}
    >
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-clayDark">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-x-4">{children}</div>
    </div>
  );
}
