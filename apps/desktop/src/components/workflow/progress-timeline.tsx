import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface WorkflowStep {
  key: string;
  label: string;
}

export const PROJECT_STEPS: WorkflowStep[] = [
  { key: "reviews", label: "Reviews" },
  { key: "insights", label: "Insights" },
  { key: "brand", label: "Brand" },
  { key: "copy", label: "Copy" },
  { key: "images", label: "Images" },
  { key: "export", label: "Export" },
];

interface ProgressTimelineProps {
  steps: WorkflowStep[];
  activeKey: string;
  completedKeys: string[];
  onSelect: (key: string) => void;
  disabledKeys?: string[];
}

export function ProgressTimeline({
  steps,
  activeKey,
  completedKeys,
  onSelect,
  disabledKeys = [],
}: ProgressTimelineProps) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step) => {
        const done = completedKeys.includes(step.key);
        const active = step.key === activeKey;
        const disabled = disabledKeys.includes(step.key);
        return (
          <button
            key={step.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(step.key)}
            className={cn(
              "flex items-center gap-3 rounded-input px-3 py-2 text-left text-body transition-colors duration-150",
              active ? "bg-primary/10 text-white" : "text-text-muted hover:bg-card",
              disabled && "opacity-40 pointer-events-none",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                done
                  ? "border-success bg-success/20 text-success"
                  : active
                    ? "border-primary text-primary-hover"
                    : "border-border-hover text-text-muted",
              )}
            >
              {done ? <Check size={12} /> : ""}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
