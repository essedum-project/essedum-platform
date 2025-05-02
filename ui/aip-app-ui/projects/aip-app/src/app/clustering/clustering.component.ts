import { Component, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatasetServices } from '../dataset/dataset-service';
import { EventsService } from '../services/event.service';
import { Services } from '../services/service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
//import { WorkflowService } from '../workflows/entities/workflow.service';
import { HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ClusteringWorkflow } from './clusteringWorkflow';

type Environment = {
  name: string;
  value: string;
};

@Component({
  selector: 'app-clustering',
  templateUrl: './clustering.component.html',
  styleUrl: './clustering.component.scss'
})
export class ClusteringComponent implements OnInit {
  datasetName = "Tickets";
  steps = { "data_setup": true, "data_preview": false, "detect_language": false, "select_clusters": false, "dashboard": false };
  basicReqTab: any = "selectDatasetTab";
  basicReqTab1: any = "logsTab1";
  search: any = '';
  allDatasets: any = []
  page = 0;
  lastPage = 0;
  size = 9;
  languages = [
    { viewValue: 'English', value: 'en' },
    { viewValue: 'French', value: 'fr' },
    { viewValue: 'German', value: 'de' },
    { viewValue: 'Spanish', value: 'es' },
    { viewValue: 'Italian', value: 'it' },
    { viewValue: 'Dutch', value: 'nl' }
  ];
  cards = [
    { name: 'NGRAM', isSelected: false },
    { name: 'SOUNDEX', isSelected: false },
    { name: 'Extract Phrases', isSelected: false },
    { name: 'LDA', isSelected: false }
  ];
  selectedLanguage = 'en';
  dsName: any;
  eventName = "LanguageDetection";
  translatedLang = "LEOTRNSL80208";
  detectedLangDatasetName = "LEODTCTD81889";
  detectedLangPipeline = "LEOLNGDT79601";
  translatedLangPipeline = "LEOLNGTR47391";
  multiThreadingClustering = "LEOMLT_T49247";
  params: any = {};
  reqEventBody = { "environment": [] };
  totalJobs = 0;
  rows = 9;
  isLoading: boolean = true;
  selectedDataset: any;
  detectedLangDataset: any;
  sortEvent: any;
  unqId: any;
  sortorder: any = -1;
  finalAndObj = { "and": [] };
  datasetData: string | any[];
  detectedLang: any;
  selectedLang: any;
  translationPipelineTriggered: boolean = false;
  basicReqTab2: any = "clustersTab";
  workflowName: any;
  workflowAlias: any;
  workflow: Object;
  jobStatus: any;


  constructor(
    private datasetsService: DatasetServices,
    private dialog: MatDialog,
    private eventService: EventsService,
    private service: Services,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
   // private workflowService: WorkflowService
  ) { }

