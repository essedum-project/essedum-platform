import { Component, OnInit, Input } from "@angular/core";
import { Subscription } from "rxjs";
import { Dataset } from "../../dataset/datasets";
import { Router, ActivatedRoute } from "@angular/router";
import {
  GridsterConfig, GridsterItem, CompactType,
  DisplayGrid,
  GridType
} from 'angular-gridster2';
import { MashupsService } from "../../mashups/mashups.service";
import { Services } from "../../services/service";

export class PaginationAttributes {
  page: any
  size: any
  sortEvent: any
  sortOrder: any
}

@Component({
  selector: 'lib-mashup-view-wrapper',
  templateUrl: './mashup-view-wrapper.component.html',
  styleUrls: ['./mashup-view-wrapper.component.scss']
})
export class MashupViewWrapperComponent implements OnInit {

  busy: Subscription;
  datasetName: string = "";
  powerMode: boolean = false;
  writeAccess: boolean;
  formView: any = false;
  dataset: any;
  unqId: string;
  childTablesFormView: boolean = false;
  hideFrmBtnInPwMd: boolean = false;

  @Input('data') data: Dataset;
  @Input('view') viewType = 'formView'
  @Input('action') action = 'update'
  @Input('mashupname') mashupname;
  @Input('id') id;
  @Input('rowObj') rowObj
  @Input('formParam') formParam
  @Input('formcommunication') isRest = false

  options: GridsterConfig;
  dashboard: Array<GridsterItem>;
  json;
  selectedTabIndex = 0
  selectedTab: any;
  mashup
  selectedSplit: string;
  selectedSubset: string;
  publicDatasetName: Dataset;
  formOutput: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datasetsService: Services,
    private mashupService: MashupsService
  ) { }

  ngOnInit() {
    this.publicDatasetName = this.data
    if (!this.mashupname) {
      this.mashupname = this.route.snapshot.params['mashupname']
    }
    if (!this.mashupname) {
      this.route.data.subscribe(dta => {
        this.isRest = dta["isRest"] ? dta["isRest"] : this.isRest
      })
      this.mashupname = this.router.url.split("/")[this.router.url.split("/").length - 1]
    }
    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 10,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      useTransformPositioning: true,
      mobileBreakpoint: 640,
      useBodyForBreakpoint: false,
      minCols: 1,
      maxCols: 100,
      minRows: 1,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: 200,
      fixedRowHeight: 200,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      enableOccupiedCellDrop: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: false
      },
      resizable: {
        enabled: false
      },
      swap: false,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: { north: true, east: true, south: true, west: true },
      pushResizeItems: false,
      displayGrid: DisplayGrid.Always,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: true
    };

    this.dashboard = [
      { cols: 10, rows: 10, y: 0, x: 0 },
      { cols: 10, rows: 10, y: 10, x: 0 }
    ];
    this.getMashup()
  }

  getMashup() {
    this.mashupService.getMashupByName(this.mashupname).subscribe(resp => {
      let template = JSON.parse(resp.template)
      for (let i = 0; i < template.contents.length; i++) {
        try {
          template.contents[i].displayColumns = template.contents[i].displayColumns ? JSON.parse(template.contents[i].displayColumns) : []
        } catch (ex) { }
      }
      this.mashup = template
    })
  }

  changedOptions(): void {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  removeItem($event: MouseEvent | TouchEvent, item): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  addItem(): void {
    this.dashboard.push({ x: 0, y: 0, cols: 1, rows: 1 });
  }

  checkFormViewResult(event) {
    if (event?.toString() == "backToTableView") {
      this.formView = false;
    }
  }

  checkTableViewResult(event) {
    if (event?.toString() == "tableView") {
      this.childTablesFormView = false;
    }
    else if (event?.toString() == "formView") {
      this.childTablesFormView = true;
    }
  }

  checkPowerModeViewResult(event) {
    event?.toString() == "Hide Create/Form Template Button" ? this.hideFrmBtnInPwMd = true : this.hideFrmBtnInPwMd = false;
  }


  onTabChange(event: any) {
    this.selectedTab = event?.tab?.textLabel
  }

  getDataset(dataset) {
    this.datasetsService.getDataset(dataset).subscribe(res => {
      return res
    })
  }

  jsonparse(value) {
    return JSON.parse(value)
  }

  selectedSplitAndConfig(event) {
    this.selectedSplit = event[0]
    this.selectedSubset = event[1]
  }

  changeForm(event) {
    this.formOutput = event
    for (let out in this.formOutput) {
      this.formParam[out] = this.formOutput[out]
    }
  }

}
