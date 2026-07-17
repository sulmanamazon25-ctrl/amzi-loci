import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, description }) => (
        <Card key={title}>
          <Icon size={20} className="text-primary-hover" />
          <h3 className="mt-4 text-section font-medium">{title}</h3>
          <p className="mt-2 text-body text-text-muted">{description}</p>
        </Card>
      ))}
    </div>
  );
}
