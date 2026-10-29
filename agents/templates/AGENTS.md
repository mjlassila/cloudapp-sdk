# Alma Cloud App development

Use these instructions for Ex Libris Alma Cloud App work.

## Authority

1. Target project instructions and installed SDK packages.
2. Matching public Cloud App SDK source.
3. Current Alma OpenAPI specification for endpoint contracts.
4. Behavior safely observed in the authorized target Alma environment.
5. Installed skill references.
6. Public documentation.

Do not assume access to Alma source code, private repositories, internal
databases, or undocumented services. Documentation examples may target older
SDK or Angular versions.

## Context-efficient workflow

- Inspect `package.json`, installed SDK versions, `manifest.json`, relevant
  `cloudapp/` source, tests, and current changes before implementation.
- Classify the task and requested endpoint: prototype, implementation,
  validated change, release candidate, or publication.
- Ask focused questions when ambiguity could materially change behavior,
  scope, data impact, security, or architecture; state minor reversible
  defaults. Explain what is proposed, why, and its important consequences in
  plain language, defining necessary terms.
- Before editing a new app, present a plain-language discovery checkpoint
  covering its goal, users, workflow, recommended design and why, identity,
  author, icon or intentional generic fallback, Alma context, data and
  operations, surfaces, languages, security, limitations, non-goals, and
  assumptions. Ask the user to confirm or correct it and do not implement until
  confirmed.
- Treat generated code, manifest values, sample APIs, locales, and UI as
  examples, not requirements.
- Before composing a new-app discovery recommendation, load the skills listed
  for it in the routing table below. Load detailed references only for the
  specific behavior being resolved.
- Supported languages must come from explicit requirements or established
  non-scaffold product behavior. If the language scope is unknown, ask without
  inferring support from generated locale files or sample selectors.
- Determine whether substantial work is possible in-app, requires a backend or
  limitations, belongs elsewhere, or remains unestablished.
- Convert feasible requirements into observable acceptance criteria.
- Load every skill that owns a boundary you will edit or recommend, and only
  those. Load a skill by invoking it or reading its whole `SKILL.md`; searching
  or excerpting part of a file does not count. Do this before editing the
  boundary or composing the recommendation, not after a problem is found.

  | Boundary | Skills |
  |---|---|
  | A new-app discovery recommendation | project, manifest, translations, UI/UX, and testing; API for Alma data, entities, SDK services, or browser capabilities; open workflows for a Library Open Workflows trigger; styles for custom visual or theme behavior |
  | `manifest.json` | manifest |
  | `CloudAppRestService`, `CloudAppConfigService` | API, testing |
  | Page entities | API, UI/UX, testing |
  | Browser-platform capabilities | API, manifest, validation |
  | Templates and user-facing text | UI/UX, translations |
  | SCSS and themes | styles |
  | TypeScript application code | code practices |
  | Specs and mocks | testing |
  | Library Open Workflows triggers | open workflows, API, UI/UX, testing, and manifest for webhooks and configuration pages |
  | The final review of any change, completing a new app, live evidence | validation |
- Read detailed references only when resolving the behavior they cover. Do not
  load all skills or references up front.
- For new apps, consider the complete lifecycle. For existing apps, preserve
  architecture and limit work to affected domains and connected regressions.
- Before the final review, list the boundaries you edited and confirm you
  loaded each owning skill. Load any you skipped and re-check that work
  against it. Also list every new service and component that has no spec, and
  say why, or add the spec.
- Review the final files and diff separately from implementation. Do not claim
  completion while required evidence is unresolved or blocked.

## Source and filesystem boundaries

- Search within the target repository and its children.
- Do not scan parent, sibling, home, cache, or unrelated workspace directories
  for SDK packages, source, examples, configuration, or credentials.
- Use another local checkout only when the user supplied or explicitly
  approved its exact path.
- Treat only the target project's `node_modules` as its installed SDK.
- Resolve SDK behavior from the target packages, target package and lockfile
  versions, installed versioned references, or the exact public
  `ExLibrisGroup/cloudapp-sdk` repository.
- Do not borrow another project's dependencies, guess legacy repositories or
  raw URLs, or suppress a failed source lookup. Leave unavailable evidence
  unverified.

