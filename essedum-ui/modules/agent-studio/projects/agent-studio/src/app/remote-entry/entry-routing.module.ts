import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgentComponent } from '../features/agent/agent.component';
import { AgentPipelineComponent } from '../features/agent-pipeline/agent-pipeline.component';
import { SkillsComponent } from '../features/skills/skills.component';
import { AgentPipelineDashboardComponent } from '../features/agent-pipeline/agent-pipeline-dashboard/agent-pipeline-dashboard.component';
import { PipelineInExecutionComponent } from '../features/agent-pipeline/pipeline-in-execution/pipeline-in-execution.component';
import { AgentDirectoryComponent } from '../features/agent-directory/agent-directory.component';
import { AgentDirectoryViewComponent } from '../features/agent-directory/agent-directory-view/agent-directory-view.component';
import { AgentDirectoryEditComponent } from '../features/agent-directory/agent-directory-edit/agent-directory-edit.component';

// Migrated from legacy aip-app-ui (2026-05-25): LLM ops + observability iframe wrappers
import { LitellmComponent } from '../features/litellm/litellm.component';
import { LangfuseComponent } from '../features/langfuse/langfuse.component';

// Routes mount under `/agent/**` per the host manifest (agent.routePath = 'agent').
const routes: Routes = [
  { path: '', redirectTo: 'pipeline', pathMatch: 'full' },

  { path: 'litellm', component: LitellmComponent },
  { path: 'langfuse', component: LangfuseComponent },

  {
    path: 'studio',
    children: [
      { path: '', component: AgentComponent },
    ],
  },

  {
    path: 'pipeline',
    children: [
      { path: '', component: AgentPipelineDashboardComponent },
      { path: 'view/:cname', component: AgentPipelineComponent },
      { path: 'pipeline-in-execution', component: PipelineInExecutionComponent },
    ],
  },

  {
    path: 'directory',
    children: [
      { path: '', component: AgentDirectoryComponent },
      { path: 'view/:name', component: AgentDirectoryViewComponent },
      { path: 'edit/:name', component: AgentDirectoryEditComponent },
      { path: 'add', component: AgentDirectoryEditComponent },
    ],
  },

  {
    path: 'skills',
    children: [
      { path: '', component: SkillsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule {}
