import { Component, OnInit } from '@angular/core';
import { combineLatest, switchMap, map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { UserContextService } from '../../core/user-context.service';
import { AssetVersion, PromotionGate } from '../../core/api-models';

interface AssetVersionRow extends AssetVersion {
  assetName: string;
}

@Component({
  selector: 'app-publishing',
  templateUrl: './publishing.component.html',
  styleUrls: ['./publishing.component.scss'],
  standalone: false,
})
export class PublishingComponent implements OnInit {
  versions: AssetVersionRow[] = [];

  readonly columns = ['assetName', 'versionNo', 'status', 'updatedAt', 'actions'];

  constructor(
    private readonly api: ApiService,
    private readonly userContext: UserContextService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.userContext.userId$
      .pipe(
        switchMap(userId =>
          combineLatest([this.api.getDraftVersions(userId), this.api.getAssets(userId)]),
        ),
        map(([versions, assets]) =>
          versions.map(v => ({
            ...v,
            assetName: assets.find(a => a.id === v.assetId)?.name ?? `Asset #${v.assetId}`,
          })),
        ),
      )
      .subscribe(rows => (this.versions = rows));
  }

  // The next gate a draft/rejected version is submitted to; §5 state machine.
  submit(version: AssetVersionRow): void {
    const gate: PromotionGate = 'project_admin';
    const userId = this.userContext.userId$.value;
    this.api
      .submitVersion(version.id, { gate, actorId: userId, actorName: `User #${userId}`, note: '' })
      .subscribe(() => this.load());
  }

  canSubmit(version: AssetVersionRow): boolean {
    return version.status === 'draft' || version.status === 'rejected';
  }
}

