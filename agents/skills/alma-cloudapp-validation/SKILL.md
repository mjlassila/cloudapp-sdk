---
name: alma-cloudapp-validation
description: >-
  Reviews and validates Alma Cloud Apps locally and in Alma. Use for final
  self-review, eca test, eca build, runtime debugging, Cloud App Center,
  iframe behavior, entities, network inspection, widgets, or authenticated
  browser testing. Requires Playwright MCP for live validation.
---

# Alma Cloud App validation workflow

Use this skill for the final evidence pass or when runtime behavior must be
confirmed. Load the owning domain skill for detailed API, UI/UX, styles,
translations, testing, migration, or release rules. Read `reference.md` only
for the live and release checklists relevant to the task.

## Local evidence

1. Inspect project scripts, installed SDK version, current changes, and tests.
2. Select the smallest existing test, build, or lint command covering the
   change.
3. Use `eca test` for the configured SDK test runner and `eca build` for
   production compilation and packaging behavior.
4. Do not install a new validation tool unless the project requires it.
5. For release candidates or migrations, apply their owning skill's clean
   install, audit, test, and build sequence.

## Final self-review

Perform this pass after implementation:

1. Re-read the request, decisions, and observable acceptance criteria.
2. Inspect every changed file and the final diff; do not rely on memory.
3. Identify affected domains and directly connected regression risks.
4. Reconcile every acceptance criterion with source, test, build, SDK, or live
   evidence.
5. Check for unintended generated files, unrelated changes, secrets, private
   endpoints, relative requests, parent-frame access, and weakened strictness.
6. Remove leftovers introduced or made obsolete by the change, but do not infer
   that a resource is unused from application imports alone. Check manifest,
   SDK, build, dynamic-loading, translation, asset, and Alma runtime consumers
   before removal. Remove temporary files, debugging output, mock data, and
   hardcoded development values.
7. Confirm each manifest value this work changed agrees with the code: with
   `useHash: true`, internal `pages.*` values are hash paths (`/#/<route>`)
   that resolve to declared routes, and `connectSrc` and `frameSrc` list
   exactly the origins the code calls or embeds.
8. Confirm the owning skill was loaded for every boundary edited (see the
   routing in `AGENTS.md`). Load any that was skipped and re-check that work
   against it.
9. Confirm every new service and component has a spec covering its states and
   failures, and list any that does not.
10. Do not declare completion while required evidence is unresolved or
    blocked.

For a new app, confirm that an application icon was chosen or the generic Alma
fallback was explicitly accepted. For theme changes, confirm that every token
exists in the installed public styling pipeline and resolves in the rendered
iframe.

For API-backed workflows, a build, helper-only unit tests, a loaded iframe, or
one convenient record is insufficient evidence. Verify the boundary and the
user-visible outcome with representative scenarios.

For a new app, consider every domain. For an existing app, fully review affected
and connected domains without broadening the task.

| Domain | Allowed disposition |
|---|---|
| Requirements and workflows | Verified, unresolved, or blocked |
| SDK and architecture | Verified, not applicable, unresolved, or blocked |
| Alma APIs and data impact | Verified, not applicable, unresolved, or blocked |
| Manifest and security | Verified, not applicable, unresolved, or blocked |
| UI/UX and accessibility | Verified, not applicable, unresolved, or blocked |
| Styles and translations | Verified, not applicable, unresolved, or blocked |
| Tests | Passed, not applicable, missing, or blocked |
| Alma runtime | Live-confirmed, safely deferred, not applicable, or blocked |
| Release readiness | Verified, not requested, unresolved, or blocked |

## Live Alma prerequisites

Before protected validation, establish:

1. Target environment and institution.
2. Sandbox or production classification.
3. Approved authentication method.
4. Whether startup, context handling, navigation, retries, or the scenario can
   change persistent state.
5. The exact approved mutation scope, if any.

Use the structured question tool when available; otherwise ask in chat and
wait for required answers or authorization when these are unclear.

## Mutation safety

