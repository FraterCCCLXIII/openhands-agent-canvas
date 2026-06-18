import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { ContextMenu } from "#/ui/context-menu";
import { Divider } from "#/ui/divider";
import { Typography } from "#/ui/typography";
import { NavigationLink } from "#/components/shared/navigation-link";
import { ContextMenuListItem } from "../context-menu/context-menu-list-item";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import CircuitIcon from "#/icons/u-circuit.svg?react";
import SettingsIcon from "#/icons/settings.svg?react";
import GaugeIcon from "#/icons/gauge.svg?react";
import CheckIcon from "#/icons/checkmark.svg?react";
import { ChevronRight } from "lucide-react";
import { cn } from "#/utils/utils";
import type { ProfileInfo } from "#/api/profiles-service/profiles-service.api";
import {
  REASONING_EFFORT_VALUES,
  type ReasoningEffort,
} from "#/constants/reasoning-effort";
import {
  getReasoningEffortLabel,
  getReasoningEffortTextClassName,
} from "#/utils/reasoning-effort-display";
import {
  dropdownMenuRowGapClassName,
  dropdownMenuRowIconWrapperClassName,
  switchProfileMenuListScrollClassName,
} from "#/utils/dropdown-classes";

const rowBaseClassName = cn(
  "w-full flex flex-col gap-0.5 p-2 rounded",
  "text-start hover:bg-[var(--oh-interactive-hover)] cursor-pointer text-nowrap",
);
const profileRowClassName = cn(rowBaseClassName, "h-auto items-stretch");
const linkRowClassName = cn(
  "group w-full flex items-center p-2 rounded",
  dropdownMenuRowGapClassName,
  "text-start hover:bg-[var(--oh-interactive-hover)] cursor-pointer text-nowrap",
);
const effortRowClassName = cn(linkRowClassName, "justify-between");

interface SwitchProfileContextMenuProps {
  profiles: ProfileInfo[];
  activeProfileName: string | null;
  reasoningEffort: ReasoningEffort;
  isEffortPending?: boolean;
  onSelect: (profileName: string) => void;
  onEffortSelect: (effort: ReasoningEffort) => void;
  onClose: () => void;
}

