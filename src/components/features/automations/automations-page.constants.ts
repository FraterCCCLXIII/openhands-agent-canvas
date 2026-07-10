export const AUTOMATIONS_ROUTE = "/automations";

export const AUTOMATIONS_DASHBOARD_PATH = `${AUTOMATIONS_ROUTE}/dashboard`;

export const AUTOMATIONS_WORKFLOWS_PATH = `${AUTOMATIONS_ROUTE}/workflows`;

/** Scheduled cron-style automations (the original automations list). */
export const AUTOMATIONS_ROUTINES_PATH = AUTOMATIONS_ROUTE;

export const AUTOMATIONS_RESPONDERS_PATH = `${AUTOMATIONS_ROUTE}/responders`;

export const AUTOMATIONS_TEMPLATES_PATH = `${AUTOMATIONS_ROUTE}/templates`;

/** @deprecated Hash-based templates deep link — prefer {@link AUTOMATIONS_TEMPLATES_PATH}. */
export const AUTOMATIONS_TEMPLATES_HASH = "templates";

export const AUTOMATIONS_TEMPLATES_SECTION_ID = "automations-templates";
