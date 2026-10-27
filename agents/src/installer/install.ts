import fsp from 'node:fs/promises';
import path from 'node:path';

import { createAssets, groupAssets, inspectAsset } from './assets';
import { isNodeError, writeAtomic } from './filesystem';
import { METADATA_FILE, METADATA_SCHEMA_VERSION } from './project';
import type {
  Conflict,
  InspectedAsset,
  InstallerMetadata,
  InstallOrUpdateOptions,
  InstallResult,
} from './types';

async function readText(filePath: string): Promise<string | undefined> {
  try {
    return await fsp.readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

export async function installOrUpdate({
  command,
  platform = 'copilot',
  targetRoot,
  packageRoot,
  selectedSkills,
  dryRun,
  packageInfo,
  previousMetadata,
}: InstallOrUpdateOptions): Promise<InstallResult> {
  const assets = await createAssets(packageRoot, selectedSkills, platform);
  const inspected = await Promise.all(
    assets.map(asset => inspectAsset(asset, targetRoot, previousMetadata)),
  );
  const safeAssets: InspectedAsset[] = [];
  const conflicts: Conflict[] = [];

  for (const [group, groupEntries] of groupAssets(inspected)) {
    const conflictingEntries = groupEntries.filter(entry => entry.action === 'conflict');
    if (conflictingEntries.length > 0) {
      // Skip the whole component so a conflict cannot create a mixed version.
      conflicts.push({
        group,
        files: conflictingEntries.map(entry => entry.targetRelative),
      });
    } else {
      safeAssets.push(...groupEntries);
    }
  }

  if (!dryRun) {
    for (const asset of safeAssets) {
      if (asset.action === 'create' || asset.action === 'update') {
        await writeAtomic(asset.targetPath, asset.content, targetRoot);
      }
    }
  }

  const safeGroups = new Set(safeAssets.map(asset => asset.group));
  const installedSkills = new Set(previousMetadata?.skills || []);
  for (const skill of selectedSkills) {
    if (safeGroups.has(`skill:${skill}`)) installedSkills.add(skill);
  }

  const metadata: InstallerMetadata = {
    schemaVersion: METADATA_SCHEMA_VERSION,
    distribution: {
      name: packageInfo.name,
      version: packageInfo.version,
    },
    skills: [...installedSkills].sort(),
    // Preserve records for installed skills outside this selective run.
    files: { ...(previousMetadata?.files || {}) },
  };
  for (const asset of safeAssets) {
    metadata.files[asset.targetRelative] = {
      source: asset.sourceRelative,
      checksum: asset.checksum,
    };
  }

  const metadataPath = path.join(targetRoot, platform === 'codex' ? '.exl-cloudapp-agent.codex.json' : METADATA_FILE);
  const serializedMetadata = `${JSON.stringify(metadata, null, 2)}\n`;
  const metadataChanged = await readText(metadataPath) !== serializedMetadata;
  const shouldManage = Boolean(previousMetadata) || safeAssets.length > 0;
  if (!dryRun && metadataChanged && shouldManage) {
    await writeAtomic(metadataPath, serializedMetadata, targetRoot);
  }

  return {
    command,
    targetRoot,
    distribution: metadata.distribution,
    skills: metadata.skills,
    dryRun,
    counts: {
      create: safeAssets.filter(asset => asset.action === 'create').length,
      update: safeAssets.filter(asset => asset.action === 'update').length,
      unchanged: safeAssets.filter(asset => asset.action === 'unchanged').length,
    },
    conflicts,
    metadataChanged: metadataChanged && shouldManage,
  };
}
