import type { ComplianceItem } from "@amzi-loci/shared";

type Props = {
  items: ComplianceItem[];
};

export function ComplianceChecklist({ items }: Props) {
  const fails = items.filter((i) => i.status === "fail").length;
  const warns = items.filter((i) => i.status === "warn").length;

  return (
    <div className="compliance-card">
      <div className="compliance-header">
        <h3>Upload checklist</h3>
        <span className="compliance-summary">
          {fails > 0 ? (
            <span className="compliance-badge fail">{fails} to fix</span>
          ) : warns > 0 ? (
            <span className="compliance-badge warn">{warns} review</span>
          ) : (
            <span className="compliance-badge pass">Looking good</span>
          )}
        </span>
      </div>
      <p className="muted">Quick checks before you paste into Seller Central.</p>
      <ul className="compliance-list">
        {items.map((item) => (
          <li key={item.id} className={`compliance-item status-${item.status}`}>
            <span className="compliance-dot" aria-hidden />
            <div>
              <strong>{item.label}</strong>
              <p>{item.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
