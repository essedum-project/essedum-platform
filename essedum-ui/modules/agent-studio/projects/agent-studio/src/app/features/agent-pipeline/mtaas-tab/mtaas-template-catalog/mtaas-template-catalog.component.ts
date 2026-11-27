import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MtaasProblemDetails, MtaasService, MtaasTemplate, mapProblemDetails } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-template-catalog',
  templateUrl: './mtaas-template-catalog.component.html',
  styleUrls: ['./mtaas-template-catalog.component.scss'],
  standalone: false,
})
export class MtaasTemplateCatalogComponent implements OnInit, OnDestroy {
  @Input() search = '';
  @Output() details = new EventEmitter<MtaasTemplate>();
  @Output() back = new EventEmitter<void>();

  templates: MtaasTemplate[] = [];
  framework = '';
  loading = false;
  problem: MtaasProblemDetails | null = null;

  // One stable card model per template: app-aip-card mutates `hover` on it.
  private cardModels = new Map<number, Record<string, unknown>>();

  private destroy$ = new Subject<void>();

  constructor(private service: MtaasService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get frameworks(): string[] {
    return Array.from(new Set(this.templates.map((t) => t.framework))).sort();
  }

  get visibleTemplates(): MtaasTemplate[] {
    const term = (this.search || '').toLowerCase().trim();
    return this.templates.filter(
      (t) =>
        (!this.framework || t.framework === this.framework) &&
        (!term ||
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(term)))
    );
  }

  /**
   * Maps a template onto the shared agent-pipeline card model. `type: 'TrainingPipeline'`
   * gives the card its existing "Training Pipeline" badge; `alias` is the title.
   */
  cardFor(template: MtaasTemplate): Record<string, unknown> {
    let card = this.cardModels.get(template.id);
    if (!card) {
      card = {
        alias: template.name,
        type: 'TrainingPipeline',
        createdBy: template.framework,
        description: template.description,
        version: template.version,
        enabled: template.enabled,
        hover: false,
      };
      this.cardModels.set(template.id, card);
    }
    return card;
  }

  trackById(_: number, template: MtaasTemplate): number {
    return template.id;
  }

  load(): void {
    this.loading = true;
    this.problem = null;
    this.service
      .getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          this.templates = templates;
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
}
