# Security Policy

## Reporting a Vulnerability

Please **do not report security vulnerabilities through public GitHub issues, pull requests, or the mailing list.** Public disclosure of an unpatched issue puts all users at risk.

Instead, report vulnerabilities privately through GitHub's private vulnerability reporting:

1. Open the **[Security tab](https://github.com/essedum-project/essedum-platform/security)** of this repository.
2. Click **"Report a vulnerability"** to open the private advisory form.
3. Include as much detail as you can:
   - the affected component and version/branch,
   - a description of the issue and its impact,
   - steps to reproduce or a proof of concept,
   - and any suggested remediation.

Your report stays private to the maintainers until a fix is available.

## What to Expect

- We aim to acknowledge new reports within a few business days.
- We will keep you updated on progress toward a fix and coordinate disclosure timing with you.
- If a report involves **exposed credentials or secrets**, note that rotating/revoking the affected keys is required in addition to any code change — removing them from the source alone does not remediate the exposure.

## Supported Versions

Security fixes are prioritized for the latest release line. Older release branches may not receive security updates.

## Scope

Examples of issues worth reporting: authentication or authorization flaws, injection (SQL/command), server-side request forgery (SSRF), insecure deserialization, path traversal, and secrets or credentials committed to the codebase.
