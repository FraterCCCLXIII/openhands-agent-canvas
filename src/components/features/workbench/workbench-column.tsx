import { useTranslation } from "react-i18next";
import {
  Archive,
  CheckCircle2,
  CircleDashed,
  Clock3,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { WorkbenchCardItem } from "./workbench-card";
import type {
  WorkbenchCard,
  WorkbenchColumn,
  WorkbenchColumnIcon,
} from "./types";

const COLUMN_ICONS: Record<WorkbenchColumnIcon, LucideIcon> = {
  "in-progress": CircleDashed,
  waiting: Clock3,
  done: CheckCircle2,
  failed: TriangleAlert,
  archived: Archive,
};

// Per-column status dot styling, keyed by column id.
const STATUS_DOT_CLASSES: Record<string, string> = {
  "in-progress": "bg-success animate-pulse",
  waiting: "bg-warning",
  done: "bg-success",
  failed: "bg-danger",
  archived: "bg-[var(--oh-muted)]",
};

interface WorkbenchColumnProps {
  column: WorkbenchColumn;
  onCardClick: (card: WorkbenchCard) => void;
  onArchiveCard: (card: WorkbenchCard) => void;
}

export function WorkbenchColumnComponent({
  column,
  onCardClick,
  onArchiveCard,
}: WorkbenchColumnProps) {
  const { t } = useTranslation("openhands");
  const Icon = COLUMN_ICONS[column.icon];
  const statusDotClassName =
    STATUS_DOT_CLASSES[column.id] ?? "bg-[var(--oh-muted)]";
  const isArchivedColumn = column.icon === "archived";

  return (
    <div className="flex h-full min-h-0 w-[22rem] shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-2">
        <Icon width={16} height={16} className="shrink-0 text-tertiary-light" />
        <h2 className="text-sm font-medium text-white">{column.title}</h2>
        <span className="rounded bg-surface-raised px-2 py-0.5 font-mono text-xs text-tertiary-light">
          {column.cards.length}
        </span>
      </div>

      <div
        data-testid={`workbench-column-${column.id}`}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl bg-base-secondary p-2 pb-6 custom-scrollbar"
      >
        {column.cards.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-text-dim">
            {t(I18nKey.WORKBENCH$EMPTY_COLUMN)}
          </p>
        ) : (
          column.cards.map((card) => (
            <WorkbenchCardItem
              key={card.id}
              card={card}
              statusDotClassName={statusDotClassName}
              onClick={() => onCardClick(card)}
              onArchive={onArchiveCard}
              isArchived={isArchivedColumn}
            />
          ))
        )}
      </div>
    </div>
  );
}
