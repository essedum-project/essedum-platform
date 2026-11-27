import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MtaasProblemDetails,
  MtaasResources,
  MtaasRunDetail,
  MtaasService,
  mapProblemDetails,
} from '../mtaas.service';

@Component({
  selector: 'app-mtaas-run-detail',
  templateUrl: './mtaas-run-detail.component.html',
  styleUrls: ['./mtaas-run-detail.component.scss'],
  standalone: false,
})
export class MtaasRunDetailComponent implements OnInit {
  run: MtaasRunDetail | null = null;
  loading = false;
  problem: MtaasProblemDetails | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { runId: string },
    private service: MtaasService,
    private dialogRef: MatDialogRef<MtaasRunDetailComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get resources(): MtaasResources | null {
    return this.run
      ? { gpus: this.run.gpus, gpuType: this.run.gpuType, cpu: this.run.cpu, memory: this.run.memory }
      : null;
  }

  get paramEntries(): { key: string; value: unknown }[] {
    return Object.keys(this.run?.params ?? {}).map((key) => ({ key, value: this.run!.params[key] }));
  }

  load(): void {
    this.loading = true;
    this.problem = null;
    this.service.getRun(this.data.runId).subscribe({
      next: (run) => {
        this.run = run;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.problem = mapProblemDetails(err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  clone(): void {
    this.dialogRef.close({ clone: this.run });
  }

  close(): void {
    this.dialogRef.close();
  }
}
