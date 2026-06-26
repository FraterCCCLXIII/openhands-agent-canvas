/** REST prefix for the loop orchestrator (automation sidecar). */
export const LOOP_API_BASE_PATH = "/api/loops";

export const LOOP_STATE_DIR = ".openhands/loops";

export function loopStateFilePath(
  loopId: string,
  fileName = "triage.md",
): string {
  return `${LOOP_STATE_DIR}/${loopId}/${fileName}`;
}