- Inspect source and relevant OpenAPI operations before opening a workflow that
  may write.
- Treat unknown behavior as potentially state-changing and production as
  observation-only.
- Prefer unit tests, mocks, local development, or a sandbox for mutation paths.
- Before any possible persistent change, obtain approval naming the
  environment, operation, affected record or bounded scope, expected change,
  and cleanup.
- Approval does not extend to another action, record, retry, batch, rollback,
  or cleanup. Stop after an unexpected side effect.

Persistent state includes Alma records, requests, jobs, workflow state,
institution configuration, app settings and store, activation, widgets,
publication state, and connected external systems.

## Browser workflow

- Use the Playwright MCP, never `playwright-cli`, prefer interactive login, and
  never request a secret in plain text.
- Confirm authentication and app state before testing.
- Derive live scenarios from the acceptance criteria. Include representative
  values for every promised data category plus relevant empty, error,
  permission, and context-change cases.
- For entity-dependent apps, validate pages supplying zero, one, and multiple
  matching entities. Confirm the displayed or selected scope and do not infer
  correct list behavior from one selected record.
- Compare the actual API representation with the rendered result when response
  data drives the workflow. Do not stop after confirming that the panel loaded.
- Exercise only the target pages, surfaces, and scenarios needed for the
  acceptance criteria.
- Distinguish SDK message-bus calls, framework assets, proxied Alma shell
  traffic, and direct external requests.
- Distinguish local same-origin proxy behavior from hosted cross-origin
  behavior for clipboard, downloads, popups, and other browser capabilities.
- Exercise observation-only empty, error, unavailable, context-change, and
  accessibility behavior when relevant.
- Do not broaden an approved mutation or attempt an unapproved repair.

## Authenticated local Cloud App sequence

When `config.json` supplies an `env` value and the requested validation includes
Alma integration:

1. Inspect possible startup and navigation writes.
2. Start the local SDK server and confirm it is responsive.
3. Derive the localhost Alma URL by preserving the path and query from
   `config.json`'s `env` value on `http://localhost:<port>`. Use `/mng/login`
   when the configured environment has no institution path or query.
4. Open that URL with the Playwright MCP.
5. If Alma presents login, tell the user the browser is ready, ask them to
   authenticate there, and wait for their response. Do not navigate elsewhere.
6. Confirm authentication, close any existing Alma side pane, and open Cloud
   App Center.
7. Locate the locally injected development app. Obtain approval before pinning
   it because pinning changes a persistent user preference.
8. Open the app, navigate to the representative Alma pages, and exercise the
   confirmed zero, one, multiple, error, and context-change scenarios.

Do not use `http://localhost:<port>/#/` for integrated evidence. It verifies
only standalone Angular rendering and cannot prove Alma authentication,
embedding, SDK message-bus behavior, entities, relevance, API calls, iframe
capabilities, or Alma theme propagation.

The local development app normally appears through the SDK proxy workflow; its
absence does not establish that tenant installation or activation is needed.
Diagnose in this order:

1. Local server responsiveness and proxy URL.
2. Root, generated, and asset manifest contents.
3. Installed manifest schema, required fields, and changed-field types.
4. Browser console and network errors.
5. Current page entity relevance.
6. Whether an open Alma side pane hides the Cloud App Center entry point.
7. Only then, environment permissions, installation, or activation.

If an authored manifest error is found, stop browser probing. Repair and
resynchronize it through the SDK workflow, restart the server, reopen the
localhost Alma URL, and resume from a confirmed authenticated state.

Do not declare live validation complete or blocked while this authenticated
handoff is available but has not been offered. It becomes blocked only when
the user declines, authentication fails, the environment is unavailable, or a
verified platform condition prevents the scenario.

## Result

Report the requested endpoint, acceptance-criteria status, applicable domain
dispositions, SDK version, local commands, live environment and scenario
without credentials, evidence labels, and unverified or deferred behavior.

Use **project-confirmed**, **SDK-confirmed**, **documentation-derived**,
**live-confirmed**, and **unverified** when the distinction matters.
