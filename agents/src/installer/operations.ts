import path from 'node:path';

import { installOrUpdate } from './install';
import {
  metadataFileForPlatform,
  normalizeSkills,
  parseMetadata,
  readDistribution,
  validateCloudApp,
} from './project';
import { readJson, resolveTargetRoot } from './filesystem';
import { readStatus } from './status';
import type {
  ExecuteOptions,
  ExecuteOverrides,
  InstallResult,
  StatusResult,
} from './types';

export async function execute(
  options: ExecuteOptions,
  overrides: ExecuteOverrides = {},
): Promise<InstallResult | StatusResult> {
  const platform = options.platform || 'copilot';
  if (platform !== 'copilot' && platform !== 'opencode') throw new Error('Unknown platform');
  const metadataFile = metadataFileForPlatform(platform);
  const packageRoot = overrides.packageRoot || path.resolve(__dirname, '../..');
  const targetRoot = await resolveTargetRoot(options.target || process.cwd());
  const packageInfo = await readDistribution(packageRoot);
  await validateCloudApp(targetRoot);

  const metadata = parseMetadata(
    await readJson(path.join(targetRoot, metadataFile), true),
    targetRoot,
    packageRoot,
  );
  if (options.command === 'status') {
    return readStatus(targetRoot, packageRoot, packageInfo.version, metadata);
  }

  let selectedSkills: string[];
  if (options.command === 'update') {
    if (!metadata) {
      throw new Error(`No managed installation found. Run install first in ${targetRoot}`);
    }
    const unknown = metadata.skills.filter(skill => !packageInfo.skillNames.includes(skill));
    if (unknown.length > 0) {
      throw new Error(`Installed skill no longer exists in this distribution: ${unknown.join(', ')}`);
    }
    selectedSkills = [...metadata.skills].sort();
  } else {
    selectedSkills = normalizeSkills(options.skills, packageInfo.skillNames);
  }

  return installOrUpdate({
    platform,
    command: options.command,
    targetRoot,
    packageRoot,
    selectedSkills,
    dryRun: Boolean(options.dryRun),
    packageInfo,
    previousMetadata: metadata,
  });
}
