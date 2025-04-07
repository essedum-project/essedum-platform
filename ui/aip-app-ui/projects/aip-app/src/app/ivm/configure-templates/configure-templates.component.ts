import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LedsModalService } from 'leds-lib';
import { RaiservicesService } from '../../services/raiservices.service';
import { Services } from '../../services/service';
import { saveAs as importedSaveAs } from 'file-saver';

@Component({
  selector: 'app-configure-templates',
  templateUrl: './configure-templates.component.html',
  styleUrls: ['./configure-templates.component.scss'],
})
export class ConfigureTemplatesComponent implements OnInit {
  // In your TypeScript file
  @ViewChild('csvFileInput') csvFileInput: ElementRef;
  types = [
    { value: 'Questionnaire', viewValue: 'Questionnaire' },
    { value: 'Canvas', viewValue: 'Canvas' },
    { value: 'TermsnCondition', viewValue: 'Terms & Condition' },
  ];
  showSpinner: boolean;
  template: any;
  tempId: any;
  templateName: any = '';
  templateType: any;
  selectedType: any = 'Questionnaire';
  templateContent: any;
  slectedTemplateView: any;
  slectedTemplate: any;
  templateData: any = [];
  constructor(
    private service: Services,
    private modalService: LedsModalService,
    private raiservice: RaiservicesService
  ) {}

  ngOnInit(): void {
    this.selectType('Questionnaire');
  }
  selectType(event: any) {
    if (event === 'Questionnaire') {
      this.getQuestionares();
    } else if (event === 'Canvas') {
      this.getCanvas();
    } else if (event === 'TermsnCondition') {
      this.getTermsCondition();
    }
    this.selectedType = event;
  }
  selectTemplate(event: any) {
    this.templateData = [];
    this.templateContent.forEach((element: any) => {
      if (element.name === event) {
        this.slectedTemplate = element.name;
        this.slectedTemplateView = JSON.parse(element.content);
      }
    });
    this.templateData = this.slectedTemplateView;
  }
  getQuestionares() {
    this.template = [];
    this.slectedTemplateView = '';
    this.templateContent = [];
    this.raiservice.getQuestionnaires().subscribe((res) => {
      res.forEach((element: any) => {
        this.template.push({ value: element.name, viewValue: element.name });
        this.templateContent.push({
          name: element.name,
          content: element.content,
          id: element.id.toString(),
        });
      });
      this.selectTemplate(this.template[0].value);
    });
  }
  getCanvas() {
    this.template = [];
    this.slectedTemplateView = '';
    this.templateContent = [];
    this.raiservice.getCanvas().subscribe((res) => {
      res.forEach((element: any) => {
        this.template.push({ value: element.name, viewValue: element.name });
        this.templateContent.push({
          name: element.name,
          content: element.content,
          id: element.id.toString(),
        });
      });
    });
  }
  getTermsCondition() {
    this.slectedTemplateView = '';
    this.template = [];
    this.templateContent = [];
    this.raiservice.getTermsCondition().subscribe((res) => {
      res.forEach((element: any) => {
        this.template.push({ value: element.name, viewValue: element.name });
        this.templateContent.push({
          name: element.name,
          content: element.content,
          id: element.id.toString(),
        });
      });
    });
  }
  open(content: any): void {
    this.tempId = this.templateData.length;
    this.modalService.openModal(content, 'mini');
  }

  close() {
    this.modalService.dismissAll('close the modal');
    this.ngOnInit();
  }
  selectTypeNew($event: any) {
    this.templateType = $event;
  }
  addSingleTemplate() {
    let temp = {
      name: this.templateName,
      content: '',
      organization:sessionStorage.getItem('organization')
    };
    this.saveSercies(this.templateType, temp);
  }
  saveTemplate() {
    let temp = {
      name: this.slectedTemplate,
      content: JSON.stringify(this.templateData),
      organization:sessionStorage.getItem('organization')
    };
    this.saveSercies(this.selectedType, temp);
  }
  saveSercies(type: any, temp: any) {
    if (type == 'Canvas') {
      this.raiservice.saveCanvas(temp).subscribe((res) => {
        this.templateName = '';
        this.close();
        this.service.message(type + ' saved successfully', 'info');
      });
    }
    if (type == 'Questionnaire') {
      this.raiservice.saveQuestionnaire(temp).subscribe((res) => {
        this.close();
        this.templateName = '';
        this.service.message(type + ' saved successfully', 'info');
      });
    }
    if (type == 'TermsnCondition') {
      this.raiservice.saveTermnconditions(temp).subscribe((res) => {
        this.close();
        this.service.message(type + ' saved successfully', 'info');
        this.templateName = '';
      });
    }
  }

  downloadCsvTemplate() {
    let template = [
      {
        columntype: 'string',
        columnorder: 1,
        recordcolumnname: 'question_content',
      },
      {
        columntype: 'string',
        columnorder: 2,
        recordcolumnname: 'response_type',
      },
      {
        columntype: 'string',
        columnorder: 3,
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
      importedSaveAs(templateBlob, this.selectedType + ' Template.csv');
    } catch (Exception) {
      // this.datasourceService.message('Some error occured', 'error');
    }
  }
  newTemplate(event: any) {
    this.templateData.push(event[0]);

  }
  openFileInput() {
    this.csvFileInput.nativeElement.click();
  }
  uploadAndReadCSV(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.showSpinner = true;
      let file = this.csvFileInput.nativeElement.files[0];
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt) => {
        const csvData = (evt.target as any).result;
        this.parseCSV(csvData).forEach((element) => {
          if (element['question_content'] && element['response_type']) {
            // this.templateData.push(element);
            let tData = {
              question_id: this.templateData.length + 1,
              question_content: element['question_content'],
              response_type: element['response_type'],
              options: element['options'],
            };
            this.templateData.push(tData);
          }
          this.csvFileInput.nativeElement.value = '';
        });
        // Now you can call saveTemplate() to save the template data
        // this.saveTemplate();
        this.showSpinner = false;
      };
      reader.onerror = (evt) => {
        console.error('An error occurred while reading the file', evt);
      };
      file = null;
    }
  }
  parseCSV(data: string) {
    const lines = data.replace(/\r/g, '').split('\n'); // Remove all \r characters
    const headers = lines[0].split(',');
    const jsonData = lines.slice(1).map((line) => {
      const values = line.split(',');
      let row = {};
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const cellValue = values[index].trim();
          if (cellValue !== '') {
            // Check if the cell is not empty
            // Split the cell value by + and push the resulting array into the row object
            row[header] = cellValue.split('+');
          }
        }
      });
      return row;
    });
    return jsonData;
  }
}
