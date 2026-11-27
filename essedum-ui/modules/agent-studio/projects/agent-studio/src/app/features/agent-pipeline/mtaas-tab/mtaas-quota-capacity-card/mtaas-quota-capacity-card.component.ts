import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MtaasQuotaCapacity } from '../mtaas.service';

@Component({
  selector: 'app-mtaas-quota-capacity-card',
  templateUrl: './mtaas-quota-capacity-card.component.html',
  styleUrls: ['./mtaas-quota-capacity-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MtaasQuotaCapacityCardComponent {
  @Input() quota: MtaasQuotaCapacity | null = null;
  @Input() estimatedWaitMinutes?: number;
  @Input() queuePosition?: number;

  get estimatedWait(): number | undefined {
    return this.estimatedWaitMinutes ?? this.quota?.estimatedWaitMinutes;
  }

  get cpuPercent(): number {
    return this.percent(this.toNumber(this.quota?.usedCpu), this.toNumber(this.quota?.quotaCpu));
  }

  get memoryPercent(): number {
    return this.percent(this.toNumber(this.quota?.usedMemory), this.toNumber(this.quota?.quotaMemory));
  }

  get gpuPercent(): number {
    return this.percent(this.quota?.usedGpus ?? 0, this.quota?.quotaGpus ?? 0);
  }

  get cpuLabel(): string {
    return `${this.quota?.usedCpu ?? '0'} / ${this.quota?.quotaCpu ?? '0'}`;
  }

  get memoryLabel(): string {
    return `${this.quota?.usedMemory ?? '0'} / ${this.quota?.quotaMemory ?? '0'}`;
  }

  get gpuLabel(): string {
    return `${this.quota?.usedGpus ?? 0} / ${this.quota?.quotaGpus ?? 0} GPU`;
  }

  private percent(used: number, quota: number): number {
    return quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  }

  private toNumber(value: string | number | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
}
