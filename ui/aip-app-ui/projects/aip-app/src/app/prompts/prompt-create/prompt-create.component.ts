import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { LedsModalService, LedsLibService } from 'leds-lib';
import { PromptTemplateComponent } from '../prompt-template/prompt-template.component';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { OutputSchemaComponent } from '../output-schema/output-schema.component';
import { PromptServices } from '../prompt.service';
import { Services } from '../../services/service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { OpenTelemetryService } from 'com-lib-util';


@Component({
  selector: 'app-prompt-create',
  templateUrl: './prompt-create.component.html',
  styleUrls: ['./prompt-create.component.scss']
})
export class PromptCreateComponent implements OnInit {
  agentGroupViewkeys: any;
  templateContent: any;
  contentAvailable: boolean;
  tempcount: number = 1;
  @ViewChild('targetContainer', { read: ViewContainerRef, static: true }) targetContainer: ViewContainerRef;
  @ViewChild('targetOutputSchemaContainer', { read: ViewContainerRef, static: true }) targetOutputSchemaContainer: ViewContainerRef;

  componentRef: any;
  componentRefs: ComponentRef<PromptTemplateComponent>[] = [];
  draggedIndex: number;
  componentRefs1: ComponentRef<OutputSchemaComponent>[] = [];
  schemacount: number = 1;
  json_content: any = { "templates": [], "inputs": [], "examples": [] };
  alias: any;
  errFlag: boolean = false;
  cardName: any;
  organisation: any;
  data: any;
  isEdit: boolean = false;
  examplesForm: FormGroup<any>;
  comment: any = "* Add a new variable by wrapping variable name with '{{' and '}}' brackets.";
  input_label_list = {};
  regexPattern = `^(?!REX)[a-zA-Z0-9\_\-]+$`;
  regexPatterForEmptyNames = `^(?!www$)[a-zA-Z0-9\_\-]+$`;
  regexPatternString: any;
  regexPatternObj: any
  nameValidator: any;
  regString: string = '';
  regexPatternForExistingNames = `^(?!REX).+$`;
  regexPatternForValidAlphabets = `^[a-zA-Z0-9\_\-]+$`;
  regexPatternForExistingNamesObj: any;
  regexPatternForValidAlphabetsObj: any;
  nameFlag: boolean = false;
  errMsgFlag: boolean = true;
  errMsg: string = "Name is required filed.";
  prompts: any;
  listOfNames: string[] = [];
  isChecked: boolean = false;
  providerList: any = [];
  finalProviderList: any = [];
  selectedProviders: any = [];
  providers: any = [];
  defaultProvider: string;
  transformData: boolean = false;
  baseTransformScript = 'import groovy.json.*\n\ndef inpResponse="$response"\n//start your code from here'

  constructor(
    private _formBuilder: FormBuilder,
    private telemetry: OpenTelemetryService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2, private el: ElementRef,
    private ledsLibService: LedsLibService,
    private resolver: ComponentFactoryResolver,
    private promptService: PromptServices,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private modalService: LedsModalService,
  ) {
    this.route.params.subscribe((params) => {
      this.cardName = params['name'];
    });
    this.route.queryParams.subscribe((params) => {
      if (params['org']) {
        this.organisation = params['org'];
      } else {
        this.organisation = sessionStorage.getItem('organization');
      }
    });
    if (history.state.card) {
      this.isEdit = true;
      let cards = this._location.getState();
      this.data = cards['card'];
      this.json_content = JSON.parse(this.data.json_content);
      this.providers = JSON.parse(this.data?.providers);
      this.alias = this.data.alias;
    } else {
      if (this.router.url.includes('edit')) {
        this.isEdit = true;
        this.getPromptDetails();
      }
    }
  }

  public pluginForm: FormGroup;
  public agentGroupViewInfoForm: FormGroup;
  defaultkeys: string[];
  formKeys: string[];
  formValueType: { inputs: string; };
  isExpanded: boolean = true;

