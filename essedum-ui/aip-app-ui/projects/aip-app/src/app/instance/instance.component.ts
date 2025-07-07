import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { TagsService } from '../services/tags.service';
import { AdapterServices } from '../adapter/adapter-service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { StreamingServices } from '../streaming-services/streaming-service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.scss'],
})
export class InstanceComponent implements OnInit, OnChanges {
  cardTitle: String = 'Instances';
  isSearchHovered: boolean = false;
  isAddHovered: boolean = false;
  isRefreshHovered: boolean = false;
  isMenuHovered: boolean = false;
  createAction = 'create';
  editAction = 'edit';
  test: any;
  cards: any;
  allCards: any;
  allCardsFiltered: any;
  options = [];
  alias = [];
  datasetTypes = [];
  OptionType: any;
  selectedInstance: any;
  keys: any = [];
  users: any = [];
  filt: any;
  selectedCard: any = [];
  cardToggled: boolean = true;
  pageSize: number;
  pageNumber: any;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 9, 18, 36, 54, 72];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  createAuth: boolean;
  editAuth: boolean;
  deleteAuth: boolean;
  deployAuth: boolean;
  category = [];
  tags;
  tagsBackup;
  allTags: any;
  tagStatus = {};
  catStatus = {};
  selectedTag = [];
  selectedConnectionNamesList: string[] = [];
  selectedAdapterList: string[] = [];
  servicev1: string = 'instances';
  records: boolean = false;
  chainName: any;
  streamItem: StreamingServices;
  isStopped: boolean = true;
  startPipeline: boolean;
  newCanvas: any;
  latest_job: boolean;
  isExpanded = false;
  tooltip: string = 'above';
  filtbackup: any = '';
  isTaggingVisible: boolean = true;
  tagrefresh: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: Services,
    private adapterServices: AdapterServices,
    private changeDetectionRef: ChangeDetectorRef,
    public tagService: TagsService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.getCards(this.pageNumber, this.pageSize);
    this.tagchange();
    this.updatePageSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSizeOnly();
  }

  updatePageSize() {
    this.pageSize = 0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16, 32, 48, 64, 80, 96];
      this.pageSize = this.pageSize || 16; // xl
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getCards(this.pageNumber, this.pageSize);
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs
      this.getCards(this.pageNumber, this.pageSize);
    }
  }

  ngOnInit(): void {
    this.updatePageSizeOnly();
    this.records = false;
    //this.updatePageSize();
    // this.pageSize=this.itemsPerPage[0];
    // this.pageNumber = 1;
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        this.selectedAdapterList = params['adapterList']
          ? params['adapterList'].split(',')
          : [];
        this.selectedConnectionNamesList = params['connectionsList']
          ? params['connectionsList'].split(',')
          : [];
        if (
          (this.selectedAdapterList && this.selectedAdapterList.length > 0) ||
          (this.selectedConnectionNamesList &&
            this.selectedConnectionNamesList.length > 0)
        ) {
          this.isExpanded = true;
        }
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.tagrefresh = false;
    this.updateQueryParam(this.pageNumber, this.filt);
    this.getCards(this.pageNumber, this.pageSize);
    if (this.pageNumber && this.pageNumber >= 5) {
      this.endIndex = this.pageNumber + 2;
      this.startIndex = this.endIndex - 5;
    } else {
      this.startIndex = 0;
      this.endIndex = 5;
    }
    this.Authentications();
    // this.getTags();
  }

  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
    }
  }
  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
    }
  }
  updateQueryParam(
    page: number = 1,
    search: string = '',
    adapterList: string = '',
    connectionsList: string = '',
    org: string = sessionStorage.getItem('organization') || '',
    roleId: string = (() => {
      const role = sessionStorage.getItem('role');
      return role ? JSON.parse(role).id : '';
    })()
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          adapterList: adapterList,
          connectionsList: connectionsList,
          org: org,
          roleId: roleId,
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) this.pageNumber = page;
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = this.startIndex ? this.startIndex : 0;
        this.endIndex = this.endIndex ? this.endIndex : 5;
      }
    }
    this.getCards(this.pageNumber, this.pageSize);
  }
  rowsPerPageChanged() {
    if (this.pageSize == 0) {
      this.pageSize = this.prevRowsPerPageValue;
    } else {
      this.pageSizeChanged.emit(this.pageSize);
      this.prevRowsPerPageValue = this.pageSize;
      this.changeDetectionRef.detectChanges();
    }
  }
  Authentications() {
    this.service.getPermission('cip').subscribe((cipAuthority) => {
      // instance-create permission
      if (cipAuthority.includes('instance-create')) this.createAuth = true;
      // instance-edit/update permission
      if (cipAuthority.includes('instance-edit')) this.editAuth = true;
      // instance-delete permission
      if (cipAuthority.includes('instance-delete')) this.deleteAuth = true;
    });
  }

  changedToogle(event: any) {
    this.refresh();
    this.cardToggled = event;
  }

  tagchange() {
    this.tagService.tags.forEach((element: any) => {});
  }

  // desc() {
  //   console.log("description");
  //   // this.router.navigate(["View/:cardTitle"],{relativeTo:this.route,state:{data:this.cardTitle}});
  //   this.router.navigate(["./view/" + this.cardTitle], { relativeTo: this.route });
  // }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  getCards(page?: any, size?: any): void {
    if (page) this.pageNumber = page;
    if (size) this.pageSize = size || 8;
    let timezoneOffset = new Date().getTimezoneOffset();
    this.adapterServices
      .getInstances(sessionStorage.getItem('organization'))
      .subscribe((res) => {
        let data: any = [];
        let test = res;
        test.forEach((element: any) => {
          element.createdon = new Date(
            new Date(element.createdon).getTime() - timezoneOffset * 60 * 1000
          );
          data.push(element);
          this.users.push(element.name);
        });
        this.cards = data;
        this.allCards = data;
        this.allCardsFiltered = data;
        this.filterSelectedCards(page, size);
      });
  }

  desc(card: any) {
    this.router.navigate(['../instances/' + card.name], {
      queryParams: {
        page: this.pageNumber,
        search: this.filt,
        adapterList: this.selectedAdapterList.toString(),
        // adapterInstance: this.selectedAdapterInstance.toString(),
        org: sessionStorage.getItem('organization'),
        roleId: JSON.parse(sessionStorage.getItem('role')).id,
      },
      queryParamsHandling: 'merge',
      relativeTo: this.route,
    });
  }

  redirect(card: any, type: string) {
    this.router.navigate(['./create'], {
      queryParams: {
        page: this.pageNumber,
        search: this.filt,
        adapterList: this.selectedAdapterList.toString(),
        // adapterInstance: this.selectedAdapterInstance.toString(),
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

  filterSelectedCards(page: any, size?: any) {
    this.tagrefresh = false;
    if (
      this.selectedConnectionNamesList.length > 0 ||
      this.selectedAdapterList.length > 0
    ) {
      let data: any = [];
      if (this.selectedAdapterList.length > 0) {
        this.selectedAdapterList.forEach((element: any) => {
          this.allCards.forEach((ele: any) => {
            if (ele.adaptername === element) {
              if (!data.some((item: any) => item.name === ele.name)) {
                data.push(ele);
              }
            }
          });
        });
      }

      if (this.selectedConnectionNamesList.length > 0) {
        this.selectedConnectionNamesList.forEach((element: any) => {
          this.allCards.forEach((ele: any) => {
            if (ele.connectionname === element) {
              if (!data.some((item: any) => item.name === ele.name)) {
                data.push(ele);
              }
            }
          });
        });
      }

      this.allCardsFiltered = data;
    } else {
      this.allCardsFiltered = this.allCards;
    }
    this.cards = this.allCardsFiltered;
    if (this.cards.length == 0) {
      this.records = true;
    } else {
      this.records = false;
    }
    if (this.filt.length >= 1) {
      this.filterz();
    } else {
      this.filt = '';
    }
    if (page) this.pageNumber = page;
    this.updateQueryParam(
      this.pageNumber,
      this.filt,
      this.selectedAdapterList?.toString() ?? '',
      this.selectedConnectionNamesList?.toString() ?? ''
    );
    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
  }
  filterz() {
    if (this.filt.length != this.filtbackup.length) {
      this.pageNumber = 1;
      this.filtbackup = this.filt;
    }
    let data: any = [];
    this.allCardsFiltered.forEach((element: any) => {
      if (element.name.toLowerCase().includes(this.filt.toLowerCase())) {
        data.push(element);
      }
    });
    this.cards = data;
    if (this.cards.length == 0) {
      this.records = true;
    } else {
      this.records = false;
    }

    this.noOfItems = this.cards.length;
    this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
    this.pageArr = [...Array(this.noOfPages).keys()];
    // this.pageNumber=1;

    this.updateQueryParam(this.pageNumber, this.filt);
  }
  getTags() {
    this.tags = {};
    this.tagsBackup = {};
    // this.category.push("platform")
    this.service.getMlTags().subscribe((resp) => {
      this.allTags = resp;
      resp.forEach((tag) => {
        if (this.category.indexOf(tag.category) == -1) {
          this.category.push(tag.category);
        }
        this.tagStatus[tag.category + ' - ' + tag.label] = false;
      });
      this.category.forEach((cat) => {
        this.tags[cat] = this.allTags
          .filter((tag) => tag.category == cat)
          .slice(0, 10);
        this.tagsBackup[cat] = this.allTags.filter(
          (tag) => tag.category == cat
        );
        this.catStatus[cat] = false;
      });
    });
  }
  showMore(category) {
    this.catStatus[category] = !this.catStatus[category];
    if (this.catStatus[category])
      this.tags[category] = this.allTags.filter(
        (tag) => tag.category == category
      );
    else
      this.tags[category] = this.allTags
        .filter((tag) => tag.category == category)
        .slice(0, 10);
  }
  filterByTag(tag) {
    this.tagStatus[tag.category + ' - ' + tag.label] =
      !this.tagStatus[tag.category + ' - ' + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    } else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1);
    }
  }

  tagSelectedEvent(event) {
    this.pageNumber = 1;
    this.selectedConnectionNamesList =
      event.getSelectedMlInstanceConnectionType();
    this.selectedAdapterList = event.getSelectedMlInstanceAdapterType();
    this.filterSelectedCards(this.pageNumber);
  }

  openedit(content: any): void {
    this.dialog.open(content, {
      width: '830px',
      panelClass: 'standard-dialog',
    });
  }

  refresh() {
    this.getCards(this.pageNumber, this.pageSize);
    this.filterSelectedCards(this.pageNumber, this.pageSize);
  }

  deleteInstance(instanceName: string) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.adapterServices.deleteInstance(instanceName).subscribe(
          (res) => {
            if (res) {
              if (res.message == 'success') {
                this.adapterServices.messageNotificaionService(
                  'success',
                  'Done!  Instance Deleted Successfully'
                );
              } else
                this.adapterServices.messageNotificaionService(
                  'warning',
                  "Instance Can't be Deleted"
                );
            } else
              this.adapterServices.messageNotificaionService('error', 'Error');
            this.refresh();
          },
          (error) => {
            this.service.messageService(error);
          }
        );
      }
    });
  }

  selectedButton(i) {
    if (i == this.pageNumber) return { color: 'white', background: '#0094ff' };
    else return { color: 'black' };
  }

  startChain(data) {
    this.adapterServices
      .getAdapteByNameAndOrganization(data.adaptername)
      .subscribe((resp) => {
        this.chainName = resp.chainName;
        this.service
          .getStreamingServicesByName(this.chainName, resp.organization)
          .subscribe((response) => {
            this.streamItem = response;
            this.service
              .savePipelineJSON(
                this.streamItem.name,
                this.streamItem.json_content
              )
              .subscribe(
                (res) => {
                  this.service.message('Saving Pipeline Json!', 'success');
                  this.triggerEvent(res.path, data);
                },
                (error) => {
                  this.service.message('Could not save the file', 'error');
                }
              );
          });
      });
  }

  triggerEvent(path, data) {
    let body = { pipelineName: this.streamItem.name, scriptPath: path[0] };
    this.service
      .triggerPostEvent('generateScript_' + this.streamItem.type, body, '')
      .subscribe(
        (resp) => {
          this.service.message('Generating Script!', 'success');
          this.service.getEventStatus(resp).subscribe((status) => {
            if (status == 'COMPLETED') this.runScript(data);
            else {
              this.service.message('Script is not generated.', 'error');
            }
          });
        },
        (error) => {
          this.service.message('Error! Could not generate script.', 'error');
        }
      );
  }

  runScript(data) {
    let passType = '';
    if (
      this.streamItem.type != 'Binary' &&
      this.streamItem.type != 'NativeScript'
    )
      passType = 'DragAndDrop';
    else passType = this.streamItem.type;
    data.status = 'RUNNING';
    var createdon = data.createdon;
    var lastmodifiedon = data.lastmodifiedon;
    delete data.createdon;
    delete data.lastmodifiedon;

    this.adapterServices.updateInstance(data).subscribe((resp) => {
      console.log('Instance Updated');
    });
    this.service
      .runPipeline(
        this.streamItem.alias ? this.streamItem.alias : this.streamItem.name,
        this.streamItem.name,
        passType,
        'REMOTE',
        data.runtimename,
        'generated'
      )
      .subscribe(
        (res) => {
          console.log('Pipeline Started!!!! ');
          this.service.message('Pipeline has been Started!', 'success');
          var jobData = JSON.parse(res);
          let job_id = jobData.jobId;
          data.jobid = job_id.replaceAll('-', '');
          data.status = jobData.status;
          data.status = 'RUNNING';
          this.adapterServices.updateInstance(data).subscribe((resp) => {
            console.log('Instance Updated');
          });
          data.createdon = createdon;
          data.lastmodifiedon = lastmodifiedon;
          this.service
            .getStreamingServicesByName(this.chainName, data.organization)
            .subscribe((response) => {
              this.newCanvas = JSON.parse(response.json_content);
              this.newCanvas['latest_jobid'] = job_id;
              response.json_content = JSON.stringify(this.newCanvas);
              this.service.update(response).subscribe((response) => {
                this.latest_job = true;
              });
            });
          data.createdon = createdon;
          data.lastmodifiedon = lastmodifiedon;
        },
        (error) => {
          this.service.message('Some error occured.', 'error');
        }
      );
  }
  stopJob(data) {
    this.service.stopPipeline(data.jobid).subscribe(
      (response) => {
        this.service.message('Stop App Triggered!', 'success');
        data.status = 'CANCELLED';
        var createdon = data.createdon;
        var lastmodifiedon = data.lastmodifiedon;
        delete data.createdon;
        delete data.lastmodifiedon;

        this.adapterServices.updateInstance(data).subscribe((resp) => {
          console.log('Instance Updated');
        });
        data.createdon = createdon;
        data.lastmodifiedon = lastmodifiedon;
      },
      (error) => {
        this.service.message('Error!', 'error');
      }
    );
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  toggler(isExpanded: boolean) {
    if (isExpanded) {
      return { width: '80%', margin: '0 0 0 20%' };
    } else {
      return { width: '100%', margin: '0%' };
    }
  }

  triggereRefresh($event) {
    if ($event) this.ngOnInit();
  }

  refreshData() {
    this.records = false;
    this.tagrefresh = true;
    this.updateQueryParam(1, '', '');
    this.selectedAdapterList = [];
    this.selectedConnectionNamesList = [];
    this.selectedTag = [];
    this.filt = '';
    this.pageSize = 8;
    this.ngOnInit();
  }

  completeRefresh() {
    this.filt = '';
    this.tagrefresh = true;
    if (!this.isExpanded) {
      this.selectedAdapterList = [];
      this.selectedConnectionNamesList = [];
      this.updateQueryParam(1, '', '', '');
      this.pageNumber = 1;
      this.filt = '';
      this.tagrefresh = true;
      this.updatePageSize();
    }
  }

  updatePageSizeOnly() {
    this.pageSize = 0;
    if (window.innerWidth > 1440) {
      this.itemsPerPage = [10, 20, 40, 60, 80, 100];
      this.pageSize = this.pageSize || 10; // lg
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [8, 16, 32, 48, 64, 80];
      this.pageSize = this.pageSize || 8; //md
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
    } else if (window.innerWidth < 768) {
      this.itemsPerPage = [4, 8, 12, 16, 20, 24];
      this.pageSize = this.pageSize || 4; //xs
    }
  }
}
