import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService } from "../../services/message.service";
import { ExportImportService } from "../../services/export-import.service";
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { Project } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { saveAs as importedSaveAs } from "file-saver";
import { UsmPortfolio } from '../../models/usm-portfolio';
import { FormControl } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import { DashConstantService } from "projects/com-lib-util/src/public-api";

@Component({
  selector: 'lib-export-import',
  templateUrl: './export-import.component.html',
  styleUrls: ['./export-import.component.css'],
})

export class ExportImportComponent implements OnInit {

  jsonFile: string;
  formData: FormData;
  busy: Subscription;
  importbusy: Subscription;
  fileSelected: boolean = false;
  importStarted: boolean = false;

  @ViewChild('inputFile', { static: false }) fileInput: ElementRef;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  public dashCtrl: FormControl = new FormControl();
  public dashFilterCtrl: FormControl = new FormControl();
  public projectFilterCtrl: FormControl = new FormControl();
  public filteredDashList: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredProjectList: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();
  dashLength: number = 0;

  lazyloadevent = {
    first: 0,
    rows: 1000,
    sortField: null,
    sortOrder: 1,
    filters: null,
    multiSortMeta: null
  };
  projectList: Project[] = [];
  dashboardList: any[] = [];
  exportFile: any;
  exportStructure: any;
  exportStarted: boolean = false;
  currentProjectName: string;
  exportedProjectName: string;
  currentDate: string;
  Mappings: boolean = false;
  role: any;
  currentProjectId: number;
  busyMessage: string = "";
  showLogs: boolean = false;
  showErrorMsg: boolean = false;
  extension: string = "";
  allowedTypes: string="";
  extensionArray: string[];
  constructor(
    private messageService: MessageService,
    private exportimportService: ExportImportService,
    private projectService: ProjectService,
    private route: Router,
    private router: ActivatedRoute,
    private dashConstantService: DashConstantService,
  ) { }

  cols12 = 5;
  colspan2 = 1;

  onResize(event) {
    this.cols12 = (event.target.outerWidth <= 640) ? 1 : 5;
    this.colspan2 = (event.target.outerWidth <= 640) ? 1 : 1;
  }

  ngOnInit(): void {
    this.cols12 = (window.outerWidth <= 640) ? 1 : 5;
    this.colspan2 = (window.outerWidth <= 640) ? 1 : 1;
    this.dashCtrl.setValue([]);
    let themecolor = sessionStorage.getItem("theme");
    document.documentElement.style.setProperty("--base-color", themecolor);
    let project: Project = new Project();
    project.portfolioId = new UsmPortfolio({ id: JSON.parse(sessionStorage.getItem("portfoliodata")).id })
    this.projectService.findAll(project, this.lazyloadevent).subscribe(
      response => {
        this.projectList = response.content.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        this.filteredProjectList.next(this.projectList.slice());
      }
    );
    this.dashFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDash();
      });
    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProject();
      });
      this.dashConstantService.getExtensionKey("FileUpload.AllowedExtension.USM.ImportData").subscribe(
        (res)=>{
        this.extension = res["allowedFileTypes"];
        if(this.extension) this.extensionArray = this.extension.split(",");
        this.allowedTypes = res["allowedFileExtension"];  
        });
  }

  getDashboard(projectName: string, id: number) {
    this.currentProjectName = projectName;
    this.currentProjectId = id;
    this.emptyField();
    this.busy = this.exportimportService.getNestedStructure(id).subscribe(
      response => {
        if (response && response.length > 0 && response[0].children != null && response[0].children.length > 0)
          this.dashboardList = response[0].children.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
        this.filteredDashList.next(this.dashboardList.slice());
        this.dashLength = this.dashboardList.length;
        if (this.dashLength <= 0) this.showErrorMsg = true;
        else this.showErrorMsg = false;
        this.messageService.info("Fetched successfully", "LEAP");
      }
    ), error => {
      this.messageService.error(error, "LEAP");
    };
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  emptyField() {
    this.exportFile = null;
    this.dashboardList = [];
    this.dashCtrl.setValue([]);
    this.busy = new Subscription;
    this.busyMessage = "Fetching Dashboards...";
    this.currentDate = new Date().toLocaleDateString();
  }

  filterDash() {
    if (!this.dashboardList) {
      return;
    }
    // get the search keyword
    let search = this.dashFilterCtrl.value;
    if (!search) {
      this.filteredDashList.next(this.dashboardList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the dashboard
    this.filteredDashList.next(
      this.dashboardList.filter(dash => dash.name.toLowerCase().indexOf(search) > -1)
    );
  }


  toggleSelectAll(selectAllValue: boolean) {
    this.filteredDashList.pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(val => {
        if (selectAllValue) {
          this.dashCtrl.patchValue(val);
        } else {
          this.dashCtrl.patchValue([]);
        }
      });
  }

  filterProject() {
    if (!this.projectList) {
      return;
    }
    // get the search keyword
    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredProjectList.next(this.projectList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the projects
    this.filteredProjectList.next(
      this.projectList.filter(project => project.name.toLowerCase().indexOf(search) > -1)
    );
  }

  export() {
    this.exportStarted = true;
    this.exportedProjectName = this.currentProjectName;
    this.busyMessage = "Exporting Data...";
    let dashboard = this.dashCtrl.value.map(ele => ele.id)
    if (dashboard.length >= 1)
      this.busy = this.exportimportService.getExportedJson(this.currentProjectId, dashboard).subscribe(
        res => {
          this.exportFile = res as Blob;
          this.exportStarted = false;
        }, error => {
          this.exportFile = null;
          this.exportStarted = false;
          this.messageService.error(error, "LEAP")
        }
      )
    else {
      this.exportFile = null;
      this.exportStarted = false;
    }
  }

  download() {
    importedSaveAs(this.exportFile, this.exportedProjectName + '.txt');
  }

  onFileChanged(event) {
    if (!this.extensionArray?.includes(event.target.files[0].type )) {
      this.messageService.error("File type should be "+this.allowedTypes+" only ", "IAMP");
      return;
    }
    else if (event.target.files[0].size > 7000 * 1000) {
      this.messageService.error("File size should be less than 7000 KB", "IAMP");
      return;
    }
    this.showLogs = false;
    this.fileSelected = true;
    let label = document.getElementById("fileLabel");
    label.innerHTML = this.jsonFile.split("\\")[this.jsonFile.split("\\").length - 1];
    let file: File = event.target.files[0];
    this.formData = new FormData();
    this.formData.append("file", file, file.name);
  }
  //Save the JSON to be uploaded
  save() {
    this.importStarted = true;
    let project = JSON.parse(sessionStorage.getItem("project"))
    this.importbusy = this.exportimportService.postNestedStructure(this.formData, project)
      .subscribe((res) => {
        this.showLogs = true;
        this.reset();
        // this.messageService.info("Imported Succesfully!!", "Leap");
        this.messageService.info("Import dashboard pipeline triggered successfully !! To check status click on logs", "Leap");
      },
        err => {
          this.showLogs = false;
          this.reset();
          this.messageService.error("Issue while importing data", "Leap");
        }
      );
  }

  //reset file
  reset() {
    this.importStarted = false;
    this.fileSelected = false;
    this.fileInput.nativeElement.value = "";
    let label = document.getElementById("fileLabel");
    label.innerHTML = "Select file...";
  }
  trackByMethod(index, item) {
    return item;
  }

  routeLogs() {
    this.route.navigate(['../../aibrain/jobs/logs'], { relativeTo: this.router })
  }
}
