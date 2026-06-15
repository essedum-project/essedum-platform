import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const T = {
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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyRules(line: string, rules: Array<{ re: RegExp; color: string }>, def = '#d4d4d4'): string {
  if (!line) return '';
  const src = rules.map(r => `(${r.re.source})`).join('|');
  const re = new RegExp(src, 'g');
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out += esc(line.slice(last, m.index));
    let ruleIdx = -1;
    for (let i = 0; i < rules.length; i++) {
      if (m[i + 1] !== undefined) { ruleIdx = i; break; }
    }
    const color = ruleIdx >= 0 ? rules[ruleIdx].color : def;
    out += `<span style="color:${color}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  if (last < line.length) out += esc(line.slice(last));
  return out;
}

function tokJs(line: string): string {
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
  return applyRules(line, rules, T.DEF);
}

function tokHtml(line: string): string {
  const rules = [
    { re: /<!--[\s\S]*?-->/, color: T.COMMENT },
    { re: /<\/?[a-zA-Z][a-zA-Z0-9-]*/, color: T.TAG },
    { re: /\/?>/, color: T.TAG },
    { re: /[a-zA-Z-]+=/, color: T.ATTR },
    { re: /"[^"]*"/, color: T.STRING },
    { re: /'[^']*'/, color: T.STRING },
  ];
  return applyRules(line, rules, T.DEF);
}

function tokCss(line: string): string {
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
  return applyRules(line, rules, T.DEF);
}

function tokJson(line: string): string {
  const rules = [
    { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/, color: T.PROP },
    { re: /"(?:[^"\\]|\\.)*"/, color: T.STRING },
    { re: /\b(?:true|false|null)\b/, color: T.KW_BLUE },
    { re: /\b-?\d+\.?\d*(?:[eE][+-]?\d+)?\b/, color: T.NUMBER },
  ];
  return applyRules(line, rules, T.DEF);
}

function tokPy(line: string): string {
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
  return applyRules(line, rules, T.DEF);
}

function tokYaml(line: string): string {
  const rules = [
    { re: /#.*/, color: T.COMMENT },
    { re: /^---/, color: T.KW_BLUE },
    { re: /"[^"]*"/, color: T.STRING },
    { re: /'[^']*'/, color: T.STRING },
    { re: /\b(?:true|false|null|yes|no)\b/, color: T.KW_BLUE },
    { re: /\b\d+\.?\d*\b/, color: T.NUMBER },
    { re: /^\s*[\w-]+(?=\s*:)/, color: T.PROP },
  ];
  return applyRules(line, rules, T.DEF);
}

function tokShell(line: string): string {
  const rules = [
    { re: /#.*/, color: T.COMMENT },
    { re: /\$\{?[\w]+\}?/, color: T.PROP },
    { re: /"(?:[^"\\]|\\.)*"/, color: T.STRING },
    { re: /'[^']*'/, color: T.STRING },
    { re: /\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|echo|export|source|cd|ls|mkdir|rm|cp|mv|grep|sed|awk|cat|chmod|chown)\b/, color: T.KW_PINK },
    { re: /\b\d+\b/, color: T.NUMBER },
  ];
  return applyRules(line, rules, T.DEF);
}

function tokMd(line: string): string {
  if (/^#{1,6}\s/.test(line)) {
    return `<span style="color:${T.KW_BLUE}">${esc(line)}</span>`;
  }
  if (/^```/.test(line) || /^~~~/.test(line)) {
    return `<span style="color:${T.COMMENT}">${esc(line)}</span>`;
  }
  const rules = [
    { re: /`[^`]+`/, color: T.STRING },
    { re: /\*\*[^*]+\*\*/, color: T.KW_BLUE },
    { re: /\[[^\]]+\]\([^)]+\)/, color: T.PROP },
  ];
  return applyRules(line, rules, T.DEF);
}

export function tokenizeForExt(line: string, ext: string, sanitizer: DomSanitizer): SafeHtml {
  let html: string;
  switch (ext) {
    case 'js': case 'ts': case 'jsx': case 'tsx': case 'java': case 'cjs': case 'mjs':
      html = tokJs(line); break;
    case 'html': case 'htm': case 'xml': case 'svg':
      html = tokHtml(line); break;
    case 'css': case 'scss': case 'less':
      html = tokCss(line); break;
    case 'json':
      html = tokJson(line); break;
    case 'py':
      html = tokPy(line); break;
    case 'yml': case 'yaml':
      html = tokYaml(line); break;
    case 'sh': case 'bash':
      html = tokShell(line); break;
    case 'md':
      html = tokMd(line); break;
    default:
      html = esc(line);
  }
  return sanitizer.bypassSecurityTrustHtml(html);
}