## Proactive reporting

For substantial or complete-lifecycle work, proactively report meaningful
transitions instead of waiting to be asked:

- Discovery and proposed scope before edits.
- Agreed design, feasibility, decisions, and unresolved assumptions before
  implementation.
- Implemented behavior and remaining validation after a coherent slice.
- Acceptance-criteria status, important findings, and unresolved or blocked
  items after validation.
- Any new evidence that changes the design or invalidates an assumption.

Keep updates concise and attach an in-progress update to the next necessary
tool action. Do not narrate routine searches, reads, commands, or unchanged
plans. Always provide the completed outcome without requiring a follow-up
prompt.

## Project rules

- Use `npm` and the installed `eca` command-line interface.
- Keep lasting source under `cloudapp/`; `.ng/` is generated.
- Preserve the installed SDK, Angular architecture, test runner, routing, and
  strictness unless the user requested a migration.
- Treat `config.json` as local CLI configuration, not runtime settings, secret
  storage, or a general backend proxy.
- Keep user-facing text in translation catalogs and use the SDK theme pipeline.
- Use only theme tokens established in the installed SDK or Angular Material.
  A hardcoded semantic-color fallback does not make an undefined token valid.
- Reuse project facilities, installed Cloud App components, Angular Material,
  and semantic HTML before creating custom UI.
- Make focused, complete changes without unrelated refactoring.
- Keep the root `README.md` (purpose, prerequisites, setup, configuration,
  manifest settings, user instructions) current. Update it in the same change
  as anything that affects it.
## Platform and security boundaries

- Use `CloudAppRestService` for supported Alma REST calls and the appropriate
  supplied SDK service for entities, navigation, settings, configuration,
  storage, and authentication tokens.
- Treat `entities$` as a collection. Establish zero, one, and multiple-entity
  behavior and explicit selection semantics before implementation. Do not
  silently use only the first match unless confirmed requirements make the
  workflow single-entity.
- Check the current OpenAPI operation for every Alma REST call. Do not confuse
  API-key permissions with logged-in Alma user roles.
- Model the exact selected response media type. Do not infer JSON fields from
  an XML example, another representation, MARC knowledge, or an undocumented
  runtime value.
- Before relying on a browser capability such as clipboard access, downloads,
  popups, notifications, or file access, establish SDK support, iframe
  permission, deployed-origin behavior, and an unavailable fallback.
- Do not add relative application network requests, Alma gateway calls, API
  keys, parent-frame access, Alma DOM access, or custom parent messaging.
- External browser calls require an absolute URL, manifest permission, CORS,
  and an authorized backend when secrets are involved.
- Treat browser-delivered code, configuration, storage, and traffic as
  user-inspectable. Never embed API keys, service credentials, or private
  configuration; keep authentication tokens out of persistent storage, URLs,
  source, tests, logs, and examples.
- Mock SDK and external boundaries in unit tests; never call Alma from a unit
  test.

## Live and external actions

- Use the Playwright MCP, never `playwright-cli`, for live browser validation.
  Ask for the target environment, institution, and authentication method when
  needed.
- When `config.json` has an `env` value, start `eca` and open the localhost Alma
  proxy URL derived from its path and `port`. At the login page, ask the user to
  authenticate in that browser and wait; do not navigate away to `/#/`.
- Treat `http://localhost:<port>/#/` as standalone Angular rendering only, not
  evidence of Alma embedding, SDK communication, entities, authentication,
  API behavior, iframe capabilities, or Alma theming.
- After authentication, close any open Alma side pane before opening Cloud App
  Center. Look for the locally injected development app before considering
  tenant installation or activation. Obtain approval before pinning it.
- If the app is absent, diagnose the server, generated and asset manifests,
  installed schema, required fields and types, browser console and network, and
  entity relevance in that order. Repair manifest errors and restart from a
  known state instead of continuing arbitrary DOM probing.
- Do not report live validation complete or blocked before offering an
  available authenticated configured scenario to the user.
- Treat production as observation-only and uncertain behavior as potentially
  state-changing. Inspect possible automatic writes before opening the app.
