import {
  Component, OnInit, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef,
  Input, ElementRef, OnDestroy, AfterViewInit, Output, EventEmitter
} from '@angular/core';

import * as ace from 'ace-builds';
// language package, choose your own
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
// ui-theme package
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/src-noconflict/mode-json'
import { LeapTelemetryService } from 'com-lib-util';
const THEME = 'ace/theme/dracula';
const LANG = 'ace/mode/python';

@Component({
  selector: 'enl-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements OnInit, OnChanges {
  @Input() isRestDataset: boolean;
  @Input() script: any[];
  @Input() langList: any[];
  @Input() lang: string;
  @Input() langEnable: any;
  @Input() alphabetagamma: string;
  @Input() scriptAlter: any;
  @Output() scriptChange = new EventEmitter();
  @Output() jsonChange = new EventEmitter();
  constructor(
    private telemetryService: LeapTelemetryService,) { }
  // lang = 'python';
  options: any = { maxLines: 1000, printMargin: false };
  private editorBeautify;
  @ViewChild('editor', {static: true}) private codeEditorElmRef: ElementRef;
  private codeEditor: ace.Ace.Editor;
  codeString = '';
  pyViewer:boolean;

  ngOnInit() {
    this.telemetryImpression();
    ace.require('ace/ext/language_tools');
    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();

    this.codeEditor = ace.edit(element, editorOptions);
    this.codeEditor.setTheme(THEME);
    this.codeEditor.setAutoScrollEditorIntoView(true)
    // this.codeEditor.getSession().setMode(LANG);
    this.codeEditor.getSession().setMode('ace/mode/' + this.lang);
    this.codeEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
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

  telemetryImpression() {
    this.telemetryService.start();
    this.telemetryService.impression("aip-app", "list", "CodeEditorComponent");
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.lang)
      this.codeEditor?.getSession().setMode('ace/mode/' + this.lang);
    if(changes?.scriptAlter?.currentValue != changes?.scriptAlter?.previousValue)
      this.ngOnInit();
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

  langChange($event) {
    this.codeEditor.getSession().setMode('ace/mode/' + $event);
  }

  stringToArray() {
    const code = this.codeEditor.getValue();
    this.jsonChange.emit(code);
    if (code !== '') {
      const codetxt = code;
      const codeArray = codetxt.replace(/"/g, "\"").split('\n');
      this.script = codeArray;
      this.scriptChange.emit(this.script);
    }
  }

  arrayToString() {
    let codeStr = '';
    for (let i = 0; i < this.script.length; i++) {
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

