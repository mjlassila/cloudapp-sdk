# Installation and compatibility

This package distributes an Alma Cloud App developer agent, focused skills,
target-repository instruction templates, and maintainer references. Opening
this package does not activate the distributed assets.

## Standalone installer

From a Cloud App project with the Cloud App CLI installed, run:

```text
eca agents install
```

`eca agents` also supports `update` and `status`, plus the `--skills` and
`--dry-run` options described below. It uses the agent package bundled with
the installed CLI and targets the current directory.

Without the Cloud App CLI, run the published package:

```text
npx @exlibris/exl-cloudapp-agent install /path/to/cloudapp
```

From a Cloud App SDK checkout, the equivalent is:

```text
cd /path/to/cloudapp-sdk/agents
npm install
npm run cli -- install /path/to/cloudapp
```

After a global install (`npm install -g @exlibris/exl-cloudapp-agent`), the
command is `exl-cloudapp-agent`.

The target path defaults to the current directory.

### Commands

```text
exl-cloudapp-agent install [path] [--skills all|name,...] [--dry-run]
exl-cloudapp-agent update [path] [--dry-run]
exl-cloudapp-agent status [path]
```

- `install` installs all skills by default. Use full skill directory names in
  `--skills`, separated by commas, for a selective installation.
- `update` updates only files managed by an earlier installation.
- `status` reports current, outdated, modified, missing, or unavailable
  managed files. It exits unsuccessfully when drift is present.
- `--dry-run` plans an install or update without writing.

The installer requires a valid `package.json`, root `manifest.json`,
`cloudapp/` directory, and an Ex Libris Cloud App SDK dependency. It does not
change application dependencies or run `eca`.

### Conflict and update behavior

- Existing identical files are adopted into management.
- Missing files are created.
- Files unchanged since an earlier managed installation can be updated.
- Modified or unrelated existing files are preserved and reported.
- A conflict in one agent, skill, or template component prevents partial
  replacement of that component but does not block unrelated components.
- The installer never provides an implicit force-overwrite mode.
- The selected Cloud App path is resolved to its real directory first. If it
  is a symlink, files are written to the linked directory and output reports
  the real path.
- Writes are refused through symlinked directories inside the Cloud App.

The installer writes `.exl-cloudapp-agent.json` at the Cloud App root. Commit
this file with the installed instructions. It records the distribution
version, installed skills, source paths, and content checksums, but no local
machine path, credentials, or environment information.

Review reported conflicts manually. Existing root `AGENTS.md` and `CLAUDE.md`
files are not silently merged because their project-specific instruction
precedence must remain explicit.

## Installed layout

Install the complete set into a Cloud App repository:

```text
.github/
  agents/
    alma-cloudapp-developer.agent.md
  skills/
    alma-cloudapp-project/
    alma-cloudapp-code-practices/
    alma-cloudapp-api/
    alma-cloudapp-open-workflows/
    alma-cloudapp-manifest/
    alma-cloudapp-translations/
    alma-cloudapp-styles/
    alma-cloudapp-ui-ux/
    alma-cloudapp-testing/
    alma-cloudapp-sdk-migration/
    alma-cloudapp-release/
    alma-cloudapp-validation/
AGENTS.md
CLAUDE.md
```

For manual installation, copy:

- `agents/alma-cloudapp-developer.agent.md` to `.github/agents/`.
- All directories below `skills/` to `.github/skills/`.
- `templates/AGENTS.md` and `templates/CLAUDE.md` to the repository root.

Installing all skills is recommended because implementation tasks commonly
cross API, UI, translation, testing, security, release, and validation
boundaries. Installation makes the skills available; it does not mean their
full contents should be loaded together.

## Context-efficient use

- Load the primary agent and target `AGENTS.md` as the orchestration layer.
- Load every skill that owns a boundary being edited, and only those. Loading
  means invoking the skill or reading its whole `SKILL.md`; searching part of a
  file does not count.
- Before a new-app discovery recommendation, load the primary project,
  manifest, translations, UI/UX, and testing skills; add API for Alma data,
  entities, SDK services, or browser capabilities, open workflows for a Library
  Open Workflows trigger, and styles for custom visual or theme
  recommendations.
- Treat ownership triggers as mandatory, and load the skills before editing the
  boundary: API and testing for `CloudAppRestService` and
  `CloudAppConfigService`; API, UI/UX, and testing for page entities; API,
  manifest, and validation for browser-platform capabilities; UI/UX and
  translations for user-facing templates; styles for SCSS; manifest for
  manifest edits; open workflows, API, UI/UX, testing, and manifest for
  Library Open Workflows triggers; code practices for application code; and
  validation for the final review of any change and before completing a new
  app. The target `AGENTS.md` carries the full routing table.
