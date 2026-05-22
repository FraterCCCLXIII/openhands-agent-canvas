import type { MarketplaceSectionId } from "./marketplace-section-ids";
import { MARKETPLACE_SECTIONS } from "./marketplace-sections";

export type MarketplaceSectionFilter = "all" | MarketplaceSectionId;

export const MARKETPLACE_SECTION_FILTER_OPTIONS: MarketplaceSectionFilter[] = [
  "all",
  ...MARKETPLACE_SECTIONS.map((section) => section.id),
];
