import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RelationshipService } from '../../services/relationship.service';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog.component/confirm-delete-dialog.component';
import { Services } from '../../services/service';
import { Relationship } from '../relationship';
import { LedsLibService } from 'leds-lib';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-relationship',
  templateUrl: './relationship.component.html',
  styleUrls: ['./relationship.component.scss']
})
export class RelationshipComponent implements OnInit {

  filt: any;
  pageSize: number;
  pageNumber: number;
  pageArr: number[] = [];
  pageNumberInput: number = 1;
  noOfPages: number = 0;
  prevRowsPerPageValue: number;
  itemsPerPage: number[] = [6, 12, 18, 24, 30, 36];
  noOfItems: number;
  @Output() pageChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<any>();
  endIndex: number;
  startIndex: number;
  pageNumberChanged: boolean = true;
  createAuth: boolean = true;
  relationships: any = [];

  create: boolean = false;
  edit: boolean = false;
  view: boolean = false;
  schemas: [];
  schemaList: any;
  schemaListChild: any;
  relationship: any = {};
  parentSchemaDetails = [];
  parentSchemaDetailsList: any;
  childSchemaDetails = [];
  childSchemaDetailsList: any;
  org: string;

  constructor(
    private telemetry: OpenTelemetryService,
    private dialog: MatDialog,
    private changeDetectionRef: ChangeDetectorRef,
    private relationService: RelationshipService,
    private service: Services,
    private ledsLibService: LedsLibService,  private location: Location,private route: ActivatedRoute,
    private router: Router,
  ) {
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updatePageSize();
  }
  updatePageSize() {
    this.pageSize=0;
    if (window.innerWidth > 2500) {
      this.itemsPerPage = [16,32,48,64,80,96];
      this.pageSize = this.pageSize || 16; // xl
      this.getAllRelationships();
    }
    else if (window.innerWidth > 1440 && window.innerWidth <= 2500) {
      this.itemsPerPage = [12, 24, 36, 48, 60, 72];
      this.pageSize = this.pageSize || 12; // lg
      this.getAllRelationships();
    } else if (window.innerWidth > 1024 && window.innerWidth <= 1440) {
      this.itemsPerPage = [9,18,27,36,45,54];
      this.pageSize = this.pageSize || 9; //md
      this.getAllRelationships(); 
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.itemsPerPage = [6, 9, 18, 36, 54, 72];
      this.pageSize = this.pageSize || 6; //sm
      this.getAllRelationships();
    } else if (window.innerWidth < 768 ) {
      this.itemsPerPage = [4,8,12,16,20,24];
      this.pageSize = this.pageSize || 4; //xs
      this.getAllRelationships();
    }
  }
  telemetryCall(){
    this.telemetry.startTelemetry('aip-app','RelationshipComponent',sessionStorage.getItem('organization'))
  }
  ngOnInit() {
    this.telemetryCall();
    // this.pageSize = this.itemsPerPage[0];
    // this.pageNumber = 1;
    this.route.queryParams.subscribe((params) => {
      // Update this.pageNumber if the page query param is present
      if (params['page']) {
        this.pageNumber = params['page'];
        this.filt = params['search'];
        // this.selectedAdapterType = params['type']
        //   ? params['type'].split(',')
        //   : [];
        // this.selectedAdapterInstance = params['adapterInstance']
        //   ? params['adapterInstance'].split(',')
        //   : [];
      } else {
        this.pageNumber = 1;
        this.filt = '';
      }
    });
    this.updateQueryParam(this.pageNumber);
    this.org = sessionStorage.getItem("organization");
    // this.getAllRelationships();
    this.updatePageSize();
    if (this.pageNumberChanged) {
      // this.pageNumber = 1;
      this.startIndex = 0;
      this.endIndex = 5;
    }
  }
 updateQueryParam(
    page: number = 1,
    search: string = '',
    // adapterType: string = '',
    // adapterInstance: string = '',
    org: string = sessionStorage.getItem('organization'),
    roleId: string = JSON.parse(sessionStorage.getItem('role')).id
  ) {
    const url = this.router
      .createUrlTree([], {
        queryParams: {
          page: page,
          search: search,
          // type: adapterType,
          // adapterInstance: adapterInstance,
          org: org,
          roleId:roleId
        },
        queryParamsHandling: 'merge',
      })
      .toString();

    this.location.replaceState(url);
  }
  getAllRelationships() {
    this.relationService.getAllRelationships(this.org).subscribe(res => {
      this.relationships = res;
      this.noOfItems = res.length;
      this.noOfItems = this.noOfItems || res.length;
      this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
      this.pageArr = [...Array(this.noOfPages).keys()];
    })
    // this.pageSize = this.pageSize || 6;
    this.updateQueryParam(
      this.pageNumber,
      this.filt
    );
  }

  createRelation() {
    this.create = true;
    this.edit = false;
    this.initialise();
  }

  initialise() {
    this.relationship = new Relationship();
    this.relationship.schema_relation = {};
    this.relationship.schema_relation['pCol'] = [];
    this.relationship.schema_relation['cCol'] = [];

    this.schemaList = [];
    this.relationService.getSchema().subscribe(res => {
      this.schemas = res;
      this.schemas.forEach(sche => {
        this.schemaList.push({ viewValue: sche['alias'], value: sche['alias'] })
      });
    })
  }

