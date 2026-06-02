# @essedum/integration-hub

Module 3 of the Essedum MFE platform — folder: `modules/integration-hub/`. Owns: **Adapters, Pipelines, Apps, Instances, Jobs, Pipeline Dialog**.

- Dev port: `8088`
- Mount path in host: `/integration/**`
- Federation name: `integration` — exposes `./Module` (the `EntryModule`)

## Routes (mounted at `/integration`)

| Path                                       | Component                          |
|--------------------------------------------|------------------------------------|
| `/integration` → redirect → `/integration/pipelines` | —                        |
| `/integration/implementations`             | `AdapterComponent`                 |
| `/integration/implementations/create`      | `AdapterCreateEditComponent`       |
| `/integration/implementations/:adapter`    | `AdapterDescriptionComponent`      |
| `/integration/pipelines`                   | `PipelineComponent`                |
| `/integration/apps`                        | `AppListComponent`                 |
| `/integration/apps/:name/:type`            | `ViewAppComponent`                 |
| `/integration/instances`                   | `InstanceComponent`                |
| `/integration/instances/create`            | `InstanceCreateEditComponent`      |
| `/integration/instances/:instance`         | `InstanceDescriptionComponent`     |
| `/integration/jobs`                        | `JobsComponent`                    |

