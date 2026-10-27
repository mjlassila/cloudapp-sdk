# Codex compatibility and validation

Adaptation source: Cloud App SDK commit
`ffe8091e5324d6f2bb5e430371aafca632ccc53f`. Checked 2026-10-27.
The distributed Cloud App skills are assets, not maintenance instructions for
this SDK. No custom subagent configuration or new runtime dependency is needed.
Licenses and source attribution remain unchanged.

## Official sources

- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/skills
- https://developers.openai.com/codex/mcp

The documentation site returned HTTP 403 in this environment. The official
OpenAI repository's `docs/agents_md.md` and `docs/skills.md` link to those
canonical discovery pages. Discovery details were additionally verified against
official implementation commit `e1dd7ed1bac231398e39cc54e0980a84f4311367`:

- [Instruction discovery](https://github.com/openai/codex/blob/e1dd7ed1bac231398e39cc54e0980a84f4311367/codex-rs/core/src/agents_md.rs):
  root-to-working-directory `AGENTS.md` loading, preferred `AGENTS.override.md`,
  and project root boundaries. Existing overrides can supersede this template.
- [Skill roots](https://github.com/openai/codex/blob/e1dd7ed1bac231398e39cc54e0980a84f4311367/codex-rs/ext/skills/src/host_roots.rs):
  repository `.agents/skills` and user `~/.agents/skills`.
- [Skill discovery](https://github.com/openai/codex/blob/e1dd7ed1bac231398e39cc54e0980a84f4311367/codex-rs/ext/skills/src/loader/discovery.rs).

Assume a Codex host supporting these discovery conventions; no minimum older
version is claimed. The CLI available during validation was 0.163.0.
No MCP configuration is installed or assumed. Configure an authorized Playwright
MCP connection using the host's current documentation. A question tool is
optional; chat remains the fallback. No Copilot-only tool names are introduced.

## Evidence and remaining checks

- Installer tests cover both layouts and platform isolation, shared root
  conflicts, selective installs, dry-run, idempotence, drift, updates,
  invalid targets, traversal, symlinks and CLI parsing. Existing schema-1
  Copilot metadata stays in its original file and remains readable.
- `npm pack --dry-run` contents were inspected. The real tarball was extracted
  outside the checkout and its compiled CLI installed all skills into a
  temporary Cloud App fixture. Status reported 37 current files.
- Codex 0.163.0 app-server `skills/list` with that fixture as `cwd` returned
  all 12 Alma skills enabled at repository scope, with no loader errors.
  This proves runtime skill discovery, not compliance with domain workflows.
- Root instruction discovery is supported by official implementation evidence;
  a read-only model turn was attempted but the proxy rejected the OpenAI
  API WebSocket connection with HTTP 403. The attempt was stopped after
  15 seconds. Instruction and full behavioral scenarios remain unverified.
  Do not equate file existence or skill listing with demonstrated orchestration.

For manual instruction and behavioral verification, install from the built
package into a disposable Cloud App and start a fresh authenticated session:

```sh
exl-cloudapp-agent install /path/to/fixture --platform codex
cd /path/to/fixture
codex --sandbox read-only
```

Ask: "Without editing files or contacting Alma, identify the loaded project
instructions, available Alma skills, task classification, required skill
routing, and acceptance criteria for reviewing an Alma API-backed UI change."
Check the transcript for root `AGENTS.md`, `.agents/skills` discovery, loading
API/UI/testing and other owning skills before recommendations, and the
standalone-versus-Alma evidence distinction. Check for `AGENTS.override.md`
or more-specific instructions if the root guidance is absent.

Then use `agent-evaluation-scenarios.md` with a disposable fixture and no live
Alma target. Audit actual skill reads, discovery questions, SDK version checks,
acceptance criteria and final review; preserve unresolved answers. The existing
Copilot harness flags are not Codex flags: do not copy `--agent`, tool allowlists,
or personal configuration isolation commands blindly. Never grant unrestricted
permissions for evaluation. Run interactive Codex with its normal approval
controls for scenarios that require local edits. Live integrated scenarios need
an authorized person, target, Playwright MCP and explicitly scoped permissions;
they were not run here.
