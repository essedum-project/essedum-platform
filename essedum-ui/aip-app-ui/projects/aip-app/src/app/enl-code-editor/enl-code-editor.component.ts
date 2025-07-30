import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Subject } from 'rxjs';
import * as ace from 'ace-builds';

// Import ACE themes
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-chrome';

// Import ACE language modes
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-r';

// Import ACE extensions
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
import 'ace-builds/src-noconflict/ext-searchbox';

// Constants
const THEMES = {
  DARK: 'ace/theme/dracula',
  LIGHT: 'ace/theme/eclipse',
} as const;

const DEFAULT_LANGUAGE = 'python';
const DEBOUNCE_TIME = 300;
const ACE_BASE_PATH = 'https://unpkg.com/ace-builds@1.4.14/src-noconflict/';

// Interfaces
interface LanguageOption {
  readonly viewValue: string;
  readonly value: string;
}

interface EditorData {
  script?: string[];
}

interface EditorEvent {
  script: string[];
}

type SupportedLanguage = 'python' | 'java' | 'javascript' | 'r';

@Component({
  selector: 'app-enl-code-editor[id=ele]',
  templateUrl: './enl-code-editor.component.html',
  styleUrls: ['./enl-code-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnlCodeEditorComponent
  implements OnInit, OnChanges, AfterViewInit
{
  // Input properties with better typing and validation
  @Input() isRestDataset = false;
  @Input() script: string[] = [];
  @Input() data: EditorData | null = null;
  @Input() lang: SupportedLanguage = DEFAULT_LANGUAGE;
  @Input() dataset = false;
  @Input() langEnable = true;
  @Input() alphabetagamma = '';

  // Output events with proper typing
  @Output() readonly scriptChange = new EventEmitter<string[]>();
  @Output() readonly event = new EventEmitter<EditorEvent>();
  @Output() readonly jsonChange = new EventEmitter<string>();

  // Language options - make it readonly and more maintainable
  readonly langList: readonly LanguageOption[] = [
    { viewValue: 'Python', value: 'python' },
    { viewValue: 'Java', value: 'java' },
    { viewValue: 'JavaScript', value: 'javascript' },
    { viewValue: 'R', value: 'r' },
    { viewValue: 'Jython', value: 'python' },
  ] as const;

  @ViewChild('editor', { static: true })
  private readonly codeEditorElmRef!: ElementRef<HTMLElement>;

  // Private properties with better typing
  private codeEditor?: ace.Ace.Editor | any;
  private editorBeautify?: any;
  private isEditorInitialized = false;
  private readonly contentChange$ = new Subject<void>();
  private readonly globalEventListeners: Array<() => void> = [];

  // Public properties
  codeString = '';
  pyViewer = false;

  readonly editorOptions = {
    maxLines: 1000,
    printMargin: false,
  } as const;

  ngOnInit(): void {
    this.initializeComponent();
    this.setupContentChangeStream();
  }

  ngAfterViewInit(): void {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      this.initializeEditor();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isEditorInitialized) return;

    this.handleLanguageChange(changes);
    this.handleScriptChange(changes);
  }

  // Public API methods
  public beautifyContent(): void {
    if (!this.canPerformEditorOperation()) {
      console.warn('Cannot beautify: Editor not ready');
      return;
    }

    try {
      const session = this.codeEditor!.getSession();
      this.editorBeautify?.beautify(session);
    } catch (error) {
      console.error('Error beautifying content:', error);
    }
  }

  public langChange(language: string): void {
    if (this.isValidLanguage(language) && this.lang !== language) {
      this.lang = language as SupportedLanguage;
      this.updateEditorLanguage(language);
    }
  }

  public setScriptToEditor(): void {
    if (this.canPerformEditorOperation() && this.codeString !== undefined) {
      this.codeEditor!.setValue(this.codeString);
      this.codeEditor!.clearSelection();
    }
  }

  public onChange(): void {
    this.contentChange$.next();
  }

  // Private initialization methods
  private initializeComponent(): void {
    this.initializeScriptData();
    this.configureAcePaths();
    this.setPyViewerVisibility();
  }

  private setupContentChangeStream(): void {
    this.contentChange$.subscribe(() => {
      this.handleContentChange();
    });
  }

  private initializeScriptData(): void {
    if (this.data?.script?.length) {
      this.script = [...this.data.script]; // Defensive copy
    }
  }

  private configureAcePaths(): void {
    const pathConfig = {
      basePath: ACE_BASE_PATH,
      modePath: ACE_BASE_PATH,
      themePath: ACE_BASE_PATH,
      workerPath: ACE_BASE_PATH,
    };

    Object.entries(pathConfig).forEach(([key, path]) => {
      ace.config.set(key, path);
    });
  }

  private setPyViewerVisibility(): void {
    this.pyViewer = this.alphabetagamma === 'show';
  }

  private initializeEditor(): void {
    if (!this.codeEditorElmRef?.nativeElement) {
      console.error('Editor element not found');
      return;
    }

    try {
      this.loadAceModules();
      this.createEditorInstance();
      this.configureEditor();
      this.setupEventListeners();
      this.loadInitialContent();
      this.setupSearchScrolling();

      this.isEditorInitialized = true;
      console.log('ACE Editor initialized successfully');
    } catch (error) {
      console.error('Error initializing ACE editor:', error);
    }
  }

  private loadAceModules(): void {
    const modules = [
      'ace/ext/language_tools',
      'ace/ext/beautify',
      'ace/ext/searchbox',
    ];

    modules.forEach((module) => ace.require(module));
  }

  private createEditorInstance(): void {
    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();

    this.codeEditor = ace.edit(element, editorOptions);
  }

  private configureEditor(): void {
    if (!this.codeEditor) return;

    this.setEditorTheme();
    this.updateEditorLanguage(this.lang);
    this.setEditorOptions();
    this.initializeExtensions();
  }

  private setEditorTheme(): void {
    const theme = this.dataset ? THEMES.LIGHT : THEMES.DARK;
    this.codeEditor!.setTheme(theme);
  }

  private setEditorOptions(): void {
    const options = {
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      wrap: 'free' as const,
      fontSize: 14,
      showPrintMargin: false,
      displayIndentGuides: true,
      tabSize: 2,
      useSoftTabs: true,
    };

    this.codeEditor!.setOptions(options);
    this.codeEditor!.setShowFoldWidgets(true);
  }

  private initializeExtensions(): void {
    this.editorBeautify = ace.require('ace/ext/beautify');
  }

  private setupEventListeners(): void {
    if (!this.codeEditor) return;

    this.codeEditor.on('change', () => {
      this.contentChange$.next();
    });
  }

  private loadInitialContent(): void {
    this.convertArrayToString();
    if (this.codeEditor) {
      this.codeEditor.clearSelection();
      this.codeEditor.moveCursorTo(0, 0);
    }
  }

  private getEditorOptions(): Partial<ace.Ace.EditorOptions> {
    return {
      highlightActiveLine: true,
      minLines: 14,
      maxLines: Infinity,
      displayIndentGuides: true,
      showPrintMargin: false,
      animatedScroll: true,
    };
  }

  private handleLanguageChange(changes: SimpleChanges): void {
    const langChange = changes['lang'];
    if (
      langChange?.currentValue &&
      langChange.currentValue !== langChange.previousValue
    ) {
      this.updateEditorLanguage(langChange.currentValue);
    }
  }

  private handleScriptChange(changes: SimpleChanges): void {
    const scriptChange = changes['script'];
    if (
      scriptChange?.currentValue &&
      scriptChange.currentValue !== scriptChange.previousValue
    ) {
      this.convertArrayToString();
    }
  }

  private updateEditorLanguage(language: string): void {
    if (!this.codeEditor) return;

    const mode = this.determineLanguageMode(language);
    this.codeEditor.getSession().setMode(`ace/mode/${mode}`);
  }

  private determineLanguageMode(language: string): string {
    if (language) {
      return language.toLowerCase();
    }

    return this.isRestDataset ? 'javascript' : 'java';
  }

  private handleContentChange(): void {
    this.convertStringToArray();
  }

  private convertStringToArray(): void {
    if (!this.codeEditor) return;

    try {
      const code = this.codeEditor.getValue();
      this.emitContentChanges(code);

      if (code.trim()) {
        const codeArray = this.processCodeContent(code);
        this.updateScript(codeArray);
      }
    } catch (error) {
      console.error('Error converting string to array:', error);
    }
  }

  private emitContentChanges(code: string): void {
    this.jsonChange.emit(code);
  }

  private processCodeContent(code: string): string[] {
    return code.replace(/"/g, '"').split('\n');
  }

  private updateScript(codeArray: string[]): void {
    this.script = codeArray;
    this.event.emit({ script: this.script });
    this.scriptChange.emit(this.script);
  }

  private convertArrayToString(): void {
    const newCodeString = this.script?.length ? this.script.join('\n') : '';

    if (this.codeString === newCodeString) return;

    this.codeString = newCodeString;
    this.updateEditorContent();
  }

  private updateEditorContent(): void {
    if (!this.codeEditor) return;

    const currentValue = this.codeEditor.getValue();
    if (currentValue !== this.codeString) {
      this.codeEditor.setValue(this.codeString);
      this.codeEditor.clearSelection();
    }
  }

  // Search functionality
  private setupSearchScrolling(): void {
    const keydownHandler = this.createKeydownHandler();
    document.addEventListener('keydown', keydownHandler);

    this.globalEventListeners.push(() => {
      document.removeEventListener('keydown', keydownHandler);
    });

    this.setupSelectionChangeListener();
  }

  private createKeydownHandler(): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (this.isSearchKeyCombo(e)) {
        setTimeout(() => this.enhanceSearchBox(), 50);
      }
    };
  }

  private isSearchKeyCombo(e: KeyboardEvent): boolean {
    return (e.ctrlKey || e.metaKey) && e.key === 'f';
  }

  private enhanceSearchBox(): void {
    const searchBox = document.querySelector('.ace_search');
    if (!searchBox) return;

    this.addSearchFieldListener(searchBox);
    this.addSearchButtonListeners(searchBox);
  }

  private addSearchFieldListener(searchBox: Element): void {
    const inputField = searchBox.querySelector(
      '.ace_search_field'
    ) as HTMLInputElement;
    if (inputField) {
      inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          setTimeout(() => this.scrollToCurrentSelection(), 10);
        }
      });
    }
  }

  private addSearchButtonListeners(searchBox: Element): void {
    const findButtons = searchBox.querySelectorAll('.ace_searchbtn');
    findButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setTimeout(() => this.scrollToCurrentSelection(), 10);
      });
    });
  }

  private setupSelectionChangeListener(): void {
    if (!this.codeEditor) return;

    this.codeEditor.selection.on('changeSelection', () => {
      if (!this.codeEditor?.selection.isEmpty()) {
        setTimeout(() => this.scrollToCurrentSelection(), 0);
      }
    });
  }

  private scrollToCurrentSelection(): void {
    if (!this.canScrollToSelection()) return;

    try {
      this.performScrollOperations();
    } catch (error) {
      console.error('Error scrolling to selection:', error);
    }
  }

  private canScrollToSelection(): boolean {
    return !!(this.codeEditor && !this.codeEditor.selection.isEmpty());
  }

  private performScrollOperations(): void {
    const selectionRange = this.codeEditor!.selection.getRange();
    const rowElement = this.findCursorElement();

    if (rowElement) {
      rowElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }

    // Use end row for forward selection (top to bottom), start row for backward selection (bottom to top)
    const targetRow = this.codeEditor!.selection.isBackwards()
      ? selectionRange.start.row
      : selectionRange.end.row;

    this.performAceScrollOperations(targetRow);
  }

  private findCursorElement(): Element | null {
    return this.codeEditor!.renderer.$cursorLayer.element.querySelector(
      '.ace_cursor'
    );
  }

  private performAceScrollOperations(row: number): void {
    const cursor = this.codeEditor!.getCursorPosition();
    this.codeEditor!.renderer.scrollCursorIntoView(cursor);
    this.codeEditor!.renderer.scrollToLine(row, true, true, () => {});
  }

  // Utility methods
  private canPerformEditorOperation(): boolean {
    return !!(this.codeEditor && this.editorBeautify);
  }

  private isValidLanguage(language: string): boolean {
    return this.langList.some((lang) => lang.value === language);
  }
}
