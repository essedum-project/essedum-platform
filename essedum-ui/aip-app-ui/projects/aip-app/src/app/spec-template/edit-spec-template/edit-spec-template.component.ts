import { Component, OnInit, ViewChild } from '@angular/core';
import { AdapterServices } from '../../sharedModule/services/adapter-service';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-spec-template',
  templateUrl: './edit-spec-template.component.html',
  styleUrls: ['./edit-spec-template.component.scss'],
})
export class EditSpecTemplateComponent implements OnInit {
    readonly CARD_TITLE = 'Spec';
  @ViewChild('formJsonEditor', { static: false })
  formJsonEditor: JsonEditorComponent;
  editorOptions = new JsonEditorOptions();
  nameValidator = [Validators.required];
  capabilityList = [
    { viewValue: 'Dataset', value: 'dataset' },
    { viewValue: 'Pipeline', value: 'pipeline' },
    { viewValue: 'Model', value: 'model' },
    { viewValue: 'Endpoint', value: 'endpoint' },
    { viewValue: 'Feature', value: 'feature' },
    { viewValue: 'Cognitive Service', value: 'cognitiveservice' },
    { viewValue: 'Custom', value: 'custom' },
  ];
  capabilityPromise: Promise<boolean>;
  data = {
    domainname: null,
    description: null,
    apispectemplate: {},
    capability: '["custom"]',
    organization: sessionStorage.getItem('organization'),
  };
  isBackHovered: boolean = false;

  constructor(
    private service: AdapterServices,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.service
      .fetchApiSpecTemplate(
        this.route.snapshot.params.dname,
        sessionStorage.getItem('organization')
      )
      .subscribe((resp: any) => {
        this.data.domainname = resp.domainname;
        this.data.description = resp.description;
        this.data.apispectemplate = JSON.parse(resp.apispectemplate);
        this.data.capability = JSON.parse(resp.capability);
        this.capabilityPromise = Promise.resolve(true);
      });
  }

  ngOnInit(): void {
    this.editorOptions.modes = ['text', 'tree', 'view'];
    this.editorOptions.statusBar = true;
    this.editorOptions.enableSort = false;
    this.editorOptions.enableTransform = false;
    this.editorOptions.mode = 'text';
    this.editorOptions.onChange = () => {
      this.data.apispectemplate = this.formJsonEditor.get();
    };
  }

  navigateBack() {
    this.location.back();
  }

  domainNameChanges(event) {
    this.data.domainname = event;
  }

  editSpecTemplate() {
    this.data.apispectemplate = this.formJsonEditor.get();
    this.data.apispectemplate = JSON.stringify(this.data.apispectemplate);
    this.data.capability = JSON.stringify(this.data.capability);
    this.service.updateApiSpecTemplate(this.data).subscribe((resp) => {
      this.service.messageService(resp, 'Spec Updated Successfully');
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

  selectChange(event: any) {
    this.data.capability = event.value;
  }
}
