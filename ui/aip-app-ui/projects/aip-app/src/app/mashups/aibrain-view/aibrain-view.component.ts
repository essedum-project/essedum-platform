import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { PageEvent } from "@angular/material/paginator";
import { ModalEditCanvasTitleComponent } from '../../pipeline.description/modal-edit-canvas-title/modal-edit-canvas-title.component';
import { DomSanitizer } from "@angular/platform-browser";
import { Services } from "../../services/service";
import { AdapterServices } from "../../adapter/adapter-service";

@Component({
  selector: "lib-aibrain-view",
  templateUrl: "./aibrain-view.component.html",
  styleUrls: ["./aibrain-view.component.scss"],
})
export class AibrainViewComponent implements OnInit, OnChanges {
  @Input() displayedColumns: any[];
  @Input() createDialog: any;
  @Input() permission: any;
  dataList: any = [];
  finalDataList: any = [];
  filterDataList: any;
  @Input() datasetname;
  @Input() datasets;
  @Input() isRest;
  @Input() mashupname;
  @Input() url;
  @Output("result") result = new EventEmitter();
  actionsList;
  datasetObj;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild("dt", { static: false }) private table: Table;
  busy: Subscription;
  page = 0;
  size = 5000;
  datasetListCount: any = 0;
  displayTableFilters = false;
  displayedColumnsObj;
  sortEvent: any = null;
  sortorder: any = 1;
  tableView = false;
  selectedDataset;
  actions;
  datasetActionObj = {};
  actionObj = {};
  removeCache = false;
  allTags;
  category;
  tags;
  tagsBackup;
  pastLabel;
  p: number;
  prevPage = 1;
  searchText: any;
  showForm = false;
  togglePipe = true;
  selectedRow;
  selectedTag: any = [];
  formParams: any;
  searchValue;
  formAction = "add";
  formDataset;
  formName;
  showAdd = false;
  platforms;
  selectedPlatform;
  clickedDval;
  inpParams;
  load;
  catStatus = {};
  tagStatus = {};
  classes;
  dataDialog = {};
  tagsfinal: any;
  searchfinal: any;
  showFormView: boolean;
  formData: any;
  formDatasetName: any;
  isAuth = true
  URL: any;
  iFrame: boolean = false;

