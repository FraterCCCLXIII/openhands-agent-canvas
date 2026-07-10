import {
  CalendarClock,
  GitBranch,
  LayoutGrid,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import {
  AUTOMATIONS_DASHBOARD_PATH,
  AUTOMATIONS_RESPONDERS_PATH,
  AUTOMATIONS_ROUTINES_PATH,
  AUTOMATIONS_TEMPLATES_PATH,
  AUTOMATIONS_WORKFLOWS_PATH,
} from "#/components/features/automations/automations-page.constants";

export interface AutomateNavItem {
  to: string;
  labelKey:
    | "AUTOMATE$NAV_DASHBOARD"
    | "AUTOMATE$NAV_WORKFLOWS"
    | "AUTOMATE$NAV_ROUTINES"
    | "AUTOMATE$NAV_RESPONDERS"
    | "AUTOMATE$NAV_TEMPLATES";
  icon: React.ReactElement;
  /** When true, only an exact path match counts as active. */
  end?: boolean;
  testIdSuffix: string;
}

export const AUTOMATE_NAV_ITEMS: AutomateNavItem[] = [
  {
    to: AUTOMATIONS_DASHBOARD_PATH,
    labelKey: "AUTOMATE$NAV_DASHBOARD",
    icon: <LayoutGrid className="size-4" strokeWidth={2} aria-hidden />,
    end: true,
    testIdSuffix: "dashboard",
  },
  {
    to: AUTOMATIONS_WORKFLOWS_PATH,
    labelKey: "AUTOMATE$NAV_WORKFLOWS",
    icon: <GitBranch className="size-4" strokeWidth={2} aria-hidden />,
    end: true,
    testIdSuffix: "workflows",
  },
  {
    to: AUTOMATIONS_ROUTINES_PATH,
    labelKey: "AUTOMATE$NAV_ROUTINES",
    icon: <CalendarClock className="size-4" strokeWidth={2} aria-hidden />,
    end: true,
    testIdSuffix: "routines",
  },
  {
    to: AUTOMATIONS_RESPONDERS_PATH,
    labelKey: "AUTOMATE$NAV_RESPONDERS",
    icon: <MessagesSquare className="size-4" strokeWidth={2} aria-hidden />,
    end: true,
    testIdSuffix: "responders",
  },
  {
    to: AUTOMATIONS_TEMPLATES_PATH,
    labelKey: "AUTOMATE$NAV_TEMPLATES",
    icon: <Sparkles className="size-4" strokeWidth={2} aria-hidden />,
    end: true,
    testIdSuffix: "templates",
  },
];