  editRelation(model, edit) {
    // if(!edit){
    //   //this.telemetry.addTelemetryEvent(model?.alias+ ' relation viewed ')
    // }
    this.create = false;
    this.edit = edit;
    this.view = !edit;
    this.initialise();
    this.relationService.getRelationshipById(model.id).subscribe(res => {
      this.relationship = res;
      this.relationship.schema_relation = JSON.parse(res.schema_relation);
      this.onParentSchemaChange(res.schemaA);
      this.fetchPSchemaColNames(res.schemaA);
      this.fetchCSchemaColNames(res.schemaB);
    })
    if(!edit){
      //this.telemetry.addTelemetryEvent(model?.alias+ ' relation viewed ')
    }
  }

  onParentSchemaChange(event) {
    this.fetchPSchemaColNames(event);
    this.schemaListChild = this.schemaList.filter(sche => sche.value != event);
  }

  onChildSchemaChange(event) {
    this.fetchCSchemaColNames(event);
  }

  fetchPSchemaColNames(val) {
    let colList = [];
    this.relationService.getSchemaByAlias(val).subscribe(res => {
      let schemavalue = JSON.parse(res.schemavalue)
      if (schemavalue.length >= 1) {
        schemavalue.forEach(element => {
          if (element.recordcolumnname) {
            colList.push(element.recordcolumnname);
          }
        });
      }
      this.parentSchemaDetailsList = [];
      this.parentSchemaDetails = colList;
      this.parentSchemaDetails.forEach(element => {
        this.parentSchemaDetailsList.push({ viewValue: element, value: element })
      });
    });
  }

  fetchCSchemaColNames(val) {
    let colList = [];
    this.relationService.getSchemaByAlias(val).subscribe(res => {
      let schemavalue = JSON.parse(res.schemavalue)
      if (schemavalue.length >= 1) {
        schemavalue.forEach(element => {
          if (element.recordcolumnname) {
            colList.push(element.recordcolumnname);
          }
        });
      }
      this.childSchemaDetailsList = [];
      this.childSchemaDetails = colList;
      this.childSchemaDetails.forEach(element => {
        this.childSchemaDetailsList.push({ viewValue: element, value: element })
      });
    });
  }

  createRelationship() {
    this.relationship.organization = sessionStorage.getItem("organization");
    this.relationship.schema_relation = JSON.stringify(this.relationship.schema_relation);
    if ((this.relationship.name == undefined) || (this.relationship.schemaA == undefined) || (this.relationship.schemaB == undefined) || (this.relationship.schema_relation == "{}")) {
      this.service.message('Enter Valid Data', 'error');
    }
    else {
      this.relationService.create(this.relationship).subscribe(res => {
        this.service.message('Relationship Added Sucessfully', 'success');
        this.backTolist();
        this.refresh();
      })
    }
  }

  updateRelationship() {
    this.relationship.organization = sessionStorage.getItem("organization");
    this.relationship.schema_relation = JSON.stringify(this.relationship.schema_relation);
    this.relationService.update(this.relationship).subscribe(res => {
      this.service.message('Relationship Updated Sucessfully', 'success');
      this.backTolist();
      this.refresh();
    })
  }

  deleterelation(model) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.relationService.deleteRelation(model.id).subscribe(res => {
          this.service.message('Deleted Sucessfully', 'success');
          //this.telemetry.addTelemetryEvent(model?.alias+' Deleted');
          this.ngOnInit();
        }, error => {
          this.service.message(JSON.stringify(error), 'error');
        });
      }
      else
        this.service.message('Could not delete the plugin', 'error');
    })
  }

  filterz(event: any) {
    let data: any = [];
    this.relationships.forEach((element: any) => {
      if (element.name.toLowerCase().includes(this.filt.toLowerCase())) {
        data.push(element);
        this.relationships = data;
        this.noOfItems = data.length;
        this.noOfItems = this.noOfItems || data.length;
        this.noOfPages = Math.ceil(this.noOfItems / this.pageSize);
        this.pageArr = [...Array(this.noOfPages).keys()];
      }
    });
    if (this.filt == "") {
      this.ngOnInit();
    }
    // this.getCards(this.pageNumber, this.pageSize,this.filt);
    this.updateQueryParam(this.pageNumber = 1,this.filt);
  }

  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  backTolist() {
    this.create = false;
    this.edit = false;
    this.view = false;
  }

  refresh() {
    this.filt = '';
    this.ngOnInit();
  }

  // pages
  nextPage() {
    if (this.pageNumber + 1 <= this.noOfPages) {
      this.pageNumber += 1;
      this.changePage();
      // this.updateQueryParam(this.pageNumber);
    }
  }

  prevPage() {
    if (this.pageNumber - 1 >= 1) {
      this.pageNumber -= 1;
      this.changePage();
      // this.updateQueryParam(this.pageNumber);
    }
  }

  changePage(page?: number) {
    if (page && page >= 1 && page <= this.noOfPages) 
    {this.pageNumber = page;
      // this.updateQueryParam(this.pageNumber);
    }
    if (this.pageNumber >= 1 && this.pageNumber <= this.noOfPages) {
      this.pageChanged.emit(this.pageNumber);
      if (this.pageNumber > 5) {
        this.endIndex = this.pageNumber;
        this.startIndex = this.endIndex - 5;
      } else {
        this.startIndex = 0;
        this.endIndex = 5;
      }
      // this.updateQueryParam(this.pageNumber);
    }
    // this.getCards(this.pageNumber, this.pageSize,this.filt);
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

  selectedButton(i) {
    if (i == this.pageNumber) {
      return { "color": "white", "background": "#7b39b1" }
    }
    else
      return { "color": "black" }
  }
  ngOnDestroy() : void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
}
