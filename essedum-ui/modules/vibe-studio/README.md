# @essedum/vibe-studio

> Path: `modules/vibe-studio/` (renamed from `apps/vibe-studio/` 2026-05-28).

Module 4 of the Essedum MFE platform. Owns: **Vibe Coding Studio, ENL Code Editor, Native Scripts, Streaming Services, Spec Templates**.

- Dev port: `8089`
- Mount path in host: `/vibe/**`
- Federation name: `vibe-studio` — exposes `./Module` (the `EntryModule`)

## Routes (mounted at `/vibe`)

| Path                                | Component                          |
|-------------------------------------|------------------------------------|
| `/vibe` → redirect → `/vibe/editor` | —                                  |
| `/vibe/editor`                      | `VibeStudioComponent`              |
| `/vibe/code-editor`                 | `EnlCodeEditorComponent`           |
| `/vibe/scripts`                     | `NativeScriptComponent`            |
| `/vibe/scripts/view/:cname`         | `NativeScriptComponent`            |
| `/vibe/spec-templates`              | `SpecTemplateComponent`            |
| `/vibe/spec-templates/create`       | `CreateSpecTemplateComponent`      |
| `/vibe/spec-templates/edit/:dname`  | `EditSpecTemplateComponent`        |
| `/vibe/spec-templates/:cname`       | `SpecTemplateDescriptionComponent` |

## Why heavy editor deps stay MFE-private

This is the **key architectural decision** for vibe-studio. The plan's pitfall #5 calls out that heavy editor deps **must not** be shared as federation singletons — otherwise they bloat the host bundle and force all MFEs to load them upfront.

In [webpack.config.js](projects/vibe-studio/webpack.config.js), the `shared` block uses **explicit per-package config** (not `shareAll`) and **deliberately omits**:

- `ngx-quill` / `quill` (rich text editor — used by markdown panels)
- `jsoneditor` / `ang-jsoneditor` (JSON tree editor — used by spec-template-custom-swagger)
- `ace-builds` (Ace code editor — used by ENL code editor)

These ship bundled inside `@essedum/vibe-studio`'s remote chunks. The host loads them only when the user actually navigates to `/vibe/**`.

