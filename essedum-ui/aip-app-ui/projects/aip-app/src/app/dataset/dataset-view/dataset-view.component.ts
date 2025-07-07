import { Component, DoCheck, Input, OnInit, ViewChild } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Subscription } from 'rxjs';
import { Services } from '../../services/service';

export class PaginationAttributes {
  page: any
  size: any
  sortEvent: any
  sortOrder: any
}
@Component({
  selector: 'app-dataset-view',
  templateUrl: './dataset-view.component.html',
  styleUrls: ['./dataset-view.component.scss']
})
export class DatasetViewComponent {
  @Input('data') data;
  dataset: any;
  datasetData: any;
  datasetData1: any;
  filename: any;
  filepath: any;
  heading: any;
  property: any;
  propertyArray: any = [];
  series1: any;
  chart1: any;
  xaxis1: any;
  labels1: any;
  viewtables: boolean = false;
  viewjson: boolean = false;
  busy: Subscription;
  datasource: any;
  datasetNamebackup;

  @ViewChild('columnJsonEditor', { static: false }) columnJsonEditor: JsonEditorComponent;
  @ViewChild('formJsonEditor', { static: false }) formJsonEditor: JsonEditorComponent;

  editorOptions = new JsonEditorOptions();
  schemaForm: any;

  constructor(private service: Services) { }

  ngOnInit() {

    this.datasetNamebackup = this.data?.name
    this.getDatasetDetails();

    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.mode = "text";

    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.onChange = () => {
      this.schemaForm = this.formJsonEditor.get();
    }
  }

  getDatasetDetails() {
    this.service.getDataset(this.data?.name).subscribe(res => {
      this.dataset = res;
      if (this.dataset != null) {
        this.service.getDatasource(this.dataset?.datasource).subscribe(resp => {
          this.datasource = resp
        }, err => { }, () => {
          if (this.datasource?.type.toLowerCase() == 'aws') {
            this.busy = this.service.getTextDatasetDetails(this.dataset).subscribe(resp => {
              this.processResponse(resp)
            }, error => {
              this.datasetData = error
            }
            )
          } else {
            this.busy = this.service.getDatasetDetails(this.dataset).subscribe(resp => {
              this.processResponse(resp)
            }, error => {
              this.datasetData = error
            }
            )
          }
        })

      }
      else {
        this.dataset = this.data
        this.service.getDatasource(this.data?.datasource?.name).subscribe(resp => {
          this.datasource = resp
        }, err => { }, () => {
          let pagination: PaginationAttributes = new PaginationAttributes();
          pagination.page = 0;
          pagination.size = 10;
          this.busy = this.service.getDirectDatasetDetails(this.data, pagination).subscribe(resp => {
            this.processResponse(resp);
          },
            error => {
              this.datasetData = error
            }
          )
        })
      }
    },
      error => console.log(error));
  }

  processResponse(resp) {
    try {
      this.viewtables = false;
      this.viewjson = false;
      if (this.datasource?.category?.toString().toUpperCase().trim() != 'REST') {
        if (this.datasource.type === 'FILE') {
          this.filename = this.dataset ? JSON.parse(this.dataset.attributes)['file'] : this.data.attributes['file'];
          if (resp && Array.isArray(resp) && resp[0]) {
            this.datasetData = resp.map(ele => Object.values(ele));
            this.heading = Object.keys(resp[0])
            this.viewtables = this.datasetData.length > 1;
          }
          else {
            this.datasetData = resp
          }
          return
        }
        this.busy = this.service.checkVisualizeSupport(this.data?.name)
          .subscribe(res => {
            if (res?.filter(ele => ele["Tabular View"]).length > 0) {
              try {
                var response = this.dataset ? JSON.parse(resp) : resp
                if (response.rows) {
                  this.heading = response.Heading;
                  this.datasetData = response.rows;
                  this.viewtables = true;
                } else {
                  if (this.dataset || !(this.datasetData?.length > 0 && this.datasetData[0]?.length > 1)) {
                    if (!this.checkForJsonView(resp))
                      this.datasetData = JSON.parse(JSON.stringify(resp));
                  }
                  else {
                    this.datasetData = JSON.parse(resp);
                    this.viewtables = true;
                  }
                }
              }
              catch (Exception) {
                if (!this.checkForJsonView(resp))
                  this.datasetData = resp;
              }
            }
            else {
              if (!this.checkForJsonView(resp))
                this.datasetData = JSON.parse(JSON.stringify(resp));
            }
          },
            err => {
              if (!this.checkForJsonView(resp))
                this.datasetData = resp;
            })
      }
      else {
        this.viewjson = true;
        try {
          if (typeof (resp) == 'object')
            this.datasetData = resp;
          else
            this.datasetData = JSON.parse(resp);


          this.datasetData = JSON.stringify(resp);
          this.schemaForm = resp;


        }
        catch (error) {
          this.viewjson = false
          resp = resp.replaceAll("\x00", "")
          this.datasetData = resp;
        }
      }
    }
    catch (Exception: any) {
      this.service.messageService("Some error occured", "Error")
    }

  }

  checkForJsonView(resp) {
    if (resp && ((Array.isArray(resp) && resp[0]) || typeof (resp) == "object")) {
      this.schemaForm = resp;
      this.viewjson = true;
      return true;
    }
    else {
      try {
        this.schemaForm = JSON.parse(resp);
        this.viewjson = true;
        return true;
      }
      catch (Exception: any) {
        return false;
      }
    }
  }

  processRestData(resp) {
    try {
      var script_str = JSON.parse(this.dataset.attributes)['TransformationScript'];
      if (script_str?.startsWith("[") && script_str?.endsWith("]")) {
        var script_obj = JSON.parse(script_str);

        var s = "";

        for (var p = 0; p < script_obj.length; p++) {
          var k = script_obj[p];
          k.replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "");
          s += k;
        }

        if (s.length > 1) {
          let ts = JSON.parse(JSON.parse(this.dataset.attributes)['TransformationScript']);
          let script = "";
          let i;
          for (i = 0; i < ts.length; i++) {
            script += "\n" + ts[i];
          }
          this.datasetData = JSON.stringify(resp);

          let result = new Function('response', script);
          this.schemaForm = result(this.datasetData);

        }

        else {
          this.datasetData = JSON.stringify(resp);
          this.schemaForm = resp;

        }
      }
      else {
        this.datasetData = JSON.stringify(resp);
        this.schemaForm = resp;
      }

    }
    catch (Exception: any) {
      this.service.messageService("Some error occured", "Error")
    }

  }

  downloadFile() {
    this.busy = this.service.downloadFile(this.filename, this.dataset).subscribe(res => {
      const blob = new Blob([(<any>res)._body], { type: 'application/vnd.ms-excel' });
      const myReader = new FileReader();
      myReader.readAsText(blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = this.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove(); // remove the element
    }, error => {
    }, () => {
    });
  }


  ngDoCheck() {
    if (this.datasetNamebackup != this.data?.name) {
      this.datasetNamebackup = this.data.name
      this.ngOnInit()
    }
  }
}
