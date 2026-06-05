import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  DATA_PIPELINE_SNIPPETS,
  TRAINING_SNIPPETS,
  SnippetCategory,
} from './snippet-library.constants';

@Component({
    selector: 'app-function-library',
    template: `
    <div class="fn-lib">
      <header class="fn-head">
        <mat-icon>auto_stories</mat-icon>
        <span>Function Library</span>
      </header>
      <mat-form-field appearance="outline" class="fn-search">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="query" placeholder="Search functions..." />
      </mat-form-field>
      <div class="fn-cats">
        <details *ngFor="let c of filtered" [open]="openCat === c.label">
          <summary (click)="openCat = c.label" [style.borderLeftColor]="c.color">
            <mat-icon [style.color]="c.color">{{ c.icon }}</mat-icon>
            <span>{{ c.label }}</span>
            <span class="count">{{ c.fns.length }}</span>
          </summary>
          <button class="fn-row" *ngFor="let fn of c.fns" (click)="insert.emit(fn.snippet)">
            <span class="fn-name">{{ fn.name }}</span>
            <span class="fn-desc">{{ fn.desc }}</span>
          </button>
        </details>
      </div>
    </div>
  `,
    styles: [`
    :host { display:block; height:100%; }
    .fn-lib { display:flex; flex-direction:column; height:100%; background:#0f172a; color:#e5e7eb; padding:10px; }
    .fn-head { display:flex; align-items:center; gap:8px; font-weight:600; margin-bottom:8px; color:#a5b4fc; }
    .fn-search { width:100%; ::ng-deep .mat-mdc-text-field-wrapper { background:#1e293b; } }
    .fn-cats { overflow-y:auto; flex:1; }
    details { margin-bottom:6px; border:1px solid #1e293b; border-radius:6px; overflow:hidden; }
    summary { display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer; background:#0b1220; border-left:3px solid transparent; }
    summary mat-icon { font-size:18px; height:18px; width:18px; }
    summary .count { margin-left:auto; font-size:11px; color:#94a3b8; }
    .fn-row { display:block; width:100%; text-align:left; background:transparent; border:0; padding:8px 12px;
              color:#cbd5e1; cursor:pointer; border-top:1px solid #1e293b; }
    .fn-row:hover { background:#1e293b; color:#fff; }
    .fn-name { display:block; font-family:'Fira Code',monospace; font-size:12px; color:#a5b4fc; }
    .fn-desc { display:block; font-size:11px; color:#94a3b8; }
  `],
    standalone: false
})
export class FunctionLibraryComponent implements OnInit {
  @Input() kind: 'data-pipeline' | 'training-job' = 'data-pipeline';
  @Output() insert = new EventEmitter<string>();

  query = '';
  openCat = '';
  cats: SnippetCategory[] = [];

  ngOnInit(): void {
    this.cats = this.kind === 'training-job' ? TRAINING_SNIPPETS : DATA_PIPELINE_SNIPPETS;
    this.openCat = this.cats[0]?.label || '';
  }

  get filtered(): SnippetCategory[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.cats;
    return this.cats
      .map(c => ({ ...c, fns: c.fns.filter(f =>
        f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)) }))
      .filter(c => c.fns.length);
  }
}