- Load validation for the final review or live evidence.
- Load release and SDK migration only for explicitly requested work.
- Read detailed skill references only for the exact behavior under
  investigation.
- For a broad new app, move through design, implementation, testing,
  validation, and release phases rather than loading every skill up front.
- For substantial or complete-lifecycle work, report discovery, agreed design,
  coherent implementation outcomes, validation findings, and changed
  assumptions proactively. Keep reports concise and do not narrate routine
  tool activity.
- For authenticated local validation, open the localhost Alma proxy derived
  from `config.json`'s `env` value and `port`, wait for user authentication,
  and follow the Cloud App Center workflow. The standalone `/#/` route is not
  integrated Alma evidence.
- Keep searches inside the target project. Use external local paths only when
  explicitly supplied or approved, treat only target `node_modules` as the
  installed SDK, and use the exact public `ExLibrisGroup/cloudapp-sdk`
  repository rather than guessed or legacy sources.

Critical safety boundaries are intentionally repeated in the agent, target
instructions, and relevant live-operation skills. Domain implementation detail
should remain in its owning skill or on-demand reference.

New-app discovery includes an explicit icon or intentional generic-fallback
decision. Styling work must trace theme tokens to the installed public SDK or
Angular Material pipeline rather than relying on plausible names or semantic
hardcoded fallbacks.

## Selective installation

Each skill contains its own primary rules, but some tasks benefit from related
skills:

| Skill | Primary workflow | Common companions |
|---|---|---|
| Project | Initialization, generated workspace, development server | Code practices, validation |
| Code practices | Angular, TypeScript, RxJS, forms, security | Testing, UI/UX |
| API | SDK services, OpenAPI endpoints, entities, persistence, browser capabilities | Code practices, manifest, testing, validation |
| Open Workflows | Run Workflow API or webhook triggers, payloads, JWT verification | API, manifest, UI/UX, testing, validation |
| Manifest | Capabilities, CSP, iframe permissions, pages, widgets, identity | API, styles, UI/UX, validation |
| Translations | Runtime catalogs, extraction, fallback, RTL | UI/UX, testing, styles |
| Styles | Material theming, SCSS, responsive layout | UI/UX, validation |
| UI/UX | Workflows, actions, feedback, accessibility | Styles, translations, testing |
| Testing | Jasmine/Karma, mocks, fixtures, headless tests | API, code practices, validation |
| SDK migration | `eca update`, Angular/Material migration | Project, testing, validation |
| Release | Clean install, audit, build, GitHub publication | API, testing, manifest, validation |
| Validation | Local and authorized Alma evidence | Every affected domain skill |

If only selected skills are installed, unresolved references to another skill
mean to apply the equivalent target-repository guidance or install that skill.
Do not ignore a safety boundary because its companion skill is absent.

## User-level installation

For use across repositories:

- Install skills under `~/.copilot/skills/`.
- Install the agent profile under `~/.copilot/agents/`.

Keep repository-local `AGENTS.md` authoritative for project-specific commands,
SDK versions, architecture, and restrictions.

## Instruction precedence

Use:

1. More-specific target-repository instructions.
2. The target project's installed SDK and source.
3. Matching public SDK source.
4. Authorized live Alma behavior.
5. Installed skill references.
6. General public documentation.

Project instructions may specialize the workflow but must not weaken security,
credential, production-mutation, iframe, or relative-request boundaries.

## Compatibility

The current bundled baseline is:

- Cloud App SDK 2.1.0.
- Angular 18.2.x.
- Angular Material 18.2.x.
- TypeScript 5.5.x.
- Jasmine 5.2 and Karma 6.4.
- Alma OpenAPI snapshot retrieved 2026-08-31.

This is a reference baseline, not a requirement that every project upgrade.
Always inspect the installed project.

For SDK 1.x and older projects:

- Use the matching public SDK source.
- Treat SDK 2 references as migration hints, not current behavior.
- Do not copy Angular 18, Material 3, translation, testing, or theming patterns
  without checking compatibility.
- Use the migration skill only when an upgrade was explicitly requested.

For a project newer than the bundled baseline:

- Prefer the installed packages and matching public source.
- Recheck CLI commands, generated workspace behavior, service exports,
  manifest schema, theming, translations, tests, and migrations.
- Mark bundled statements that have not been reconfirmed as version-sensitive.

