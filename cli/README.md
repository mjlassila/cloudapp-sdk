# Cloud Apps CLI
The `eca` command-line tool for creating, running, building, and maintaining [Ex Libris Cloud Apps](https://developers.exlibrisgroup.com/cloudapps/).

## Installation
```
$ npm install -g @exlibris/exl-cloudapp-cli
```

## Getting started
```
$ mkdir my-cloudapp && cd my-cloudapp
$ eca init
$ eca start
```

`eca init` requires an empty directory (it offers to empty the current one). It copies the starter app from [`@exlibris/exl-cloudapp-base`](https://github.com/ExLibrisGroup/cloudapp-sdk/tree/master/base) and prompts for the app details. It then initializes a Git repository with an initial commit, unless Git isn't installed, the directory is already inside a Git repository, or you pass `--no-git`.

## Commands
| Command | Description |
| --- | --- |
| `eca init` | Create a new Cloud App in the current (empty) directory. In an existing app, offers to reconfigure it. |
| `eca start` | Install dependencies, serve the app locally with live reload, and open Alma in the browser. |
| `eca build` | Build the app for production into `build/`. Extra arguments are passed to the Angular build. |
| `eca test` | Run the app's unit tests. |
| `eca generate <type> <name>` | Generate a `class`, `directive`, `component`, `pipe`, or `service` in `cloudapp/`. |
| `eca extract-labels` | Extract translation keys into `cloudapp/src/i18n/_.json`. |
| `eca eject <path>` | Copy a file from the generated `.ng/` workspace into `cloudapp/` so it can be customized. |
| `eca update` | Update the app to the base version bundled with the installed CLI, merge dependencies, and reinstall. |
| `eca agents <install\|update\|status>` | Install or update AI coding agent instructions and skills (see [agents](https://github.com/ExLibrisGroup/cloudapp-sdk/tree/master/agents)). |
| `eca version` | Print the CLI version. |
| `eca help` | Show help. |

### `eca init` options
| Option | Description |
| --- | --- |
| `--no-git` | Don't initialize a Git repository. |

### `eca start` options
| Option | Description |
| --- | --- |
| `--no-install` | Skip `npm install`. |
| `--no-open-browser` | Don't open the browser. |
| `--browser <app>` | Browser to open. The `ECA_BROWSER` environment variable can be used instead. |

### `eca agents` options
| Option | Description |
| --- | --- |
| `--skills <names>` | Comma-separated skills to install. |
| `--dry-run` | Show the planned changes without writing files. |

## Project layout
| Path | Description |
| --- | --- |
| `cloudapp/` | App source code. |
| `manifest.json` | Cloud App manifest. |
| `config.json` | Local development settings (see below). |
| `tsconfig.override.json` | Optional `compilerOptions` and `angularCompilerOptions` merged into the generated `tsconfig.json`. |
| `.ng/` | Generated Angular workspace. Managed by the CLI. |
| `build/` | Production build output. |

## Development settings
`eca start` reads `config.json` in the project root and prompts for any missing values:

| Setting | Description |
| --- | --- |
| `env` | URL of the Alma environment used for development. |
| `port` | Local development server port. Defaults to `4200`. |
| `title`, `subtitle`, `author` | App details. Used for `manifest.json` fields that aren't already set; the app `id` defaults to the kebab-cased title. |

## Documentation
See the [Cloud Apps documentation](https://developers.exlibrisgroup.com/cloudapps/) on the Ex Libris Developer Network.

OpenCode uses `eca agents install --platform opencode` with a CLI bundling the
updated installer. Pass `--platform opencode` to `status` and `update` too.
It installs root guidance and shared `.agents/skills/`; see the SDK agents
installation guide for coexistence and standalone usage.
