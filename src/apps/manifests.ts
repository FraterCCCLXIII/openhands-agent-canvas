import type { AppManifest } from "#/apps/types";

export const memoryApp: AppManifest = {
  id: "memory",
  version: "1.0.0",
  scope: "product",
  displayName: "Memory",
  descriptionKey: "APPS$MEMORY_DESCRIPTION",
  odysseusScopes: ["memory:read", "memory:write"],
  agentToolNames: ["memory"],
  toolModules: { memory: "apps.memory_tool" },
  requiresOdysseus: true,
  defaultEnabled: false,
};

export const notesApp: AppManifest = {
  id: "notes",
  version: "1.0.0",
  scope: "work",
  displayName: "Notes",
  descriptionKey: "APPS$NOTES_DESCRIPTION",
  odysseusScopes: ["todos:read", "todos:write"],
  agentToolNames: ["notes"],
  toolModules: { notes: "apps.notes_tool" },
  optionalConversationTab: "notes",
  requiresOdysseus: true,
  defaultEnabled: true,
};

export const emailApp: AppManifest = {
  id: "email",
  version: "1.0.0",
  scope: "work",
  displayName: "Email",
  descriptionKey: "APPS$EMAIL_DESCRIPTION",
  odysseusScopes: ["email:read", "email:draft"],
  agentToolNames: ["email"],
  toolModules: { email: "apps.email_tool" },
  optionalConversationTab: "email",
  requiresOdysseus: true,
  defaultEnabled: false,
};

export const calendarApp: AppManifest = {
  id: "calendar",
  version: "1.0.0",
  scope: "work",
  displayName: "Calendar",
  descriptionKey: "APPS$CALENDAR_DESCRIPTION",
  odysseusScopes: ["calendar:read", "calendar:write"],
  agentToolNames: ["calendar"],
  toolModules: { calendar: "apps.calendar_tool" },
  optionalConversationTab: "calendar",
  requiresOdysseus: true,
  defaultEnabled: true,
};

export const contactsApp: AppManifest = {
  id: "contacts",
  version: "1.0.0",
  scope: "work",
  displayName: "Contacts",
  descriptionKey: "APPS$CONTACTS_DESCRIPTION",
  odysseusScopes: ["contacts:read", "contacts:write"],
  agentToolNames: ["contacts"],
  toolModules: { contacts: "apps.contacts_tool" },
  requiresOdysseus: true,
  defaultEnabled: true,
};

export const documentsApp: AppManifest = {
  id: "documents",
  version: "1.0.0",
  scope: "work",
  displayName: "Documents",
  descriptionKey: "APPS$DOCUMENTS_DESCRIPTION",
  odysseusScopes: ["documents:read", "documents:write"],
  agentToolNames: ["documents"],
  toolModules: { documents: "apps.documents_tool" },
  requiresOdysseus: true,
  defaultEnabled: true,
};

export const researchApp: AppManifest = {
  id: "research",
  version: "1.0.0",
  scope: "work",
  displayName: "Research",
  descriptionKey: "APPS$RESEARCH_DESCRIPTION",
  odysseusScopes: ["research:read", "research:launch"],
  agentToolNames: ["research"],
  toolModules: { research: "apps.research_tool" },
  requiresOdysseus: true,
  defaultEnabled: false,
};

export const scheduledTasksApp: AppManifest = {
  id: "scheduled_tasks",
  version: "1.0.0",
  scope: "work",
  displayName: "Scheduled Tasks",
  descriptionKey: "APPS$SCHEDULED_TASKS_DESCRIPTION",
  odysseusScopes: ["tasks:read", "tasks:write"],
  agentToolNames: ["scheduled_tasks"],
  toolModules: { scheduled_tasks: "apps.scheduled_tasks_tool" },
  requiresOdysseus: true,
  defaultEnabled: false,
};

export const browserApp: AppManifest = {
  id: "browser",
  version: "1.0.0",
  scope: "work",
  displayName: "Browser",
  descriptionKey: "WORK$TOOL_BROWSER_DESCRIPTION",
  odysseusScopes: [],
  agentToolNames: ["browser_tool_set"],
  defaultEnabled: false,
  requiresOdysseus: false,
};
