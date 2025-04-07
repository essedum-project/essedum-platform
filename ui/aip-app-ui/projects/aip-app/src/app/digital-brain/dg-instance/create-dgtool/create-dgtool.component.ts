import { ChangeDetectorRef, Component, SimpleChange, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { EnlCodeEditorComponent } from '../../../enl-code-editor/enl-code-editor.component';
import { Services } from '../../../services/service';
//import {EnlCodeEditorComponent}

@Component({
  selector: 'app-create-dgtool',
  templateUrl: './create-dgtool.component.html',
  styleUrls: ['./create-dgtool.component.scss']
})
export class CreateDgtoolComponent {
  cardTitle: String = 'Create Thoughts';
  instance: any;
  attributes: any;
  uischema;

  data = {};
  renderers = angularMaterialRenderers;
  appDetails = {};
  appName: string;
  loadScript: boolean = false;
  script: any[] = [];
  lang: string = 'python';
  appId: string;
  showLoader: boolean;
  showIcon: boolean = true;
  resizeing: boolean = true;
  tooltipPoition: string = 'above';
  scriptClass: string;
  keys: any;
  nameInScript: any;
  classNames = [];
  classRegex: any;
  @ViewChild('codeEditorContainer', { read: ViewContainerRef }) container: ViewContainerRef;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: Services,
    private viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) { }

  maximize() {
    this.resizeing = !this.resizeing;
    this.showIcon = !this.showIcon
  }
  minimize() {
    this.resizeing = !this.resizeing;
    this.showIcon = !this.showIcon
  }

  ngOnInit(): void {
    let data: any;
    data = sessionStorage.getItem('user');
    console.log('sessipnData',data);
    
    //this.instance=this.route.snapshot.paramMap.get('name');
    const appData = this.route.snapshot.queryParamMap.get('App')
    this.appDetails = JSON.parse(appData);
    this.appName = this.appDetails[0].Name;
    console.log('appName', this.appName);
    this.appId = this.appDetails[0].Id;
    this.data = { AppName: this.appName, AppID: this.appId };
    this.getDGToolJson();
    setTimeout(()=>{
      this.getData();
    },500);
    
  }
  encodeAndDecode(script) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(script);
    const textDecoder = new TextDecoder('utf-8');
    this.script = textDecoder.decode(data).split('\\r\\n');
    console.log('encodescrip', this.script);
  }
  getDGToolJson() {
    this.showLoader = true;
    this.service.getRegisterDGToolJson(this.appId).subscribe((resp) => {
      this.showLoader = false;
      this.attributes = resp.attributes;
      this.keys = Object.keys(resp.attributes.properties)
      console.log('arr', this.attributes.required[0]);
      console.log('key', this.keys);
      this.uischema = resp.uischema;
    });
  }
  getData() {
    this.service.loadFile().subscribe((res) => {
      console.log('code', res);
      this.encodeAndDecode(res.body);
      console.log('scrip', this.script);
      this.loadScript = true;
      this.classRegex = /class\s+([\w-]+)/g;
      console.log('classRegx', this.classRegex);
      this.nameInScript = /name\s*=\s*("[^"]*")/g;
      console.log('namereg', this.nameInScript);
      // Extract class names
      this.classNames = [];
      let match;
      while ((match = this.classRegex.exec(res.body)) !== null) {
        this.classNames.push(match[1]);
      }
      this.scriptClass = this.classNames[0];
      console.log('className', this.scriptClass);
    })
    //  this.loadScript=false;
  }

  saveJson() {
    let toolName = this.data['Tool Name'];
    console.log('ToolName', this.data['Tool Name']);

    let className = this.classNames[0];
    const formData: FormData = new FormData();
    let script = this.script.join('\\r\\n');
    //  console.log('script', script);
    const modifiedScript = script.replace(this.classRegex, (_, capturedClassName) => {
      if (capturedClassName == className) {
        return `class ${toolName}:\n  name= "${event['Tool Name']}"`;
      }
      return _;
    });
    console.log('modife', modifiedScript);

    let scriptFile = new Blob([script], { type: 'text/plain' });
    formData.set('scriptFile', scriptFile);
    console.log('formData', formData);

    this.service.syntaxValidation(formData, toolName, this.appId, this.appName).subscribe((res) => {
      let response = JSON.stringify(res);
      // if(res.status==200){
      //   this.onClickSubmit();
      // }
      // else{
      //   this.service.messageService("Syntax Validation failed");
      // }
    })

  }
  onClickSubmit() {
    console.log('artributes', this.attributes);
    console.log(this.data);
    this.service.registerDGTool(this.data, this.appId).subscribe((resp) => {
      console.log(resp);
      this.service.messageService(resp, "Done! DG Tool  is Created.");
      if (resp.status == 200) {
        this.saveJson();
        this.routeBackToList();
      }
    }, error => { this.service.messageService(error); });
  }
  showData(event: any) {
    this.loadScript = false;
    if (event['Tool Name']) {
      //console.log('dataAdmin');
      let className = this.classNames[0];
      let script = this.script.join('\\r\\n');
      let modifiedScript = script.replace(this.classRegex, (match, capturedClassName) => {
        return `class ${event['Tool Name']}`;
      });
      modifiedScript = modifiedScript.replace(this.nameInScript, `name = "${event['Tool Name']}"`);
      this.encodeAndDecode(modifiedScript);
      this.cdr.detectChanges();
      this.onScriptChange(this.script);
      //  this.loadScript=true;
    }
    //  this.loadScript=true;
    this.data = event;
    console.log('eventJson', this.data);

  }
  routeBackToList() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
  onScriptChange($event) {
    this.script = $event;
    this.loadScript = true;
    console.log('scriptChange', this.script);

  }

}
