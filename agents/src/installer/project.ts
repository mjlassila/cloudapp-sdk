import fsp from 'node:fs/promises';
import path from 'node:path';

import { isNodeError, readJson, resolveWithin } from './filesystem';
import type {
  InstallerMetadata,
  ManagedFile,
  PackageInfo,
  PackageJson,
  Platform,
} from './types';

export const METADATA_FILE = '.exl-cloudapp-agent.json';
export const METADATA_SCHEMA_VERSION = 1;

export function metadataFileForPlatform(platform: Platform): string {
  return platform === 'copilot' ? METADATA_FILE : `.exl-cloudapp-agent.${platform}.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringDependencies(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] =>
      typeof entry[1] === 'string'),
  );
}

function parsePackageJson(value: unknown, filePath: string): PackageJson {
  if (!isRecord(value)) {
    throw new Error(`Invalid package metadata: ${filePath}`);
  }
  return {
    name: typeof value.name === 'string' ? value.name : undefined,
    version: typeof value.version === 'string' ? value.version : undefined,
    dependencies: stringDependencies(value.dependencies),
    devDependencies: stringDependencies(value.devDependencies),
  };
}

export function parseMetadata(
  metadata: unknown,
  targetRoot: string,
  packageRoot: string,
): InstallerMetadata | undefined {
  if (metadata === undefined) return undefined;
  if (
    !isRecord(metadata)
    || metadata.schemaVersion !== METADATA_SCHEMA_VERSION
    || !isRecord(metadata.distribution)
    || typeof metadata.distribution.name !== 'string'
    || typeof metadata.distribution.version !== 'string'
    || !Array.isArray(metadata.skills)
    || !metadata.skills.every(skill => typeof skill === 'string')
    || !isRecord(metadata.files)
  ) {
    throw new Error(`Unsupported installer metadata: ${path.join(targetRoot, METADATA_FILE)}`);
  }

  const files: Record<string, ManagedFile> = {};
  for (const [targetRelative, record] of Object.entries(metadata.files)) {
    if (!isRecord(record) || typeof record.source !== 'string' || typeof record.checksum !== 'string') {
      throw new Error(`Invalid managed file entry: ${targetRelative}`);
    }
    resolveWithin(targetRoot, targetRelative, 'target');
    resolveWithin(packageRoot, record.source, 'source');
    files[targetRelative] = {
      source: record.source,
      checksum: record.checksum,
    };
  }

  return {
    schemaVersion: METADATA_SCHEMA_VERSION,
    distribution: {
      name: metadata.distribution.name,
      version: metadata.distribution.version,
    },
    skills: [...metadata.skills],
    files,
  };
}

export async function readDistribution(packageRoot: string): Promise<PackageInfo> {
  const packagePath = path.join(packageRoot, 'package.json');
  const packageJson = parsePackageJson(await readJson(packagePath), packagePath);
  if (!packageJson.name || !packageJson.version) {
    throw new Error(`Invalid package metadata: ${packagePath}`);
  }
  const skillNames = (await fsp.readdir(path.join(packageRoot, 'skills'), { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
  return {
    name: packageJson.name,
    version: packageJson.version,
    skillNames,
  };
}

export async function validateCloudApp(targetRoot: string): Promise<PackageJson> {
  const packagePath = path.join(targetRoot, 'package.json');
  const packageData = await readJson(packagePath, true);
  if (packageData === undefined) {
    throw new Error(`Not an Alma Cloud App project: ${targetRoot}`);
  }
  const packageJson = parsePackageJson(packageData, packagePath);
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
  const hasSdkDependency = Object.keys(dependencies)
    .some(name => name.startsWith('@exlibris/exl-cloudapp-') || name === '@exlibris/eca-components');

  try {
    const [source, manifest] = await Promise.all([
      fsp.stat(path.join(targetRoot, 'cloudapp')),
      fsp.stat(path.join(targetRoot, 'manifest.json')),
    ]);
    if (!source.isDirectory() || !manifest.isFile() || !hasSdkDependency) {
      throw new Error(`Not an Alma Cloud App project: ${targetRoot}`);
    }
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error(`Not an Alma Cloud App project: ${targetRoot}`);
    }
    throw error;
  }

  return packageJson;
}

export function normalizeSkills(
  value: string | undefined,
  availableSkills: string[],
): string[] {
  if (value === undefined || value === 'all') return availableSkills;
  const requested = [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))].sort();
  if (requested.length === 0) throw new Error('No skills were selected');
  const unknown = requested.filter(name => !availableSkills.includes(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown skill${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}`);
  }
  return requested;
}