export function SwitchProfileContextMenu({
  profiles,
  activeProfileName,
  reasoningEffort,
  isEffortPending = false,
  onSelect,
  onEffortSelect,
  onClose,
}: SwitchProfileContextMenuProps) {
  const { t } = useTranslation("openhands");
  const ref = useClickOutsideElement<HTMLUListElement>(onClose);
  const [effortSubmenuOpen, setEffortSubmenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSelect = (
    event: React.MouseEvent<HTMLButtonElement>,
    name: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(name);
    onClose();
  };

  const handleEffortSelect = (
    event: React.MouseEvent<HTMLButtonElement>,
    effort: ReasoningEffort,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (effort === reasoningEffort || isEffortPending) return;
    onEffortSelect(effort);
    setEffortSubmenuOpen(false);
  };

  const effortLabel = getReasoningEffortLabel(t, reasoningEffort);

  return (
    <ContextMenu
      ref={ref}
      testId="switch-profile-context-menu"
      position="top"
      alignment="left"
      className="z-[60] left-0 mb-2 bottom-full min-w-[280px] pt-0 overflow-visible"
    >
      <div className="px-2 pb-0.5">
        <Typography.Text className="text-[11px] font-medium text-[var(--oh-text-dim)] uppercase tracking-wide leading-4">
          {t(I18nKey.SETTINGS$AVAILABLE_PROFILES)}
        </Typography.Text>
      </div>
      <div
        data-testid="switch-profile-options-list"
        className={switchProfileMenuListScrollClassName}
      >
        {profiles.map((profile) => {
          const isActive = profile.name === activeProfileName;
          return (
            <ContextMenuListItem
              key={profile.name}
              testId={`switch-profile-option-${profile.name}`}
              onClick={(event) => handleSelect(event, profile.name)}
              className={cn(
                profileRowClassName,
                isActive && "bg-[var(--oh-interactive-hover)]",
              )}
            >
              <span
                className={cn(
                  "flex items-center min-w-0",
                  dropdownMenuRowGapClassName,
                )}
                title={profile.model ?? undefined}
              >
                <span
                  className={dropdownMenuRowIconWrapperClassName}
                  aria-hidden
                >
                  <CircuitIcon width={16} height={16} />
                </span>
                <span className="flex-1 truncate text-sm leading-5">
                  {profile.name}
                </span>
                {isActive && (
                  <CheckIcon
                    width={14}
                    height={14}
                    className="shrink-0"
                    aria-hidden
                  />
                )}
              </span>
              {profile.model && (
                <span className="block truncate text-xs leading-4 text-[var(--oh-muted)] pl-6">
                  {profile.model}
                </span>
              )}
            </ContextMenuListItem>
          );
        })}
      </div>
      <Divider />
      <div className="relative group/effort">
        <ContextMenuListItem
          testId="switch-profile-effort-button"
          onClick={() => setEffortSubmenuOpen((open) => !open)}
          isDisabled={!activeProfileName || isEffortPending}
          className={effortRowClassName}
        >
          <span
            className={cn(
              "flex items-center min-w-0",
              dropdownMenuRowGapClassName,
            )}
          >
            <span
              className={dropdownMenuRowIconWrapperClassName}
              data-testid="switch-profile-effort-icon"
              aria-hidden
            >
              <GaugeIcon width={16} height={16} />
            </span>
            <span className="text-sm leading-5">{t(I18nKey.MODEL$EFFORT)}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "text-sm leading-5",
                getReasoningEffortTextClassName(reasoningEffort),
              )}
            >
              {effortLabel}
            </span>
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="shrink-0 text-[var(--oh-muted)]"
              aria-hidden
            />
          </span>
        </ContextMenuListItem>
        <div
          className={cn(
            "absolute left-full top-0 z-[70] opacity-0 invisible pointer-events-none transition-all duration-200 ml-[1px]",
            "group-hover/effort:opacity-100 group-hover/effort:visible group-hover/effort:pointer-events-auto",
            "hover:opacity-100 hover:visible hover:pointer-events-auto",
            effortSubmenuOpen && "opacity-100 visible pointer-events-auto",
          )}
        >
          <ContextMenu
            testId="switch-profile-effort-submenu"
            theme="naked"
            spacing="none"
            className="min-w-[160px] rounded-md border border-[var(--oh-border-subtle)] bg-tertiary px-1 py-1 shadow-lg"
          >
            {REASONING_EFFORT_VALUES.map((effort) => {
              const isActive = effort === reasoningEffort;
              return (
                <ContextMenuListItem
                  key={effort}
                  testId={`switch-profile-effort-option-${effort}`}
                  onClick={(event) => handleEffortSelect(event, effort)}
                  isDisabled={isEffortPending}
                  className={cn(
                    linkRowClassName,
                    isActive && "bg-[var(--oh-interactive-hover)]",
                  )}
                >
                  <span className="flex-1 text-sm leading-5">
                    {getReasoningEffortLabel(t, effort)}
                  </span>
                  {isActive && (
                    <CheckIcon
                      width={14}
                      height={14}
                      className="shrink-0"
                      aria-hidden
                    />
                  )}
                </ContextMenuListItem>
              );
            })}
          </ContextMenu>
        </div>
      </div>
      <Divider />
      <NavigationLink
        to="/settings"
        onClick={onClose}
        data-testid="switch-profile-open-settings"
        className={linkRowClassName}
      >
        <span className={dropdownMenuRowIconWrapperClassName} aria-hidden>
          <SettingsIcon width={16} height={16} />
        </span>
        <span className="text-sm leading-5">
          {t(I18nKey.MODEL$OPEN_SETTINGS)}
        </span>
      </NavigationLink>
    </ContextMenu>
  );
}
