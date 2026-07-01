import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  WIZARD_DELIVERY_BEHAVIOR_OPTIONS,
  WIZARD_EVENT_OPTIONS,
  WIZARD_INTEGRATION_OPTIONS,
  WIZARD_JITTER_OPTIONS,
  WIZARD_PREVIOUS_RUN_OPTIONS,
  WIZARD_TIMEZONE_OPTIONS,
  WIZARD_WAIT_PERIOD_OPTIONS,
  getWizardBranchLabel,
} from "./create-automation-wizard.constants";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";
import { getWizardActionTypeLabel } from "./create-automation-wizard-action-summary";

interface WizardReviewStepProps {
  state: CreateAutomationWizardState;
}

export function WizardReviewStep({ state }: WizardReviewStepProps) {
  const { t } = useTranslation("openhands");

  const triggerTypeLabel =
    state.triggerType === "schedule"
      ? t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_SCHEDULE)
      : t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_EVENT);

  const timezoneLabel =
    WIZARD_TIMEZONE_OPTIONS.find((option) => option.key === state.timezone)
      ?.label ?? state.timezone;

  const integrationLabel =
    WIZARD_INTEGRATION_OPTIONS.find(
      (option) => option.key === state.integration,
    )?.label ?? state.integration;

  const selectedEventLabels = WIZARD_EVENT_OPTIONS.filter((option) =>
    state.selectedEvents.includes(option.id),
  ).map((option) => t(option.labelKey));

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-review-step"
    >
      <dl className="flex flex-col gap-3 rounded-xl border border-[var(--oh-border)] bg-base-secondary p-4 text-sm">
        <ReviewRow
          label={t(I18nKey.AUTOMATIONS$NAME)}
          value={state.name || t(I18nKey.AUTOMATIONS$WIZARD_REVIEW_NOT_SET)}
        />
        {state.description ? (
          <ReviewRow
            label={t(I18nKey.AUTOMATIONS$WIZARD_DESCRIPTION)}
            value={state.description}
          />
        ) : null}
        <ReviewRow
          label={t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_TYPE)}
          value={triggerTypeLabel}
        />
        {state.triggerType === "schedule" ? (
          <>
            {state.useAdvancedCron ? (
              <ReviewRow
                label={t(I18nKey.AUTOMATIONS$WIZARD_CRON_EXPRESSION)}
                value={state.cronExpression}
              />
            ) : (
              <ReviewRow
                label={t(I18nKey.AUTOMATIONS$WIZARD_RUN_EVERY)}
                value={`${state.pollingInterval} ${t(
                  state.pollingUnit === "hours"
                    ? I18nKey.AUTOMATIONS$WIZARD_UNIT_HOURS
                    : I18nKey.AUTOMATIONS$WIZARD_UNIT_MINUTES,
                )}`}
              />
            )}
            <ReviewRow
              label={t(I18nKey.AUTOMATIONS$WIZARD_TIMEZONE)}
              value={timezoneLabel}
            />
          </>
        ) : null}
        {state.triggerType === "event" ? (
          <>
            <ReviewRow
              label={t(I18nKey.AUTOMATIONS$WIZARD_SELECT_INTEGRATION)}
              value={integrationLabel}
            />
            <ReviewRow
              label={t(I18nKey.AUTOMATIONS$WIZARD_EVENTS)}
              value={
                selectedEventLabels.join(", ") ||
                t(I18nKey.AUTOMATIONS$WIZARD_REVIEW_NOT_SET)
              }
            />
            <ReviewRow
              label={t(I18nKey.AUTOMATIONS$WIZARD_REPOSITORY)}
              value={state.repository}
            />
          </>
        ) : null}
        <ReviewRow
          label={t(I18nKey.AUTOMATIONS$WIZARD_ACTION_TYPE)}
          value={getWizardActionTypeLabel(state.actionType, t)}
        />
        <ReviewRow
          label={t(I18nKey.AUTOMATIONS$DETAIL$PROMPT)}
          value={state.prompt || t(I18nKey.AUTOMATIONS$WIZARD_REVIEW_NOT_SET)}
        />
      </dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr] gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-content">{value}</dd>
    </div>
  );
}

export function buildWizardTriggerSummary(
  state: CreateAutomationWizardState,
  t: (key: I18nKey, options?: Record<string, string>) => string,
): string {
  if (state.triggerType === "schedule") {
    const timezoneLabel =
      WIZARD_TIMEZONE_OPTIONS.find((option) => option.key === state.timezone)
        ?.label ?? state.timezone;
    const previousRunLabel = t(
      WIZARD_PREVIOUS_RUN_OPTIONS.find(
        (option) => option.key === state.previousRunBehavior,
      )?.labelKey ?? I18nKey.AUTOMATIONS$WIZARD_SKIP_NEXT_RUN,
    );
    const jitterLabel = state.jitterEnabled
      ? t(I18nKey.AUTOMATIONS$WIZARD_SUMMARY_JITTER_ENABLED, {
          seconds:
            WIZARD_JITTER_OPTIONS.find(
              (option) => option.key === state.jitterMaxSeconds,
            )?.key ?? state.jitterMaxSeconds,
        })
      : t(I18nKey.AUTOMATIONS$WIZARD_SUMMARY_JITTER_DISABLED);
    if (state.useAdvancedCron) {
      return t(I18nKey.AUTOMATIONS$WIZARD_SUMMARY_CRON, {
        cron: state.cronExpression,
        timezone: timezoneLabel,
        maxRuns: state.maxRunsPerHour,
        previousRun: previousRunLabel,
        jitter: jitterLabel,
      });
    }
    const unitLabel = t(
      state.pollingUnit === "hours"
        ? I18nKey.AUTOMATIONS$WIZARD_UNIT_HOURS
        : I18nKey.AUTOMATIONS$WIZARD_UNIT_MINUTES,
    );
    return t(I18nKey.AUTOMATIONS$WIZARD_SUMMARY_SCHEDULE, {
      interval: state.pollingInterval,
      unit: unitLabel,
      timezone: timezoneLabel,
      maxRuns: state.maxRunsPerHour,
      previousRun: previousRunLabel,
      jitter: jitterLabel,
    });
  }

  if (state.triggerType === "event") {
    const integrationLabel =
      WIZARD_INTEGRATION_OPTIONS.find(
        (option) => option.key === state.integration,
      )?.label ?? state.integration;
    const eventLabels = WIZARD_EVENT_OPTIONS.filter((option) =>
      state.selectedEvents.includes(option.id),
    )
      .map((option) => t(option.labelKey))
      .join(", ");
    const branchLabel = getWizardBranchLabel(state.branch, t);
    const waitLabel = t(
      WIZARD_WAIT_PERIOD_OPTIONS.find(
        (option) => option.key === state.waitPeriod,
      )?.labelKey ?? I18nKey.AUTOMATIONS$WIZARD_WAIT_2_MINUTES,
    );
    const deliveryLabel = t(
      WIZARD_DELIVERY_BEHAVIOR_OPTIONS.find(
        (option) => option.key === state.deliveryBehavior,
      )?.labelKey ?? I18nKey.AUTOMATIONS$WIZARD_DEBOUNCE_EVENTS,
    );

    return t(I18nKey.AUTOMATIONS$WIZARD_SUMMARY_EVENT, {
      integration: integrationLabel,
      events: eventLabels,
      repository: state.repository,
      branch: branchLabel,
      delivery: deliveryLabel,
      wait: waitLabel,
    });
  }

  return "";
}
