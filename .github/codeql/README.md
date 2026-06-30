# CodeQL Custom Configuration

This directory provides a CodeQL configuration and a Models-as-Data (MaD) pack
that teaches the GitHub CodeQL scanner about the project-local validation
utilities used throughout the Essedum codebase. Without it, CodeQL produces a
large number of false-positive alerts at HTTP / SQL / Groovy / file / command
sinks that are in fact already guarded.

## Layout

```
.github/codeql/
├── codeql-config.yml                       # top-level config (loaded by Code Scanning)
└── extensions/
    └── essedum-sanitizers/
        ├── qlpack.yml                      # data-extension qlpack manifest
        └── models/
            └── sanitizers.model.yml        # MaD sanitizer / summary declarations
```

## Sanitizers declared

| Utility (package) | Method(s) | Query kind cleared |
| --- | --- | --- |
| `com.lfn.icip.dataset.util.SsrfProtectionUtil` | `validateAndCreateUrl`, `safeUrl` | `request-forgery` |
| `com.lfn.icip.dataset.util.GroovySandboxUtil` | `validateScript`, `evaluateSandboxed` | `groovy-injection` |
| `com.lfn.ai.comm.lib.util.SqlStatementValidator` | `validateSingleStatement` | `sql-injection` |
| `com.lfn.ai.comm.lib.util.CommandSanitizer` | `validateExecutable`, `validateShellFlag`, `sanitizeArgument` | `command-injection` |
| `com.lfn.icip.dataset.util.PathValidationUtil` | `validatePath`, `validateAndGetPath` | `path-injection` |

Each method is also registered as a `summaryModel` taint pass-through so that
flows that traverse the validator are not re-tainted on the other side.

## How to activate

CodeQL Code Scanning has two operating modes on GitHub:

### A. Default setup (current)

1. Open the repository on GitHub → **Settings → Code security and analysis**.
2. Under **Code scanning** click **Edit configuration** next to the default
   setup.
3. Enable **Use a custom CodeQL config file** and point it at
   `.github/codeql/codeql-config.yml`.
4. Click **Save** and re-run the analysis (the next push will trigger it).

### B. Advanced setup (workflow-based)

If you prefer a dedicated workflow, replace the default setup with an advanced
setup by adding a `.github/workflows/codeql.yml` file containing:

```yaml
name: "CodeQL"
on:
  push:
    branches: [main, "essedum-lfn-*"]
  pull_request:
    branches: [main, "essedum-lfn-*"]
  schedule:
    - cron: "0 3 * * 1"

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: ["java-kotlin"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          config-file: ./.github/codeql/codeql-config.yml
      - uses: github/codeql-action/analyze@v3
```

## Adding more sanitizers

Append new rows to `extensions/essedum-sanitizers/models/sanitizers.model.yml`
following the [Java MaD column
layout](https://codeql.github.com/docs/codeql-language-guides/customizing-library-models-for-java/):

```
package | type | subtypes | name | signature | ext | input | output | kind | provenance
```

For a barrier guard use `extensible: sanitizerModel` with columns
`Argument[<n>] | <query-kind> | manual`. For pass-through flow use
`extensible: summaryModel` with columns
`Argument[<n>] | ReturnValue | taint | manual`.

