import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MtaasResources } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-resource-summary',
  templateUrl: './mtaas-resource-summary.component.html',
  styleUrls: ['./mtaas-resource-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MtaasResourceSummaryComponent {
  @Input() resources: MtaasResources | null = null;

  get gpuLabel(): string {
    if (this.resources && this.resources.gpus > 0) {
      return `${this.resources.gpus} x ${this.resources.gpuType || 'GPU'}`;
    }
    return 'CPU only';
  }

  get cpuLabel(): string {
    return this.resources?.cpu ? `${this.resources.cpu} vCPU` : '-';
  }

  get memoryLabel(): string {
    return this.resources?.memory || '-';
  }
}
