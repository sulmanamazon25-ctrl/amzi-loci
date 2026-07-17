import { WORKFLOW_STEPS } from "../../lib/site";

export function WorkflowSteps() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {WORKFLOW_STEPS.map((step) => (
        <div
          key={step.num}
          className="rounded-card border border-border bg-card p-5"
        >
          <span className="text-caption font-medium text-primary-hover">
            Step {step.num}
          </span>
          <h3 className="mt-2 text-section font-medium">{step.title}</h3>
          <p className="mt-1 text-body text-text-muted">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
