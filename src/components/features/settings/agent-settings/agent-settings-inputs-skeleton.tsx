import { cn } from "#/utils/utils";
import {
  formControlSwitchDescriptionClassName,
  formControlSwitchFieldClassName,
} from "#/utils/form-control-classes";
import { InputSkeleton } from "../input-skeleton";
import { SwitchSkeleton } from "../switch-skeleton";

/**
 * Mirrors the default OpenHands {@link AgentSettingsScreen} layout:
 * sub-agents toggle (+ helper), then optional follow-on fields.
 */
export function AgentSettingsInputsSkeleton() {
  return (
    <div
      data-testid="agent-settings-skeleton"
      className="skeleton-stagger flex flex-col gap-6"
      aria-hidden
    >
      <div className={formControlSwitchFieldClassName}>
        <SwitchSkeleton />
        <div
          className={cn(
            formControlSwitchDescriptionClassName,
            "h-4 w-3/4 max-w-md skeleton",
          )}
        />
      </div>
      <InputSkeleton />
    </div>
  );
}
