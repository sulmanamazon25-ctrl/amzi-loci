interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="flex items-center justify-between text-text-muted">
        <span className="text-caption uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-heading font-semibold">{value}</span>
        {trend && <span className="text-caption text-success">{trend}</span>}
      </div>
    </div>
  );
}
