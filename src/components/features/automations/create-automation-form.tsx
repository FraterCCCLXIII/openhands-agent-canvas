import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { BrandButton } from "#/components/features/settings/brand-button";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { I18nKey } from "#/i18n/declaration";
import { formControlSettingsFieldClassName } from "#/utils/form-control-classes";
import InfoCircleIcon from "#/icons/info-circle.svg?react";
import {
  AutomationBubbleField,
  type AutomationBubbleItem,
} from "./automation-bubble-field";
import {
  AddRepositoryModal,
  type RepositoryTarget,
} from "./add-repository-modal";
import { CreateAutomationPromptField } from "./create-automation-prompt-field";
import { CreateAutomationSectionHeader } from "./create-automation-section-header";
import { CreateAutomationSectionRevealButton } from "./create-automation-section-reveal-button";
import {
  CREATE_AUTOMATION_OPTIONAL_SECTIONS,
  CREATE_AUTOMATION_PLUGIN_OPTIONS,
  CREATE_AUTOMATION_SCHEDULE_TRIGGER_ID,
  CREATE_AUTOMATION_TRIGGER_OPTIONS,
  type CreateAutomationOptionalSection,
} from "./create-automation-form.constants";

const OPTIONAL_SECTION_LABEL_KEYS: Record<
  CreateAutomationOptionalSection,
  I18nKey
> = {
  repositories: I18nKey.AUTOMATIONS$DETAIL$REPOSITORIES,
  triggers: I18nKey.AUTOMATIONS$CREATE_TRIGGER_EVENTS,
  plugins: I18nKey.AUTOMATIONS$DETAIL$PLUGINS,
  notification: I18nKey.AUTOMATIONS$DETAIL$NOTIFICATION,
};

const OPTIONAL_SECTION_ARIA_LABEL_KEYS: Record<
  CreateAutomationOptionalSection,
  I18nKey
> = {
  repositories: I18nKey.AUTOMATIONS$CREATE_ADD_REPOSITORIES,
  triggers: I18nKey.AUTOMATIONS$CREATE_ADD_TRIGGERS,
  plugins: I18nKey.AUTOMATIONS$CREATE_ADD_PLUGINS,
  notification: I18nKey.AUTOMATIONS$CREATE_ADD_NOTIFICATION,
};

interface CreateAutomationFormProps {
  onCancel: () => void;
  /** Called after the UI-only create action completes (form reset + close). */
  onCreate: () => void;
}

function formatRepositoryLabel(target: RepositoryTarget): string {
  return `${target.repository} (${target.branch})`;
}

