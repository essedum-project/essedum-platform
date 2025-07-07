import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as ace from 'ace-builds';
const THEME = 'ace/theme/dracula';
const THEME1 = 'ace/theme/eclipse';
const LANG = 'ace/mode/python';
@Component({
  selector: 'app-enl-code-editor[id=ele]',
  templateUrl: './enl-code-editor.component.html',
  styleUrls: ['./enl-code-editor.component.scss']
})
export class EnlCodeEditorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input()
  isRestDataset: boolean = false;
  @Input()
  script: string[] = [];
  @Input()
  data;

  langList = [{viewValue:"Python",value:"Python"},{viewValue:"Java",value:"Java"},{viewValue:"JavaScript",value:"JavaScript"},{viewValue:"R",value:"R"},{viewValue:"Jython",value:"Jython"}];
  @Input() lang: string = 'python';
  @Input() dataset: boolean = false;
  @Input() langEnable: any;
  @Input() alphabetagamma: string = '';
  @Output() scriptChange = new EventEmitter();
  @Output() event = new EventEmitter();
  @Output() jsonChange = new EventEmitter();
  constructor(

  ) { }
  // lang = 'python';
  options: any = { maxLines: 1000, printMargin: false };
  private editorBeautify : any;
  @ViewChild('editor', {static: true}) private codeEditorElmRef: ElementRef | any;
  private codeEditor: ace.Ace.Editor | any;
  codeString = '';
  pyViewer: boolean = false;

  ngOnInit() {
    if(this.data && this.data.script){
      this.script = this.data.script
    }
    ace.require('ace/ext/language_tools');
    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();

    this.codeEditor = ace.edit(element, editorOptions);
    if(this.dataset == true){
      this.codeEditor.setTheme(THEME1);
      ace.config.set('themePath','ace/theme/chrome');
    }else{
    this.codeEditor.setTheme(THEME);
    ace.config.set('themePath','ace/theme/dracula');
    } 
    this.codeEditor.getSession().setMode('ace/mode/' + this.lang);
    
    this.codeEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      wrap:'free'
    });
    this.codeEditor.setShowFoldWidgets(true);
    this.editorBeautify = ace.require('ace/ext/beautify');
    this.arrayToString();
    this.codeEditor.on('change', this.onChange.bind(this));

    if(this.isRestDataset && !this.lang){
      this.codeEditor.getSession().setMode('ace/mode/javascript');
    }
    else if(!this.isRestDataset && !this.lang){
      this.lang = 'java'
    }

    if(this.alphabetagamma == "show")
    {
      this.pyViewer = true;
    }
    else
    {
      this.pyViewer = false;
    }
   

  }

  ngAfterViewInit(): void {
    const element = this.codeEditorElmRef.nativeElement;
    this.codeEditor = ace.edit(element, {
      mode: LANG,
      theme: THEME,
      highlightActiveLine: false,
      highlightSelectedWord: false,
      selectionStyle: 'text'
    });

    // Optionally, you can clear the selection if it is already set
    this.codeEditor.clearSelection();
  }



  ngOnChanges(changes: SimpleChanges) {
    // this.codeEditor.getSession().setMode('ace/mode/' + this.lang);
  }

  getEditorOptions() {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 14,
      maxLines: Infinity,
      displayIndentGuides: true
    };
    return basicEditorOptions;
  }

  public beautifyContent() {
    if (this.codeEditor && this.editorBeautify) {
      const session = this.codeEditor.getSession();
      this.editorBeautify.beautify(session);
    }
  }

  langChange($event: any) {
    this.codeEditor.getSession().setMode('ace/mode/' + $event);
  }

  stringToArray() {
    try{
    const code = this.codeEditor.getValue();
    this.jsonChange.emit(code);
    if (code !== '') {
      const codetxt = code;
      const codeArray = codetxt.replace(/"/g, "\"").split('\n');
      this.script = codeArray;
      this.event.emit({"script":this.script});
      this.scriptChange.emit(this.script);
    }
  }catch(e){
    console.log(e)
  }
  }

  arrayToString() {
    let codeStr = '';
    for (let i = 0; i < this.script?.length; i++) {
      codeStr += this.script[i] + '\n';
    }
    this.codeString = codeStr;
    this.setScriptToEditor();
  }

  setScriptToEditor() {
    this.codeEditor.setValue(this.codeString);
  }

  onChange() {
    this.stringToArray();
  }
}


