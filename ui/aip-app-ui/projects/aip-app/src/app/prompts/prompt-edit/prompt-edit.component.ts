import { Component, ComponentFactoryResolver, ComponentRef, ElementRef, Renderer2, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { PromptTemplateComponent } from '../prompt-template/prompt-template.component';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AccordionComponent, LedsLibService, LedsModalService } from 'leds-lib';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../../services/service';
import { PromptServices } from '../prompt.service';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { MatDialog } from '@angular/material/dialog';
import { OpenTelemetryService } from 'com-lib-util';

@Component({
  selector: 'app-prompt-edit',
  templateUrl: './prompt-edit.component.html',
  styleUrls: ['./prompt-edit.component.scss']
})
export class PromptEditComponent {
  agentGroupViewkeys: any;
  templateContent: any;
  contentAvailable: boolean;
  tempcount: number = 1;
  @ViewChild('targetContainer', { read: ViewContainerRef, static: true }) targetContainer: ViewContainerRef;
  @ViewChild('innerDiv') innerDiv: ElementRef;
  @ViewChild('outerDiv') outerDiv: ElementRef;
  @ViewChild('validConfig') validConfig: TemplateRef<any>;
  componentRef: any;
  private componentRefs: ComponentRef<PromptTemplateComponent>[] = [];
  isEdit: boolean = true;
  provider: any;
  api_key: any;
  output: any;
  providerList: any = [];
  finalProviderList: any = [];
  configlist: any = [];
  selectedExampleList: any = [];
  providerDetails: any;
  tokens: any = "5000";
  examplekeys: string[];
  examplesForm: FormGroup;
  cardName: any;
  organisation: any;
  data: any;
  panel1Expanded: boolean = false;
  panel2Expanded: boolean = false;
  panelInputsExpanded: boolean = true;
  expandedPanels: boolean[] = [];
  connection_name: any;
  prompt_name: any;
  temperature: any = "0.5";
  top_p: any = "0.5";
  presence_penalty: any = "0.5";
  frequency_penalty: any = "0.5";
  loptions: Options = { floor: 0, ceil: 10000, showTicks: true, showTicksValues: true, tickStep: 5000, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1' };
  toptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  tpoptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  ppoptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  fpoptions: Options = {
    floor: 0, ceil: 1, step: 0.01,
    translate: (value: number): string => {
      return value.toFixed(2);
    }, showTicks: true, showTicksValues: true, tickStep: 0.5, showSelectionBar: true, ariaLabel: 'SliderDiscrete_min', ariaLabelHigh: 'SliderDiscrete_max', ariaLabelledBy: 'slider_s1', ariaLabelledByHigh: 'slider_s1'
  };
  providers: any = [];
  selectedExampleConfig: any;
  exampleProvider: any;
  main_provider: any;
  constructor(
    private _formBuilder: FormBuilder,
    private telemetry: OpenTelemetryService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2, private el: ElementRef,
    private ledsLibService: LedsLibService,
    private resolver: ComponentFactoryResolver,
    private modalService: LedsModalService,
    private promptService: PromptServices,
    private service: Services,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private dialog: MatDialog,
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
      let cards = this._location.getState();
      this.data = cards['card'];
      this.prompt_name = this.data.name;
      this.json_content = JSON.parse(this.data.json_content);
      this.providers = JSON.parse(this.data.providers);
      if (this.providers && this.providers.length > 0) {
        this.providers.forEach((element, index) => {
          this.providers[index].type_name = element.type + '-' + element.alias;
        });
      }
      if (this.json_content?.examples.length > 0) {
        this.expandedPanels = new Array(this.json_content?.examples.length).fill(false);
      }
    } else {
      this.promptService.getPromptByNameAndOrg(this.cardName, this.organisation).subscribe({
        next: (data) => {
          this.data = data.body;
          this.prompt_name = this.data.name;
          this.json_content = JSON.parse(this.data.json_content);
          this.providers = JSON.parse(this.data.providers);
          this.providers.forEach((element, index) => {
            this.providers[index].type_name = element.type + '-' + element.alias;
          });
          if (this.json_content?.examples.length > 0) {
            this.expandedPanels = new Array(this.json_content?.examples.length).fill(false);
          }
          this.structurePromptDetails();
        },
        error: (error) => {
          this.service.message('Error!' + error, 'error');
        }
      });
    }
  }
  public pluginForm: FormGroup;
  public agentGroupViewInfoForm: FormGroup;
  defaultkeys: string[];
  formKeys: string[];
  formValueType: { inputs: string; };
  select1: any = 'SYSTEM';
  select2: any = 'HUMAN';
  isExpanded: boolean = true;
  isExpandedExp: boolean = false;
  json_content: any;
  transformData: boolean = false;
  baseTransformScript = 'import groovy.json.*\n\ndef inpResponse="$response"\n//start your code from here'

