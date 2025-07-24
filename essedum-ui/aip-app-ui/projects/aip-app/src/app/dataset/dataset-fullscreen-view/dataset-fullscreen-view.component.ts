import { Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dataset } from '../datasets';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { DatasetServices } from '../dataset-service';
@Component({
  selector: 'app-dataset-fullscreen-view',
  templateUrl: './dataset-fullscreen-view.component.html',
  styleUrls: ['./dataset-fullscreen-view.component.scss']
})
export class DatasetFullscreenViewComponent implements OnInit, OnChanges, DoCheck {
  busy: Subscription;
  // searchIncident: any;
  datasetName: string = "";
  powerMode: boolean = false;
  writeAccess: boolean;
  formView: any = false;
  dataset: any;
  unqId: string;
  action: any;
  childTablesFormView: boolean = false;
  hideFrmBtnInPwMd: boolean = false;

  @Input('data') data: Dataset;
  @Input('datasetname') inpdataset;

  datasetNamebackup

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datasetsService: DatasetServices
  ) { }

  ngOnInit() {
    this.getSourceApiParameters();
  }

  getSourceApiParameters() {
    try {
      try {
        if (this.router.url.includes("/workflows/")) throw '';
        this.route.params.subscribe(param => {
          this.datasetName = param['name'];
        })
      }
      catch (Exception) {
        this.datasetName = this.data?.name;
      }
      if (this.datasetName == undefined) {
        this.datasetName = this.data?.name;
      }
      if (this.inpdataset) {
        this.datasetName = this.inpdataset
      }
      if (!this.datasetName || this.datasetName.replace(/\s/g, "").length < 1) {
        if (sessionStorage.getItem("isSbx") != "true") this.datasetsService.message("Dataset name not found", 'error');
      }
      else {
        this.busy = this.datasetsService.getDataset(this.datasetName)
          .subscribe(resp => {
            if (resp) {
              this.dataset = resp;
              (sessionStorage.getItem("cipAuthority")?.includes("dataset-edit") && this.dataset.type == "rw") ?
                this.writeAccess = true :
                this.writeAccess = false;
              (this.dataset.attributes && JSON.parse(this.dataset.attributes)['uniqueIdentifier']) ?
                this.unqId = JSON.parse(this.dataset.attributes)['uniqueIdentifier'] :
                this.unqId = undefined;
            }
            else { this.datasetsService.message("Dataset details not found", 'error'); }
          },
            error => { this.datasetsService.message("Error in fetching dataset details " + error,'error'); })
      }

    }
    catch (Exception) {
      this.datasetsService.message("Some error occured", "error")
    }

  }

  goToFormView(incAction) {
    this.action = incAction;
    this.formView = true;
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

  ngOnChanges(changes: SimpleChanges) {
    if (sessionStorage.getItem("isSbx") == "true") this.getSourceApiParameters();
  }

  ngDoCheck() {
    if (this.datasetNamebackup != this.data?.name) {
      this.datasetNamebackup = this.data.name
      this.ngOnInit()
    }
  }



}