export function CreateAutomationForm({
  onCancel,
  onCreate,
}: CreateAutomationFormProps) {
  const { t } = useTranslation("openhands");
  const getRemoveAriaLabel = (label: string) =>
    t(I18nKey.AUTOMATIONS$CREATE_REMOVE_ITEM, { name: label });
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [notification, setNotification] = useState("");
  const [repositories, setRepositories] = useState<RepositoryTarget[]>([]);
  const [triggerItems, setTriggerItems] = useState<AutomationBubbleItem[]>([]);
  const [pluginItems, setPluginItems] = useState<AutomationBubbleItem[]>([]);
  const [isAddRepositoryOpen, setIsAddRepositoryOpen] = useState(false);
  const [revealedSections, setRevealedSections] = useState<
    Set<CreateAutomationOptionalSection>
  >(() => new Set());

  const isSectionRevealed = (section: CreateAutomationOptionalSection) =>
    revealedSections.has(section);

  const toggleSection = (section: CreateAutomationOptionalSection) => {
    setRevealedSections((previous) => {
      const next = new Set(previous);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const hideSection = (section: CreateAutomationOptionalSection) => {
    setRevealedSections((previous) => {
      if (!previous.has(section)) return previous;
      const next = new Set(previous);
      next.delete(section);
      return next;
    });
  };

  const getSectionItemCount = (
    section: CreateAutomationOptionalSection,
  ): number | undefined => {
    switch (section) {
      case "repositories":
        return repositories.length;
      case "triggers":
        return triggerItems.length;
      case "plugins":
        return pluginItems.length;
      default:
        return undefined;
    }
  };

  const getHideSectionAriaLabel = (section: CreateAutomationOptionalSection) =>
    t(I18nKey.AUTOMATIONS$CREATE_HIDE_SECTION, {
      section: t(OPTIONAL_SECTION_LABEL_KEYS[section]),
    });

  const repositoryBubbleItems = useMemo(
    () =>
      repositories.map((target) => ({
        id: target.id,
        label: formatRepositoryLabel(target),
      })),
    [repositories],
  );

  const triggerMenuOptions = useMemo(() => {
    const selectedIds = new Set(triggerItems.map((item) => item.id));
    const eventOptions: AutomationBubbleItem[] =
      CREATE_AUTOMATION_TRIGGER_OPTIONS.filter(
        (option) => !selectedIds.has(option.id),
      ).map((option) => ({ id: option.id, label: option.label }));

    if (!selectedIds.has(CREATE_AUTOMATION_SCHEDULE_TRIGGER_ID)) {
      eventOptions.unshift({
        id: CREATE_AUTOMATION_SCHEDULE_TRIGGER_ID,
        label: t(I18nKey.AUTOMATIONS$CREATE_SCHEDULE_OPTION),
      });
    }

    return eventOptions;
  }, [triggerItems, t]);

  const pluginMenuOptions = useMemo(() => {
    const selectedIds = new Set(pluginItems.map((item) => item.id));
    return CREATE_AUTOMATION_PLUGIN_OPTIONS.filter(
      (option) => !selectedIds.has(option.id),
    ).map((option) => ({ id: option.id, label: option.label }));
  }, [pluginItems]);

  const canCreate =
    name.trim().length > 0 &&
    prompt.trim().length > 0 &&
    repositories.length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate) return;
    onCreate();
  };

  const handleAddTrigger = (id: string) => {
    if (id === CREATE_AUTOMATION_SCHEDULE_TRIGGER_ID) {
      setTriggerItems((previous) => {
        if (previous.some((item) => item.id === id)) return previous;
        return [
          ...previous,
          {
            id,
            label: t(I18nKey.AUTOMATIONS$CREATE_SCHEDULE_PILL),
          },
        ];
      });
      return;
    }

    const option = CREATE_AUTOMATION_TRIGGER_OPTIONS.find(
      (entry) => entry.id === id,
    );
    if (!option) return;

    setTriggerItems((previous) =>
      previous.some((item) => item.id === id)
        ? previous
        : [...previous, { id: option.id, label: option.label }],
    );
  };

  const handleAddPlugin = (id: string) => {
    const option = CREATE_AUTOMATION_PLUGIN_OPTIONS.find(
      (entry) => entry.id === id,
    );
    if (!option) return;

    setPluginItems((previous) =>
      previous.some((item) => item.id === id)
        ? previous
        : [...previous, { id: option.id, label: option.label }],
    );
  };

  return (
    <>
      <form
        data-testid="create-automation-form"
        aria-labelledby="add-automation-modal-title"
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-5 custom-scrollbar">
          <SettingsInput
            testId="create-automation-name"
            name="name"
            type="text"
            label={t(I18nKey.AUTOMATIONS$NAME)}
            value={name}
            placeholder={t(I18nKey.AUTOMATIONS$CREATE_NAME_PLACEHOLDER)}
            onChange={setName}
            showRequiredTag
          />

          <CreateAutomationPromptField
            prompt={prompt}
            onPromptChange={setPrompt}
          />

          <div
            className="flex flex-wrap gap-2"
            data-testid="create-automation-optional-section-buttons"
          >
            {CREATE_AUTOMATION_OPTIONAL_SECTIONS.map((section) => (
              <CreateAutomationSectionRevealButton
                key={section}
                section={section}
                label={t(OPTIONAL_SECTION_LABEL_KEYS[section])}
                ariaLabel={t(OPTIONAL_SECTION_ARIA_LABEL_KEYS[section])}
                itemCount={getSectionItemCount(section)}
                isRevealed={isSectionRevealed(section)}
                onToggle={toggleSection}
              />
            ))}
          </div>

          {isSectionRevealed("repositories") ? (
            <AutomationBubbleField
              testId="create-automation-repositories"
              label={t(I18nKey.AUTOMATIONS$DETAIL$REPOSITORIES)}
              addActionLabel={t(I18nKey.AUTOMATIONS$CREATE_ADD_REPOSITORY)}
              addActionAriaLabel={t(I18nKey.AUTOMATIONS$CREATE_ADD_REPOSITORY)}
              hideSectionAriaLabel={getHideSectionAriaLabel("repositories")}
              getRemoveAriaLabel={getRemoveAriaLabel}
              items={repositoryBubbleItems}
              onHide={() => hideSection("repositories")}
              onRemove={(id) =>
                setRepositories((previous) =>
                  previous.filter((target) => target.id !== id),
                )
              }
              onAddClick={() => setIsAddRepositoryOpen(true)}
            />
          ) : null}

          {isSectionRevealed("triggers") ? (
            <AutomationBubbleField
              testId="create-automation-triggers"
              label={t(I18nKey.AUTOMATIONS$CREATE_TRIGGER_EVENTS)}
              addActionLabel={t(I18nKey.AUTOMATIONS$CREATE_ADD_TRIGGER)}
              addActionAriaLabel={t(I18nKey.AUTOMATIONS$CREATE_ADD_TRIGGER)}
              hideSectionAriaLabel={getHideSectionAriaLabel("triggers")}
              getRemoveAriaLabel={getRemoveAriaLabel}
              items={triggerItems}
              menuOptions={triggerMenuOptions}
              onSelectMenuOption={handleAddTrigger}
              onHide={() => hideSection("triggers")}
              onRemove={(id) =>
                setTriggerItems((previous) =>
                  previous.filter((item) => item.id !== id),
                )
              }
            />
          ) : null}

          {isSectionRevealed("plugins") ? (
            <AutomationBubbleField
              testId="create-automation-plugins"
              label={t(I18nKey.AUTOMATIONS$DETAIL$PLUGINS)}
              addActionLabel={t(I18nKey.AUTOMATIONS$CREATE_ADD_PLUGIN)}
              addActionAriaLabel={t(I18nKey.AUTOMATIONS$CREATE_ADD_PLUGIN)}
              hideSectionAriaLabel={getHideSectionAriaLabel("plugins")}
              getRemoveAriaLabel={getRemoveAriaLabel}
              items={pluginItems}
              menuOptions={pluginMenuOptions}
              onSelectMenuOption={handleAddPlugin}
              onHide={() => hideSection("plugins")}
              onRemove={(id) =>
                setPluginItems((previous) =>
                  previous.filter((item) => item.id !== id),
                )
              }
            />
          ) : null}

          {isSectionRevealed("notification") ? (
            <div className="flex w-full min-w-0 flex-col gap-2.5">
              <CreateAutomationSectionHeader
                label={t(I18nKey.AUTOMATIONS$DETAIL$NOTIFICATION)}
                hideAriaLabel={getHideSectionAriaLabel("notification")}
                hideTestId="create-automation-notification-hide"
                onHide={() => hideSection("notification")}
                htmlFor="create-automation-notification"
                labelAccessory={
                  <StyledTooltip
                    content={
                      <span className="block max-w-xs text-left">
                        {t(I18nKey.AUTOMATIONS$CREATE_NOTIFICATION_INFO_BODY)}
                      </span>
                    }
                    placement="top"
                  >
                    <button
                      type="button"
                      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-white"
                      aria-label={t(
                        I18nKey.AUTOMATIONS$CREATE_NOTIFICATION_INFO,
                      )}
                    >
                      <InfoCircleIcon className="size-3.5" />
                    </button>
                  </StyledTooltip>
                }
              />
              <input
                id="create-automation-notification"
                data-testid="create-automation-notification"
                name="notification"
                type="text"
                value={notification}
                placeholder={t(
                  I18nKey.AUTOMATIONS$CREATE_NOTIFICATION_PLACEHOLDER,
                )}
                onChange={(event) => setNotification(event.target.value)}
                className={formControlSettingsFieldClassName}
              />
            </div>
          ) : null}
        </div>

        <footer className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-[var(--oh-border)] px-6 py-4">
          <BrandButton
            type="button"
            variant="secondary"
            testId="create-automation-cancel"
            onClick={onCancel}
          >
            {t(I18nKey.AUTOMATIONS$CANCEL)}
          </BrandButton>
          <BrandButton
            type="submit"
            variant="primary"
            testId="create-automation-submit"
            isDisabled={!canCreate}
          >
            {t(I18nKey.AUTOMATIONS$CREATE_AUTOMATION_BUTTON)}
          </BrandButton>
        </footer>
      </form>

      <AddRepositoryModal
        isOpen={isAddRepositoryOpen}
        onClose={() => setIsAddRepositoryOpen(false)}
        onAdd={(target) =>
          setRepositories((previous) =>
            previous.some((entry) => entry.id === target.id)
              ? previous
              : [...previous, target],
          )
        }
      />
    </>
  );
}
