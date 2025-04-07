import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LedsLibService } from 'leds-lib';
import { PaginationComponent } from '../../pagination/pagination.component';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent {
  cardTitle: String = 'Agent';
  filter: string = '';
  servicev1 = 'agent';
  createAuth: boolean = true;
  editAuth: boolean = true;
  deleteAuth: boolean = true;
  cards: any[] = [];
  pageNumber: number;
  pageSize: number;
  noOfItems: number = 100;
  alias = ['agent1','agent2','agent3'];
  selectedInstance: string;
  options = [];
  @ViewChild('pagination') paginationComponent: PaginationComponent;

  constructor(
    private ledsLibService: LedsLibService,
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private location: Location
  ) { }

  ngOnInit() {
  //  this.cards;
  }
  resetPage(page: number) {
    this.paginationComponent.changePage(page);
  }
  getList() {
    let params: HttpParams = new HttpParams();
    // params = params.set('page', this.pageNumber);
    // params = params.set('size', this.pageSize);
    // if (this.filter.length >= 1) params = params.set('query', this.filter);
    // if (this.selectedAdapterType.length >= 1) {
    //   params = params.set('type', this.selectedAdapterType.toString());
    //   //  this.setQueryParam('type',this.selectedAdapterType.toString());
    // }
    // if (this.selectedTag.length >= 1)
    //   params = params.set('tags', this.selectedTag.toString());
    // if (this.selectedAdapterInstance.length >= 1) {
    //   this.instance = this.selectedAdapterInstance;
    //   params = params.set('instance', this.selectedAdapterInstance.toString());
    //   //  this.setQueryParam('Instance',this.selectedAdapterInstance.toString())
    // }
    // else{
    //   this.instance=this.adapterInstance;
    //   params = params.set('adapter_instance', this.instance)
    //   }
    params = params.set('project', sessionStorage.getItem('organization'));
  //  params = params.set('isCached', true);
    params =params.set('adapter','LEODGBRN60469')

    this.service.getAgentList(params).subscribe((res: any) => {
      let data: any = [];
      res.forEach((element) => {
        data.push(element);
      });
      this.cards = data;
      console.log('agentList', this.cards);
      // this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      // this.pageArr = [...Array(this.noOfPages).keys()];
      // console.log(this.pageArr, 'pageArr');
      // console.log(this.noOfPages, 'noOfPages');
    });
  //  this.pageSize = this.pageSize || 6;
    // this.updateQueryParam(
    //   this.pageNumber,
    //   this.filter,
    //   this.selectedAdapterType.toString(),
    //   this.selectedAdapterInstance.toString()
    // )
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    type: string = '',
    adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          type: type,
          adapterInstance: adapterInstance,
          org: org,
          roleId: roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }
  handlePageAndSizeChange(event: { pageNumber: number; pageSize: number }) {
    // Handle the updated pageNumber and pageSize here
    console.log('Page number:', event.pageNumber);
    console.log('Page size:', event.pageSize);
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.getList();
  }

  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  selectChange(value: string): void {
    this.selectedInstance = value;
    this.redirect();
  }
  redirect() {
    // this.options.forEach((element: any) => {
    //   if (element.alias === this.selectedInstance) {
    //     this.selectedInstance = element.name;
    //     this.InstanceName = element.instanceName;
    //   }
    // });
    this.router.navigate(['./view', this.cardTitle, this.selectedInstance], {
      relativeTo: this.route,
      // queryParams: { InstanceName: this.InstanceName },
    });
  }
  deleteDGApp(card) { }
  redirection(card: any, type: any) {
    this.router.navigate(['./' + type + '/' + card.agentName], {
      queryParams: {
        page: this.pageNumber,
        search: this.filter,
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      state: {
        card,
      },
      relativeTo: this.route,
    });
   }
  filterz() {
    this.getList();
  }
  refreshComplete() {
    this.filter = "";
    this.resetPage(1);
    this.getList();
  }
}
