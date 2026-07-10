import { cn } from "#/utils/utils";
import {
  formControlBorderClassName,
  formControlSurfaceClassName,
} from "#/utils/form-control-classes";

interface AutomateDashboardStatCardProps {
  label: string;
  value: number;
  testId: string;
}

export function AutomateDashboardStatCard({
  label,
  value,
  testId,
}: AutomateDashboardStatCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-xl px-4 py-3",
        formControlBorderClassName,
        formControlSurfaceClassName,
      )}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-content">{value}</p>
    </div>
  );
}
