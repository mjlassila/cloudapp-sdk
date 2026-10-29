import fsp from 'node:fs/promises';
import path from 'node:path';

import { listFiles, readChecksum, sha256, toPosix } from './filesystem';
import type { Asset, InspectedAsset, InstallerMetadata, Platform } from './types';

export async function createAssets(
  packageRoot: string,
  selectedSkills: string[],
  platform: Platform = 'copilot',
): Promise<Asset[]> {
  const assets: Asset[] = [];

  const addFile = async (
    sourcePath: string,
    targetRelative: string,
    group: string,
  ): Promise<void> => {
    const content = await fsp.readFile(sourcePath);
    assets.push({
      sourceRelative: toPosix(path.relative(packageRoot, sourcePath)),
      targetRelative: toPosix(targetRelative),
      group,
      content,
      checksum: sha256(content),
    });
  };

  if (platform === 'copilot') {
    for (const sourcePath of await listFiles(path.join(packageRoot, 'agents'))) {
      await addFile(
        sourcePath,
        path.join('.github', 'agents', path.basename(sourcePath)),
        'agent',
      );
    }
  }

  for (const skill of selectedSkills) {
    const skillRoot = path.join(packageRoot, 'skills', skill);
    for (const sourcePath of await listFiles(skillRoot)) {
      await addFile(
        sourcePath,
        path.join(platform === 'copilot' ? '.github' : '.agents', 'skills', skill, path.relative(skillRoot, sourcePath)),
        `skill:${skill}`,
      );
    }
  }

  for (const name of ['AGENTS.md', 'CLAUDE.md']) {
    await addFile(
      path.join(packageRoot, 'templates', name),
      name,
      `template:${name}`,
    );
  }

  return assets;
}

export async function inspectAsset(
  asset: Asset,
  targetRoot: string,
  previousMetadata?: InstallerMetadata,
): Promise<InspectedAsset> {
  const targetPath = path.join(targetRoot, asset.targetRelative);
  const currentChecksum = await readChecksum(targetPath);
  const previous = previousMetadata?.files[asset.targetRelative];

  if (!currentChecksum) return { ...asset, targetPath, action: 'create' };
  if (currentChecksum === asset.checksum) {
    return { ...asset, targetPath, action: 'unchanged' };
  }
  if (previous && currentChecksum === previous.checksum) {
    return { ...asset, targetPath, action: 'update' };
  }
  return { ...asset, targetPath, action: 'conflict' };
}

export function groupAssets(
  inspectedAssets: InspectedAsset[],
): Map<string, InspectedAsset[]> {
  const groups = new Map<string, InspectedAsset[]>();
  for (const asset of inspectedAssets) {
    const group = groups.get(asset.group) || [];
    group.push(asset);
    groups.set(asset.group, group);
  }
  return groups;
}
