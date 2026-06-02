import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VibeStudioComponent } from '../features/vibe-studio/vibe-studio/vibe-studio.component';
import { EnlCodeEditorComponent } from '../features/enl-code-editor/enl-code-editor.component';
import { NativeScriptComponent } from '../features/native-script/native-script.component';
import { SpecTemplateComponent } from '../features/spec-template/spec-template.component';
import { CreateSpecTemplateComponent } from '../features/spec-template/create-spec-template/create-spec-template.component';
import { EditSpecTemplateComponent } from '../features/spec-template/edit-spec-template/edit-spec-template.component';
import { SpecTemplateDescriptionComponent } from '../features/spec-template/spec-template-description/spec-template-description.component';

// Routes mount under `/vibe/**` per the host manifest (vibe-studio.routePath = 'vibe').
const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },

  {
    path: 'editor',
    children: [
      { path: '', component: VibeStudioComponent },
    ],
  },

  {
    path: 'code-editor',
    children: [
      { path: '', component: EnlCodeEditorComponent },
    ],
  },

  {
    path: 'scripts',
    children: [
      { path: '', component: NativeScriptComponent },
      { path: 'view/:cname', component: NativeScriptComponent },
    ],
  },

  {
    path: 'spec-templates',
    children: [
      { path: '', component: SpecTemplateComponent },
      { path: 'create', component: CreateSpecTemplateComponent },
      { path: 'edit/:dname', component: EditSpecTemplateComponent },
      { path: ':cname', component: SpecTemplateDescriptionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntryRoutingModule {}
