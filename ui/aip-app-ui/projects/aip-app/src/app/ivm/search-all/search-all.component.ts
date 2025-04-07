import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-all',
  templateUrl: './search-all.component.html',
  styleUrls: ['./search-all.component.scss'],
})
export class SearchAllComponent implements OnInit {
  groupData: { [key: string]: any[] } = {};
  resultObserver: any;
  groupkey: any[] = [];
  size: number = 8;
  page: number = 0;
  search: any = '';
  searcedFor: any='';
  selectedGroup: any = 'DATASET';
  protected subscriptions: Subscription[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private cdref: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getArtifacts();
  }
  navigateBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  fetchmore() {
    this.page = this.page + 1;
    this.getArtifacts(this.searcedFor);
  }
  changesOccur() {
    this.groupData = {};
    this.getArtifacts(this.search);
    this.searcedFor = this.search;
    this.search = '';
    this.page = 0;
    // this.ngOnInit();
  }
  selectionChange(event: any) {
    this.selectedGroup = event;
  }
  getArtifacts(fetch?: any) {
    let search = '';
    if (fetch) {
      search = fetch;
    }
    const subscription = this.service
      .getCommonSearchData(this.size, this.page, search)
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
  data_flux_type(type: any) {
    let page = Math.ceil(this.groupData[type].length / this.size + 1);
    this.service.commonSearchByType(type, this.size, page).subscribe({
      next: (val) => {
        if (this.resultObserver.length > 0) {
          this.resultObserver = val;
          this.groupData[this.resultObserver[0].type].push(
            // this.resultObserver[0]
            {
              data: JSON.parse(this.resultObserver[0].data),
              status: false,
              type_nav: this.resultObserver[0].type,
            }
          );
        }
        this.cdref.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {},
    });
  }
}
