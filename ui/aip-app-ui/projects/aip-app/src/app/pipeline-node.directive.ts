import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[pipelinenode]',
})
export class PipelinenodeDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }

}