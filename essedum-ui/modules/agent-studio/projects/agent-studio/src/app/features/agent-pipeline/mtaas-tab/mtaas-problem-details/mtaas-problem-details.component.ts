import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MtaasProblemDetails } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-problem-details',
  templateUrl: './mtaas-problem-details.component.html',
  styleUrls: ['./mtaas-problem-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MtaasProblemDetailsComponent {
  @Input() problem: MtaasProblemDetails | null = null;
  @Input() retryable = false;
  @Output() retry = new EventEmitter<void>();

  get fieldErrors(): { field: string; messages: string[] }[] {
    const entries = this.problem?.fieldErrors ?? {};
    return Object.keys(entries).map((field) => ({ field, messages: entries[field] }));
  }
}