  constructor(
    private datasetsService: Services,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private location: Location,
    private router: Router, public messageService: AdapterServices,
    private domSanitizer: DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges): void {

    if (this.url) this.iFrame = true; //only for iFrame

    if (changes.url?.currentValue != changes.url?.previousValue) {
      this.URL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.url);
    }
  }

  ngOnInit(): void {
    this.classes = {
      ModalEditCanvasTitleComponent: ModalEditCanvasTitleComponent
    };

    if (sessionStorage.getItem("cipAuthority") &&
      sessionStorage.getItem("cipAuthority").includes(this.permission)) this.isAuth = false;

    let params = { page: this.page, size: this.size };
    this.inpParams = history.state.data;
    if (this.inpParams?.action) {
      this.selectedTag = {};
      this.selectedTag["category"] = this.inpParams.action[0].params[0];
      this.selectedTag["label"] =
        this.inpParams[this.inpParams.action[0].params[0]];
    }
    if (this.inpParams?.cache) this.removeCache = true;
    if (!this.url) {
      this.getTags();
      this.getData(params);
    }

  }

  startIndex: number = 0;
  endIndex: number = 10;
  //Function for pagination
  onPageChange(event: PageEvent) {
    this.startIndex = event.pageIndex * event.pageSize;
    this.endIndex = this.startIndex + event.pageSize;
    if (this.endIndex > this.finalDataList.length) {
      this.endIndex = this.finalDataList.length;
    }
    return event;
  }

  getTags() {
    this.category = [];
    this.tags = {};
    this.tagsBackup = {};
    this.category.push(this.displayedColumns[1]);
    if (this.mashupname != 'datasources' && this.mashupname != 'adapters' && this.mashupname != 'methods' && this.mashupname != 'endpoint') {
      this.datasetsService.getMlTags().subscribe((resp) => {
        this.allTags = resp;
        this.allTags.forEach((tag) => {
          if (!this.category.includes(tag.category))
            this.category.push(tag.category);
          this.tagStatus[tag.category + " - " + tag.label] = false;
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
    } else {
      this.tags[this.displayedColumns[1]] = [];
      this.tagsBackup[this.displayedColumns[1]] = [];
    }
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

  filtermultiTag(t) {
    let multiFilter;
    this.finalDataList = []
    for (let i = 0; i < this.selectedTag.length; i++) {
      multiFilter = this.dataList.filter(
        (data) =>
          data[t]?.includes(
            this.selectedTag[i].label
          ) ||
          data[t]?.includes(
            this.selectedTag[i].category + ":" + this.selectedTag[i].label
          )
      );
      this.finalDataList.push(...multiFilter);
    }
  }
  filterByTag(tag) {
    this.tagStatus[tag.category + " - " + tag.label] =
      !this.tagStatus[tag.category + " - " + tag.label];

    if (!this.selectedTag.includes(tag)) {
      this.selectedTag.push(tag);
    }
    else {
      this.selectedTag.splice(this.selectedTag.indexOf(tag), 1)
    }

    let nosTrue = Object.values(this.tagStatus).includes(true);
    if (this.inpParams && this.inpParams.action && tag.category == this.inpParams?.action[0].params[0]) {
      this.finalDataList = this.dataList.filter(
        (data) =>
          data[this.inpParams.action[0].params[0]]?.includes(tag.label) ||
          data[this.inpParams.action[0].params[0]]?.includes(
            tag.category + ":" + tag.label
          )
      );
    } else if (
      tag.category == this.displayedColumns[1] &&
      nosTrue
    ) {
      this.filtermultiTag(this.displayedColumns[1]);
    } else if (nosTrue) {
      this.filtermultiTag('tags');
    }
    else {
      this.finalDataList = this.dataList;
    }

    this.tagsfinal = this.finalDataList;
    if (this.searchText?.length > 0) this.searchValueAdder();
  }

  toggleView(rowData) {
    this.togglePipe = !this.togglePipe;
    this.selectedRow = rowData;
  }

  getData(params) {
    this.load = true;
    if (this.removeCache) this.dataList = [];
    let i = 0;
    let j = 0;
    let dsetList = []
    let map = {}
    this.datasets.forEach(dset => {
      this.actions = dset.action
      this.getActions(map, dset.name, i)
      i++
      this.datasetsService.getDatasetByNameAndOrg(dset.name).subscribe(res => {
        this.datasetObj = res
        dsetList.push(this.datasetObj)
      })

    })
    setTimeout(() => {
      this.getDatasetDetails(params, dsetList, map)
    }, 2000)

    if (!this.displayedColumns || this.displayedColumns.length == 0) {
      this.displayedColumns = [];
      this.displayedColumns = Object.keys(this.dataList[0]);
    }
    this.displayedColumnsObj = [];
    this.displayedColumns.forEach((col) => {
      if (col != "Actions") {
        let obj = {};
        obj["field"] = col;
        obj["filterValue"] = "";
        this.displayedColumnsObj.push(obj);
      }
    });
    if (!this.displayedColumns.includes("Actions"))
      this.displayedColumns.push("Actions");
  }

  getDatasetDetails(params, dsetList, map) {
    dsetList.forEach((dset) => {
      if (params.param && dset.datasource.category == "SQL") {
        this.datasetsService
          .getProxyDbDatasetDetails(
            dset,
            dset.datasource,
            params,
            sessionStorage.getItem("organization"),
            this.removeCache
          )
          .subscribe((resp) => {
            this.load = false;
            for (let res of resp) {
              res["mashupdsetname"] = dset.name
              res["action"] = map[dset.name]
              let tags = dset.tags ? JSON.parse(dset.tags)[0] : "others"
              res.platform = tags
              let dta = this.dataList.filter(data => data[this.displayedColumns[0]] == res[this.displayedColumns[0]])

              if (dta.length == 0) this.dataList.push(res)
              let typec = this.tags[this.displayedColumns[1]]?.filter(
                (t) => t.label == res[this.displayedColumns[1]]
              );
              if (typec?.length == 0)
                this.tags[this.displayedColumns[1]]?.push({
                  category: this.displayedColumns[1],
                  label: res[this.displayedColumns[1]],
                });
            }
            this.datasetListCount = this.dataList.length;
            this.finalDataList = this.dataList;
            if (this.selectedTag.length > 0) this.filterByTag(this.selectedTag);
          });
      } else {
        if (
          this.page == 0 ||
          (this.page >= 0 && dset.datasource.category == "SQL") ||
          this.removeCache
        ) {
          this.datasetsService
            .getProxyDatasetDetails(
              dset,
              dset.datasource,
              params,
              null,
              sessionStorage.getItem("organization"),
              this.removeCache
            )
            .subscribe((resp) => {
              this.load = false;
              for (let res of resp) {
                res["mashupdsetname"] = dset.name
                res["action"] = map[dset.name]
                let dta = this.dataList.filter(
                  (data) =>
                    data[this.displayedColumns[0]] ==
                    res[this.displayedColumns[0]]
                );
                if (dta.length == 0) this.dataList.push(res);
                let typec = this.tags[this.displayedColumns[1]]?.filter(
                  (t) => t.label == res[this.displayedColumns[1]]
                );
                if (typec?.length == 0)
                  this.tags[this.displayedColumns[1]]?.push({
                    category: this.displayedColumns[1],
                    label: res[this.displayedColumns[1]],
                  });
              }
              this.datasetListCount = this.dataList.length;
              this.finalDataList = this.dataList;
              if (this.selectedTag.length > 0) this.filterByTag(this.selectedTag);
            });
        }
      }
    });
    this.removeCache = false;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  paginate(navigate) {
    if (navigate > this.prevPage) {
      this.page = this.page + 1;
    } else {
      this.page = this.page > 0 ? this.page - 1 : (this.page = 0);
    }
    this.prevPage = navigate;
    let params = { page: this.page, size: this.size };
    this.getData(params);
  }

  refresh() {
    this.removeCache = true;
    let params = { page: this.page, size: this.size };
    this.getData(params);
    this.catStatus = {};
    this.finalDataList = [];
    this.searchText = "";
  }

  getActions(map, dset, i) {
    this.actionsList = [];
    let j = 0;
    for (let ind in this.actions) {

      let action = {}
      action["tooltip"] = this.actions[ind]["name"]
      action["icon"] = "fa fa-" + this.actions[ind]["icon"]
      action["viewtype"] = this.actions[ind]["viewtype"]
      action["url"] = this.actions[ind]["url"]
      action["mashupname"] = this.actions[ind]["mashupname"]
      action["params"] = JSON.parse(this.actions[ind]["params"])
      action["requestType"] = this.actions[ind]["requestType"]
      action["onCard"] = this.actions[ind]["onCard"]
      action["componentView"] = this.actions[ind]["componentView"]
      action["formName"] = this.actions[ind]["form"]
      this.actionsList.push(action)
    }
    this.actionObj[i] = this.actionsList;
    map[dset] = this.actionsList;
  }

  actionClick(action, rowData) {
    if (action.viewtype == "preview") {
      this.router.navigate(["../preview/"], { relativeTo: this.route, state: { data: rowData } })
    }
    if (action.viewtype == "navigateTo") {
      action.params.forEach((par) => {
        if (action.url.includes(par))
          action.url = action.url.replace(
            "{" + par + "}",
            rowData[par].toString().replace("/", "%2F")
          );
      });
      this.router.navigate([action.url], {
        relativeTo: this.route,
        state: { data: rowData },
      });
    }
    if (action.viewtype == "table") {
      this.tableView = true;
      this.selectedDataset = rowData[action.params];
    }
    if (action.viewtype == "api") {
      action.params.forEach((par) => {
        if (action.url.includes(par))
          action.url = action.url.replace(
            "{" + par + "}",
            rowData[par].toString().replace("/", "%2F")
          );
      });
    }
    if (action.viewtype == "form") {
      this.showForm = true;
      this.formParams = action.params;
      this.searchValue = rowData[action.params[0]];
      this.formAction = "update";
      this.formName = action.mashupname;
    }
    if (action.viewtype == "componentView") {
      this.dataDialog = rowData;
      this.openDialog(this.classes[action.componentView], this.dataDialog);
    }
    if (action.viewtype == 'formView') {
      this.showFormView = true
      this.formData = rowData
      this.formDatasetName = rowData.mashupdsetname
      this.formName = action.formName
    }
  }

  actionClickView(rowData) {
    let action = rowData.action[0]
    rowData['mashupName'] = this.mashupname
    rowData['permission'] = this.permission
    this.actionClick(action, rowData)
  }

  expandOneCard(val) {
    this.clickedDval = val;
  }

  searchValueAdder() {
    let param = {};
    param[this.displayedColumns[0]] = this.searchText;
    let params = {
      page: this.page,
      size: this.size,
      sortEvent: this.sortEvent,
      sortOrder: this.sortorder,
    };
    params["param"] = JSON.stringify(param);
    if (this.tagsfinal == undefined) this.filterDataList = this.dataList;
    else this.filterDataList = this.tagsfinal;

    for (let par in param) {
      this.finalDataList = this.filterDataList.filter((search) =>
        search[par].toLowerCase().includes(param[par].toLowerCase())
      );
    }

    this.searchfinal = this.finalDataList;
    this.dataSource = new MatTableDataSource(this.dataList);

    this.displayTableFilters = false;
  }

  sortData(column) {
    this.sortEvent = column;
    this.sortorder = this.sortorder == 1 ? -1 : 1;
    this.searchValueAdder();
  }

  addDataset() {
    this.showAdd = true
    this.platforms = []
    this.datasetsService.getDatasetForm(this.datasetname).subscribe(resp => {
      this.platforms = resp
    })
  }

  platformChange() {
    if (this.selectedPlatform.formtemplate.alias == "CIP") {
      this.dataDialog = {};
      this.openDialog(this.classes[this.createDialog], this.dataDialog);
    } else {
      this.showForm = true;
      this.formName = this.selectedPlatform.formtemplate.name;
      this.formAction = "add";
      this.formDataset = this.selectedPlatform.dataset;
    }
  }

  openDialog(comp, dta) {
    const dialogRef = this.dialog.open(comp, {
      height: "90%",
      panelClass: "dsConfig",
      minWidth: "60vw",
      disableClose: true,
      data: dta,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("data saved");
        this.showAdd = false
      }
    });
  }

  cancel() {
    this.location.back();
  }
}