import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { JobsComponent } from "../../../../jobs/jobs.component";
import { WizardPipelineModel } from "../pipeline-editor.component";

@Component({
    selector: "app-run-history-tab",
    template: `
    <div class="rh-shell">
      <app-jobs *ngIf="model?.name" [cname]="model.name"></app-jobs>
    </div>
  `,
    styles: [`
    :host { display: block; }
    .rh-shell { padding: 0; }
  `],
    standalone: false
})
export class RunHistoryTabComponent implements OnChanges {
  @Input() model: WizardPipelineModel;

  @ViewChild(JobsComponent) private jobsComp: JobsComponent;

  ngOnChanges(_: SimpleChanges): void {
    // app-jobs loads itself via ngOnInit — no manual fetch needed on input change
  }

  refresh(): void {
    this.jobsComp?.onRefresh();
  }
}


