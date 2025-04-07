import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LedsModalService } from 'leds-lib';
import { saveAs as importedSaveAs } from 'file-saver';
import { RaiservicesService } from '../../services/raiservices.service';
import { Services } from '../../services/service';
import { UserProjectRole } from '../../models/user-project-role';
import { RoleService } from '../../services/role.service';
import { Pipe, PipeTransform } from '@angular/core';
import * as XLSX from 'xlsx';
import { Role } from '../../models/role';
@Component({
  selector: 'app-initiative-activity',
  templateUrl: './initiative-activity.component.html',
  styleUrls: ['./initiative-activity.component.scss'],
})
export class InitiativeActivityComponent implements OnInit {
  @ViewChild('csvFileInput') csvFileInput: ElementRef;
  showSpinner: boolean;
  activityList: any = [];
  tableHeader: any = [];
  selectedTemplateName: any;
  selectedTemplateMandatory: boolean = false;
  selectedTemplateContent: any;
  // approverFlow: boolean = false;
  approverRole: any;
  searchText: any;
  templateList = [
    {
      value: 'TermsnCondition',
      viewValue: 'TermsnCondition',
    },
    { value: 'Questionnaire', viewValue: 'Questionnaire' },
    { value: 'Canvas', viewValue: 'Canvas' },
  ];
  linkedTemplateList: any = [];
  tempId: any;
  templateData: any = [];
  selectedActivity: any;
  selectedTemplate: any;
  approver_role = [];
  templateName: any;
  isApprovalFlow: boolean = false;
  constructor(
    private modalService: LedsModalService,
    private raiservice: RaiservicesService,
    private service: Services,
    public roleSerive: RoleService,
    private cdRef: ChangeDetectorRef
  ) {}
  mandate(event: any) {
    this.selectedTemplateMandatory = event.checked;
  }
  isApproval(event: any) {
    this.isApprovalFlow = event.checked;
  }
  getRoleList() {
    this.approver_role = [];
    let tempUserProjectRole = new Role();
    tempUserProjectRole.projectId = null;
    this.roleSerive.getRoleList(tempUserProjectRole).subscribe((res) => {
      res.content.forEach((item) => {
        this.approver_role.push({ value: item.id, viewValue: item.name });
      });
    });
  }
  ngOnInit() {
    this.getActivityList();
    this.getRoleList();
  }
  open(content: any): void {
    this.tempId = this.templateData.length;
    this.modalService.openModal(content, 'mini');
  }
  newTemplate(event: any) {
    this.templateData.push(event[0]);
  }
  openFileInput() {
    this.csvFileInput.nativeElement.click();
  }
  getActivityList() {
    this.activityList = [];
    this.raiservice.getActivityList().subscribe((res) => {
      res.forEach((element: any) => {
        this.activityList.push({
          value: element.id,
          viewValue: element.activityName,
        });
      });
    });
  }
  selectActivity(event: any) {
    this.selectedActivity = event;
  }
  selectTemplate(event: any) {
    this.selectedTemplate = event;
    this.linkedTemplateList = [];
    if (event === 'Questionnaire')
      this.getQuestionnaireList(this.selectedActivity);
    if (event === 'TermsnCondition')
      this.getTermsAndConditionsList(this.selectedActivity);
    if (event === 'Canvas') this.getCanvasList(this.selectedActivity);
  }
  getQuestionnaireList(activityId: any) {
    // this.linkedTemplateList = [];
    this.raiservice.getQuestionnaireList(activityId).subscribe((res) => {
      res.forEach((element: any) => {
        this.linkedTemplateList.push(element);
        this.cdRef.detectChanges();
      });
    });
  }
  getTermsAndConditionsList(activityId: any) {
    // this.linkedTemplateList = [];
    this.raiservice.getTermsAndConditionsList(activityId).subscribe((res) => {
      res.forEach((element: any) => {
        this.linkedTemplateList.push(element);
        this.cdRef.detectChanges();
      });
    });
  }
  getCanvasList(activityId: any) {
    // this.linkedTemplateList = [];
    this.raiservice.getCanvasList(activityId).subscribe((res) => {
      res.forEach((element: any) => {
        this.linkedTemplateList.push(element);
        this.cdRef.detectChanges();
      });
    });
  }
  deleteTemplate(questionId: number) {
    // Filter out the item to delete
    this.templateData = this.templateData.filter((item) => item.question_id !== questionId);
  
    // Renumber the question_id for all remaining items
    this.templateData = this.templateData.map((item, index) => {
      return { ...item, question_id: index + 1 };
    });
  }
  linkedTemplate(event: any) {
    this.templateData = [];
    this.selectedTemplateName = event.name;
    this.selectedTemplateMandatory = event.mandatory;
    this.isApprovalFlow = event.approverFlow;
    this.approverRole = event.approverRole;
    this.selectedTemplateContent = JSON.parse(event.content);
    this.selectedTemplateContent.forEach((element: any) => {
      let tData = {
        question_id: this.templateData.length + 1,
        parent_name: element['parent_name'],
        question_content: element['question_content'],
        response_type: element['response_type'],
        options: element['options'],
      };
      this.templateData.push(tData);
    });
    this.selectTemplate(this.selectedTemplate);
  }

