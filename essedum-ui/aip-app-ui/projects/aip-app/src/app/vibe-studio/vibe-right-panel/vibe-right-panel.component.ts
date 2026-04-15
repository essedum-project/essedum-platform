import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VibeStudioService } from '../services/vibe-studio.service';
import { VibeFile, VibeSessionStatus } from '../models/vibe-studio.models';

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
export class VibeRightPanelComponent implements OnInit, OnDestroy {
  files: VibeFile[] = [];
  treeNodes: FileTreeNode[] = [];          // flat list for *ngFor (virtual tree)
  selectedFile: VibeFile | null = null;
  previewUrl: SafeResourceUrl | null = null;
  status: VibeSessionStatus = 'idle';
  activeTab: 'preview' | 'code' = 'preview';
  codeLines: string[] = [];
  codeColor = '#f8f8f2';  // Dracula default, updated per file type

  private expandedDirs = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private vibeService: VibeStudioService,
    private sanitizer: DomSanitizer,
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
              this.codeLines = updated.content.split('\n');
            }
          }
        }
      });

    this.vibeService.previewUrl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((url) => {
        if (url) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.activeTab = 'preview';
        }
      });

    this.vibeService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => (this.status = s));
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
    this.codeLines = file.content.split('\n');
    this.codeColor = this.getCodeColor(file.path);
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

  // Returns a Dracula-palette color for the file type (mirrors agent-pipeline codespace)
  getCodeColor(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() ?? '';
    const colors: Record<string, string> = {
      py:         '#f8f8f2',  // default light
      json:       '#f1fa8c',  // yellow
      js:         '#50fa7b',  // green
      ts:         '#8be9fd',  // cyan
      jsx:        '#50fa7b',
      tsx:        '#8be9fd',
      html:       '#ff79c6',  // pink
      xml:        '#ff79c6',
      css:        '#8be9fd',
      scss:       '#ff79c6',
      md:         '#bd93f9',  // purple
      yml:        '#f1fa8c',
      yaml:       '#f1fa8c',
      sh:         '#50fa7b',
      toml:       '#f1fa8c',
      txt:        '#f8f8f2',
      dockerfile: '#8be9fd',
      properties: '#a8ff78',
      java:       '#f8f8f2',
    };
    return colors[ext] ?? '#f8f8f2';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
