import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Services } from '../../services/service';

@Component({
  selector: 'app-semantic-search-dataset-view-dialog',
  templateUrl: './semantic-search-dataset-view-dialog.component.html',
  styleUrls: ['./semantic-search-dataset-view-dialog.component.scss']
})
export class SemanticSearchDataSetViewDialogComponent implements OnInit {
  type: any;
  loadingPageForSpinner: boolean = true;
  datasetViewData: any;
  views: any;
  obj:string;
  fileName: string;
  selectedReferenceObject: any;

  constructor(
    public dialogRef: MatDialogRef<SemanticSearchDataSetViewDialogComponent>,
    private service: Services,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {

    if (this.data) {
      this.type = this.data.viewType;
      this.selectedReferenceObject=this.data?.selectedReferenceObject;
      if (this.data.viewType == 'Json View') {
        this.service.getDatasetByNameAndOrg(this.data.datasetId, this.data.org).subscribe(resp => {
          this.datasetViewData = resp;
          this.views = this.data.viewType;
          this.loadingPageForSpinner = false;
        });
      } else if (this.data.viewType == 'Table View') {
        this.datasetViewData = this.data.datasetId;
        this.views = this.data.viewType;
        this.loadingPageForSpinner = false;
      }
      else if (this.data.viewType == 'Folder View') {
        this.service.getDatasetByNameAndOrg(this.data.datasetId, this.data.org).subscribe(resp => {
          let datasetViewDataResp = resp;
          let params = { page: 0, size: 50 }
          this.service.getProxyDbDatasetDetails(
            datasetViewDataResp,
            datasetViewDataResp.datasource,
            params,
            datasetViewDataResp.organization,
            true
          ).subscribe(resp => {
            this.datasetViewData = resp
            this.loadingPageForSpinner = false;
            this.datasetViewData?.[0]?.forEach(file => {
              if (this.data.object && file.includes(this.data.object)) {
                const splitBySlash = file.split('/');
                this.fileName = splitBySlash.slice(1).join('/');
                this.selectedReferenceObject['fileName'] = this.fileName;
              }
            });
          }, err => {
            console.log(err);
          });
          this.views = this.data.viewType;
        });
      }
      else {
        if (this.data.path && this.data.path.includes('/')) {
          this.obj ='';
          let parts = this.data.path.split('/');
          this.obj = this.data.actualObject;
          if (parts.length > 2) {
            this.data.actualObject = parts.slice(1).join('/');
            this.data.actualObject = this.data.actualObject + '/' + this.obj;
          }
          else {
            this.data.actualObject = parts.slice(1);
            this.data.actualObject = this.data.actualObject + '/' + this.obj;
          }
        }
        this.service.getNutanixFileData(this.data.datasetId, [this.data.actualObject], this.data.org).subscribe(resp => {
          if (resp) {
            this.datasetViewData = resp;
            this.views = this.data.viewType;
            this.loadingPageForSpinner = false;
          }
        });
      }
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

}
