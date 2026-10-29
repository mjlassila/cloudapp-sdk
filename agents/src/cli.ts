#!/usr/bin/env node

import path from 'node:path';
import type { Platform } from './installer/types';

import { execute, formatResult, usage } from './installer';

type ParsedArguments =
  | { command: 'help' }
  | { command: 'version' }
  | {
    command: 'install' | 'update' | 'status';
    target: string;
    skills?: string;
    dryRun: boolean;
    platform?: Platform;
  };

const executableCommands = ['install', 'update', 'status'] as const;

function isExecutableCommand(value: string): value is typeof executableCommands[number] {
  return executableCommands.some(command => command === value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parseArguments(argv: string[]): ParsedArguments {
  if (argv.includes('--help') || argv.includes('-h')) {
    return { command: 'help' };
  }
  if (argv.includes('--version') || argv.includes('-v')) {
    return { command: 'version' };
  }

  const command = argv.shift();
  if (!command) return { command: 'help' };
  if (!isExecutableCommand(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  let target = process.cwd();
  let targetSet = false;
  let skills: string | undefined;
  let dryRun = false;
  let platform: Platform | undefined;

  while (argv.length > 0) {
    const argument = argv.shift();
    if (argument === undefined) break;
    if (argument === '--platform' || argument.startsWith('--platform=')) {
      const value = argument === '--platform' ? argv.shift() : argument.slice(11);
      if (value !== 'copilot' && value !== 'opencode') throw new Error('--platform requires copilot or opencode');
      platform = value;
      continue;
    }
    if (argument === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (argument === '--skills') {
      const value = argv.shift();
      if (!value) throw new Error('--skills requires a comma-separated value');
      skills = value;
      continue;
    }
    if (argument.startsWith('--skills=')) {
      skills = argument.slice('--skills='.length);
      continue;
    }
    if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`);
    }
    if (targetSet) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    target = path.resolve(argument);
    targetSet = true;
  }

  if (command !== 'install' && skills !== undefined) {
    throw new Error('--skills is supported only by install');
  }
  if (command === 'status' && dryRun) {
    throw new Error('--dry-run is not applicable to status');
  }

  return { command, target, skills, dryRun, platform };
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
    if (options.command === 'help') {
      process.stdout.write(usage());
      return;
    }
    if (options.command === 'version') {
      const packageJson = require('../package.json');
      process.stdout.write(`${packageJson.version}\n`);
      return;
    }

    const result = await execute(options);
    process.stdout.write(formatResult(result));
    if (result.command === 'status' && result.driftCount > 0) {
      process.exitCode = 1;
    }
  } catch (error: unknown) {
    process.stderr.write(`Error: ${errorMessage(error)}\n\n${usage()}`);
    process.exitCode = 1;
  }
}

main();