  async onStatusChange(newStatus: string) {
    this.jobStatus = newStatus;
    if (newStatus === 'COMPLETED') {
      await this.getDataset();
    }
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.workflowName = params['name'];
      this.workflowAlias = params['displayName'];
    });
    // this.workflowService.getClusteringWorkflowByName(this.workflowName, sessionStorage.getItem('organization'))
    //   .subscribe((res) => {
    //     const instance = new ClusteringWorkflow(res);
    //     this.selectedDataset = instance.getSelectedDataset();
    //   });
    this.getDatasets('First');
  }

  selectChangeHandler(event: any) {
    for (let key in this.steps) {
      this.steps[key] = false;
    }
    this.steps[event] = true;
  }
  nextStep() {
    for (let key in this.steps) {
      if (this.steps[key] == true) {
        this.steps[key] = false;
        if (key == "data_setup") {
          this.steps["data_preview"] = true;
        }
      }
    }
  }

  selectedStep(event) {
    if (this.steps[event]) return { color: 'white', background: '#7b39b1' };
    else return { color: 'black' };
  }

  basicReqTabChange(index) {
    switch (index) {
      case 0:
        this.basicReqTab = "selectDatasetTab";
        break;
      case 1:
        this.basicReqTab = "uploadDataTab";
        break;
    }
  }
  basicReqTabChange1(index) {
    switch (index) {
      case 0:
        this.basicReqTab1 = "logsTab1";
        break;
      case 1:
        this.basicReqTab1 = "detectLangTab";
        break;
      case 2:
        this.basicReqTab1 = "logsTab2";
        break;
      case 3:
        this.basicReqTab1 = "translatedDataTab";
        break;
    }
  }

  basicReqTabChange2(index) {
    switch (index) {
      case 0:
        this.basicReqTab2 = "clustersTab";
        break;
      case 1:
        this.basicReqTab2 = "logsTab";
        break
    }
  }

  getDatasets(choice: String) {
    switch (choice) {
      case "Next":
        this.page += 1;
        if (this.page == this.lastPage) {
          choice = "Last";
          this.getDatasets("Last");
          break;
        }
        break;
      case "Prev":
        this.page -= 1;
        if (this.page == 0) {
          choice = "First";
          this.getDatasets("First");
          break;
        }
        break;
      case "First":
        this.page = 0;
        break;
      case "Last":
        this.page = this.lastPage;
        break;
    }
    if (this.search == "") {
      this.datasetsService.getDatasetsByOrg(this.page, this.size).subscribe((res) => {
        this.allDatasets = res
      });
    }
    else {
      this.datasetsService.getDatasetsByName(this.search, this.page, this.size).subscribe((res) => {
        this.allDatasets = res
      });
    }
  }

  selectChange(event) {
    const selectedLanguage = this.languages.find(lang => lang.value === event);
    if (selectedLanguage) {
      this.selectedLang = selectedLanguage.viewValue;
    }

  }
  skip() {
    this.steps["select_clusters"] = true;
  }

  anotherFunction(eventName) {
    let org = sessionStorage.getItem("organization");
    this.eventService.getEventBySearch(eventName, org, 0, 1).subscribe((res) => {
      this.dsName = JSON.parse(res[0]?.jobdetails)[0].runtime.dsName
      this.triggerEvent(eventName);
    });
  }

  triggerEvent(eventName) {
    if (eventName == 'languageTranslation') {
      this.translationPipelineTriggered = true;
      this.reqEventBody["environment"].push({
        "name": "Target_Language",
        "value": this.selectedLang
      })
    }
    if (eventName == 'multi_threading_clustering') {
      const environment: Environment[] = this.cards.map(card => {
        const cardName = card.name === 'Extract Phrases' ? 'EASE' : card.name.toUpperCase().replace(' ', '');
        return {
          name: cardName,
          value: card.isSelected ? 'True' : 'False'
        };
      });
      const datasetIdValue = this.translationPipelineTriggered ? this.translatedLang : this.selectedDataset;
      this.reqEventBody["environment"].push(...environment,
        { name: "dataset_id", value: datasetIdValue },
        { name: "org", value: sessionStorage.getItem("organization") }
      );
    }
    this.eventService.triggerPostEvent(eventName, this.reqEventBody, this.dsName).subscribe((res) => {
      this.service.message("Job Triggered Successfully", 'success');
      this.isLoading = false;
      // if (eventName == 'multi_threading_clustering')
      //   this.selectChangeHandler('dashboard');
    }, (error) => {
      this.isLoading = false;
      this.service.message('Job not triggered due to error: ' + error, 'error');
    });
  }

  searching() {
    this.datasetsService.getDatasetsLenBySearch(this.search).subscribe(response => {
      var n: Number = new Number(response);
      this.totalJobs = n.valueOf();
      var remainder = this.totalJobs % this.rows;
      var cof = (this.totalJobs - remainder) / this.rows;
      if (remainder != 0) {
        this.lastPage = cof;
      } else {
        this.lastPage = cof - 1;
      }
      if (this.totalJobs !== 0) {
        this.getDatasets('First')
      } else {
        this.page = 0;
        this.lastPage = 0;
      }
    })

  }

  changeStage(dataset) {
    this.selectedDataset = dataset;
    this.basicReqTabChange(1);
  }

  async getDataset() {
    try {
      const res = await firstValueFrom(this.datasetsService.getDatasetByNameAndOrg(this.detectedLangDatasetName));
      this.detectedLangDataset = res;
      const attributes = JSON.parse(this.detectedLangDataset.attributes);
      this.unqId = attributes['uniqueIdentifier'] ? attributes['uniqueIdentifier'] : undefined;
      if (this.unqId) this.sortEvent = this.unqId;

      let org = sessionStorage.getItem("organization");
      let pagination = { 'page': '0', 'size': '10', 'sortEvent': this.sortEvent, 'sortOrder': this.sortorder };

      const ticketRes = await firstValueFrom(this.datasetsService.searchTicketsUsingDataset(
        this.detectedLangDatasetName, org, pagination, this.finalAndObj
      ));

      this.datasetData = ticketRes;
      this.detectedLang = this.datasetData[0].DetectedLanguage;
    } catch (error) {
      console.error('Error in getDataset:', error);
    }
  }

  toggleSelection(index: number) {
    this.cards[index].isSelected = !this.cards[index].isSelected;
  }

  navigate() {
    this.location.back();
  }

  navigateToDashboard() {
    this.router.navigate(['../../../../dynamicDashboard/grid/OCC/3'], { relativeTo: this.route })
  }

  save() {
    let params: HttpParams = new HttpParams();
    params = params.set('project', sessionStorage.getItem('organization'));
    let org = sessionStorage.getItem('organization');
    let payload = {
      "name": this.workflowName,
      "Alias": this.workflowAlias,
      "workflowDetails": {
        "selectedDataset": this.selectedDataset,
      },
    }
    // this.workflowService.saveClusteringWorkflow(payload, params).subscribe((res) => {
    //   this.service.message("Saved Successfully", 'success');
    // });
  }

}
