import type { FunctionComponent, SVGProps } from "react";
import BellIcon from "#/icons/bell.svg?react";
import GitBranchIcon from "#/icons/git-branch.svg?react";
import GlobeIcon from "#/icons/globe.svg?react";
import PuzzleIcon from "#/icons/puzzle.svg?react";
import { cn } from "#/utils/utils";
import { extensionModuleCardPillClassName } from "#/utils/extension-module-card-classes";
import type { CreateAutomationOptionalSection } from "./create-automation-form.constants";

const CREATE_AUTOMATION_SECTION_ICONS: Record<
  CreateAutomationOptionalSection,
  FunctionComponent<SVGProps<SVGSVGElement>>
> = {
  repositories: GitBranchIcon,
  triggers: GlobeIcon,
  plugins: PuzzleIcon,
  notification: BellIcon,
};

interface CreateAutomationSectionRevealButtonProps {
  section: CreateAutomationOptionalSection;
  label: string;
  ariaLabel: string;
  isRevealed: boolean;
  itemCount?: number;
  onToggle: (section: CreateAutomationOptionalSection) => void;
}

export function CreateAutomationSectionRevealButton({
  section,
  label,
  ariaLabel,
  isRevealed,
  itemCount = 0,
  onToggle,
}: CreateAutomationSectionRevealButtonProps) {
  const SectionIcon = CREATE_AUTOMATION_SECTION_ICONS[section];

  return (
    <button
      type="button"
      data-testid={`create-automation-reveal-${section}`}
      aria-label={ariaLabel}
      aria-expanded={isRevealed}
      onClick={() => onToggle(section)}
      className={cn(
        extensionModuleCardPillClassName,
        "h-8 cursor-pointer gap-1.5 px-3 py-1.5 text-sm font-normal transition-none",
        isRevealed
          ? "bg-primary text-[var(--oh-color-base)]"
          : "text-muted hover:bg-white/10 hover:text-white",
      )}
    >
      <SectionIcon className="size-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
      {itemCount > 0 ? (
        <span
          data-testid={`create-automation-reveal-${section}-count`}
          className={cn(
            "inline-flex min-w-[1.125rem] items-center justify-center rounded-full px-1.5",
            "text-[11px] leading-4 font-normal tabular-nums",
            isRevealed
              ? "bg-[var(--oh-color-base)]/20 text-[var(--oh-color-base)]"
              : "bg-white/15 text-white",
          )}
        >
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
