import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Services } from '../../../services/service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-initiative-actifact-details',
  templateUrl: './initiative-actifact-details.component.html',
  styleUrls: ['./initiative-actifact-details.component.scss'],
})
export class InitiativeActifactDetailsComponent implements OnInit, OnChanges {
  data: any;
  @Input() dataType: any;
  constructor(
    private service: Services,
    private cdref: ChangeDetectorRef,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (sessionStorage.getItem('sbxBreadcrumb')!=='null') {
      let sbxBreadcrumb = (JSON.parse(sessionStorage.getItem('sbxBreadcrumb'))).breadcrumb;
      this.breadcrumbs.push(sbxBreadcrumb);
    } else {
      this.breadcrumbs.push({ label: 'My Solutions', url: '../../../' });
    }
  }
  resultObserver: any;
  groupkey: any[] = [];
  groupData: { [key: string]: any[] } = {};
  @Input() initiativeId: any;
  @Input() selectArtifact: any;
  protected subscriptions: Subscription[] = [];
  breadcrumbs: any[] = [];
  ngOnInit(): void {
    // this.getArtifacts();
    this.breadcrumbs.push({
      label: this.selectArtifact.alias,
      url: '/',
    });
    this.cdref.detectChanges();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.data = this.selectArtifact.data;
  }
  back() {
    this.location.back();
  }
  getArtifacts() {
    const subscription = this.service
      .getRelatedComponent(this.initiativeId, 'INITIATIVE')
      .subscribe({
        next: (val) => {
          this.resultObserver = val;
          if (this.resultObserver.length > 0) {
            if (!this.groupData[this.resultObserver[0].type]) {
              this.groupData[this.resultObserver[0].type] = [];
            }

            this.groupData[this.resultObserver[0].type].push({
              // data: this.resultObserver[0],
              data: JSON.parse(this.resultObserver[0].data),
              status: false,
              type_nav: this.resultObserver[0].type,
            });

            this.groupkey = Object.keys(this.groupData);

            this.cdref.detectChanges();
          }
        },
        error: (err) => {
          console.log(err);
        },
      });

    this.subscriptions.push(subscription);
  }
}
