import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import SearchIcon from "#/icons/search.svg?react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  testId?: string;
}

export function SearchInput({
  value,
  onChange,
  className,
  placeholder,
  testId,
}: SearchInputProps) {
  const { t } = useTranslation("openhands");
  const resolvedPlaceholder =
    placeholder ?? t(I18nKey.AUTOMATIONS$SEARCH_PLACEHOLDER);

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 items-center",
        "h-9 rounded-lg border border-[var(--oh-border)] bg-base-secondary",
        "focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20",
        "transition-colors",
        className,
      )}
    >
      <SearchIcon
        className="ml-3 size-4 shrink-0 text-tertiary-alt"
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        aria-label={resolvedPlaceholder}
        data-testid={testId}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-white outline-none placeholder:text-tertiary-alt"
      />
    </div>
  );
}
