import { Store } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import AutomationsIcon from "#/icons/automations.svg?react";

export interface AutomationsNavItem {
  to: string;
  labelKey:
    | typeof I18nKey.AUTOMATIONS$YOUR_AUTOMATIONS
    | typeof I18nKey.AUTOMATIONS$MARKETPLACE;
  icon: React.ReactElement;
  end?: boolean;
}

export const AUTOMATIONS_NAV_ITEMS: AutomationsNavItem[] = [
  {
    to: "/automations",
    labelKey: I18nKey.AUTOMATIONS$YOUR_AUTOMATIONS,
    icon: <AutomationsIcon width={16} height={16} aria-hidden="true" />,
    end: true,
  },
  {
    to: "/automations/marketplace",
    labelKey: I18nKey.AUTOMATIONS$MARKETPLACE,
    icon: <Store className="size-4" aria-hidden="true" />,
    end: true,
  },
];
