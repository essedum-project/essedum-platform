import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Services } from '../../services/service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-spec-template',
  templateUrl: './create-spec-template.component.html',
  styleUrls: ['./create-spec-template.component.scss'],
})
export class CreateSpecTemplateComponent implements OnInit {
  readonly CARD_TITLE = 'Spec';
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;
  @ViewChild('nameRef') nameRef: NgModel;
  editorOptions = new JsonEditorOptions();
  capabilityList = [
    { viewValue: 'Dataset', value: 'dataset' },
    { viewValue: 'Pipeline', value: 'pipeline' },
    { viewValue: 'Model', value: 'model' },
    { viewValue: 'Endpoint', value: 'endpoint' },
    { viewValue: 'Feature', value: 'feature' },
    { viewValue: 'Cognitive Service', value: 'cognitiveservice' },
    { viewValue: 'Custom', value: 'custom' },
  ];
  desciptionValidator = [Validators.required];
  regString: any = '';
  regexPatternString: any;
  regexPattern = `^(?!REX)[a-zA-Z0-9\_\-]+$`;
  regexPatterForEmptyNames = `^(?!www$)[a-zA-Z0-9\_\-]+$`;
  regexPatternObj: RegExp;
  regexPatternForExistingNames = `^(?!REX).+$`;
  regexPatternForValidAlphabets = `^[a-zA-Z0-9\_\-]+$`;
  regexPatternForValidAlphabetsObj: RegExp;
  regexPatternForExistingNamesObj: RegExp;
  errMsg: string = 'Name is required field.';
  isBackHovered: boolean = false;
  nameFlag: boolean = false;
  errMsgFlag: boolean = true;
  nameValidator: any;

  constructor(
    private route: ActivatedRoute,
    private dsService: Services,
    private location: Location,
    private router: Router,
    private service: AdapterServices
  ) {}

  ngOnInit(): void {
    this.authentications();
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.mode = 'text';
    this.editorOptions.onChange = () => {
      this.data.apispectemplate = this.formJsonEditor.get();
    };
    this.fetchallSpecTemplates();
  }

  authentications() {
    this.dsService.getPermission('cip').subscribe((cipAuthority) => {
      if (!cipAuthority.includes('spectemplate-create')) this.navigateBack();
    });
  }

  fetchallSpecTemplates() {
    this.service.getSpecTemplateNamesByOrganization().subscribe((res) => {
      let specs = res;
      console.log(specs);
      if (specs.length > 0) {
        for (let i = 0; i < specs.length; i++) {
          if (i != specs.length - 1)
            this.regString = this.regString.concat(specs[i].concat('$|'));
          else this.regString = this.regString.concat(specs[i].concat('$'));
        }
        this.regexPatternString = this.regexPattern.replace(
          'REX',
          this.regString
        );
        this.regexPatternForExistingNames =
          this.regexPatternForExistingNames.replace('REX', this.regString);
      } else {
        this.regexPatternString = this.regexPatterForEmptyNames;
      }
      this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
      this.regexPatternForExistingNamesObj = new RegExp(
        this.regexPatternForExistingNames,
        'i'
      );
      this.regexPatternForValidAlphabetsObj = new RegExp(
        this.regexPatternForValidAlphabets,
        'i'
      );

      this.nameValidator = [
        Validators.required,
        Validators.pattern(this.regexPatternObj),
      ];
    });
  }
  data = {
    domainname: null,
    description: null,
    apispectemplate: {},
    capability: null,
    organization: sessionStorage.getItem('organization'),
  };

  createSpecTemplate() {
    this.data.apispectemplate = JSON.stringify(this.data.apispectemplate);
    this.service.createApiSpecTemplate(this.data).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp, 'Spec  Created Successfully');
      this.router.navigate(['../'], { relativeTo: this.route });
    });
    console.log(this.data);
  }

  navigateBack() {
    this.location.back();
  }

  domainNameChanges(specName: string) {
    if (this.regexPatternObj.test(specName)) {
      this.nameFlag = true;
      this.errMsgFlag = false;
       if (this.nameRef && this.nameRef.control) {
        this.nameRef.control.setErrors(null);
      }
    } else {
      this.nameFlag = false;
      this.errMsgFlag = true;
      if (specName.length == 0) {
        this.errMsg = 'Name is required field.';
      } else if (specName.match(this.regexPatternForExistingNamesObj) == null) {
        this.errMsg = 'Name already exists';
      } else if (
        specName.match(this.regexPatternForValidAlphabetsObj) == null
      ) {
        this.errMsg =
          'Name should not contain special characters, accepted special characters are _ and -';
      }
       if (this.nameRef && this.nameRef.control) {
        this.nameRef.control.setErrors({ custom: true });
      }
    }
  }

  selectChange(event) {
    this.data.capability = JSON.stringify(event);
  }

  openChange(event) {}
}
