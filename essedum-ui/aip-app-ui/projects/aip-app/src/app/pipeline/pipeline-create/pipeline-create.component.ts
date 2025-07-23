import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { StreamingServices } from '../../streaming-services/streaming-service';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef,MatDialog } from '@angular/material/dialog';
import { Services } from '../../services/service';
import * as _ from "lodash";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pipeline-create',
  templateUrl: './pipeline-create.component.html',
  styleUrls: ['./pipeline-create.component.scss']
})
export class PipelineCreateComponent implements OnInit {
  @Output() responseLink = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();
  @Input() interfaceType: string = "pipeline";
  busy: Subscription;
  name = '';
  alias = '';
  description = '';
  groups: boolean = false
  type: any;
  ssTypes = ['DragAndDrop', 'DragNDropLite', 'Binary', 'NativeScript', 'Agents'];
  inputColumns = new FormControl('', Validators.required);
  selectedFile: File;
  importedJson: string;
  isAuth: any = false;
  fileData: any = {
    'agenttype': '',
    'filetype': 'Python3',
    'files': [],
    'config': []
  };
  @Input('dataset') matData: any;
  plugins = []
  options = []
  isTemplate: boolean = false
  edit: boolean = false
  script: any[] = [];
  errFlag: boolean = false;
  fetchOrg: string;

  constructor(
    public dialogRef: MatDialogRef<PipelineCreateComponent>,
    public dialog: MatDialog,
    private Services: Services,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    dialogRef.disableClose = true;
  }


  ngOnInit() {
    this.authentications();
    if (this.data) {
      if (this.data.type) {
        this.type = this.data.type;
      }
      if (this.data.interfacetype) {
        this.interfaceType = this.data.interfacetype;
      }
      if (this.data.edit) {
        this.edit = this.data.edit
      }
      if (this.data) {
        if (this.data.canvasData) {
          if (this.data.canvasData.is_template) {
            this.isTemplate = true;
          }
          if (this.data.canvasData.type) {
            this.type = this.data.canvasData.type;
          }
          if (this.data.canvasData.alias) {
            this.alias = this.data.canvasData.alias;
          }
          if (this.data.canvasData.description) {
            this.description = this.data.canvasData.description;
          }
          if (this.data.canvasData.interfacetype) {
            this.interfaceType = this.data.canvasData.interfacetype;
          }
        }
      }
      let databckp = _.cloneDeep(this.data)
      if (this.data?.action) {
        this.data.canvasData = databckp
        delete this.data.canvasData.created_date
      }
    }
    this.getAllPlugins()
    this.ssTypes.push('Azure');
    this.ssTypes.push('Vertex');
    this.ssTypes.push('ICMM');
    this.ssTypes.push('Mlflow');
    this.ssTypes.push('AWS');
    this.ssTypes.push('CodeBuddy');
    this.ssTypes.push('Haystack');

    this.groups = true

  }

  authentications() {
    this.Services.getPermission("cip").subscribe(
      (cipAuthority) => {
        // edit/update permission
        if (cipAuthority.includes("edit")) this.isAuth = false;
      }
    );
  }

  checkAll(event) {
    this.isTemplate = event;
  }