  telemetryCall() {
    this.telemetry.startTelemetry('aip-app', 'PromptEditComponent', sessionStorage.getItem('organization'))
  }
  ngOnInit(): void {
    this.telemetryCall();
    if (this.router.url.includes('preview')) {
      this.isEdit = false
    }
    this.defaultkeys = ['inputs']
    this.agentGroupViewkeys = ['examples']
    this.examplekeys = ['inputs', 'outputs']
    this.formKeys = ['inputs']
    this.formValueType = { 'inputs': 'Array' }
    this.structurePromptDetails()
  }

  createNewForm(): FormGroup {
    let newForm
    newForm = this._formBuilder.group({});
    this.formKeys.forEach(e => {
      newForm.addControl(e, new FormArray([]))
    })
    const formArray = newForm.get('inputs') as FormArray;
    this.json_content?.inputs.forEach(item => {
      formArray.push(this._formBuilder.group(item));
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
    if (k == 'examples') {
      let p = form.get('inputs') as FormArray
      if (p.length) {
        p.value.forEach((e) => {
          form.get('examples').push(this._formBuilder.group({ name: e.name, name_value: '' }));
        })
      }
    }
  }

  addExample(form) {
    let p = form.get("inputs") as FormArray
    let outputFormGroup = this._formBuilder.group({ output: this.output }); // Create a new FormArray
    let inputFormGroup = new FormArray([]); // Create a new FormArray
    if (p.length) {
      let innerForm = p.value
      innerForm.forEach((e) => {
        inputFormGroup.push(this._formBuilder.group({ name: e.name, name_value: e.name_value }));
      })
    }
    (this.examplesForm.get('examples') as FormArray).push(this._formBuilder.group({
      inputs: inputFormGroup,
      outputs: outputFormGroup,
      configurations: this._formBuilder.group({
        provider: this.provider,
        tokens: this.tokens,
        temperature: this.temperature,
        top_p: this.top_p,
        presence_penalty: this.presence_penalty,
        frequency_penalty: this.frequency_penalty
      })

    }));
    this.output = 'Click on Start to get the output';
    this.save();

  }

  removeExample(index: number) {
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
  selectTemp1Change($event) {
    console.log($event);
  }
  selectTemp2Change($event) {
    console.log($event);
  }
  onContentChange($event, index) {
    console.log($event.target.innerText);
    this.templateContent = $event.target.innerHTML;
    this.contentAvailable = true;
    const list = document.getElementById("list");
    list.innerHTML = this.templateContent;
  }
  setTempAgent(type, divId) {
    console.log(type);
    document.getElementById(divId + '-value').innerText = type;
    this.select2 = type;
  }
  clickactive(eventObj: any) {
    this.ledsLibService.clickactive(eventObj);
  }
  addExistingTemplate() {
    this.json_content?.templates.forEach((element: any) => {
      const factory = this.resolver.resolveComponentFactory(PromptTemplateComponent);
      const componentRef = this.targetContainer.createComponent(factory);
      componentRef.instance.id = element.templateid;
      componentRef.instance.value = element.templateid + '-value';
      componentRef.instance.exist_value = element.templatevalue;

      componentRef.instance.text = element.templateid + '-text';
      componentRef.instance.exist_text = element.templatetext;
      componentRef.instance.isEdit = this.isEdit;

      componentRef.instance.removeTemplate = this.removeTemplate.bind(this);
      this.componentRefs.push(componentRef);
      this.tempcount++;
    });
  }
  addTemplate() {
    const factory = this.resolver.resolveComponentFactory(PromptTemplateComponent);
    const componentRef = this.targetContainer.createComponent(factory);
    componentRef.instance.id = `sampleTempDiv-${this.tempcount}`;
    componentRef.instance.value = `sampleTempDiv-${this.tempcount}-value`;
    componentRef.instance.text = `sampleTempDiv-${this.tempcount}-text`;
    componentRef.instance.removeTemplate = this.removeTemplate.bind(this);
    this.componentRefs.push(componentRef);
    this.tempcount++;
  }

  removeTemplate(id: string) {
    const index = this.componentRefs.findIndex(ref => ref.instance.id === id);
    if (index !== -1) {
      this.componentRefs[index].destroy();
      this.componentRefs.splice(index, 1);
    }
  }
  save() {
    let json_content = {};
    // json_content["templates"] = [];
    let prompt_template_list = []
    // this.componentRefs.forEach((componentRef, index) => {
    //   const instance = componentRef.instance;
    //   var prompt_template: Prompt_Templete = {
    //     type: document.getElementById(instance.id + "-value").innerText,
    //     text: document.getElementById(instance.id + "-text").innerText,
    //   };
    //   prompt_template_list.push(prompt_template);
    // });
    this.json_content?.templates.forEach((element: any) => {
      var prompt_template: Prompt_Templete = {
        type: element.templatevalue,
        text: element.templatetext,
      };
      prompt_template_list.push(prompt_template);
    });
    let examples = this.examplesForm.value.examples;

    examples = examples.map((example, index) => {
      if (index === examples.length - 1) {
        // Apply new configurations only to the last example (new example)
        return {
          ...example,
          configurations: {
            provider: this.providerDetails.name,
            tokens: this.tokens,
            temperature: this.temperature,
            top_p: this.top_p,
            presence_penalty: this.presence_penalty,
            frequency_penalty: this.frequency_penalty
          }
        };
      } else {
        // Retain old configurations for existing examples
        return {
          ...example,
          configurations: example.configurations ? example.configurations : {
            provider: this.providerDetails.name,
            tokens: 5000,
            temperature: 0.5,
            top_p: 0.5,
            presence_penalty: 0.5,
            frequency_penalty: 0.5
          }
        };
      }
    });
    this.examplesForm.value.examples = examples;
    let prompt = {
      "alias": this.data.alias,
      "organization": sessionStorage.getItem('organization'),
      "prompt": prompt_template_list,
      "inputs": this.pluginForm.value.inputs,
      "examples": examples,
      "providers": this.providers
    }
    prompt['provider'] = this.connection_name;
    prompt['configuration'] = {};
    prompt['configuration']['max_tokens'] = this.tokens;
    prompt['configuration']['temperature'] = this.temperature;
    prompt['configuration']['top_p'] = this.top_p;
    prompt['configuration']['frequency_penalty'] = this.frequency_penalty;
    prompt['configuration']['presence_penalty'] = this.presence_penalty;
    this.promptService.saveAsExample(prompt, this.data.id).subscribe({
      next: (data) => {
        this.service.message('Prompt Updated Successfully', 'success');
        this.telemetry.addTelemetryEvent(prompt.alias + ' Example saved');
      },
      error: (error) => {
        this.service.message('Error!' + error, 'error');
      }
    });
  }

  selectChange($event) {
    this.connection_name = $event;
    let index = this.providers.findIndex(option => option.name === $event);
    if (index > -1) {
      this.providerDetails = this.providers[index]
      this.provider = this.providers[index].type + '-' + this.providers[index].alias;
      if (this.providerDetails.friendly_name) {
        this.provider = this.providerDetails.friendly_name;
        this.connection_name = this.providerDetails.friendly_name
      }
      else this.connection_name = this.providerDetails.name
    }
    else {
      this.providerDetails = this.providers[0]
      this.provider = this.providers[0].type + '-' + this.providers[0].alias;

      if (this.providerDetails.friendly_name) {
        this.provider = this.providerDetails.friendly_name;
        this.connection_name = this.providerDetails.friendly_name
      }
      else this.connection_name = this.providerDetails.name
    }

  }
  start() {
    let prompt = {}
    // let prompt_template = ""
    prompt['inputs'] = {};
    this.pluginForm.value.inputs.forEach(element => {
      prompt['inputs'][element.name] = element.name_value;
    });
    // this.json_content["templates"].forEach(element => {
    //   prompt_template = prompt_template + "\n" + element["templatetext"];
    // });
    // prompt['prompt_template'] = prompt_template;

    prompt['type'] = this.providerDetails.type.toLowerCase();
    // prompt['tokens'] = this.tokens;
    // prompt['configuration'] = JSON.parse(this.providerDetails.connectionDetails);

    prompt['prompt_name'] = this.prompt_name;
    prompt['provider'] = this.connection_name;
    prompt['configuration'] = {};
    prompt['configuration']['max_tokens'] = this.tokens;
    prompt['configuration']['temperature'] = this.temperature;
    prompt['configuration']['top_p'] = this.top_p;
    prompt['configuration']['frequency_penalty'] = this.frequency_penalty;
    prompt['configuration']['presence_penalty'] = this.presence_penalty;
    prompt['organization'] = this.organisation;

    // Initialize the output message
    this.output = 'Fetching result';
    let dotCount = 0;
    const maxDots = 3;

    // Create blinking effect
    const intervalId = setInterval(() => {
      dotCount = (dotCount + 1) % (maxDots + 1);
      this.output = 'Fetching result' + ' .'.repeat(dotCount);
    }, 500);

    this.promptService.startGeneration(prompt).subscribe({
      next: (data) => {
        clearInterval(intervalId); // Clear the interval on success
        // this.output = data.body;
        this.output = this.processResponse(data.body);
        this.telemetry.addTelemetryEvent(this.prompt_name + " prompts started");
      },
      error: (error) => {
        clearInterval(intervalId); // Clear the interval on error
        this.output = 'Error! ' + error;
        this.service.message('Error!' + error, 'error');
      }
    })

  }
  processResponse(response: any): string {
    try {
      const jsonResponse = JSON.parse(response);
      return JSON.stringify(jsonResponse, null, 2); // Beautify JSON with 2 spaces indentation
    } catch (e) {
      return response; // Return as plain text if not valid JSON
    }
  }
  openConfiguration(example: any): void {
    const dialogRef = this.dialog.open(this.validConfig, {
      //width: '400px',
      data: { configuration: example.configurations }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result if needed
      }
    });
  }
  getConfigurationFromExample(example: any) {
    // Implement this method to return the configuration from the example
    return {
      provider: example.provider,
      tokens: example.tokens,
      temperature: example.temperature,
      top_p: example.top_p,
      presence_penalty: example.presence_penalty,
      frequency_penalty: example.frequency_penalty
    };
  }

  getPromptProvidersList() {
    let org = sessionStorage.getItem('organization');
    this.promptService.getPromptProviders(org).subscribe(
      res => {
        var providerList: any = res.body;
        var tempProvidersList = [];
        if (providerList.length > 0) {
          var default_index = 0
          providerList.forEach((element, index) => {
            tempProvidersList.push({ type: element.type, alias: element.alias, name: element.name, isDefault: false, friendly_name: '', type_name: element.type + '-' + element.alias, transform: false, transformScript: this.baseTransformScript });
            this.finalProviderList.push({ viewValue: element.type + '-' + element.alias, value: element.name });
          });
          if (this.providers && this.providers.length > 0) {
            this.providers.forEach((element, index) => {
              if (element.isDefault) {
                let index = this.finalProviderList.findIndex(option => option.value === element.name);
                if (index > -1) {
                  if (element.friendly_name) {
                    this.finalProviderList[index].viewValue = element.friendly_name;
                    tempProvidersList[index].friendly_name = element.friendly_name;
                  }
                  tempProvidersList[index].isDefault = element?.isDefault;
                  tempProvidersList[index].transform = element?.transform || false;
                  tempProvidersList[index].transformScript = element?.transformScript || this.baseTransformScript;

                  default_index = index
                }
              } else {
                let index = this.finalProviderList.findIndex(option => option.value === element.name);
                if (index > -1) {
                  if (element.friendly_name) {
                    this.finalProviderList[index].viewValue = element.friendly_name;
                    tempProvidersList[index].friendly_name = element.friendly_name;
                  }
                  tempProvidersList[index].transform = element?.transform || false;
                  tempProvidersList[index].transformScript = element?.transformScript || this.baseTransformScript;
                }
              }
            });
          }
          this.providers = tempProvidersList
          this.providerDetails = this.providers[default_index]
          this.provider = this.providers[default_index].type + '-' + this.providers[default_index].alias;

          if (this.providerDetails.friendly_name) {
            this.provider = this.providerDetails.friendly_name;
            this.connection_name = this.providerDetails.friendly_name
          }
          else this.connection_name = this.providerDetails.name

          this.main_provider = this.providerDetails.name
        }
      },
      error => {
        this.service.message('Error in fetching prompt providers.', 'error');
      });
  }
  changesOccurAPIKey($event) {
    this.api_key = $event;
  }
  open1(content: any, example: any): void {
    if (example.value.configurations) {
      this.selectedExampleConfig = JSON.parse(JSON.stringify(example.value.configurations));
    } else {
      this.selectedExampleConfig = {
        provider: this.providers[0].friendly_name ? this.providers[0].friendly_name : this.providers[0].type + '-' + this.providers[0].alias,
        tokens: 5000,
        temperature: 0.5,
        top_p: 0.5,
        presence_penalty: 0.5,
        frequency_penalty: 0.5
      };
    }
    let index = this.providers.findIndex(option => option.name === this.selectedExampleConfig.provider || option.friendly_name === this.selectedExampleConfig.provider || option.type_name === this.selectedExampleConfig.provider);
    if (index > -1) {
      var provider_index = index;
      this.exampleProvider = this.providers[provider_index].friendly_name ? this.providers[provider_index].friendly_name : this.providers[provider_index].type + '-' + this.providers[provider_index].alias;
    } else {
      // provider_index = 0;
      this.exampleProvider = this.selectedExampleConfig.provider + "(Not Available)";

    }

    this.modalService.openModal(content, 'mini');
  }
  playExample(example: any): void {
    // Update main inputs with the example inputs
    const exampleInputs = example.value.inputs;
    this.pluginForm.setControl('inputs', this._formBuilder.array(exampleInputs.map(input => this._formBuilder.group({
      name: input.name,
      name_value: input.name_value
    }))));

    if (example.value.configurations) {
      // Update main configuration with the example configurations
      const exampleConfig = example.value.configurations;
      this.tokens = exampleConfig.tokens;
      this.temperature = exampleConfig.temperature;
      this.top_p = exampleConfig.top_p;
      this.presence_penalty = exampleConfig.presence_penalty;
      this.frequency_penalty = exampleConfig.frequency_penalty;

      //Update main configuration provider with example provider
      let provider = exampleConfig.provider ? exampleConfig.provider : (this.providers[0].friendly_name ? this.providers[0].friendly_name : this.providers[0].name);
      let index = this.providers.findIndex(option => option.name === provider || option.friendly_name === provider || option.type_name === provider);
      if (index > -1) {
        this.providerDetails = this.providers[index];
      } else {
        this.providerDetails = this.providers[0];
      }
    } else {
      this.providerDetails = this.providers[0]
      this.tokens = 5000;
      this.temperature = 0.5;
      this.top_p = 0.5;
      this.presence_penalty = 0.5;
      this.frequency_penalty = 0.5;
    }
    this.provider = this.providerDetails.friendly_name ? this.providerDetails.friendly_name : this.providerDetails.type + '-' + this.providerDetails.alias;
    if (this.providerDetails.friendly_name) {
      this.connection_name = this.providerDetails.friendly_name;
    } else {
      this.connection_name = this.providerDetails.name;
    }
    this.main_provider = this.providerDetails.name;

    // Start the generation
    this.start();
  }

  changesOccurPrompt($event) {
    console.log($event);
  }

  changesOccurTokens($event) {
    this.tokens = $event.toString();
  }
  changesOccurTokensconf($event) {
    this.tokens = $event.toString();
  }

  changesOccurTemperature($event) {
    this.temperature = $event.toString();
  }

  changesOccurTopP($event) {
    this.top_p = $event.toString();
  }

  changesOccurPresencePenalty($event) {
    this.presence_penalty = $event.toString();
  }

  changesOccurFrequencyPenalty($event) {
    this.frequency_penalty = $event.toString();
  }
  open(content: any): void {
    this.modalService.openModal(content, 'mini');
  }
  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
  }

  scrollToExamples(): void {
    this.isExpandedExp = true
    const examples = document.getElementById('exampleDiv');
    examples.scrollIntoView({ behavior: 'smooth' });
  }
  expandTemplate(): void {
    this.isExpanded = true;
    this.isExpandedExp = false
  }
  collapseTemplate(): void {
    this.isExpanded = false;
  }

  expandExamples(): void {
    this.isExpandedExp = true;
    this.isExpanded = false;
  }

  collapseExamples(): void {
    this.isExpandedExp = false;
  }

  onPanelOpened(panelNumber: number | string) {
    if (panelNumber === 1) {
      this.panel2Expanded = false;
    } else if (panelNumber === 2) {
      this.panel1Expanded = false;
    } else if (panelNumber === 'inputs') {
      this.panel1Expanded = false;
      this.panel2Expanded = false;
    }
  }

  onExamplePanelOpened(index: number) {
    this.expandedPanels = this.expandedPanels.map((_, i) => i === index);
  }

  structurePromptDetails() {
    this.pluginForm = this.createNewForm()
    this.examplesForm = this._formBuilder.group({
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
        configurations: this._formBuilder.group({
          provider: example.configurations?.provider || this.provider,
          tokens: example.configurations?.tokens || this.tokens,
          temperature: example.configurations?.temperature || this.temperature,
          top_p: example.configurations?.top_p || this.top_p,
          presence_penalty: example.configurations?.presence_penalty || this.presence_penalty,
          frequency_penalty: example.configurations?.frequency_penalty || this.frequency_penalty
        })
      }));
      const exampleFormArray = this._formBuilder.array(exampleFGs);
      // (this.examplesForm.get('examples') as FormArray).push(exampleFormArray);
      this.examplesForm.setControl('examples', exampleFormArray);
    }
    this.addExistingTemplate();
    this.getPromptProvidersList();
  }
  ngOnDestroy(): void {
    let activeSpan = this.telemetry.fetchActiveSpan();
    this.telemetry.endTelemetry(activeSpan);
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