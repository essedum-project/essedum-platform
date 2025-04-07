import { HttpParams } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LedsModalService } from 'leds-lib';
import { RaiservicesService } from 'projects/aip-app/src/app/services/raiservices.service';
import { Services } from 'projects/aip-app/src/app/services/service';
import { CommonCreateDialogComponent } from './common-create-dialog.component';

@Component({
  selector: 'app-common-create',
  templateUrl: './common-create.component.html',
  styleUrls: ['./common-create.component.scss'],
})
export class CommonCreateComponent implements OnInit {
  // @ViewChild('modelCreate', { static: true }) modelCreate: TemplateRef<any>;
  // my_menu = [
  //   'Item 1',
  //   { 'Submenu': ['Subitem 1', 'Subitem 2'] },
  //   'Item 2'
  // ];
  @Output() reloads = new EventEmitter<boolean>();
  @Input() initiativeId: any;
  customCreateName: any;
  my_menu = [
    { Model: [] },
    { Endpoint: [] },
    'Pipeline',
    'Connection',
    'Dataset',
    'App',
    // 'Upload',
  ];
  mainItems: string = '';
  selectedType: string[] = [];
  selectedAdapterType: string[] = [];
  objectKeys = Object.keys;
  data: boolean;
  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private dialog: MatDialog,
    private raiService: RaiservicesService
  ) {
    this.raiService.currentModal.subscribe((value) => {
      this.data = value;
      if (this.data) {
        this.dialog.closeAll();
      }
    });
  }
  ngOnInit() {
    this.fetchModelAdapters();
    this.fetchEndpointAdapterList();
  }
  open(subItem: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth = "90vw";
    dialogConfig.maxHeight = "95vh";
    // dialogConfig.minWidth = "30vw";
    // dialogConfig.minHeight = "30vh";
    dialogConfig.data = {
      mainItems: subItem,
      customCreateName: this.customCreateName,
      initiativeId: this.initiativeId
    };
    this.dialog.open(CommonCreateDialogComponent, dialogConfig);
  }
  alertObject(event, mainItem = '') {
    this.customCreateName = event.name;
    this.mainItems = mainItem;
  }
  alertString(event) {
    this.customCreateName = event;
    this.mainItems = event;
  }
  getType(item: any) {
    return typeof item;
  }
  isObject(item: any) {
    return item instanceof Object;
  }
  fetchModelAdapters(): boolean {
    let params: HttpParams = new HttpParams();
    //this.selectedAdapterInstance = [];
    if (this.selectedAdapterType.length >= 1)
      params = params.set('adapterType', this.selectedAdapterType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getModelListAdapters(params).subscribe((res) => {
      let test = res.body;
      test.forEach((element) => {
        this.my_menu[0]['Model'].push(element);
      });
    });
    return true;
  }
  fetchEndpointAdapterList() {
    let params: HttpParams = new HttpParams();
    if (this.selectedType.length >= 1)
      params = params.set('adapterType', this.selectedType.toString());
    params = params.set('project', sessionStorage.getItem('organization'));
    this.service.getEndpointListAdapters(params).subscribe((res) => {
      let test = res.body;
      test.forEach((element) => {
        this.my_menu[1]['Endpoint'].push(element);
      });
    });
  }

}

