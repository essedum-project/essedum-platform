import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupsService } from '../../services/groups.service';
import { DatasetServices } from '../dataset-service';
import { Services } from '../../services/service';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { StringUtils } from "turbocommons-ts";
import { saveAs as importedSaveAs } from "file-saver";
import * as _ from "lodash";
import { MatRadioChange } from '@angular/material/radio';
import { OptionsDTO } from '../../DTO/OptionsDTO';
import { LedsModalService } from 'leds-lib';

@Component({
  selector: 'app-dataset-load',
  templateUrl: './dataset-load.component.html',
  styleUrls: ['./dataset-load.component.scss']
})
export class DatasetLoadComponent implements OnInit, OnChanges {
  @ViewChild('taskStepper') taskStepper: MatStepper;
  @Input("dataset") data: any;
  @Input("clustering") clustering: boolean = false;
  @Input("selectedDataset") selectedDataset: any;
  task: any;
  @Input() showdateformat: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();
  selectedFile: any;
  isLinear = false;
  uploaded: Boolean = false;
  overwrite: boolean = false;
  isRawData: boolean = false;
  schemaAlias: any;
  schemaName: any;
  isInEdit: boolean = false;
  schemaExists: any;
  dataset: any;
  list: any = [];
  url: any;
  schemaValue: any = "";
  mapping: any = [];
  mappingJson = {};
  dataSource: any[] = [];
  tableDataSource: any[] = [];
  groups: any[] = [];
  excelColumns: any = [];
  formattedExcelCols = [];
  errorList = [];
  uploadedFiles: any[];
  schemasList: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = ["map", "column"];
  displayedColumns2: string[] = [
    "columnorder",
    "columntype",
    "recordcolumnname",
    "recordcolumndisplayname",
  ];
  selectedGroups: any = [];
  isAuth = true;
  attributes;
  primarysel = "existingcol";
  pkname;
  filechoose = "newfile";
  tabPrimary = {};
  originalSchemas: any[] = [];
  taskList = [];
  dateformats = ["dd-MM-yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy-dd-MM", "dd/MM/yyyy", "MM/dd/yyyy",
    "yyyy/MM/dd", "yyyy/dd/MM", "dd-MM-yyyy HH:mm", "MM-dd-yyyy HH:mm", "dd/MM/yyyy HH:mm",
    "MM/dd/yyyy HH:mm", "yyyy-MM-dd HH:mm", "yyyy/MM/dd HH:mm", "yyyy-dd-MM HH:mm",
    "yyyy/dd/MM HH:mm", "dd-MM-yyyy HH:mm:ss", "dd/MM/yyyy HH:mm:ss", "MM-dd-yyyy HH:mm:ss",
    "MM/dd/yyyy HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd HH:mm:ss", "yyyy-dd-MM HH:mm:ss",
    "yyyy/dd/MM HH:mm:ss", "yyyy-MM-dd'T'HH:mm:ssZ"]
  dateformats1 = ["dd-MM-yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy-dd-MM", "dd/MM/yyyy", "MM/dd/yyyy",
    "yyyy/MM/dd", "yyyy/dd/MM"]
  timeformats = ["HH:mm:ss"]
  public isMenuOpen: boolean = false;
  isTableExists = false;
  busy: Subscription;
  displayedColumns3: string[] = [
    "columntype",
    "tablecolumn",
    // "primary",
    "unique",
    "required",
    // "autoincrement",
    "excelcols",
    "dateformat"
  ];
  displayedColumns4 = ["columntype", "columnname", "action"]
  datatypes = [
    "string",
    "int",
    "text",
    "date",
    "time",
    "datetime",
    "timestamp",
    "boolean",
    "float",
    "double"
  ];
  crtFrmTmpltErr: string = "";
  fieldTitles: any[] = [];
  fieldTitlesCopy: any[] = [];
  selectedFieldTitles: any[] = [];
  schmjsn: any = {};
  showFormTemplate: boolean = false;
  datasetSchema: any;
  tableName: string;
  error;
  dialogOpen = false;
  validate = false;
  instructions = false;
  specificInstructions = false;
  tmpltNmVld: boolean = false;
  templateName: string;
  templateTags: string[] = [];
  formTemplate: any;

  extraColumns = []
  fileToUpload: any;
  uploadedFile: any;
  showPreprocess: boolean = false;
  preprocessScript: any = "$";
  selectedFileObj: any;
  isRestDataset = true;
  newfileToUpload: boolean = true;
  uploadedFilesOptions: OptionsDTO[] = [];
  cipAuthority: any;
  showCloseButton: boolean = true;
  showPanel: boolean = false;
  docName: any;

