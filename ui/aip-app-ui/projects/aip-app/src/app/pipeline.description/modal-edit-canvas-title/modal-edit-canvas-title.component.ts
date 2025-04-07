//  @ 2018 Infosys Limited, Bangalore, India. All Rights Reserved.
//  Version: 1.0
//  Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
//  this Program is protected by copyright laws, international treaties and  other pending or existing intellectual property
//  rights in India, the United States, and other countries. Except as expressly permitted, any unauthorized reproduction, storage,
//  transmission in any form or by any means(including without limitation electronic, mechanical, printing, photocopying,
//  recording, or otherwise), or any distribution of this program, or any portion of it, may result in severe civil and
//  criminal penalties, and will be prosecuted to the maximum extent possible under the law.
//

import { Component, OnInit, Inject, SimpleChanges, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MessageService } from '../../sharedModule/service/message.service';
// import { StreamingServicesService } from '../../entities/streaming-services/streaming-services.service';
// import { StreamingServices } from '../../entities/streaming-services/streaming-services';
import { FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from "lodash";
import { Services } from '../../services/service';
import { StreamingServices } from '../../streaming-services/streaming-service';
// import { PluginService } from '../plugin/plugin.service';
// import { DatasetsService } from '../../entities/datasets/datasets.service';
// import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: 'app-modal-edit-canvas-title',
  templateUrl: './modal-edit-canvas-title.component.html',
  styleUrls: ['./modal-edit-canvas-title.component.scss']
})

export class ModalEditCanvasTitleComponent implements OnInit {

