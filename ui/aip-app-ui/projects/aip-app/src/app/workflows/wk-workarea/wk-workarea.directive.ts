import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[workarea]'
})
export class WorkareaDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