  public onSidenavClick(): void {
    this.isMenuOpen = true;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private groupService: GroupsService,
    private datasetsService: DatasetServices,
    private datasourceService: Services,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: LedsModalService
  ) { }

  ngOnInit() {
    try {
      this.authentications();
      if (this.route.snapshot?.children[0]?.params?.["action"] == "upload")
        this.specificInstructions = true
      this.loadGroups();
      if(this.clustering) this.data = this.selectedDataset;
      this.busy = this.datasetsService.getDataset(this.data).subscribe(
        (res) => {
          this.dataset = res;
          this.isTablePresent();
          this.attributes = JSON.parse(this.dataset.attributes);
          this.tableName = this.attributes?.tableName?.includes("@projectname")
            ? this.attributes?.tableName?.replace(
              "@projectname",
              sessionStorage.getItem("organization")
            )
            : this.attributes?.tableName;
        },
        (error) => { },
        () => {
          this.busy = this.datasourceService
            .getDatasource(this.dataset.datasource)
            .subscribe((res) => {
              this.dataset.datasource = res;
            });
        }
      );
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }
    if (this.selectedFileObj?.filename?.endsWith(".json")) {
      this.showPreprocess = true
    }
    else
      this.showPreprocess = false

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"].currentValue != changes["data"].previousValue) {
      this.ngOnInit();
    }
  }

  onScriptChange(event) {
    this.preprocessScript = event
  }

  authentications() {
    this.datasourceService.getPermission("cip").subscribe(
      (cipAuthority) => {
        if (cipAuthority.includes("dataset-edit")) this.isAuth = false;
      }
    );
  }

  checkTaskSupport() {
    this.busy = this.datasetsService
      .checkTaskSupport(this.data)
      .subscribe((resp) => {
        this.taskList = [];
        resp.forEach((re) => {
          for (let task in re) {
            if (re[task]) this.taskList.push(task);
          }
        });
        // this.taskList.push("ETL")
        if (this.taskList.length == 0) {
          this.taskList.push("No Tasks");
          this.task = "";
        }
        else {
          this.task = this.taskList[0]
        }
        if (this.taskList.includes("Load from File")) this.loadUploadedFiles();

        if (this.task == "Extract Schema") this.extractSchema();
      });
  }

  toggleView() {
    this.isRawData = !this.isRawData;
  }

  onUploadStarted() {
    this.getChunkPanel().innerHTML = "";

  }
  onUploadProgress(segmentSize, bytesLoaded, bytesTotal) {
    this.getChunkPanel().appendChild(
      this.addChunkInfo(segmentSize, bytesLoaded, bytesTotal)
    );
  }

  addChunkInfo(segmentSize, loaded, total) {
    var result = document.createElement("DIV");
    result.appendChild(this.createSpan("Chunk size:"));
    result.appendChild(
      this.createSpan(this.getValueInKb(segmentSize), "segment-size")
    );
    result.appendChild(this.createSpan(", Uploaded:"));
    result.appendChild(
      this.createSpan(this.getValueInKb(loaded), "loaded-size")
    );
    result.appendChild(this.createSpan("/"));
    result.appendChild(this.createSpan(this.getValueInKb(total), "total-size"));

    return result;
  }
  getValueInKb(value) {
    return (value / 1024).toFixed(0) + "kb";
  }
  createSpan(text, className = null) {
    var result = document.createElement("SPAN");
    if (className)
      result.className = className + " dx-theme-accent-as-text-color";
    result.innerText = text;
    return result;
  }
  getChunkPanel() {
    // let req = document.getElementsByTagName('lib-icip-iai-mgmt')[0].shadowRoot.getElementById("chunkkpanel");
    // return req;
    return document.querySelector(".chunk-panel");
  }

  mapColumn(column, modify) {
    // this.mapping[column] = modify;
    if (modify.col) {
      modify = modify.col;
    }
    let index = this.mapping.findIndex((x) => x.field === column.field);
    if (index >= 0)
      this.mapping.splice(index, 1);
    if (modify != "None" && modify != "undefined" && modify != "") {
      let patt = /\((.*)\)/i;
      column["primary"] = column.primary ? true : false;
      column["required"] = column.required ? true : false;
      column["unique"] = column.unique ? true : false;
      column["autoincrement"] = column.autoincrement ? true : false;
      let ind = this.formattedExcelCols.findIndex((x) => x.formattedCol === modify)
      try {
        column["excelcol"] = patt.exec(modify) ? patt.exec(modify)[1] : patt.exec(this.formattedExcelCols[ind].col)[1];
      } catch (e) {
        column["excelcol"] = modify.trim()
      }
      this.mapping.push(column);
    }
  }

  changeDateFormat(column, modify) {
    this.mapping.forEach(map => {
      if (column.field == map.field) {
        column["format"] = modify
      }
    })
  }

  loadSchemas() {
    try {
      this.busy = this.datasourceService
        .getSchemaByName(this.dataset.schema)
        .subscribe((res) => {
          this.list = [];
          this.datasetSchema = res;
          let schemavalue = JSON.parse(res.schemavalue);
          if (schemavalue && schemavalue.length >= 1) {
            schemavalue.forEach((element) => {
              // if (element.recordcolumnname) {
              //   this.list.push(element.recordcolumnname)
              // }
              if (element.recordcolumnname != "uuid__" && element.recordcolumnname != "ingestion_time__") {
                let col = {};
                col["field"] = element.recordcolumnname;
                col["type"] = element.columntype;
                col["required"] = element.isrequired;
                col["primary"] = element.isprimarykey;
                col["unique"] = element.isunique;
                col["autoincrement"] = element.isautoincrement;
                this.list.push(col);
              }
            });
            if (this.task != "Create Table") this.loadHeaders();
            this.tableDataSource = this.list;
          } else {
            this.error =
              "Please create columns in the schema mapped : " +
              this.dataset.schema;
          }
        });

      this.busy = this.datasourceService.getAllSchemas().subscribe((res) => {
        this.originalSchemas = res;
      });
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }

  }

  loadUploadedFiles(stepper?: MatStepper) {
    this.busy = this.datasetsService.getFileNames(this.data).subscribe(
      (resp) => {
        this.uploadedFiles = resp;
        this.uploadedFiles.forEach((uploadedFile) => {
          this.uploadedFilesOptions.push(new OptionsDTO(uploadedFile.filename, uploadedFile.id));
        });
      },
      (error) => { },
      () => {
        if (this.uploadedFiles.length > 0 && !this.selectedFile) {
          this.selectedFile = this.uploadedFiles[0].id;
          this.selectedFileObj = this.uploadedFiles[0]
        }
        if (stepper)
          stepper.next()
        this.decideColumnHeaders();

      }
    );
  }

  selectChange(event: any) {
    this.selectedFile = event;
    this.loadHeaders();
  }

  loadHeaders(loadType?) {
    this.mappingJson = {};
    this.busy = this.datasetsService.findById(this.selectedFile).subscribe(
      (resp) => {
        // this.excelColumns = []
        // let response = JSON.parse(resp)
        // for(let r in response){
        //   this.excelColumns.push(r)
        // }
        this.excelColumns = resp
          ? resp.headers
            ? resp.headers.split(",")
            : []
          : [];
      },
      (err) => { },
      () => {
        this.extraColumns = []
        if (loadType == "csvload") {
          this.mapping = [];
          let list = [];
          this.excelColumns.forEach((head) => {
            let h = {};
            // h["field"] = head.replace(/[^A-Z0-9_]/gi, "");
            h["field"] = head.match(/[a-zA-Z]+[a-zA-Z0-9_]*/) ? head.match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0] : ""
            h["type"] = "text";
            list.push(h);
          });
          if (this.tabPrimary["type"]) {
            list.push(this.tabPrimary);
            this.mapping.push(this.tabPrimary)
          }
          this.tableDataSource = list;
          this.list = list;
          for (let i = 0; i < this.list.length; i++) {
            this.mappingJson[this.list[i].field] = this.excelColumns[i];
            this.mapColumn(this.list[i], this.excelColumns[i]);
          }
        } else {
          this.mapping = [];

          this.list.forEach((element) => {
            let max = 0;
            let maxValue;
            for (let i = 0; i < this.excelColumns.length; i++) {
              if (this.excelColumns[i].match(/[a-zA-Z]+[a-zA-Z0-9_]*/)) {
                let c = this.list.filter(l => l.field == this.excelColumns[i].match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0])
                let c1 = this.extraColumns.filter(l => l.field == this.excelColumns[i].match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0])
                if (c.length == 0 && c1.length == 0) {
                  let col = {}
                  col["field"] = this.excelColumns[i].match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0];
                  col["type"] = "string";
                  col["required"] = false;
                  col["primary"] = false;
                  col["unique"] = false;
                  col["autoincrement"] = false;
                  this.extraColumns.push(col)
                }
                let percent =
                  element.field.toLowerCase() ==
                    this.excelColumns[i].match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0].toLowerCase()
                    ? 100
                    : StringUtils.compareSimilarityPercent(
                      element.field,
                      this.excelColumns[i]
                    );
                if (percent >= max) {
                  max = percent;
                  maxValue = this.excelColumns[i];
                }
              }
            }
            if (max > 70) {
              // this.mappingJson[element.field] = maxValue.replace(
              //   /[^A-Z0-9_]/gi,
              //   ""
              // );
              // this.mappingJson[element.field] = maxValue.includes(" ")?maxValue.strip().split(" ")[1].replace(/[^A-Z0-9_]/gi, ""):maxValue
              this.mappingJson[element.field] = maxValue.match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0]
              this.mapColumn(element, maxValue);
            }
          });
          this.formattedExcelCols = [];
          for (let i = 0; i < this.excelColumns.length; i++) {
            let col = {};
            col["col"] = this.excelColumns[i];
            col["formattedCol"] = this.excelColumns[i].match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0];
            // col["formattedCol"] = this.excelColumns[i].includes(" ")?this.excelColumns[i].strip().split(" ")[1]:this.excelColumns[i]
            this.formattedExcelCols.push(col);
          }
        }
        if (this.selectedFileObj.filename.endsWith(".json")) {
          this.showPreprocess = true
          let queryObj = { "query": "" }
          queryObj.query = this.preprocessScript[0] ? this.preprocessScript[0] : this.preprocessScript
          this.mapping.forEach(element => {
            if (element.query) {
              element.query = queryObj
              return
            }
          });
          this.mapping.push(queryObj)
        }
        this.formattedExcelCols.sort((a, b) =>
          a["formattedCol"] > b["formattedCol"] ? 1 : -1
        );
        this.formattedExcelCols.splice(0, 0, "None");
        this.excelColumns.splice(0, 0, "None");
      }
    );
  }

  downloadCsvTemplate() {
    try {
      this.getDatasetSchema();
      let finalHeader = ""
      JSON.parse(this.datasetSchema.schemavalue).forEach((col) => {
        finalHeader = finalHeader + col.recordcolumnname;
        if (col.isrequired) finalHeader = finalHeader + "*";
        finalHeader = finalHeader + ",";
      });
      let templateBlob = new Blob([finalHeader], { type: "text/csv" });
      importedSaveAs(templateBlob, this.dataset.schema + " Template.csv");
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }

  }

  loadDataset(validate: any) {
    this.errorList = [];
    let json = {}
    json['type'] = "int";
    json['field'] = "id";
    json['required'] = true;
    json['autoincrement'] = true;
    json['unique'] = true;
    json['primary'] = true;
    let idexists = this.mapping.filter(m => m.field == "id")
    if (idexists.length == 0 && this.dataset.datasource.type != "PRESTO" && this.dataset.datasource.type != "BIGQUERYREST")
      this.mapping.push(json);
    if (idexists.length != 0 && this.dataset.datasource.type == "PRESTO" && !this.dataset.schema) {
      this.datasourceService.message("Please change the column name of `id`", "error")
    }
    else {
      if (this.task != "Create Table") {
        let error = false;
        if (!this.isTableExists) {
          this.tableDataSource.forEach((tab) => {
            let i = this.mapping.indexOf(tab);
            if (tab.unique) this.mapping[i]["required"] = tab.unique;
            else if (tab.autoincrement) this.mapping[i]["type"] = "int";
          });
        } else {
          this.mapping.forEach((map) => {
            map.type = map.type.match(/[a-zA-Z]+[a-zA-Z0-9_]*/)[0];
          });
        }
        if (this.dataset.schema || this.isTableExists) {
          for (let i = 0; i < this.tableDataSource.length; i++) {
            let flag = false;
            for (let map in this.mapping) {
              if (this.mapping[map].field == this.tableDataSource[i].field) {
                flag = true;
                if ((this.tableDataSource[i].type == "date" || this.tableDataSource[i].type == "datetime" || this.tableDataSource[i].type == "timestamp") && !this.mapping[map].format) {
                  this.datasourceService.message("Select a date format", this.tableDataSource[i].field)
                  error = true
                  break
                }
              }
            }
            if (!flag) {
              this.errorList.push(this.tableDataSource[i].field);
              if (this.tableDataSource[i]?.required && !this.tableDataSource[i].autoincrement) {
                this.datasourceService.message(
                  "Required Column not mapped",
                  this.tableDataSource[i].field
                );
                error = true;
                break;
              }
            }
          }
        }
        if (!error) {
          this.modalService.openModal(validate, 'mini')
          // this.dialogOpen = true;
          // this.validate = true;
        }
      } else this.load();
    }
  }

  load() {
    this.dialogOpen = false;
    this.datasetsService
      .loadDataset(this.data, this.selectedFile, this.mapping, this.overwrite)
      .subscribe(
        (resp) => {
          this.datasourceService.message("Job Submitted", "ICIP");
          setTimeout(() => {
            this.isTablePresent();
          }, 3000);
        },
        (error) => {
          if(error == "Scheduler Paused")
            this.datasourceService.message("Scheduler paused. Please resume and retrigger", "error");
          else
            this.datasourceService.message("Job Submission failed", "ICIP");
        }
      );
  }

  radioChange() {
    this.tabPrimary = {};
  }

  onDialogClose() {
    this.dialogOpen = false;
    this.validate = false;
    this.instructions = false;
  }

  refresh() {
    let col = this.displayedColumns3[1];
    this.displayedColumns3 = [
      "columntype",
      col,
      "unique",
      "required",
      "excelcols",
      'dateformat'
    ];
    this.ngOnInit();
  }

  omit_special_char(event) {
    var k = event.charCode;
    return this.isValidLetter(k);
  }

  isValidLetter(k) {
    return (
      (k >= 65 && k <= 90) ||
      (k >= 97 && k <= 122) ||
      (k >= 48 && k <= 57) ||
      [8, 9, 13, 16, 17, 20, 95].indexOf(k) > -1
    );
  }

  groupChange(group) {
    if (this.selectedGroups.includes(group)) {
      const index = this.selectedGroups.indexOf(group, 0);
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
      }
    } else this.selectedGroups.push(group);
  }

  save() {
    try {
      let schemaJson = [{}];
      if (this.isRawData === true) {
        schemaJson = JSON.parse(this.schemaValue);
      } else {
        schemaJson = this.dataSource;
      }
      this.datasourceService
        .updateSchema("new", this.schemaAlias, schemaJson)
        .subscribe(
          (res) => {
            this.schemaName = res.name
            const temp = [];
            if (this.selectedGroups != null) {
              this.selectedGroups.forEach((element) => {
                temp.push(element.name);
              });
              this.datasourceService
                // .addGroupModelEntity(this.schemaName, temp, res.organization)                
                .addGroupModelEntity(this.schemaName, temp)
                .subscribe();
              this.datasourceService.message("Saved", "Saved Sucessfully");
              this.datasourceService
                .searchSchemasByName(this.schemaName)
                .subscribe(
                  (resp) => {
                    this.dataset.schema = resp[0];
                    this.dataset.attributes = JSON.parse(this.dataset.attributes);
                  },
                  (error) => { },
                  () => {
                    this.datasetsService
                      .createDataset(this.dataset)
                      .subscribe((res) => {
                        this.datasourceService.message(
                          "Saved!",
                          "Updated successfully"
                        );
                      });
                  }
                );
            }
          },
          (error) => {
            this.datasourceService.message("Could not get the results", error);
          }
        );
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }

  }

  checkChange(element, check, event) {
    // let i = this.mapping.indexOf(element)
    // this.mapping[i][event] = !check
    // if (event == 'unique')
    //   this.mapping[i]['required'] = !check
    // else if (event == 'autoincrement')
    //   this.mapping[i]['type'] = 'int'

    let j = this.tableDataSource.indexOf(element);
    if (event == "unique") this.tableDataSource[j]["required"] = !check;
    else if (event == "autoincrement") this.tableDataSource[j]["type"] = "int";
  }

  columnChange(element, column) {
    this.mapping.forEach((map) => {
      if (element.field == map.field) map[column] = element.type;
    });
  }

  dataTypeChange(element, column, dataType) {
    this.tableDataSource.forEach( ele =>{
      if (element.field == ele.field)
        ele[column] = dataType;
    })
    this.changeDetectorRefs.detectChanges();
  }

  setPrimaryKey(name) {
    let flag = false;
    this.mapping.forEach((map) => {
      if (name == map.field) {
        flag = true;
        map["primary"] = true;
        map["unique"] = true;
        map["required"] = true;
      }
    });
    if (flag == false) {
      let existing = this.tableDataSource.filter((tab) => tab.field == name);
      if (existing.length > 0)
        this.datasourceService.message("Column Name already Exists", "Duplicate");
      else {
        this.tabPrimary["field"] = name;
        this.tabPrimary["type"] = "int";
        this.tabPrimary["primary"] = true;
        this.tabPrimary["unique"] = true;
        this.tabPrimary["required"] = true;
        this.tabPrimary["autoincrement"] = true;
        this.tableDataSource.push(this.tabPrimary);
        this.mapping.push(this.tabPrimary)
        this.refresh();
      }
    }
  }

  changeMapping(ind, value) {
    this.mapping[ind].field = value
    // this.mapping.forEach((map) => {
    //   if (name == map.field) {
    //     map["field"] = value;
    //   }
    // });
    // this.tableDataSource.forEach((tab) => {
    //   if (tab.field == name) {
    //     tab["field"] = value;
    //   }
    // });
  }

  loadGroups() {
    var length: any = 0;
    this.busy = this.groupService.getGroupsLength().subscribe(
      (resp) => {
        length = resp;
      },
      (err) => { },
      () => {
        this.busy = this.datasourceService
          .getSchemaGroups(0, length)
          .subscribe((res) => {
            this.groups = res;
          });
      }
    );
  }

  showInstructionsDialog() {
    this.instructions = true;
    this.dialogOpen = true;
  }

  extractSchema() {
    try {
      const dataCopy = JSON.parse(JSON.stringify(this.dataset));
      if (
        dataCopy.schema && dataCopy.schema != null &&
        typeof dataCopy.schema == "string" &&
        dataCopy.schema.toString().replace(/\s/g, "").length > 0
      ) {
        const schema = this.originalSchemas.filter(
          (s) => s.name === dataCopy.schema
        )[0];
        dataCopy.schema = schema;
      } else if (typeof dataCopy.schema != "object") dataCopy.schema = undefined;
      dataCopy.backingDataset =
        dataCopy.backingDataset !== "" ? dataCopy.backingDataset : null;
      dataCopy.attributes = JSON.parse(dataCopy.attributes);
      this.busy = this.datasourceService.getDatasource(dataCopy.datasource.name ? dataCopy.datasource.name : dataCopy.datasource).subscribe(
        (resp) => {
          dataCopy.datasource = resp;
        },
        (err) => { },
        () => {
          this.datasetsService.extractSchema(dataCopy).subscribe((res) => {
            this.dataSource = res;
            this.schemaValue = JSON.stringify(res);
          });
        }
      );
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }

  }

  selectedz(data) {
    try {
      return JSON.stringify(data);
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }

  }

  refreshparent() {
    this.reload.emit(null);
  }

  addfile(file) {
    this.onUploadStarted()
    this.uploadedFile = file
    if (file.target.files[0].name.endsWith(".csv") || file.target.files[0].name.endsWith(".xlsx")
      || file.target.files[0].name.endsWith(".json")) {
      try {
        this.selectedFile = undefined;
        const chunkSize = 200000;
        const formData: FormData = new FormData();
        let file1: File = file.target.files[0];
        let metadata = {};
        metadata["FileGuid"] = this.generateHash();
        metadata["FileName"] = file1.name;
        metadata["TotalCount"] = Math.ceil(file1.size / chunkSize);
        metadata["FileSize"] = file1.size;
        
        this.docName = file1.name;
        let i = 0;
        let count = 0;
        for (let offset = 0; offset < file1.size; offset += chunkSize) {
          const chunk = file1.slice(offset, offset + chunkSize);
          formData.set("file", chunk, file1.name);
          metadata["Index"] = i++;
          formData.set("chunkMetadata", JSON.stringify(metadata));
          this.datasetsService.saveChunks(this.data, formData).subscribe(
            (res) => {
              count += 1;
              if (count < Math.ceil(file1.size / chunkSize))
                this.onUploadProgress(chunk.size, count * chunk.size, file1.size);
              else this.onUploadProgress(chunk.size, file1.size, file1.size);
            },
            (err) => {
              //console.log(err)
              this.datasourceService.message('Error! while uploading file: ' + "error")
            }
          );
        }
        this.uploaded = true;
        // this.previewFile();

      }
      catch (Exception) {
        this.datasourceService.message("Some error occured", "error")
      }
    }
    else
      this.datasourceService.message("File format not supported", "error")

  }

  clearUploadedFile(element) {
    element.value = "";
    this.uploaded = false;
    this.selectedFile = undefined
    this.tableDataSource = []
    this.extraColumns = []
  }

  isTablePresent() {
    this.busy = this.datasetsService.isTablePresent(this.data).subscribe(
      (res) => {
        this.isTableExists = res;
      },
      (err) => { },
      () => {
        if (this.taskList.includes("Create Table")) {
          if (!this.isTableExists && this.dataset.schema) {
          } else this.taskList.splice(this.taskList.indexOf("Create Table"), 1);
        }

      }
    );
    this.checkTaskSupport();
  }

  decideColumnHeaders() {
    if (this.isTableExists && !this.overwrite) {
      this.displayedColumns3[1] = "tablecolumn";
      this.extractTableSchema();
      if (this.dataset.schema) this.getDatasetSchema();
    } else {
      if (this.dataset.schema) {
        this.displayedColumns3[1] = "schemacolumn";
        this.loadSchemas();
      } else {
        this.displayedColumns3.splice(
          this.displayedColumns3.indexOf("excelcols"),
          1
        );
        this.displayedColumns3[1] = "csvcolumn";
        this.loadHeaders("csvload");
      }
    }
  }

  generateHash() {
    return Array.apply(0, Array(5))
      .map(function () {
        return (function (charset) {
          let min = 0;
          let max = charset.length - 1;
          let rand =
            window.crypto.getRandomValues(new Uint32Array(1))[0] /
            (0xffffffff + 1);
          return charset.charAt(Math.floor(rand * (max - min + 1)) + min);
        })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
      })
      .join("");
  }

  extractTableSchema() {
    this.list = [];
    this.busy = this.datasetsService
      .extractTableSchema(this.data)
      .subscribe((res) => {
        this.displayedColumns3.splice(
          this.displayedColumns3.indexOf("unique"),
          1
        );
        res.forEach((r) => {
          if (r.Field != "uuid__" && r.Field != "ingestion_time__") {
            let col = {};
            col["field"] = r.Field;
            col["type"] = r.Type;
            col["primary"] = r.Key == "PRI" ? true : false;
            col["unique"] = r.Key == "PRI" ? true : false;
            col["unique"] = r.Key == "UNI" ? true : false;
            col["required"] = r.Null == "NO" ? true : false;
            col["autoincrement"] = r.Extra == "auto_increment" ? true : false;
            col["format"] = r.Type.includes("date") ? "yyyy-MM-dd" : r.Type.includes("datetime") ? "yyyy-MM-dd HH:mm:ss" : r.Type.includes("timestamp") ? "yyyy-MM-dd HH:mm:ss" : r.Type.includes("time") ? "HH:mm:ss" : "";
            this.list.push(col);
          }
        });
        this.tableDataSource = this.list;
        this.loadHeaders();
      });
  }

  taskChange(t) {
    this.task = t;
    if (this.task == "Create Table") {
      this.displayedColumns3[1] = "schemacolumn";
      if (this.displayedColumns3.includes("excelcols"))
        this.displayedColumns3.splice(
          this.displayedColumns3.indexOf("excelcols"),
          1
        );
      if (this.displayedColumns3.includes("dateformat"))
        this.displayedColumns3.splice(
          this.displayedColumns3.indexOf("dateformat"),
          1
        );
      this.selectedFile = undefined;
      this.loadSchemas();
    } else if (this.task == "Generate Form") {
      this.schmjsn = {};
      this.showFormTemplate = false;
      this.getTemplateData();
    }
    else if (this.task == "Extract Schema") this.extractSchema();
  }

  getTemplateData() {
    try {
      // if(this.dataset?.schema){
      this.getDatasetSchema().then(resp => {
        this.fieldTitles = [];
        this.selectedFieldTitles = [];
        let schemaValueStr = this.datasetSchema.schemavalue;
        if (schemaValueStr && JSON.parse(schemaValueStr)?.length > 1) {
          this.fieldTitles = JSON.parse(schemaValueStr).map(ele => ({ "name": ele.recordcolumnname, "title": ele.recordcolumndisplayname }));
          this.fieldTitlesCopy = _.cloneDeep(this.fieldTitles);
        }
      })
        .catch(err => this.crtFrmTmpltErr = "Error while fetching schema details " + err);
      // }
      // else {
      //   let pagination: any = { page: 0, size: 1 };
      //   this.datasetsService.getPaginatedDetails(this.dataset, pagination)
      //   .subscribe(
      //     (resp) => {
      //       if (resp && resp[0]) {
      //         this.fieldTitles = resp[0];
      //       } else {
      //         this.crtFrmTmpltErr = "No response from server";
      //       }
      //     },
      //     (error) => {
      //       this.crtFrmTmpltErr = error?.toString();
      //       if (this.crtFrmTmpltErr.includes(";"))
      //         this.crtFrmTmpltErr = this.crtFrmTmpltErr.substring(
      //           0,
      //           this.crtFrmTmpltErr.indexOf(";")
      //         );
      //       // this.crtFrmTmpltErr = "Error while fetching results for generating form-template fields.\n"+errMsg
      //     }
      //   );
      // }
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }

  }

  getDatasetSchema() {
    return new Promise((resolve, reject) => {
      this.datasourceService.getSchemaByName(this.dataset.schema)
        .subscribe((res) => {
          this.datasetSchema = res;
          resolve("Schema fetched successfully");
        },
          err => {
            this.datasourceService.message("Error while fetching schema details " + err, "error");
            reject("Error while fetching schema details " + err);
          });
    })
  }

  generateForm() {
    try {
      //console.log(this.selectedFieldTitles);
      let selectedFieldNames = this.selectedFieldTitles.map(ele => ele.name).toString();
      let templateDetails = { "fieldNames": selectedFieldNames, "templateName": this.templateName, "templateTags": this.templateTags.toString(), "origin": window.location.origin }
      this.datasetsService.generateFormTemplate(this.dataset.name, templateDetails)
        .subscribe(res => {
          this.datasourceService.message("Saved!", "Form generated successfully");
          this.showFormTemplate = true;
          this.formTemplate = res;
        },
          error => this.datasourceService.message("Error!", "Error in generating form-template  " + error)
        );
    }
    catch (Exception) {
      this.datasourceService.message("Some error occured", "error")
    }
  }

  clearTemplateDetails() {
    this.templateName = "";
    this.templateTags = [];
    this.fieldTitles = _.cloneDeep(this.fieldTitlesCopy);
    this.selectedFieldTitles = [];
    this.tmpltNmVld = false;
    this.showFormTemplate = false;
  }

  validateTemplateName() {
    this.tmpltNmVld = this.templateName?.replace(/\s/g, "").length > 0
  }

  addColumn(element, ind) {
    let tabledata = _.cloneDeep(this.tableDataSource)
    tabledata.push(element)
    this.tableDataSource = tabledata
    this.mapping.push(element)
    let excols = _.cloneDeep(this.extraColumns)
    excols.splice(ind, 1)
    this.extraColumns = excols
    // this.changeDetectorRefs.detectChanges();
    // this.tableDataSource = this.tableDataSource
    // this.extraColumns = this.extraColumns
  }

  previewFile() {
    let extension: string = this.uploadedFile.target.files[0].name;
    // if (this.uploadedFile.target.files[0].name.endsWith(".csv")){
    const reader = new FileReader();
    reader.readAsText(this.uploadedFile.target.files[0]);
    reader.onload = (event) => {
      const text = reader.result;
      this.fileToUpload = event.target.result.toString().split("\r");
      if (extension.endsWith(".json")) {
        this.fileToUpload = "[" + this.fileToUpload + "]";
      }
      //console.log("readupload", this.fileToUpload)
    }
    // }
  }

  stringToJson(string) {
    return JSON.parse(string);
  }

  addQueryToMap(stepper: MatStepper) {
    this.busy = this.datasetsService.setJsonHeaders(this.preprocessScript, this.selectedFileObj).subscribe(resp => {
      this.loadUploadedFiles(stepper)
    })
    let queryObj = { "query": "" }
    queryObj.query = this.preprocessScript[0] ? this.preprocessScript[0] : this.preprocessScript
    this.mapping.forEach(element => {
      if (element.query) {
        element.query = queryObj
        return
      }
    });
    this.mapping.push(queryObj)
  }

  toggleFileUpload(event: MatRadioChange) {
    this.filechoose = event.value;
  }

  moveToNextStep() {
    this.taskStepper.next();
  }

  open(content: any): void {
    this.modalService.openModal(content, 'mini')
  }

}
