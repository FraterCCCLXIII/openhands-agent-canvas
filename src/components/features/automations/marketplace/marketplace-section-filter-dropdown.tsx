import { I18nKey } from "#/i18n/declaration";
import { EnumFilterDropdown } from "#/components/shared/filters/enum-filter-dropdown";
import { MARKETPLACE_SECTIONS } from "./marketplace-sections";
import {
  MARKETPLACE_SECTION_FILTER_OPTIONS,
  type MarketplaceSectionFilter,
} from "./marketplace-section-filter";

const FILTER_LABEL_KEY = {
  all: I18nKey.AUTOMATIONS$MARKETPLACE_SECTION_FILTER_ALL,
  ...Object.fromEntries(
    MARKETPLACE_SECTIONS.map((section) => [section.id, section.labelKey]),
  ),
} as Record<MarketplaceSectionFilter, I18nKey>;

interface MarketplaceSectionFilterDropdownProps {
  value: MarketplaceSectionFilter;
  onChange: (filter: MarketplaceSectionFilter) => void;
}

export function MarketplaceSectionFilterDropdown({
  value,
  onChange,
}: MarketplaceSectionFilterDropdownProps) {
  return (
    <EnumFilterDropdown
      testId="automation-marketplace-section-filter"
      value={value}
      onChange={onChange}
      options={MARKETPLACE_SECTION_FILTER_OPTIONS}
      labelKeyByValue={FILTER_LABEL_KEY}
    />
  );
}
