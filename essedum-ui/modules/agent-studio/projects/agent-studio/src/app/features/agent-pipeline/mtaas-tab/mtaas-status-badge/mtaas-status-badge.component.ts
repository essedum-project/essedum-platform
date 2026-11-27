import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MtaasRunState } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-status-badge',
  templateUrl: './mtaas-status-badge.component.html',
  styleUrls: ['./mtaas-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MtaasStatusBadgeComponent {
  @Input() state: MtaasRunState | string = 'PENDING';
  @Input() queuePosition?: number;

  get label(): string {
    const value = String(this.state || 'pending').toUpperCase();
    const text = value.charAt(0) + value.slice(1).toLowerCase();
    return value === 'QUEUED' && this.queuePosition ? `${text} · #${this.queuePosition}` : text;
  }

  get cssClass(): string {
    return 'status-' + String(this.state || 'pending').toLowerCase();
  }
}
