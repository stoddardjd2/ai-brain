const manualStopRuns = new Set<string>();

export function requestManualStop(runId: string): void {
  manualStopRuns.add(runId);
}

export function consumeManualStop(runId: string): boolean {
  if (!manualStopRuns.has(runId)) {
    return false;
  }
  manualStopRuns.delete(runId);
  return true;
}
