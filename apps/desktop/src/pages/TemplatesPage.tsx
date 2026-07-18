import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { EmptyState, LoadingState } from "../components/ui/empty-loading";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { listBrandKits } from "../lib/brandKit";
import type { BrandKitSummary } from "@amzi-loci/shared";

export function TemplatesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kits, setKits] = useState<BrandKitSummary[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listBrandKits();
      setKits(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-heading font-semibold">Templates</h1>
        <p className="text-body text-text-muted">
          Reusable brand kits as listing templates.
        </p>
      </div>

      {kits.length === 0 ? (
        <EmptyState
          icon={<Star size={32} />}
          title="No templates yet"
          description="Save a brand kit and reuse it across client projects."
          actionLabel="Go to brand kits"
          onAction={() => navigate("/brand-kits")}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {kits.map((kit) => (
            <Card key={kit.id}>
              <p className="text-body font-medium">{kit.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ background: kit.primaryColor }}
                />
                <span className="text-caption text-text-muted">Brand template</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button variant="secondary" onClick={() => navigate("/brand-kits")}>
          Manage brand kits
        </Button>
      </div>

      <p className="mt-8 text-caption text-text-muted">
        Dedicated template library with marketplace presets coming soon.
      </p>
    </div>
  );
}
