'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { promisify } = require('node:util');

const {
  METADATA_FILE,
  execute,
  validateCloudApp,
} = require('../dist/installer');

const packageRoot = path.resolve(__dirname, '..');
const execFileAsync = promisify(execFile);

async function temporaryDirectory(t, prefix) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

async function createCloudApp(t) {
  const target = await temporaryDirectory(t, 'alma-cloudapp-target-');
  await fs.mkdir(path.join(target, 'cloudapp'));
  await fs.writeFile(path.join(target, 'manifest.json'), '{}\n');
  await fs.writeFile(
    path.join(target, 'package.json'),
    `${JSON.stringify({
      name: 'test-cloudapp',
      private: true,
      dependencies: {
        '@exlibris/exl-cloudapp-base': '2.1.0',
      },
    }, null, 2)}\n`,
  );
  return target;
}

async function copyDistribution(t) {
  const target = await temporaryDirectory(t, 'alma-cloudapp-distribution-');
  for (const name of ['agents', 'skills', 'templates']) {
    await fs.cp(path.join(packageRoot, name), path.join(target, name), { recursive: true });
  }
  const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  packageJson.version = '0.2.0';
  await fs.writeFile(path.join(target, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  return target;
}

test('rejects a directory that is not an Alma Cloud App', async t => {
  const target = await temporaryDirectory(t, 'not-a-cloudapp-');
  await fs.writeFile(path.join(target, 'package.json'), '{}\n');

  await assert.rejects(
    validateCloudApp(target),
    /Not an Alma Cloud App project/,
  );
});

test('rejects a directory without package.json', async t => {
  const target = await temporaryDirectory(t, 'not-a-cloudapp-');

  await assert.rejects(
    execute({ command: 'install', target }),
    /Not an Alma Cloud App project/,
  );
});

test('dry-run plans installation without writing files', async t => {
  const target = await createCloudApp(t);

  const result = await execute({
    command: 'install',
    target,
    skills: 'alma-cloudapp-api',
    dryRun: true,
  });

  assert.equal(result.counts.create > 0, true);
  assert.equal(result.metadataChanged, true);
  await assert.rejects(fs.access(path.join(target, METADATA_FILE)));
  await assert.rejects(fs.access(path.join(target, '.github')));
});

test('installs the complete distribution and records checksums', async t => {
  const target = await createCloudApp(t);

  const result = await execute({ command: 'install', target });
  const metadata = JSON.parse(await fs.readFile(path.join(target, METADATA_FILE), 'utf8'));

  assert.equal(result.conflicts.length, 0);
  assert.equal(metadata.skills.length, 12);
  assert.equal(metadata.distribution.version, require('../package.json').version);
  assert.ok(metadata.files['.github/agents/alma-cloudapp-developer.agent.md']);
  assert.ok(metadata.files['.github/skills/alma-cloudapp-api/SKILL.md']);
  assert.ok(metadata.files['AGENTS.md']);
  assert.equal(
    await fs.readFile(path.join(target, 'CLAUDE.md'), 'utf8'),
    '@AGENTS.md\n',
  );
});

test('preserves an existing root instruction file while installing skills', async t => {
  const target = await createCloudApp(t);
  await fs.writeFile(path.join(target, 'AGENTS.md'), '# Project instructions\n');

  const result = await execute({
    command: 'install',
    target,
    skills: 'alma-cloudapp-testing',
  });

  assert.deepEqual(
    result.conflicts.map(conflict => conflict.group),
    ['template:AGENTS.md'],
  );
  assert.equal(
    await fs.readFile(path.join(target, 'AGENTS.md'), 'utf8'),
    '# Project instructions\n',
  );
  await fs.access(path.join(target, '.github', 'skills', 'alma-cloudapp-testing', 'SKILL.md'));
});

test('status reports target modifications', async t => {
  const target = await createCloudApp(t);
  await execute({
    command: 'install',
    target,
    skills: 'alma-cloudapp-api',
  });
  const skillPath = path.join(target, '.github', 'skills', 'alma-cloudapp-api', 'SKILL.md');
  await fs.appendFile(skillPath, '\nProject customization.\n');

  const result = await execute({ command: 'status', target });
  const entry = result.entries.find(item =>
    item.targetRelative === '.github/skills/alma-cloudapp-api/SKILL.md');

  assert.equal(entry.state, 'modified');
  assert.equal(result.driftCount, 1);
});

test('update changes unmodified managed files and preserves customizations', async t => {
  const target = await createCloudApp(t);
  await execute({
    command: 'install',
    target,
    skills: 'alma-cloudapp-api',
  });
  await fs.appendFile(path.join(target, 'AGENTS.md'), '\nProject customization.\n');

  const updatedDistribution = await copyDistribution(t);
  const sourceAgent = path.join(updatedDistribution, 'agents', 'alma-cloudapp-developer.agent.md');
  await fs.appendFile(sourceAgent, '\nUpdated distribution marker.\n');

  const result = await execute(
    { command: 'update', target },
    { packageRoot: updatedDistribution },
  );
  const metadata = JSON.parse(await fs.readFile(path.join(target, METADATA_FILE), 'utf8'));

  assert.equal(metadata.distribution.version, '0.2.0');
  assert.match(
    await fs.readFile(
      path.join(target, '.github', 'agents', 'alma-cloudapp-developer.agent.md'),
      'utf8',
    ),
    /Updated distribution marker/,
  );
  assert.match(await fs.readFile(path.join(target, 'AGENTS.md'), 'utf8'), /Project customization/);
  assert.deepEqual(
    result.conflicts.map(conflict => conflict.group),
    ['template:AGENTS.md'],
  );
});

test('status rejects metadata paths outside the Cloud App', async t => {
  const target = await createCloudApp(t);
  await fs.writeFile(
    path.join(target, METADATA_FILE),
    `${JSON.stringify({
      schemaVersion: 1,
      distribution: { name: '@exlibris/exl-cloudapp-agent', version: '2.1.0' },
      skills: [],
      files: {
        '../outside.md': {
          source: 'README.md',
          checksum: 'invalid',
        },
      },
    }, null, 2)}\n`,
  );

  await assert.rejects(
    execute({ command: 'status', target }),
    /Invalid target path/,
  );
});

test('refuses to write through a symlinked target directory', async t => {
  const target = await createCloudApp(t);
  const outside = await temporaryDirectory(t, 'alma-cloudapp-outside-');
  await fs.symlink(outside, path.join(target, '.github'));

  await assert.rejects(
    execute({
      command: 'install',
      target,
      skills: 'alma-cloudapp-api',
    }),
    /symlinked directory/,
  );
  await assert.rejects(fs.access(path.join(outside, 'agents')));
});

test('resolves a symlinked Cloud App root before writing', async t => {
  const target = await createCloudApp(t);
  const links = await temporaryDirectory(t, 'alma-cloudapp-links-');
  const linkedTarget = path.join(links, 'cloudapp-link');
  await fs.symlink(target, linkedTarget);

  const result = await execute({
    command: 'install',
    target: linkedTarget,
    skills: 'alma-cloudapp-api',
  });

  assert.equal(result.targetRoot, await fs.realpath(target));
  await fs.access(path.join(target, METADATA_FILE));
  assert.equal((await fs.lstat(linkedTarget)).isSymbolicLink(), true);
});

test('refuses symlinked directories inside a symlinked Cloud App root', async t => {
  const target = await createCloudApp(t);
  const outside = await temporaryDirectory(t, 'alma-cloudapp-outside-');
  const links = await temporaryDirectory(t, 'alma-cloudapp-links-');
  const linkedTarget = path.join(links, 'cloudapp-link');
  await fs.symlink(target, linkedTarget);
  await fs.symlink(outside, path.join(target, '.github'));

  await assert.rejects(
    execute({ command: 'install', target: linkedTarget, skills: 'alma-cloudapp-api' }),
    /symlinked directory/,
  );
  await assert.rejects(fs.access(path.join(outside, 'agents')));
});

test('command entry point installs and reports status', async t => {
  const target = await createCloudApp(t);
  const command = path.join(packageRoot, 'dist', 'cli.js');

  const install = await execFileAsync(process.execPath, [
    command,
    'install',
    target,
    '--skills',
    'alma-cloudapp-manifest',
  ]);
  const status = await execFileAsync(process.execPath, [command, 'status', target]);

  assert.match(install.stdout, /Files: \d+ create, 0 update/);
  assert.match(status.stdout, /alma-cloudapp-manifest/);
  assert.match(status.stdout, /current:/);
});

for (const platform of ['copilot', 'opencode']) {
  test(`${platform}: selective dry-run, repeat install, status and isolated update`, async t => {
    const target = await createCloudApp(t);
    const opts = { target, platform };
    const folder = platform === 'copilot' ? '.github' : '.agents';
    await execute({ ...opts, command: 'install', skills: 'alma-cloudapp-api', dryRun: true });
    await assert.rejects(fs.access(path.join(target, folder)));
    await execute({ ...opts, command: 'install', skills: 'alma-cloudapp-api' });
    const repeated = await execute({ ...opts, command: 'install', skills: 'alma-cloudapp-api' });
    assert.equal(repeated.counts.create, 0);
    assert.equal(repeated.metadataChanged, false);
    assert.equal((await execute({ ...opts, command: 'status' })).driftCount, 0);
    const other = platform === 'copilot' ? 'opencode' : 'copilot';
    await execute({ target, platform: other, command: 'install' });
    const otherFolder = platform === 'copilot' ? '.agents' : '.github';
    const otherPath = path.join(target, otherFolder, 'skills/alma-cloudapp-api/SKILL.md');
    const otherBefore = await fs.readFile(otherPath, 'utf8');
    const source = await copyDistribution(t);
    await fs.appendFile(path.join(source, 'skills/alma-cloudapp-api/SKILL.md'), '\nUpdated domain guidance.\n');
    const update = await execute({ ...opts, command: 'update', dryRun: true }, { packageRoot: source });
    assert.ok(update.counts.update > 0);
    await execute({ ...opts, command: 'update' }, { packageRoot: source });
    assert.equal(await fs.readFile(otherPath, 'utf8'), otherBefore);
    assert.equal((await execute({ ...opts, command: 'status' }, { packageRoot: source })).driftCount, 0);
    const skillPath = path.join(target, folder, 'skills/alma-cloudapp-api/SKILL.md');
    await fs.appendFile(skillPath, '\nCustomization\n');
    await fs.appendFile(path.join(target, 'AGENTS.md'), '\nCustom root\n');
    const conflicts = await execute({ ...opts, command: 'update' }, { packageRoot: source });
    assert.ok(conflicts.conflicts.some(c => c.group === 'skill:alma-cloudapp-api'));
    assert.ok(conflicts.conflicts.some(c => c.group === 'template:AGENTS.md'));
    assert.match(await fs.readFile(skillPath, 'utf8'), /Customization/);
    assert.equal((await execute({ ...opts, command: 'status' }, { packageRoot: source })).driftCount, 2);
  });
}

for (const platform of ['opencode']) {
test(`${platform} full install shares every skill asset and resolves instruction paths`, async t => {
  const target = await createCloudApp(t);
  const result = await execute({ command: 'install', target, platform });
  assert.equal(result.skills.length, 12);
  await assert.rejects(fs.access(path.join(target, '.github')));
  for (const skill of result.skills) {
    const root = path.join(target, '.agents/skills', skill);
    const text = await fs.readFile(path.join(root, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^---\\nname: ${skill}\\ndescription:`, 'm'));
    assert.equal(text, await fs.readFile(path.join(packageRoot, 'skills', skill, 'SKILL.md'), 'utf8'));
    await fs.access(path.join(root, 'reference.md'));
  }
  const instructions = await fs.readFile(path.join(target, 'AGENTS.md'), 'utf8');
  for (const match of instructions.matchAll(/`(\.agents\/skills\/[^`]+)`/g)) {
    await fs.access(path.join(target, match[1]));
  }
  const metadata = JSON.parse(await fs.readFile(path.join(target, `.exl-cloudapp-agent.${platform}.json`), 'utf8'));
  for (const name of Object.keys(metadata.files)) assert.ok(!name.startsWith('.github/'));
});

test(`${platform} rejects invalid platform, skill traversal, targets and symlink boundaries`, async t => {
  const target = await createCloudApp(t);
  await assert.rejects(execute({ command: 'install', target, platform: 'invalid' }), /Unknown platform/);
  await assert.rejects(execute({ command: 'install', target, platform, skills: '../outside' }), /Unknown skill/);
  const outside = await temporaryDirectory(t, 'opencode-outside-');
  await assert.rejects(execute({ command: 'install', target: outside, platform }), /Not an Alma/);
  await fs.symlink(outside, path.join(target, '.agents'));
  await assert.rejects(execute({ command: 'install', target, platform }), /symlinked directory/);
  assert.deepEqual(await fs.readdir(outside), []);
});

test(`${platform} CLI accepts platform syntax and rejects malformed selectors`, async t => {
  const target = await createCloudApp(t);
  const command = path.join(packageRoot, 'dist/cli.js');
  await execFileAsync(process.execPath, [command, 'install', target, `--platform=${platform}`, '--skills', 'alma-cloudapp-manifest']);
  const status = await execFileAsync(process.execPath, [command, 'status', target, '--platform', platform]);
  assert.match(status.stdout, /current:/);
  await assert.rejects(execFileAsync(process.execPath, [command, 'install', target, '--platform']), /requires copilot or opencode/);
  const metadataPath = path.join(target, `.exl-cloudapp-agent.${platform}.json`);
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  metadata.files['../escape'] = { source: 'README.md', checksum: 'bad' };
  await fs.writeFile(metadataPath, JSON.stringify(metadata));
  await assert.rejects(execute({ command: 'status', target, platform }), /Invalid target path/);
});

}

test('legacy schema-1 Copilot metadata updates without touching OpenCode metadata', async t => {
  const target = await createCloudApp(t);
  await execute({ command: 'install', target, platform: 'opencode' });
  const opencodePath = path.join(target, '.exl-cloudapp-agent.opencode.json');
  const before = await fs.readFile(opencodePath, 'utf8');
  const content = '# Earlier managed Copilot agent\n';
  const relative = '.github/agents/alma-cloudapp-developer.agent.md';
  await fs.mkdir(path.dirname(path.join(target, relative)), { recursive: true });
  await fs.writeFile(path.join(target, relative), content);
  await fs.writeFile(path.join(target, METADATA_FILE), JSON.stringify({
    schemaVersion: 1,
    distribution: { name: '@exlibris/exl-cloudapp-agent', version: '2.0.0' },
    skills: [],
    files: { [relative]: { source: 'agents/alma-cloudapp-developer.agent.md',
      checksum: require('node:crypto').createHash('sha256').update(content).digest('hex') } },
  }));
  assert.equal((await execute({ command: 'status', target })).entries[0].state, 'outdated');
  await execute({ command: 'update', target });
  assert.equal((await execute({ command: 'status', target })).driftCount, 0);
  assert.equal(await fs.readFile(opencodePath, 'utf8'), before);
});

test('all installed OpenCode assets match their sources and valid skill metadata', async t => {
  const target = await createCloudApp(t);
  await execute({ command: 'install', target, platform: 'opencode' });
  const metadata = JSON.parse(await fs.readFile(path.join(target, '.exl-cloudapp-agent.opencode.json'), 'utf8'));
  for (const [relative, entry] of Object.entries(metadata.files)) {
    assert.deepEqual(await fs.readFile(path.join(target, relative)), await fs.readFile(path.join(packageRoot, entry.source)));
  }
  for (const skill of metadata.skills) {
    assert.match(skill, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(skill.length <= 64);
    const text = await fs.readFile(path.join(target, '.agents/skills', skill, 'SKILL.md'), 'utf8');
    const frontmatter = text.split('---')[1];
    const description = frontmatter.split(/description:\s*>-?\s*\n/)[1].trim().replace(/\s+/g, ' ');
    assert.ok(description.length > 0 && description.length <= 1024);
  }
});