- Obtain narrowly scoped approval before any persistent change. Approval must
  name the environment, operation, affected scope, expected change, and
  cleanup. Stop after unexpected side effects.
- Do not create tags, releases, webhooks, activation changes, or publication
  submissions without explicit approval.

## Completion

For a new app, review requirements, architecture, APIs, data impact, manifest,
security, UI/UX, accessibility, styles, translations, tests, Alma behavior, and
requested release readiness. For an existing app, review affected and directly
connected domains.

Record applicable domains as verified, not applicable with a reason,
unresolved, or blocked. Distinguish project-confirmed, SDK-confirmed,
documentation-derived, live-confirmed, and unverified evidence.

A successful build, helper-only tests, a loaded iframe, or one convenient
record does not verify a complete API-backed workflow. Exercise representative
data and compare the actual response with the rendered outcome.

## Skills

Use `.agents/skills/` for OpenCode and `.github/skills/` for Copilot.
The table lists Copilot and OpenCode paths respectively. If a companion is
absent, install it or report the missing guidance; never skip its safety boundaries.

| Work | Path |
|---|---|
| Project and CLI | `.github/skills/alma-cloudapp-project/SKILL.md` / `.agents/skills/alma-cloudapp-project/SKILL.md` |
| Code practices | `.github/skills/alma-cloudapp-code-practices/SKILL.md` / `.agents/skills/alma-cloudapp-code-practices/SKILL.md` |
| SDK and Alma APIs | `.github/skills/alma-cloudapp-api/SKILL.md` / `.agents/skills/alma-cloudapp-api/SKILL.md` |
| Library Open Workflows | `.github/skills/alma-cloudapp-open-workflows/SKILL.md` / `.agents/skills/alma-cloudapp-open-workflows/SKILL.md` |
| Manifest and security | `.github/skills/alma-cloudapp-manifest/SKILL.md` / `.agents/skills/alma-cloudapp-manifest/SKILL.md` |
| Translations | `.github/skills/alma-cloudapp-translations/SKILL.md` / `.agents/skills/alma-cloudapp-translations/SKILL.md` |
| Styles and theming | `.github/skills/alma-cloudapp-styles/SKILL.md` / `.agents/skills/alma-cloudapp-styles/SKILL.md` |
| UI/UX | `.github/skills/alma-cloudapp-ui-ux/SKILL.md` / `.agents/skills/alma-cloudapp-ui-ux/SKILL.md` |
| Testing | `.github/skills/alma-cloudapp-testing/SKILL.md` / `.agents/skills/alma-cloudapp-testing/SKILL.md` |
| SDK migration | `.github/skills/alma-cloudapp-sdk-migration/SKILL.md` / `.agents/skills/alma-cloudapp-sdk-migration/SKILL.md` |
| Release | `.github/skills/alma-cloudapp-release/SKILL.md` / `.agents/skills/alma-cloudapp-release/SKILL.md` |
| Validation | `.github/skills/alma-cloudapp-validation/SKILL.md` / `.agents/skills/alma-cloudapp-validation/SKILL.md` |

## Host capabilities

For OpenCode, this file provides the developer orchestration; no custom agent
profile or subagent configuration is required.
In OpenCode, load an owning skill using its native `skill` tool, for example
`skill({ name: "alma-cloudapp-api" })`, or read its entire `SKILL.md`.
OpenCode discovers skills on demand; this distribution does not add slash
commands. If a required skill is hidden or denied by host permissions, report the blocker instead of
silently skipping it. Do not weaken permissions to make it available.
Use available search, file, and shell tools without assuming Copilot tool names.
When a structured question tool is unavailable, ask in chat and wait for any
required answer or authorization. Live browser validation requires a configured
Playwright MCP server with access to the selected browser and Alma environment.
If it is unavailable, report live checks as blocked; do not substitute
playwright-cli or claim a standalone render verifies Alma integration.

Classify work as a new app, feature, fix, review, SDK migration, or release.
Establish whether the endpoint is a prototype, implemented change, validated
change, release candidate, or publication. Load release or migration guidance
only for requested work. Preserve acceptance criteria and decisions between
phases. Review the actual final diff separately from implementation.