  telemetryCall() {
    this.telemetry.startTelemetry('aip-app', 'PromptCreateComponent', sessionStorage.getItem('organization'));
  }

  ngOnInit(): void {
    this.telemetryCall();
    this.defaultkeys = ['inputs']
    this.agentGroupViewkeys = ['examples']
    this.formKeys = ['inputs']
    this.formValueType = { 'inputs': 'Array' }

    this.getPromptProvidersList()

    // Initialize the FormArray
    this.agentGroupViewInfoForm = this._formBuilder.group({
      examples: new FormArray([]), // Create an empty form array
    });
    if (this.isEdit) {
      this.addExistingTemplate();
      this.pluginForm = this.inputExistingForm();
      this.examplesForm = this.exampleExistingForm();
    }
    else {
      this.findAllPrompts()
      this.pluginForm = this.createNewForm();
      this.addTemplate();
      // this.add('inputs', this.pluginForm);
    }
  }
  exampleExistingForm(): FormGroup {
    let exForm = this._formBuilder.group({
      examples: new FormArray([])
    });
    if (this.json_content?.examples.length > 0) {
      const exampleFGs = this.json_content.examples.map(example => this._formBuilder.group({
        inputs: this._formBuilder.array(example.inputs.map(input => this._formBuilder.group({
          name: input.name,
          name_value: input.name_value
        }))),
        outputs: this._formBuilder.group({
          output: example.outputs.output
        }),
        configurations: example.configurations,
      }));
      const exampleFormArray = this._formBuilder.array(exampleFGs);
      // (exForm.get('examples') as FormArray).push(exampleFormArray);

      exForm.setControl('examples', exampleFormArray);
    }
    return exForm
  }
  inputExistingForm(): FormGroup {
    let newForm
    newForm = this._formBuilder.group({});
    this.formKeys.forEach(e => {
      newForm.addControl(e, new FormArray([]))
    })
    const formArray = newForm.get('inputs') as FormArray;
    this.json_content.inputs.forEach(item => {
      formArray.push(this._formBuilder.group(item));
    });
    return newForm
  }

  addExistingTemplate() {
    this.json_content.templates.forEach((element: any) => {
      const factory = this.resolver.resolveComponentFactory(PromptTemplateComponent);
      const componentRef = this.targetContainer.createComponent(factory);
      componentRef.instance.id = element.templateid;
      componentRef.instance.value = element.templateid + '-value';
      componentRef.instance.exist_value = element.templatevalue;

      componentRef.instance.text = element.templateid + '-text';
      componentRef.instance.exist_text = element.templatetext;
      componentRef.instance.isEdit = this.isEdit;

      componentRef.instance.removeTemplate = this.removeTemplate.bind(this);
      componentRef.instance.autoAddInput = this.autoAddInput.bind(this);

      this.componentRefs.push(componentRef);
      this.tempcount++;
    });
  }
  createNewForm(): FormGroup {
    let newForm
    newForm = this._formBuilder.group({
      inputs: new FormArray([])
    });
    return newForm
  }
  updateForm(form, type, key) {
    switch (type) {
      case 'Array':
        form.addControl(key, new FormArray([]))
        break;
      case 'Object':
        form.addControl(key, new FormGroup({}))
        break;
    }
    return form
  }
  // to add data to form
  addDataToForm(plugData) {
    this.formKeys.forEach(e => {
      if (this.formValueType[e] == 'Array') {
        for (let l = 0; l < plugData[e]?.length; l++)
          this.add(e, this.pluginForm)
      }
    })
    return plugData
  }
  add(k, form) {
    let p = form.get(k) as FormArray
    if (k == 'inputs')
      p.push(this._formBuilder.group({ name: '', name_value: '' }));
  }

  removeExample(index: number) {
    // (this.agentGroupViewInfoForm.get('examples') as FormArray).removeAt(index);
    (this.examplesForm.get('examples') as FormArray).removeAt(index);

  }

