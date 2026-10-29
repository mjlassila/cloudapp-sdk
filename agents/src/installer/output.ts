import type { InstallResult, StatusResult, StatusState } from './types';

export function usage(): string {
  return `Usage:
  exl-cloudapp-agent install [path] [--skills all|name,...] [--dry-run]
  exl-cloudapp-agent update [path] [--dry-run]
  exl-cloudapp-agent status [path]
  exl-cloudapp-agent --version

Options: --platform copilot|opencode (default: copilot), for install, update, and status.

Commands:
  install  Install all or selected skills and safely adopt matching files.
  update   Update unchanged managed files to this distribution version.
  status   Report missing, modified, outdated, and current managed files.

Conflicting target customizations are preserved and reported, never overwritten.
`;
}

function formatStatus(result: StatusResult): string[] {
  if (!result.installed) {
    return [
      'Status: not installed',
      `Available distribution: ${result.distribution.current}`,
    ];
  }

  const lines = [
    `Distribution: ${result.distribution.installed} installed; ${result.distribution.current} available`,
    `Skills: ${result.skills.join(', ') || 'none'}`,
  ];
  const counts = result.entries.reduce<Partial<Record<StatusState, number>>>((summary, entry) => {
    summary[entry.state] = (summary[entry.state] || 0) + 1;
    return summary;
  }, {});
  lines.push(`Managed files: ${result.entries.length}`);

  const states: StatusState[] = [
    'current',
    'outdated',
    'modified',
    'missing',
    'source-unavailable',
  ];
  for (const state of states) {
    if (counts[state]) lines.push(`  ${state}: ${counts[state]}`);
  }
  for (const entry of result.entries.filter(item => item.state !== 'current')) {
    lines.push(`  ${entry.state}: ${entry.targetRelative}`);
  }
  return lines;
}

function formatInstall(result: InstallResult): string[] {
  const lines = [
    `Distribution: ${result.distribution.name}@${result.distribution.version}`,
    `Skills: ${result.skills.join(', ') || 'none'}`,
    `${result.dryRun ? 'Planned' : 'Files'}: ${result.counts.create} create, ${result.counts.update} update, ${result.counts.unchanged} unchanged`,
  ];
  if (result.conflicts.length > 0) {
    lines.push(`Preserved conflicts: ${result.conflicts.length} component(s)`);
    for (const conflict of result.conflicts) {
      lines.push(`  ${conflict.group}: ${conflict.files.join(', ')}`);
    }
  }
  lines.push(
    result.dryRun
      ? `Metadata: ${result.metadataChanged ? 'would update' : 'unchanged'}`
      : `Metadata: ${result.metadataChanged ? 'updated' : 'unchanged'}`,
  );
  return lines;
}

export function formatResult(result: InstallResult | StatusResult): string {
  const details = result.command === 'status'
    ? formatStatus(result)
    : formatInstall(result);
  return [`Cloud App: ${result.targetRoot}`, ...details, ''].join('\n');
}
