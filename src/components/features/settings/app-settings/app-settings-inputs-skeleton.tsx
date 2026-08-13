import { InputSkeleton } from "../input-skeleton";
import { SwitchSkeleton } from "../switch-skeleton";

/** Mirrors {@link AppSettingsScreen}: language, theme, toggles, git identity. */
export function AppSettingsInputsSkeleton() {
  return (
    <div
      data-testid="app-settings-skeleton"
      className="skeleton-stagger flex flex-col gap-6"
      aria-hidden
    >
      <InputSkeleton />
      <InputSkeleton />
      <SwitchSkeleton />
      <SwitchSkeleton />

      <div className="mt-2 flex flex-col gap-6 border-t border-[var(--oh-border)] pt-6">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 skeleton" />
          <div className="h-4 w-full max-w-xl skeleton" />
        </div>
        <InputSkeleton />
        <InputSkeleton />
      </div>
    </div>
  );
}