  remove(k, j) {
    let c = this.pluginForm.get(k) as FormArray
    c.removeAt(j)
  }

  routeBackToPromptList() {
    this._location.back();
  }
  changesOccur($event) {
    console.log($event);
  }
  changesOccurPrompt($event) {
    console.log($event);
  }

  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }

  addTemplate() {
    const factory = this.resolver.resolveComponentFactory(PromptTemplateComponent);
    const componentRef = this.targetContainer.createComponent(factory);
    componentRef.instance.id = `sampleTempDiv-${this.tempcount}`;
    componentRef.instance.value = `sampleTempDiv-${this.tempcount}-value`;
    componentRef.instance.text = `sampleTempDiv-${this.tempcount}-text`;
    componentRef.instance.removeTemplate = this.removeTemplate.bind(this);
    componentRef.instance.autoAddInput = this.autoAddInput.bind(this);

    this.componentRefs.push(componentRef);

    this.tempcount++;
  }

  removeTemplate(id: string) {
    const index = this.componentRefs.findIndex(ref => ref.instance.id === id);
    if (index !== -1) {
      this.componentRefs[index].destroy();
      this.componentRefs.splice(index, 1);
    }
    if (id === 'sampleTempDiv-1') {
      this.tempcount = 2;
    }
  }

  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const draggedIndex = this.draggedIndex;
    if (draggedIndex === dropIndex) return;

    const draggedComponent = this.componentRefs[draggedIndex];
    this.componentRefs.splice(draggedIndex, 1);
    this.componentRefs.splice(dropIndex, 0, draggedComponent);

    // Reorder the view container
    this.targetContainer.move(draggedComponent.hostView, dropIndex);
  }

  addSchema() {
    const factory1 = this.resolver.resolveComponentFactory(OutputSchemaComponent);
    const componentRef1 = this.targetOutputSchemaContainer.createComponent(factory1);
    componentRef1.instance.id = `sampleSchemaDiv-${this.schemacount}`;
    componentRef1.instance.value = `sampleSchemaDiv-${this.schemacount}-value`;
    componentRef1.instance.text = `sampleSchemaDiv-${this.schemacount}-text`;
    componentRef1.instance.removeTemplate = this.removeTemplate.bind(this);

    this.componentRefs1.push(componentRef1);

    this.schemacount++;
  }
  removeSchema(id: string) {
    const index = this.componentRefs1.findIndex(ref => ref.instance.id === id);
    if (index !== -1) {
      this.componentRefs1[index].destroy();
      this.componentRefs1.splice(index, 1);
    }
    if (id === 'sampleTempDiv-1') {
      this.schemacount = 2;
    }
  }
  save() {
    this.errFlag = false;
    if (this.componentRefs.length && this.alias) {
      this.pluginForm.value.inputs.forEach((input, index) => {
        if (input.name === "") {
          this.errFlag = true;
        }
      });
      if (!this.errFlag) {
        let prompt_template_list = []
        this.componentRefs.forEach((componentRef, index) => {
          const instance = componentRef.instance;
          // var template: Template = {
          //   templateid: instance.id,
          //   templatevalue: document.getElementById(instance.id + "-value").innerText,
          //   templatetext: document.getElementById(instance.id + "-text").innerText,
          // };
          // this.json_content["templates"][index] = template;
          var prompt_template: Prompt_Templete = {
            type: document.getElementById(instance.id + "-value").innerText,
            text: document.getElementById(instance.id + "-text").innerText,
          };
          prompt_template_list.push(prompt_template);
        });

        let prompt = {
          "alias": this.alias,
          "organization": sessionStorage.getItem('organization'),
          "prompt": prompt_template_list,
          "inputs": this.pluginForm.value.inputs,
          "providers": this.finalProviderList
        }
        this.promptService.promptSave(prompt).subscribe({
          next: (data) => {
            this.promptService.message('Prompt Created Successfully', 'success');
            this.telemetry.addTelemetryEvent(prompt.alias + ' Prompt created')
            this.routeBackToPromptList();
          },
          error: (error) => {
            this.promptService.message('Error!' + error, 'error');
          }
        })
      }
    }
    else {
      this.errFlag = true;
    }
  }

  changesOccurAlias($event) {
    // this.alias = $event;
    let adpName = $event;
    this.errMsg = "Name is required field.";
    if (this.regexPatternObj.test(adpName)) {
      this.nameFlag = true;
      this.errMsgFlag = false;
      this.alias = $event;
    } else {
      this.nameFlag = false;
      this.errMsgFlag = true;
      if (adpName.length == 0) {
        this.errMsg = "Name is required filed.";
      } else if (adpName.match(this.regexPatternForExistingNamesObj) == null) {
        this.errMsg = "Name already exists";
      } else if (adpName.match(this.regexPatternForValidAlphabetsObj) == null) {
        this.errMsg = "Name should not contain special characters, accepted special characters are _ and -";
      }
    }
  }

  update() {
    let json_content = {};
    // json_content["templates"] = [];
    let prompt_template_list = []
    this.componentRefs.forEach((componentRef, index) => {
      const instance = componentRef.instance;
      // var template: Template = {
      //   templateid: instance.id,
      //   templatevalue: document.getElementById(instance.id + "-value").innerText,
      //   templatetext: document.getElementById(instance.id + "-text").innerText,
      // };
      // json_content["templates"].push(template);
      var prompt_template: Prompt_Templete = {
        type: document.getElementById(instance.id + "-value").innerText,
        text: document.getElementById(instance.id + "-text").innerText,
      };
      prompt_template_list.push(prompt_template);
    });

    let prompt = {
      "alias": this.alias,
      "organization": sessionStorage.getItem('organization'),
      "prompt": prompt_template_list,
      "inputs": this.pluginForm.value.inputs,
      "examples": this.examplesForm.value.examples,
      "providers": this.finalProviderList
    }
    // json_content["inputs"] = this.pluginForm.value.inputs;
    // json_content["examples"] = this.examplesForm?.value.examples;
    // this.data.json_content = JSON.stringify(json_content);
    this.promptService.promptUpdate(prompt, this.data.id).subscribe({
      next: (data) => {
        this.service.message('Prompt Updated Successfully', 'success');
        this.telemetry.addTelemetryEvent(prompt.alias + ' Prompt updated')
      },
      error: (error) => {
        this.service.message('Error!' + error, 'error');
      }
    });
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
  }

  autoAddInput(input_label_list: any[], tempid) {
    this.input_label_list[tempid] = input_label_list;
  }

  refreshInput() {
    let p = this.pluginForm.get('inputs') as FormArray;
    const names = p.value.map((element: any) => element.name);
    let input_values = [...new Set([].concat(...Object.values(this.input_label_list)))];
    if (input_values?.length > 0) {
      input_values.forEach((input_label: any) => {
        if (!names.includes(input_label)) {
          p.push(this._formBuilder.group({ name: input_label, name_value: '' }));
        }
      });
    }
  }
  getPromptDetails() {
    this.promptService.getPromptByNameAndOrg(this.cardName, this.organisation).subscribe({
      next: (data) => {
        this.data = data.body;
        this.json_content = JSON.parse(this.data.json_content);
        this.providers = JSON.parse(this.data.providers);
        this.alias = this.data.alias;
        this.addExistingTemplate();
        this.pluginForm = this.inputExistingForm();
        this.examplesForm = this.exampleExistingForm();
      },
      error: (error) => {
        this.service.message('Error!' + error, 'error');
      }
    });
  }
  findAllPrompts() {
    let org = sessionStorage.getItem('organization');
    this.promptService.getAllPromptsList(org).subscribe((res) => {
      this.prompts = res.body;
      // this.noOfItems = this.cards.length;
      if (this.prompts.length > 0) {
        this.prompts.forEach((adp) => {
          this.listOfNames.push(adp.name);
        });
        if (this.listOfNames.length > 0) {
          for (let i = 0; i < this.listOfNames.length; i++) {
            if (i != this.listOfNames.length - 1)
              this.regString = this.regString.concat(this.listOfNames[i].concat('$|'));
            else
              this.regString = this.regString.concat(this.listOfNames[i].concat('$'));
          }
          this.regexPatternString = this.regexPattern.replace('REX', this.regString)
          this.regexPatternForExistingNames = this.regexPatternForExistingNames.replace('REX', this.regString)
        } else {
          this.regexPatternString = this.regexPatterForEmptyNames;
        }
        this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
        this.regexPatternForExistingNamesObj = new RegExp(this.regexPatternForExistingNames, 'i');
        this.regexPatternForValidAlphabetsObj = new RegExp(this.regexPatternForValidAlphabets, 'i');

        this.nameValidator = [Validators.required, Validators.pattern(this.regexPatternObj)];
      } else {
        this.regexPatternString = this.regexPatterForEmptyNames;
        this.regexPatternObj = new RegExp(this.regexPatternString, 'i');
        this.regexPatternForExistingNamesObj = new RegExp(this.regexPatternForExistingNames, 'i');
        this.regexPatternForValidAlphabetsObj = new RegExp(this.regexPatternForValidAlphabets, 'i');

        this.nameValidator = [Validators.required, Validators.pattern(this.regexPatternObj)];
        // this.service.message('No Prompts available', 'error');
      }
    });
  }

  addRemoveProvider(type, alias, name) {
    let i = this.finalProviderList.findIndex(x => x.name == name);
    this.finalProviderList[i].checked = !(this.finalProviderList[i].checked);
    if (this.finalProviderList[i].checked) {
      this.selectedProviders.push({ type: type, alias: alias, name: name });
    } else {
      let index = this.selectedProviders.findIndex(x => x.name == name);
      this.selectedProviders.splice(index, 1);
    }
    // this.selectedProviders.push({ type: type, alias: alias, name: name });
  }

  setProvidersFriendlyName($event, name) {
    let index = this.finalProviderList.findIndex(x => x.name == name);
    this.finalProviderList[index]["friendly_name"] = $event;
  }

  getPromptProvidersList() {

    let org = sessionStorage.getItem('organization');
    this.promptService.getPromptProviders(org).subscribe(
      res => {
        this.providerList = res.body;
        if (this.providerList.length > 0) {
          this.providerList.forEach(element => {
            this.finalProviderList.push({ type: element.type, alias: element.alias, name: element.name, isDefault: false, friendly_name: '', transform: false, transformScript: this.baseTransformScript });
          });

          if (this.isEdit && this.providers.length > 0) {
            this.providers.forEach(element => {
              let index = this.finalProviderList.findIndex(x => x.name == element.name);
              if (index > -1) {
                if (element?.isDefault) {
                  this.defaultProvider = element.name;
                }
                this.finalProviderList[index].isDefault = element?.isDefault || false;
                this.finalProviderList[index].friendly_name = element?.friendly_name || '';
                this.finalProviderList[index].transform = element?.transform || false;
                this.finalProviderList[index].transformScript = element?.transformScript || this.baseTransformScript;
              }
            });
          }
        }
      },
      error => {
        this.service.message('Error in fetching prompt providers.', 'error');
      }
    )
  }
  defaultProviderChange(name) {
    let index = this.finalProviderList.findIndex(x => x.name == name);
    this.finalProviderList.forEach(element => {
      element.isDefault = false;
    });
    this.finalProviderList[index].isDefault = true;
    this.defaultProvider = this.finalProviderList[index].name;
  }

  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
  }
  open1(content: any, example: any): void {
    this.modalService.openModal(content, 'standard');
  }
  setTransformScript(index, transformScript) {
    this.finalProviderList[index].transformScript = transformScript;
  }
}
interface Template {
  templateid: string;
  templatevalue: string;
  templatetext: string;
}

interface Prompt_Templete {
  type: string;
  text: string;
}