  close() {
    this.modalService.dismissAll('close the modal');
    this.ngOnInit();
  }
  // selectTypeNew($event: any) {
  //   this.selectedTemplate = $event;
  // }
  addSingleTemplate() {
    let temp = {
      name: this.templateName,
      content: '',
      organization: sessionStorage.getItem('organization'),
      activityId: this.selectedActivity,
      mandatory: this.selectedTemplateMandatory,
      approverFlow: this.isApprovalFlow,
      approverRole: this.approverRole,
    };
    this.saveSercies(this.selectedTemplate, temp);
    this.selectTemplate(this.selectedTemplate);
  }
  selectApproverRole(event: any) {
    this.approverRole = event;
  }
  saveTemplate() {
    let temp = {
      name: this.selectedTemplateName,
      content: JSON.stringify(this.templateData),
      organization: sessionStorage.getItem('organization'),
      activityId: this.selectedActivity,
      mandatory: this.selectedTemplateMandatory,
      approverFlow: this.isApprovalFlow,
      approverRole: this.approverRole,
    };
    this.saveSercies(this.selectedTemplate, temp);
  }
  saveSercies(type: any, temp: any) {
    if (type == 'Canvas') {
      this.raiservice.saveCanvas(temp).subscribe((res) => {
        this.close();
        this.service.message(type + ' saved successfully', 'info');
      });
    }
    if (type == 'Questionnaire') {
      this.raiservice.saveQuestionnaire(temp).subscribe((res) => {
        this.close();
        this.service.message(type + ' saved successfully', 'info');
      });
    }
    if (type == 'TermsnCondition') {
      this.raiservice.saveTermnconditions(temp).subscribe((res) => {
        this.close();
        this.service.message(type + ' saved successfully', 'info');
      });
    }
    // this.selectedActivity = '';
    // this.selectedTemplate = '';
    // this.selectedTemplateName = '';
    // this.selectedTemplateMandatory = false;
    // this.selectedTemplateContent = '';
    // this.approverFlow = false;
    // this.approverRole = '';
    // this.templateData = [];
    this.templateName = '';
  }

  downloadCsvTemplate() {
    alert(
      `options must be saperated using " + "`
    );
    let template = [
      {
        columntype: 'string',
        columnorder: 1,
        recordcolumnname: 'parent_name',
      },
      {
        columntype: 'string',
        columnorder: 2,
        recordcolumnname: 'question_content',
      },
      {
        columntype: 'string',
        columnorder: 3,
        recordcolumnname: 'response_type',
      },
      {
        columntype: 'string',
        columnorder: 4,
        recordcolumnname: 'options',
      },

      // {question_id,question_content,response_type,options,parent_id}
    ];
    try {
      let finalHeader = '';
      template.forEach((col) => {
        finalHeader = finalHeader + col.recordcolumnname;
        finalHeader = finalHeader + ',';
      });
      let templateBlob = new Blob([finalHeader], { type: 'text/csv' });
      importedSaveAs(templateBlob, this.selectedTemplateName + ' Template.csv');
    } catch (Exception) {
      // this.datasourceService.message('Some error occured', 'error');
    }
  }
  fileUpload(event: any) {
    console.log(event.target.files);
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (e) => {
      let binaryData = e.target.result;
      let workbook = XLSX.read(binaryData, { type: 'binary' });
      workbook.SheetNames.forEach((sheetName) => {
        let rowObject = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        rowObject.forEach((element: any) => {
          let tData = {
            question_id: this.templateData.length + 1,
            parent_name: element['parent_name'],
            question_content: element['question_content'],
            response_type: element['response_type'],
            options: element['options']?.split('+'),
          };
          this.templateData.push(tData);
        });
       
      });
      
    }
  }
}
