# OpenCode compatibility and verification

Adaptation source: SDK commit `ffe8091e5324d6f2bb5e430371aafca632ccc53f`.
Checked 2026-10-29. Distributed workflows are assets for target Cloud Apps,
not active maintenance instructions for this package. All 12 domain skill
sources, references, licensing and attribution are reused unchanged. There are
no skill scripts in the current distribution.

## Official sources and assumptions

- https://opencode.ai/docs/rules/ — root `AGENTS.md`, `CLAUDE.md` fallback,
  global rules and precedence; Markdown links do not automatically load files.
- https://opencode.ai/docs/skills/ — `.agents/skills/<name>/SKILL.md`, native
  `skill` tool, frontmatter requirements, discovery and permissions.
- https://opencode.ai/docs/mcp-servers/ — consult for Playwright MCP setup;
  this distribution installs no MCP or permission configuration.

The documentation website returned HTTP 403 in this environment. Rules and
skills were verified from the official documentation source in
`anomalyco/opencode` at dev commit
`66f1fa816d583fdfa0f52eff1c7d56c8458b1c4e`:

- [rules.mdx](https://github.com/anomalyco/opencode/blob/66f1fa816d583fdfa0f52eff1c7d56c8458b1c4e/packages/web/src/content/docs/rules.mdx)
- [skills.mdx](https://github.com/anomalyco/opencode/blob/66f1fa816d583fdfa0f52eff1c7d56c8458b1c4e/packages/web/src/content/docs/skills.mdx)

Assume a release implementing these documented OpenCode 1 conventions. No
minimum older version or automatic skill invocation is claimed. The skill tool
must be enabled and relevant skills permitted. Shared root guidance explicitly
instructs on-demand skill loading and preserves the Copilot orchestration:
classification, discovery, SDK checks, acceptance criteria, routing, public
evidence, proportional review, security, and standalone-versus-Alma validation.
A renamed Copilot profile is not an OpenCode agent. No custom subagent is needed.

## Validation and runtime limitations

Installer tests exercise all/selected skills, repeat installation, dry-run,
updates, status, customized root guidance, conflicts, invalid targets,
traversal, symlinks, CLI selectors, Copilot coexistence, legacy metadata,
frontmatter, installed reference paths and byte-identical assets. The package
file list and actual extracted tarball installation are checked separately.

OpenCode is not installed in this environment. Runtime instruction/skill
discovery and behavioral scenarios remain unverified. File checks do not
establish behavioral compliance. To verify manually, use an installed OpenCode
release and a disposable valid Cloud App with no real Alma target or credentials:

```sh
# In the SDK agents/ directory: npm ci && npm run build
node /path/to/cloudapp-sdk/agents/dist/cli.js install /path/to/fixture --platform opencode
node /path/to/cloudapp-sdk/agents/dist/cli.js status /path/to/fixture --platform opencode
cd /path/to/fixture
opencode
```

Ask: "Do not edit files, start servers or contact Alma. Identify the root
project instructions loaded at startup and available Alma skills. Load
alma-cloudapp-api using the native skill tool and report its bundled reference
path. Explain required skill routing and evidence for reviewing an API-backed
Cloud App UI change."

Inspect the actual transcript for root `AGENTS.md`, all 12 skills under
`.agents/skills`, successful `skill` invocation, and owning-domain reads before
recommendations. Check installed SDK versions, task classification, acceptance
criteria, public evidence, final review, and integrated Alma safety boundaries.
Inspect ancestor/global rules, duplicates and permissions if discovery differs;
do not automatically loosen permissions. Repeat scenarios from
`agent-evaluation-scenarios.md` using normal OpenCode approvals; Copilot harness
flags are not OpenCode flags. Do not treat a skill listing alone as proof of
orchestration. Full scenarios and live Alma validation remain unrun. Live checks
require an authorized target, Playwright MCP, approved authentication, and
explicit scoped approval for persistent actions.
