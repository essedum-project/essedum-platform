import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Services } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import mammoth from 'mammoth';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})

export class DocumentViewComponent implements AfterViewInit{
  tab: String;
  content: any;
  datasetName: any;
  fileData: any;
  language: string;
  loadingPageForSpinner: boolean = true;
  langOption: { viewValue: string; value: string; }[];
  opts = [{ viewValue: 'English', value: 'eng' }, { viewValue: 'Hindi', value: 'hin' }, { viewValue: 'German', value: 'deu' }, { viewValue: 'Telugu', value: 'tel' },
  { viewValue: 'Kannada', value: 'kan' }, { viewValue: 'Tamil', value: 'tam' }, { viewValue: 'French', value: 'fre' }, { viewValue: 'Spanish', value: 'spa' }]
  view: any;
  dataset: any;
  datasetDataErr: any;
  datasetData: any;
  fileName: string;
  path: any;
  @ViewChild('docxIframe') docxIframe: ElementRef;
  htmlstring: any;
  dataDoc: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DocumentViewComponent>,
    private service: Services,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // this.route.params.subscribe((params) => {
    //   this.datasetName = params['cname'];
    //   this.tab = "View Document: " + params['cname'];
    // });
    this.langOption = this.opts;
    this.language = this.langOption[0].value;
    if (this.data) {
      this.tab = this.data.type;
      this.datasetName = this.data.datasetName;
      if (this.tab === 'View') {
        this.loadingPageForSpinner = false;
      } else {
        let fullPath = this.getFilePath();
        let fileDataRes = this.getFileData(fullPath);
        fileDataRes.then(res => {
          this.fileData = res;
          this.loadingPageForSpinner = false;
        });
      }
    }
  }

  ngAfterViewInit(): void {
    this.getDatasetData();
  }

  isEmptyArray(data: any[]): boolean {
    if (!data)
      return true;
    return data.length === 1 && Array.isArray(data[0]) && data[0].length === 0;
  }

  getDatasetData() {
    this.service.getDataset(this.datasetName).subscribe(resp => {
      this.dataset = resp;
      this.view = this.dataset.views ? this.dataset.views : '';
      this.path = JSON.parse(this.dataset.attributes).path;
      this.fileName = this.path + '/' + JSON.parse(this.dataset.attributes).object;
      if (this.view) {
        this.service.getDatasource(this.dataset.datasource).subscribe(res => {
          this.dataset.datasource = res;
          let params = { page: 0, size: 50 }
          this.service.getProxyDbDatasetDetails(
            this.dataset,
            this.dataset.datasource,
            params,
            this.dataset.organization,
            true
          ).subscribe(resp => {
            this.http.get(resp[0], { responseType: 'arraybuffer' }).subscribe(async (docxArray) => {
              let docxHtml = mammoth.convertToHtml({ arrayBuffer: docxArray })
              await docxHtml.then((result) => {
                this.dataDoc = true;
                this.htmlstring = result.value;
              })
              .catch(function(err) {
                  console.error(err);
              });
            });
          }, err => {
            console.log(err);
            this.datasetDataErr = err;
          });
        }, err => { console.log(err) });

      }
    }, err => { console.log(err) });
  }

  getExtntype(extension: any): string {
    switch (extension) {
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      default:
        return '';
    }
  }

  base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return byteArray;
  }

  getFilePath() {
    let path = JSON.parse(this.data.attributes).path + '/' + JSON.parse(this.data.attributes).object;
    const pathDetails = path.split('/');
    const lstPath = pathDetails[pathDetails.length - 1]
    let filenameNoExt = lstPath.replace(/\.[^/.]+$/, '')
    let fullPath: string = '';
    let part: string[] = path.split("/");
    let name: string = part[part.length - 1].split(".")[0];
    if (path.split("/").length === 2) {
      fullPath = ".aip/" + this.tab + '/' + filenameNoExt
    } else {
      let path: string = part.slice(0, part.length - 1).join("/");
      let parts: string[] = path.split("/");
      parts.shift();
      path = parts.join("/");
      fullPath = path + "/.aip/" + this.tab + '/' + filenameNoExt
    }
    if (this.tab === 'Translation') {
      fullPath = fullPath + '_' + this.language;
    }
    fullPath = fullPath + ".txt";
    return fullPath;
  }

  // Translation Summary FAQ 
  getFileData(fileName) {
    return this.service.getNutanixFileData(this.datasetName, [fileName], localStorage.getItem('organization')).toPromise()
      .catch(err => this.service.messageService('Some error occured while fetching file'));
  }

  onLanguageChange(newLanguage: string) {
    this.language = newLanguage;
    this.loadingPageForSpinner = true;
    this.getFilePath();
  }

  closeModal() {
    this.dialogRef.close();
  }

}