## Updating an installation

Prefer `exl-cloudapp-agent update` for a managed installation. It updates
unchanged distributed files and preserves target customizations as conflicts.

When updating manually or resolving conflicts:

1. Review its release notes and baseline changes.
2. Compare target-repository customizations in `AGENTS.md`, `CLAUDE.md`, agent
   profiles, and skills.
3. Replace unchanged distributed files.
4. Merge intentional target-specific instruction changes instead of
   overwriting them.
5. Remove obsolete skill versions only after confirming no instructions still
   reference them.
6. Re-run the smallest relevant validation for affected workflows.

Do not update the Cloud App SDK merely because the agent distribution was
updated. The distribution is released with the SDK and shares its version
number, but a Cloud App's installed SDK version is independent of it.

## Distribution versioning

The package is published by the Cloud App SDK `publish.sh` script with the
same version as the other SDK packages. Release notes should identify:

- SDK and OpenAPI baselines.
- Added, removed, or renamed skills.
- Changed safety boundaries.
- Known documentation drift.
- Migration requirements for installed copies.

Do not claim compatibility with an SDK version that was not inspected.

## Codex support

Select `--platform codex` on **every** install, update, or status command;
`--platform copilot` is the default. Both `--platform=codex` and the spaced
form work. Installation remains scoped to the explicitly selected Cloud App.

```sh
exl-cloudapp-agent install /path/to/cloudapp --platform codex --dry-run
exl-cloudapp-agent install /path/to/cloudapp --platform codex --skills alma-cloudapp-api,alma-cloudapp-testing
exl-cloudapp-agent update /path/to/cloudapp --platform codex --dry-run
exl-cloudapp-agent update /path/to/cloudapp --platform codex
exl-cloudapp-agent status /path/to/cloudapp --platform codex
# Equivalent from the target project, with a CLI bundling this installer:
eca agents install --platform codex
```

The existing CLI forwards arguments to its bundled agent package; older CLI
releases may bundle an installer without this option. Use the standalone
installer or the built checkout (`node agents/dist/cli.js ...`) in that case.

| Copilot capability | Codex equivalent |
|---|---|
| Developer `.agent.md` orchestration | Shared target `AGENTS.md`, including task classification, discovery, skill routing, acceptance criteria, evidence and final review |
| `.github/skills/<name>/` | `.agents/skills/<name>/`, with identical skill content and bundled relative references |
| Skill selection | Invoke `$alma-cloudapp-api`, another installed skill, or read its entire `SKILL.md` |
| Structured questions | Available host question tool, otherwise chat and wait for required answers |
| Live Playwright MCP | Configure Playwright MCP in the Codex host; installation does not configure servers or authentication |
| Checksummed updates/status | Same installer with platform-specific metadata |

Codex installation creates `.exl-cloudapp-agent.codex.json`; Copilot keeps
`.exl-cloudapp-agent.json` and its existing schema-1 format. Commit the metadata
with installed files. Old Copilot metadata requires no migration. Both platforms
can coexist: their skill trees and metadata are independent, while identical
root `AGENTS.md` and `CLAUDE.md` templates are shared and safely adopted.
Codex does not install the Copilot agent profile. `CLAUDE.md` is retained as the
existing delegation convenience; Codex relies on `AGENTS.md`.

Customized or older root instructions are preserved and reported as conflicts.
Review and merge the shared template manually before relying on its workflow;
the installer does not silently append instructions. An update from either
platform preserves root customizations. If one platform has updated a shared
root file since the other recorded it, the latter may report a conflict; review
that change rather than overwriting it. Selective installs may lack companion
skills: install those skills when required, or report missing guidance.

For manual Codex installation, copy `skills/*` to `.agents/skills/` and the
shared templates to the target root, preserving existing instructions. No
subagent TOML or custom tool names are needed. User-level installation is manual
only: current Codex supports `~/.agents/skills/`; this installer never writes
there. Project-specific guidance belongs in project `AGENTS.md`.

Live Alma validation requires Playwright MCP, browser access, a supplied target
and interactive approved authentication. Missing MCP access blocks live checks,
not local builds/tests. Do not substitute `playwright-cli`. Standalone Angular
rendering does not establish Alma embedding, authentication, entities, API or
iframe behavior. Production remains observation-only, secrets stay out of
source/logs/chat, and persistent live actions require explicit scoped approval.

Compatibility and discovery evidence are recorded in
[`references/codex-compatibility.md`](references/codex-compatibility.md) in the
SDK checkout (maintainer references are not shipped in the npm package).
