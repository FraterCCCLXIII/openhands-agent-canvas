/** Shared interactive card chrome for Skills / MCP library tiles. */
export const extensionModuleCardSurfaceClassName =
  "rounded-xl border border-[var(--oh-border)] bg-base-secondary";

export const extensionModuleCardInteractiveClassName =
  "cursor-pointer transition-colors hover:border-white/40 hover:bg-base-tertiary/30 focus-visible:outline-none focus-visible:border-white/40";

/** Two-column card grids switch back to one column at or below this width (px). */
export const EXTENSION_MODULE_CARD_GRID_SINGLE_COLUMN_MAX_PX = 599;

/** Establishes the inline-size container queried by {@link extensionModuleCardGridClassName}. */
export const extensionModuleCardGridContainerClassName =
  "@container min-w-0 w-full";

/** Single column in narrow content columns; two columns from 600px container width up. */
export const extensionModuleCardGridClassName =
  "grid min-w-0 grid-cols-1 gap-3 @min-[600px]:grid-cols-2";
