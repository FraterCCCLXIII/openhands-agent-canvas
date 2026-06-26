/** Loops UI and mock API; set VITE_LOOPS_ENABLED=false to hide. */
export function isLoopsFeatureEnabled(): boolean {
  return import.meta.env.VITE_LOOPS_ENABLED !== "false";
}