  name = '';
  alias = '';
  description = '';
  colList: any = [];
  groups: boolean = false
  type = 'DragAndDrop';
  ssTypes = ['DragAndDrop', 'DragNDropLite', 'Binary', 'NativeScript', 'Agents', 'R'];
  agentTypes = ["File Watcher", "Metric Watcher"];
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
  tagsSelected;
  tag;
  tags: any = "";
  tagsDisp = new FormControl("");
  @Input('dataset') matData: any;
  plugins = []
  isTemplate: boolean
  isLegacy: boolean
  constructor
    (
      public dialogRef: MatDialogRef<ModalEditCanvasTitleComponent>,
      private service: Services,
      // private streamingServicesService: StreamingServicesService,
      // public messageService: MessageService,
      private route: Router,
      public activatedRoute: ActivatedRoute,
      @Inject(MAT_DIALOG_DATA) public data: any,
      // public datasetService: DatasetsService,
      // private pluginService: PluginService
    ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.getAllPlugins()
    if (sessionStorage.getItem("cipAuthority") &&
      sessionStorage.getItem("cipAuthority").includes("edit")) this.isAuth = false;
    this.fetchGroup();
    if (this.data) {
      if (this.data.type) {
        this.type = this.data.type;
      }
      if (this.data) {
        if(this.data.canvasData){
          if (this.data.canvasData.interfacetype && this.data.canvasData.interfacetype === "template") {
            this.isTemplate = true;
          } else if (this.data.canvasData.interfacetype && this.data.canvasData.interfacetype === "legacy") {
            this.isLegacy = true;
          }
        }else{
        if (this.data.interfacetype === "template") {
          this.isTemplate = true;
        } else if (this.data.interfacetype === "legacy") {
          this.isLegacy = true;
        }
      }
      }
      let databckp = _.cloneDeep(this.data)
      if (this.data?.action) {
        this.data.canvasData = databckp
        delete this.data.canvasData.created_date
      }
    }
    // if ((this.route.url).includes('iamp-iecp')) {
    this.ssTypes.push('Azure');
    this.ssTypes.push('Vertex');
    this.ssTypes.push('ICMM');
    this.ssTypes.push('Mlflow');
    this.ssTypes.push('AWS');
    this.ssTypes.push('CodeBuddy');
    this.ssTypes.push('Haystack');

    this.groups = true
    // }
    if (this.data?.canvasData?.tags) {
      this.data.canvasData.tags = JSON.parse(this.data.canvasData.tags)
    }

    this.fetchTags();
  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }
  }
  alterTemplate(event, interfacetype: string) {
    if (event.checked) {
      if (interfacetype === 'template') {
        this.isTemplate = true;
        this.isLegacy = false;
      } else {
        this.isLegacy = true;
        this.isTemplate = false;
      }

    } else {
      if (interfacetype === 'template') {
        this.isTemplate = false
      } else {
        this.isLegacy = false
      }
    }
  }

  omit_special_char(event) {
    var k = event.charCode
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return ((k >= 65 && k <= 90) || (k >= 97 && k <= 122) || (k >= 48 && k <= 57) || [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1)
  }

  getAllPlugins() {
    this.service.getAllPlugins(sessionStorage.getItem('organization')).subscribe(res => {
      this.plugins = res.filter(r => r.type != null);
      this.plugins.push({ type: "NativeScript" })
      this.plugins.push({ type: "Binary" })
      this.plugins.push({ type: "R" })
      this.service.message('Fetched Sucessfully','success');
    },
      error => {
        this.service.message('Could not get the results', 'error');
      }
    );
  }

  isWordValid(word) {
    word = word.toString()
    //for (var i = 0, j = word.length; i < j; i++) {
    //  if (!this.isValidLetter(word.charCodeAt(i))) {
    //    return false
    //  }
    //}
    return true
  }

  saveDetails() {
    try {
      // if (this.isWordValid(this.name)) {
      const newCanvas = new StreamingServices();
      newCanvas.alias = this.alias;
      newCanvas.description = this.description;
      newCanvas.type = this.type;
      newCanvas.tags = JSON.stringify(this.tagsDisp.value)
      if (this.fileData.agenttype != '') {
        if (this.fileData.agenttype == 'Metric Watcher')
          this.fileData.agenttype = "metric"
        if (this.fileData.agenttype == 'File Watcher')
          this.fileData.agenttype = "filewatcher"
        newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': this.fileData }] });
      }
      if (this.isTemplate) {
        newCanvas.interfacetype = 'template';
      }
      if (this.isLegacy) {
        newCanvas.interfacetype = 'legacy';
      }
      const temp = [];
      if (this.inputColumns.value != null) {
        if (Array.isArray(this.inputColumns.value)) {
          this.inputColumns.value.forEach(element => {
            temp.push(JSON.parse(element).name);
          });
        }
      }
      newCanvas.groups = temp;
      newCanvas.type = this.type;
      if (this.data && this.data.sourceToCopy) {
        if (newCanvas.type == "DragAndDrop")
          newCanvas.json_content = JSON.stringify({ 'elements': this.data.sourceToCopy });
        else
          newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': this.data.sourceToCopy }] });
      }
      if (this.importedJson) {
        newCanvas.json_content = this.importedJson;
      }
      // if (newCanvas.type == "NativeScript") {
      //   newCanvas.json_content = JSON.stringify({ 'elements': [{ 'attributes': { 'version': 'v2' } }] });
      // }
      this.service.create(newCanvas).subscribe((data) => {

        console.log("resp", data);
        console.log("resp name", data.name);
        this.service.message('Created Successfully','success');

        this.service.addGroupModelEntity(data.name, temp).subscribe();

        this.dialogRef.afterClosed().subscribe(() => {
          this.route.navigate(['landing/iamp-iecp/preview/pipelines', data.name], { state: { data } });

        });
        this.dialogRef.close({ group: temp[0].name, data: data });

      },
        error => this.service.message('Canvas not Created due to error: ' + error,'error')
      );
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }


  }

  editDetails() {
    try {
      const editCanvas = this.data.canvasData;
      this.service.getStreamingServices(editCanvas.cid).subscribe((res) => {
        editCanvas.job_id = res.job_id;
        editCanvas.json_content = res.json_content;
        editCanvas.tags = JSON.stringify(this.tagsDisp.value)
        const temp = [];
        if (this.isTemplate || this.isLegacy) {
          if (this.isTemplate) {
            editCanvas.interfacetype = 'template'
          } else {
            editCanvas.interfacetype = 'legacy'
          }
        } else {
          editCanvas.interfacetype = null;
        }
        if (this.inputColumns.value != null) {
          if (Array.isArray(this.inputColumns.value)) {
            this.inputColumns.value.forEach(element => {
              temp.push(JSON.parse(element).name);
            });
          }
        }
        editCanvas.groups = temp;
        setTimeout(() => {
          editCanvas.canvasData = {};
          this.service.update(editCanvas).subscribe((response) => {
            this.service.message( 'Updated Successfully','success');
            this.service.addGroupModelEntity(this.data.canvasData.name, temp).subscribe();
            this.dialogRef.close(response);
          },
            error => this.service.message('Canvas not updated due to error: ' + error,'error')
          );
        }, 3000)
      });
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }
  }


  fetchGroup() {
    try {
      this.service.getPipelineGroups().subscribe((res) => {
        this.colList = [];
        res.forEach((element: { id: any; alias: any; name: any; description: any; organization: any; groupType: any; }) => {
          const newelement = {};
          newelement['id'] = element.id;
          newelement['alias'] = element.alias;
          newelement['name'] = element.name;
          newelement['description'] = element.description;
          newelement['organization'] = element.organization;
          newelement['groupType'] = element.groupType;
          this.colList.push(newelement);
        });
        this.colList.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        if (this.data.group != "NA") {
          const temp = [];
          const index = this.colList.findIndex(i => i.name === this.data.group);
          if (index !== -1) {
            temp.push(JSON.stringify(this.colList[index]));
            this.inputColumns.setValue(String(temp));
          }
        }
        if (this.data && this.data.canvasData && this.data.canvasData.name !== '') {
          this.service.getGroupsForEntity(this.data.canvasData.name).subscribe(res1 => {
            const temp = [];
            res1.forEach(element => {
              const index = this.colList.findIndex(i => i.name === element.name);
              if (index !== -1) {
                temp.push(JSON.stringify(this.colList[index]));
              }
            });
            this.inputColumns.setValue(String(temp));
          });
        }
      });
    }
    catch (Exception) {
      this.service.message("Some error occured", "error")
    }


  }

  closeDialog() {
    this.dialogRef.close();
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
      this.service.message("Some error occured", "error")
    }


  }

  fetchTags() {
    this.service.getMlTags().subscribe(res => {
      this.tagsSelected = res;
    });

  }
}
