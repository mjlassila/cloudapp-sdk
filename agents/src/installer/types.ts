export type Platform = 'copilot' | 'opencode';

export type InstallerCommand = 'install' | 'update';
export type Command = InstallerCommand | 'status';
export type FileAction = 'create' | 'update' | 'unchanged' | 'conflict';
export type StatusState = 'current' | 'outdated' | 'modified' | 'missing' | 'source-unavailable';

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface PackageInfo {
  name: string;
  version: string;
  skillNames: string[];
}

export interface ManagedFile {
  source: string;
  checksum: string;
}

export interface InstallerMetadata {
  schemaVersion: number;
  distribution: {
    name: string;
    version: string;
  };
  skills: string[];
  files: Record<string, ManagedFile>;
}

export interface Asset {
  sourceRelative: string;
  targetRelative: string;
  group: string;
  content: Buffer;
  checksum: string;
}

export interface InspectedAsset extends Asset {
  targetPath: string;
  action: FileAction;
}

export interface Conflict {
  group: string;
  files: string[];
}

export interface InstallResult {
  command: InstallerCommand;
  targetRoot: string;
  distribution: InstallerMetadata['distribution'];
  skills: string[];
  dryRun: boolean;
  counts: Record<'create' | 'update' | 'unchanged', number>;
  conflicts: Conflict[];
  metadataChanged: boolean;
}

export interface StatusEntry {
  targetRelative: string;
  state: StatusState;
}

export interface StatusResult {
  command: 'status';
  targetRoot: string;
  distribution: {
    current: string;
    installed?: string;
  };
  installed: boolean;
  skills: string[];
  entries: StatusEntry[];
  driftCount: number;
}

export interface ExecuteOptions {
  platform?: Platform;
  command: Command;
  target?: string;
  skills?: string;
  dryRun?: boolean;
}

export interface ExecuteOverrides {
  packageRoot?: string;
}

export interface InstallOrUpdateOptions {
  platform?: Platform;
  command: InstallerCommand;
  targetRoot: string;
  packageRoot: string;
  selectedSkills: string[];
  dryRun: boolean;
  packageInfo: PackageInfo;
  previousMetadata?: InstallerMetadata;
}
