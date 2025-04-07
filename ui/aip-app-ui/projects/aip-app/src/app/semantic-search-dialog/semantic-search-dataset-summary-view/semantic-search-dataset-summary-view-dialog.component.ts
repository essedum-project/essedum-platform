import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-semantic-search-dataset-summary-view-dialog',
  templateUrl: './semantic-search-dataset-summary-view-dialog.component.html',
  styleUrls: ['./semantic-search-dataset-summary-view-dialog.component.scss']
})
export class SemanticSearchDataSetSummaryViewDialogComponent implements OnInit {
  loadingPageForSpinner: boolean = true;
  selectedReferenceObject: any;
  pageContentObject: any;
  columns: string[] = [];
  rows: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SemanticSearchDataSetSummaryViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {

    if (this.data) {
      this.selectedReferenceObject = this.data?.selectedReferenceObject;
      this.loadingPageForSpinner = false;
      if (this.selectedReferenceObject && this.selectedReferenceObject.pageContent) {
        this.selectedReferenceObject.pageContent = this.selectedReferenceObject.pageContent.replaceAll('\\n', '\n');
        this.selectedReferenceObject.pageContent = this.selectedReferenceObject.pageContent.replaceAll('\\t', '\n');
      }
      if (this.selectedReferenceObject && this.selectedReferenceObject.pageContent && this.selectedReferenceObject.pageContent.includes('{') && this.selectedReferenceObject.pageContent.includes('}')) {
        this.pageContentObject = JSON.parse(this.selectedReferenceObject.pageContent);
        this.columns = [];
        this.rows = [];
        this.columns = Object.keys(this.pageContentObject);
        const rowCount = Object.keys(this.pageContentObject[this.columns[0]]).length;
        for (let i = 0; i < rowCount; i++) {
          const row = {};
          this.columns.forEach(column => {
            row[column] = this.pageContentObject[column][i];
          });
          this.rows.push(row);
        }
      } else {
        this.pageContentObject = undefined;
        this.columns = [];
        this.rows = [];
      }
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

}
