import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import { VibeFile, VibeSessionStatus } from '../models/vibe-studio.models';
import { Services } from '@essedum/shared-lib';

export interface FileTreeNode {
  name: string;
  fullPath: string;
  isDir: boolean;
  depth: number;
  file?: VibeFile;
  children: FileTreeNode[];
}

@Component({
  selector: 'app-vibe-right-panel',
  templateUrl: './vibe-right-panel.component.html',
  styleUrls: ['./vibe-right-panel.component.scss'],
})
export class VibeRightPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pipelineCname: string | null = null;

  files: VibeFile[] = [];
  treeNodes: FileTreeNode[] = [];          // flat list for *ngFor (virtual tree)
  selectedFile: VibeFile | null = null;
  previewUrl: SafeResourceUrl | null = null;
  status: VibeSessionStatus = 'idle';
  activeTab: 'preview' | 'code' | 'environment' = 'preview';
  codeLines: string[] = [];
  tokenizedLines: SafeHtml[] = [];
  deploymentStatus: 'idle' | 'deploying' | 'success' | 'error' = 'idle';
  deploymentResult: any = null;
  deploymentSafeUrl: SafeResourceUrl | null = null;
  private selectedExt = '';

  // ── Environment tab state ──────────────────────────────────────────────────
  dynamicEnvArray: Array<{ name: string; value: string }> = [];
  envCollapsed = true;
  envEditIndex = -1;
  envEditMode = false;
  dynamicSecretsArray: Array<{ name: string; value: string }> = [];
  secretsCollapsed = true;
  secretsEditIndex = -1;
  secretsEditMode = false;
  secretsShowValue: boolean[] = [];
  private streamItem: any = null;
  private _saveEnvDebounceTimer: any = null;

  private expandedDirs = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private vibeService: VibeStudioService,
    private sanitizer: DomSanitizer,
    private services: Services,
  ) {}

  ngOnInit(): void {
    this.vibeService.files$
      .pipe(takeUntil(this.destroy$))
      .subscribe((files) => {
        this.files = files;
        if (!files.length) {
          this.selectedFile = null;
          this.codeLines = [];
          this.expandedDirs.clear();
          this.treeNodes = [];
          return;
        }
        const firstLoad = !this.selectedFile;
        this.rebuildTree();
        this.activeTab = 'code';
        if (firstLoad) {
          // Auto-expand all dirs and select first file on first load
          this.expandAll();
          const firstFile = files[0];
          this.selectFile(firstFile);
          this.activeTab = 'code';
        } else {
          // Keep selected file content fresh
          if (this.selectedFile) {
            const updated = files.find(f => f.path === this.selectedFile!.path);
            if (updated) {
              this.selectedFile = updated;
              const updLines = updated.content.split('\n');
              this.codeLines = updLines;
              this.tokenizedLines = updLines.map(l => this.tokenizeForExt(l, this.selectedExt));
            }
          }
        }
      });

    this.vibeService.previewUrl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((url) => {
        if (url) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          // Only auto-switch to preview if no files are loaded yet
          if (!this.files.length) {
            this.activeTab = 'preview';
          }
        }
      });

    this.vibeService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => (this.status = s));

    this.vibeService.deploymentStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => {
        this.deploymentStatus = s;
        if (s === 'deploying' || s === 'success' || s === 'error') {
          this.activeTab = 'preview';
        }
      });

    this.vibeService.deploymentResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.deploymentResult = result;
        this.deploymentSafeUrl = (result && this.isDeploymentUrl(result))
          ? this.sanitizer.bypassSecurityTrustResourceUrl(result as string)
          : null;
      });
  }

  // ─── Tree building ──────────────────────────────────────────────────────────

  private rebuildTree(): void {
    // Build a proper nested tree from flat paths, then flatten for rendering
    interface InternalNode {
      name: string;
      fullPath: string;
      isDir: boolean;
      file?: VibeFile;
      children: Map<string, InternalNode>;
    }

    const root: InternalNode = {
      name: '', fullPath: '', isDir: true, children: new Map(),
    };

    for (const file of this.files) {
      const parts = file.path.split('/');
      let cur = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const pathSoFar = parts.slice(0, i + 1).join('/');
        if (!cur.children.has(part)) {
          cur.children.set(part, {
            name: part,
            fullPath: pathSoFar,
            isDir: !isLast,
            file: isLast ? file : undefined,
            children: new Map(),
          });
        } else if (isLast) {
          const node = cur.children.get(part)!;
          node.file = file;
          node.isDir = false;
        }
        cur = cur.children.get(part)!;
      }
    }

    // Flatten to renderable nodes
    const flat: FileTreeNode[] = [];
    const visit = (node: InternalNode, depth: number): void => {
      // Sort: dirs first, then files, both alphabetically
      const sorted = [...node.children.values()].sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      for (const child of sorted) {
        flat.push({
          name: child.name,
          fullPath: child.fullPath,
          isDir: child.isDir,
          depth,
          file: child.file,
          children: [],
        });
        if (child.isDir && this.expandedDirs.has(child.fullPath)) {
          visit(child, depth + 1);
        }
      }
    };
    visit(root, 0);
    this.treeNodes = flat;
  }

  private expandAll(): void {
    for (const file of this.files) {
      const parts = file.path.split('/');
      for (let i = 0; i < parts.length - 1; i++) {
        this.expandedDirs.add(parts.slice(0, i + 1).join('/'));
      }
    }
  }

  toggleDir(node: FileTreeNode): void {
    if (this.expandedDirs.has(node.fullPath)) {
      this.expandedDirs.delete(node.fullPath);
    } else {
      this.expandedDirs.add(node.fullPath);
    }
    this.rebuildTree();
  }

  isDirExpanded(node: FileTreeNode): boolean {
    return this.expandedDirs.has(node.fullPath);
  }

  // ─── File selection ─────────────────────────────────────────────────────────

  selectFile(file: VibeFile): void {
    this.selectedFile = file;
    const lines = file.content.split('\n');
    this.codeLines = lines;
    this.selectedExt = file.path.split('.').pop()?.toLowerCase() ?? '';
    this.tokenizedLines = lines.map(l => this.tokenizeForExt(l, this.selectedExt));
    this.activeTab = 'code';
  }

  onNodeClick(node: FileTreeNode): void {
    if (node.isDir) {
      this.toggleDir(node);
    } else if (node.file) {
      this.selectFile(node.file);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  // ─── Syntax tokenizer (VS Code Dark+ palette) ───────────────────────────────

  private readonly T = {
    COMMENT : '#6a9955',
    STRING  : '#ce9178',
    NUMBER  : '#b5cea8',
    KW_BLUE : '#569cd6',
    KW_PINK : '#c586c0',
    TYPE    : '#4ec9b0',
    FUNC    : '#dcdcaa',
    PROP    : '#9cdcfe',
    TAG     : '#4ec9b0',
    ATTR    : '#9cdcfe',
    SELECTOR: '#d7ba7d',
    ATRULE  : '#c586c0',
    DEF     : '#d4d4d4',
  };

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private applyRules(line: string, rules: Array<{ re: RegExp; color: string }>, def = '#d4d4d4'): string {
    if (!line) return '';
    const src = rules.map(r => `(${r.re.source})`).join('|');
    const re = new RegExp(src, 'g');
    let out = '';
    let last = 0;
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) out += this.esc(line.slice(last, m.index));
      let ruleIdx = -1;
      for (let i = 0; i < rules.length; i++) {
        if (m[i + 1] !== undefined) { ruleIdx = i; break; }
      }
      const color = ruleIdx >= 0 ? rules[ruleIdx].color : def;
      out += `<span style="color:${color}">${this.esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    if (last < line.length) out += this.esc(line.slice(last));
    return out;
  }

  tokenizeForExt(line: string, ext: string): SafeHtml {
    let html: string;
    switch (ext) {
      case 'js': case 'ts': case 'jsx': case 'tsx': case 'java': case 'cjs': case 'mjs':
        html = this.tokJs(line); break;
      case 'html': case 'htm': case 'xml': case 'svg':
        html = this.tokHtml(line); break;
      case 'css': case 'scss': case 'less':
        html = this.tokCss(line); break;
      case 'json':
        html = this.tokJson(line); break;
      case 'py':
        html = this.tokPy(line); break;
      case 'yml': case 'yaml':
        html = this.tokYaml(line); break;
      case 'sh': case 'bash':
        html = this.tokShell(line); break;
      case 'md':
        html = this.tokMd(line); break;
      default:
        html = this.esc(line);
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private tokJs(line: string): string {
    const T = this.T;
    const rules = [
      { re: /\/\/.*/, color: T.COMMENT },
      { re: /"(?:[^"\\]|\\.)*"/, color: T.STRING },
      { re: /'(?:[^'\\]|\\.)*'/, color: T.STRING },
      { re: /`(?:[^`\\]|\\.)*`/, color: T.STRING },
      { re: /@\w+/, color: T.FUNC },
      { re: /\b(?:0x[\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/, color: T.NUMBER },
      { re: /\b(?:import|export|from|as|return|if|else|switch|case|default|break|continue|for|while|do|try|catch|finally|throw|yield|of|in)\b/, color: T.KW_PINK },
      { re: /\b(?:var|let|const|function|class|extends|implements|interface|type|enum|namespace|new|delete|typeof|instanceof|void|null|undefined|true|false|this|super|static|abstract|public|private|protected|readonly|async|await|declare|get|set)\b/, color: T.KW_BLUE },
      { re: /\b[A-Z][A-Za-z0-9_]*\b/, color: T.TYPE },
      { re: /\b[a-z_$][a-zA-Z0-9_$]*(?=\s*\()/, color: T.FUNC },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokHtml(line: string): string {
    const T = this.T;
    const rules = [
      { re: /<!--[\s\S]*?-->/, color: T.COMMENT },
      { re: /<\/?[a-zA-Z][a-zA-Z0-9-]*/, color: T.TAG },
      { re: /\/?>/, color: T.TAG },
      { re: /[a-zA-Z-]+=/, color: T.ATTR },
      { re: /"[^"]*"/, color: T.STRING },
      { re: /'[^']*'/, color: T.STRING },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokCss(line: string): string {
    const T = this.T;
    const rules = [
      { re: /\/\*[\s\S]*?\*\//, color: T.COMMENT },
      { re: /\/\/.*/, color: T.COMMENT },
      { re: /@\w[\w-]*/, color: T.ATRULE },
      { re: /#[0-9a-fA-F]{3,8}\b/, color: T.STRING },
      { re: /"[^"]*"/, color: T.STRING },
      { re: /'[^']*'/, color: T.STRING },
      { re: /\b\d+\.?\d*(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/, color: T.NUMBER },
      { re: /\$[\w-]+/, color: T.PROP },
      { re: /[\w-]+(?=\s*:(?!:))/, color: T.PROP },
      { re: /[.#]?[a-zA-Z][a-zA-Z0-9_-]*/, color: T.SELECTOR },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokJson(line: string): string {
    const T = this.T;
    const rules = [
      { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/, color: T.PROP },
      { re: /"(?:[^"\\]|\\.)*"/, color: T.STRING },
      { re: /\b(?:true|false|null)\b/, color: T.KW_BLUE },
      { re: /\b-?\d+\.?\d*(?:[eE][+-]?\d+)?\b/, color: T.NUMBER },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokPy(line: string): string {
    const T = this.T;
    const rules = [
      { re: /#.*/, color: T.COMMENT },
      { re: /"""[\s\S]*?"""/, color: T.COMMENT },
      { re: /'''[\s\S]*?'''/, color: T.COMMENT },
      { re: /@\w+/, color: T.FUNC },
      { re: /"(?:[^"\\]|\\.)*"/, color: T.STRING },
      { re: /'(?:[^'\\]|\\.)*'/, color: T.STRING },
      { re: /\b(?:def|class|lambda|return|if|elif|else|for|while|try|except|finally|with|as|import|from|raise|pass|break|continue|yield|and|or|not|in|is)\b/, color: T.KW_PINK },
      { re: /\b(?:True|False|None|self|super|print)\b/, color: T.KW_BLUE },
      { re: /\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/, color: T.NUMBER },
      { re: /\b[A-Z][A-Za-z0-9_]*\b/, color: T.TYPE },
      { re: /\b[a-z_][a-zA-Z0-9_]*(?=\s*\()/, color: T.FUNC },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokYaml(line: string): string {
    const T = this.T;
    const rules = [
      { re: /#.*/, color: T.COMMENT },
      { re: /^---/, color: T.KW_BLUE },
      { re: /"[^"]*"/, color: T.STRING },
      { re: /'[^']*'/, color: T.STRING },
      { re: /\b(?:true|false|null|yes|no)\b/, color: T.KW_BLUE },
      { re: /\b\d+\.?\d*\b/, color: T.NUMBER },
      { re: /^\s*[\w-]+(?=\s*:)/, color: T.PROP },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokShell(line: string): string {
    const T = this.T;
    const rules = [
      { re: /#.*/, color: T.COMMENT },
      { re: /\$\{?[\w]+\}?/, color: T.PROP },
      { re: /"(?:[^"\\]|\\.)*"/, color: T.STRING },
      { re: /'[^']*'/, color: T.STRING },
      { re: /\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|echo|export|source|cd|ls|mkdir|rm|cp|mv|grep|sed|awk|cat|chmod|chown)\b/, color: T.KW_PINK },
      { re: /\b\d+\b/, color: T.NUMBER },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  private tokMd(line: string): string {
    const T = this.T;
    if (/^#{1,6}\s/.test(line)) {
      return `<span style="color:${T.KW_BLUE}">${this.esc(line)}</span>`;
    }
    if (/^```/.test(line) || /^~~~/.test(line)) {
      return `<span style="color:${T.COMMENT}">${this.esc(line)}</span>`;
    }
    const rules = [
      { re: /`[^`]+`/, color: T.STRING },
      { re: /\*\*[^*]+\*\*/, color: T.KW_BLUE },
      { re: /\[[^\]]+\]\([^)]+\)/, color: T.PROP },
    ];
    return this.applyRules(line, rules, T.DEF);
  }

  getFileIcon(path: string): { cls: string; color: string } {
    const ext = path.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, { cls: string; color: string }> = {
      py:     { cls: 'bi-filetype-py',   color: '#3572A5' },
      js:     { cls: 'bi-filetype-js',   color: '#F7DF1E' },
      ts:     { cls: 'bi-filetype-tsx',  color: '#3178C6' },
      jsx:    { cls: 'bi-filetype-jsx',  color: '#61DAFB' },
      tsx:    { cls: 'bi-filetype-jsx',  color: '#61DAFB' },
      html:   { cls: 'bi-filetype-html', color: '#E34F26' },
      css:    { cls: 'bi-filetype-css',  color: '#1572B6' },
      scss:   { cls: 'bi-filetype-css',  color: '#CC6699' },
      json:   { cls: 'bi-filetype-json', color: '#FFCA28' },
      md:     { cls: 'bi-filetype-md',   color: '#aaa' },
      txt:    { cls: 'bi-file-text',     color: '#aaa' },
      yml:    { cls: 'bi-file-code',     color: '#CB171E' },
      yaml:   { cls: 'bi-file-code',     color: '#CB171E' },
      toml:   { cls: 'bi-file-code',     color: '#9c4221' },
      sh:     { cls: 'bi-terminal',      color: '#89e051' },
      dockerfile: { cls: 'bi-box',       color: '#2391E6' },
    };
    return map[ext] ?? { cls: 'bi-file-code', color: '#C8C8C8' };
  }

  indentPx(depth: number): string {
    return `${depth * 16 + 8}px`;
  }

  /** Returns true when the deployment result is a plain URL string (render in iframe). */
  isDeploymentUrl(result: any): boolean {
    return typeof result === 'string' && /^https?:\/\//i.test(result.trim());
  }

  /** Sanitizes a deployment URL for iframe use. */
  sanitizeDeploymentUrl(result: any): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(result as string);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pipelineCname'] && this.pipelineCname) {
      // Only reload if not currently editing (prevents overwriting user input)
      if (!this.envEditMode && !this.secretsEditMode) {
        this.loadEnvAndSecrets();
      }
    }
  }

  // ── Environment / Secrets CRUD ──────────────────────────────────────────────

  private loadEnvAndSecrets(): void {
    if (!this.pipelineCname) return;
    this.services.getStreamingServicesByName(this.pipelineCname).subscribe((res: any) => {
      // If user started editing while API was in-flight, don't overwrite their work
      if (this.envEditMode || this.secretsEditMode) {
        this.streamItem = res;
        return;
      }
      this.streamItem = res;
      const rawContent = res.json_content || res.jsonContent;
      if (rawContent) {
        try {
          const parsed = JSON.parse(rawContent);
          this.dynamicEnvArray = parsed.environment || [];
          if (this.dynamicEnvArray.length) { this.envCollapsed = false; }
          const attrs = parsed.elements?.[0]?.attributes;
          this.dynamicSecretsArray = attrs?.usedSecrets || [];
          if (this.dynamicSecretsArray.length) { this.secretsCollapsed = false; }
          this.secretsShowValue = this.dynamicSecretsArray.map(() => false);
        } catch (e) {
          this.dynamicEnvArray = [];
          this.dynamicSecretsArray = [];
        }
      }
      this.envEditIndex = -1;
      this.envEditMode = false;
      this.secretsEditIndex = -1;
      this.secretsEditMode = false;
    });
  }

  addEnvVar(): void {
    if (this.envEditMode) return;
    if (!this.dynamicEnvArray) this.dynamicEnvArray = [];
    this.dynamicEnvArray.push({ name: '', value: '' });
    this.envEditIndex = this.dynamicEnvArray.length - 1;
    this.envEditMode = true;
    this.envCollapsed = false;
  }

  editEnvVar(i: number): void {
    this.envEditIndex = i;
    this.envEditMode = true;
  }

  saveEnvVar(i: number): void {
    this.envEditMode = false;
    this.envEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  deleteEnvVar(i: number): void {
    this.dynamicEnvArray.splice(i, 1);
    this.envEditMode = false;
    this.envEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  addSecret(): void {
    if (this.secretsEditMode) return;
    if (!this.dynamicSecretsArray) this.dynamicSecretsArray = [];
    this.dynamicSecretsArray.push({ name: '', value: '' });
    this.secretsShowValue.push(false);
    this.secretsEditIndex = this.dynamicSecretsArray.length - 1;
    this.secretsEditMode = true;
    this.secretsCollapsed = false;
  }

  editSecret(i: number): void {
    this.secretsEditIndex = i;
    this.secretsEditMode = true;
  }

  saveSecret(i: number): void {
    this.secretsEditMode = false;
    this.secretsEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  deleteSecret(i: number): void {
    this.dynamicSecretsArray.splice(i, 1);
    this.secretsShowValue.splice(i, 1);
    this.secretsEditMode = false;
    this.secretsEditIndex = -1;
    this.saveEnvAndSecrets();
  }

  toggleSecretVisibility(i: number): void {
    this.secretsShowValue[i] = !this.secretsShowValue[i];
  }

  trackByIndex(index: number): number {
    return index;
  }

  private saveEnvAndSecrets(): void {
    if (this._saveEnvDebounceTimer) { clearTimeout(this._saveEnvDebounceTimer); }
    this._saveEnvDebounceTimer = setTimeout(() => {
      this._saveEnvDebounceTimer = null;
      try {
        if (!this.streamItem) return;
        const current = this.streamItem.json_content
          ? JSON.parse(this.streamItem.json_content)
          : { elements: [{ attributes: {} }] };
        current.environment = this.dynamicEnvArray || [];
        if (!current.elements) current.elements = [{ attributes: {} }];
        if (!current.elements[0]) current.elements[0] = { attributes: {} };
        if (!current.elements[0].attributes) current.elements[0].attributes = {};
        current.elements[0].attributes.usedSecrets = this.dynamicSecretsArray || [];
        this.streamItem.json_content = JSON.stringify(current);
        this.services.update(this.streamItem).subscribe();
      } catch (e) {
        console.error('saveEnvAndSecrets error:', e);
      }
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
