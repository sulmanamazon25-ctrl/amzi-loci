import { ButtonLink } from "../ui/button";
import { Badge } from "../ui/card";

interface HeroProps {
  title: string;
  subtitle: string;
  primaryCta?: { to: string; label: string };
  secondaryCta?: { to: string; label: string };
  badge?: string;
}

export function Hero({ title, subtitle, primaryCta, secondaryCta, badge }: HeroProps) {
  return (
    <section className="container-page py-20 md:py-28">
      {badge && (
        <Badge tone="primary" className="mb-4">
          {badge}
        </Badge>
      )}
      <h1 className="max-w-3xl text-display font-semibold tracking-tight">{title}</h1>
      <p className="mt-6 max-w-2xl text-body text-text-muted md:text-lg">{subtitle}</p>
      {(primaryCta || secondaryCta) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {primaryCta && (
            <ButtonLink to={primaryCta.to} size="lg">
              {primaryCta.label}
            </ButtonLink>
          )}
          {secondaryCta && (
            <ButtonLink to={secondaryCta.to} variant="secondary" size="lg">
              {secondaryCta.label}
            </ButtonLink>
          )}
        </div>
      )}
    </section>
  );
}
