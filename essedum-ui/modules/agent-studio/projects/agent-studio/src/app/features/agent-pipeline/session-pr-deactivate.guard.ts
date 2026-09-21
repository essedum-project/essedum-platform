import { CanDeactivateFn } from '@angular/router';
import { AgentPipelineComponent } from './agent-pipeline.component';

/**
 * Guards navigation AWAY from the pipeline editor (switching to a different
 * pipeline, or to a completely different screen/module). If the current
 * editing session created a session branch that hasn't been merged back yet
 * (see `AgentPipelineComponent.activeSessionBranch`), the user is prompted to
 * either raise a Pull Request now or skip (keeping the same session branch
 * for later). Navigation itself is never blocked — this only decides whether
 * a PR gets raised before leaving.
 */
export const sessionPrDeactivateGuard: CanDeactivateFn<AgentPipelineComponent> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