  saveDetails() {
    try {
      // if (this.isWordValid(this.name)) {
      if (this.type && this.alias.length) {
        const newCanvas = new StreamingServices();
        newCanvas.alias = this.alias;
        newCanvas.description = this.description;
        newCanvas.type = this.type;
        // newCanvas.interfacetype = this.type;
        if (newCanvas.type === 'Langchain') {
          newCanvas.interfacetype = 'chain';
        } else if (newCanvas.type === 'App') {
          newCanvas.interfacetype = 'App';
        } else if (newCanvas.type === 'Tool') {
          newCanvas.interfacetype = 'tool';
        } else {
          newCanvas.interfacetype = this.interfaceType;
        }

        newCanvas.is_template = this.isTemplate;
        const temp = [];
        if (this.inputColumns.value != null) {
          if (Array.isArray(this.inputColumns.value)) {
            newCanvas.groups = this.inputColumns.value;
          }
        }
        if (this.data && this.data.sourceToCopy) {
          if (newCanvas.type != "NativeScript" && newCanvas.type != "Binary") {
            if (this.data.pipeline_attributes) {
              newCanvas.json_content = JSON.stringify({ 'elements': this.data.sourceToCopy, 'pipeline_attributes': this.data.pipeline_attributes });
            } else {
              newCanvas.json_content = JSON.stringify({ 'elements': this.data.sourceToCopy });
            }
          }
          else {
            if (this.data.pipeline_attributes) {
              newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': this.data.sourceToCopy }], 'pipeline_attributes': this.data.pipeline_attributes });
            } else {
              newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': this.data.sourceToCopy }] });
            }
          }
        }

        if (this.importedJson) {
          newCanvas.json_content = this.importedJson;
        }


        this.Services.create(newCanvas).subscribe((data) => {
          this.responseLink.emit(data);
          if (data.type == "NativeScript") {
            if (data.json_content) {
              let json_content = JSON.parse(data.json_content)
              let script_file = json_content.elements[0].attributes.files[0]
              let script_pipeline_name = script_file.split('_')[0]

              this.Services.readNativeFile(script_pipeline_name, data.organization, script_file).subscribe(
                resp => {
                  // this.script = resp;
                  const textDecoder = new TextDecoder('utf-8');
                  this.script = textDecoder.decode(resp).split('\n');
                  json_content.elements[0].attributes.files[0] = data.name + "_" + sessionStorage.getItem('organization') + ".py";
                  data.json_content = JSON.stringify(json_content)

                  const formData: FormData = new FormData();
                  let script = this.script.join('\n')
                  let scriptFile = new Blob([script], { type: 'text/plain' });
                  formData.set('scriptFile', scriptFile);
                  this.Services.createNativeFile(data.name, data.organization, json_content.elements[0].attributes.files[0], json_content.elements[0].attributes.filetype, formData).subscribe();
                  this.Services.update(data).subscribe();
                }, error => {
                }
              );
            }
     

          }
          this.Services.message("Created Sucessfully.", "success");
          this.dialogRef.close(data);


          if (this.data.edit || this.data.copy) {
            this.dialogRef.close(data);
          } else {
            this.closeModal();
             this.dialogRef.close(data);

          }
 
        },
          error => {
              this.Services.message(`Error: ${error}`, 'error');
          }

        );
      } else {
        this.errFlag = true
      }
    }
    catch (Exception) {
      this.Services.message("Some error occured",'error');
    }


  }
  getAllPlugins() {
    let org
    this.plugins = []
    this.options = []
    this.Services.getConstantByKey('icip.aip.pluginView').subscribe((response) => {
      this.fetchOrg = response.body;
      if (this.fetchOrg == 'all') {
        this.Services.getAllPlugins(sessionStorage.getItem('organization')).subscribe(res => {
          this.plugins = res.filter(r => r.type != null);
          this.plugins.push({ type: "NativeScript" })
          this.plugins.forEach((opt) => {
            let val = { viewValue: opt.type, value: opt.type };
            if (opt.type === 'NativeScript') {
              this.options.push(val);
            }
          })
          this.type=this.options[0].value;
        },
          error => {
            this.Services.message('Error '+error,'error');
          }
        );
      }
      else {
        this.Services.getAllPluginsByOrg(sessionStorage.getItem('organization')).subscribe(res => {
          this.plugins = res.filter(r => r.type != null);
          this.plugins.push({ type: "NativeScript" })
          this.plugins.forEach((opt) => {
            let val = { viewValue: opt.type, value: opt.type };
          if (opt.type === 'NativeScript') {
              this.options.push(val);
            }
          })
          this.type=this.options[0].value;
        },
          error => {
            this.Services.message('Error '+error,'error');
          }
        )
      }
    });
  }

  closeModal() {
    if (this.data && (this.data.edit || this.data.copy || this.router.url.includes('/initiative'))) {
      this.dialogRef.close();
    } else {
      this.dialogRef.close();
      this.dialogRef.afterClosed().subscribe(() => {
        this.modalClosed.emit();
      });
    }
  }

  
  closePipelineOpenDialog(): void {
    const openDialogs = this.dialog.openDialogs;
    for (const dialog of openDialogs) {
      if (dialog.componentInstance instanceof PipelineCreateComponent) {
        dialog.close();
      }
    }
  }

  dropChange(val) {
    if (this.data && this.data.canvasData) {
      this.data.canvasData.groups = this.inputColumns.value;
    }
  }


  onFileChanged(event: { target: { files: File[]; }; }) {
    try {
      this.selectedFile = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsText(this.selectedFile, 'UTF-8');
      fileReader.onload = () => {
        const json = JSON.parse(fileReader.result as string);
        this.importedJson = JSON.stringify(json, null, 2);
      };
      fileReader.onerror = (error) => {
      };
    }
    catch (Exception) {
      this.Services.message("Some error occured",'error')
    }


  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    }
    catch (Exception) {
     
    }
  }


  omit_special_char(event) {
    var k = event.charCode
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  isWordValid(word) {
    word = word.toString()
    return true
  }
  editDetails() {
    try {
      const editCanvas = this.data.canvasData;
      this.Services.getStreamingServices(editCanvas.cid).subscribe((res) => {
        editCanvas.job_id = res.job_id;
        editCanvas.is_template = this.isTemplate;
        editCanvas.alias = this.alias;
        editCanvas.description = this.description;
        editCanvas.type = this.type;
  
        if (this.importedJson) {
          editCanvas.json_content = this.importedJson;
        } else {
          editCanvas.json_content = res.json_content;
        }

        this.Services.update(editCanvas).subscribe((response) => {
          this.Services.message('Updated Successfully', 'success');
          this.responseLink.emit(response);
          this.dialogRef.close(response);
        },
          error => this.Services.message('Canvas not updated due to error: ' + error, 'error')
        );

      });
    }
    catch (Exception) {
      this.Services.message("Some error occured", "error")
    }
  }


}