/**
 * Syntax tokenizer utility for code highlighting.
 * - All regexes are static literals (no dynamic RegExp construction).
 * - All output is HTML-escaped to prevent XSS.
 * - Extension lookup uses a validated switch (no dynamic property access).
 * - Returns plain escaped HTML string; caller handles Angular trust.
 */

// ── Validated color constants ───────────────────────────────────────────────

const C_COMMENT = '#6a9955';
const C_STRING = '#ce9178';
const C_NUMBER = '#b5cea8';
const C_KW_BLUE = '#569cd6';
const C_KW_PINK = '#c586c0';
const C_TYPE = '#4ec9b0';
const C_FUNC = '#dcdcaa';
const C_PROP = '#9cdcfe';
const C_TAG = '#4ec9b0';
const C_ATTR = '#9cdcfe';
const C_SELECTOR = '#d7ba7d';
const C_ATRULE = '#c586c0';
const C_DEF = '#d4d4d4';

// ── Escape utility ──────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function span(color: string, text: string): string {
  return '<span style="color:' + color + '">' + esc(text) + '</span>';
}

// ── Tokenize with static regex ──────────────────────────────────────────────

function applyStatic(line: string, re: RegExp, colors: ReadonlyArray<string>): string {
  if (!line) { return ''; }
  re.lastIndex = 0;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) { out += esc(line.slice(last, m.index)); }
    let color = C_DEF;
    for (let i = 0; i < colors.length; i++) {
      if (m[i + 1] !== undefined) { color = colors[i]; break; }
    }
    out += span(color, m[0]);
    last = m.index + m[0].length;
  }
  if (last < line.length) { out += esc(line.slice(last)); }
  return out;
}

// ── Static pre-compiled regex per language ──────────────────────────────────
// Each regex is a single literal with capture groups separated by |

const RE_JS = /(\/\/.*)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|(@\w+)|(\b(?:0x[\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b)|(\b(?:import|export|from|as|return|if|else|switch|case|default|break|continue|for|while|do|try|catch|finally|throw|yield|of|in)\b)|(\b(?:var|let|const|function|class|extends|implements|interface|type|enum|namespace|new|delete|typeof|instanceof|void|null|undefined|true|false|this|super|static|abstract|public|private|protected|readonly|async|await|declare|get|set)\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z_$][a-zA-Z0-9_$]*(?=\s*\())/g;
const COLORS_JS: ReadonlyArray<string> = [C_COMMENT, C_STRING, C_STRING, C_STRING, C_FUNC, C_NUMBER, C_KW_PINK, C_KW_BLUE, C_TYPE, C_FUNC];

const RE_HTML = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][a-zA-Z0-9-]*)|(\/?>)|([a-zA-Z-]+=)|("[^"]*")|('[^']*')/g;
const COLORS_HTML: ReadonlyArray<string> = [C_COMMENT, C_TAG, C_TAG, C_ATTR, C_STRING, C_STRING];

const RE_CSS = /(\/\*[\s\S]*?\*\/)|(\/\/.*)|(@\w[\w-]*)|(#[0-9a-fA-F]{3,8}\b)|("[^"]*")|('[^']*')|(\b\d+\.?\d*(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b)|(\$[\w-]+)|([\w-]+(?=\s*:(?!:)))|([.#]?[a-zA-Z][a-zA-Z0-9_-]*)/g;
const COLORS_CSS: ReadonlyArray<string> = [C_COMMENT, C_COMMENT, C_ATRULE, C_STRING, C_STRING, C_STRING, C_NUMBER, C_PROP, C_PROP, C_SELECTOR];

const RE_JSON = /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(\b-?\d+\.?\d*(?:[eE][+-]?\d+)?\b)/g;
const COLORS_JSON: ReadonlyArray<string> = [C_PROP, C_STRING, C_KW_BLUE, C_NUMBER];

const RE_PY = /(#.*)|("""[\s\S]*?""")|('''[\s\S]*?''')|(@\w+)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\b(?:def|class|lambda|return|if|elif|else|for|while|try|except|finally|with|as|import|from|raise|pass|break|continue|yield|and|or|not|in|is)\b)|(\b(?:True|False|None|self|super|print)\b)|(\b\d+\.?\d*(?:[eE][+-]?\d+)?\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z_][a-zA-Z0-9_]*(?=\s*\())/g;
const COLORS_PY: ReadonlyArray<string> = [C_COMMENT, C_COMMENT, C_COMMENT, C_FUNC, C_STRING, C_STRING, C_KW_PINK, C_KW_BLUE, C_NUMBER, C_TYPE, C_FUNC];

const RE_YAML = /(#.*)|(^---)|("[^"]*")|('[^']*')|(\b(?:true|false|null|yes|no)\b)|(\b\d+\.?\d*\b)|(^\s*[\w-]+(?=\s*:))/g;
const COLORS_YAML: ReadonlyArray<string> = [C_COMMENT, C_KW_BLUE, C_STRING, C_STRING, C_KW_BLUE, C_NUMBER, C_PROP];

const RE_SHELL = /(#.*)|(\$\{?[\w]+\}?)|("(?:[^"\\]|\\.)*")|('[^']*')|(\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|echo|export|source|cd|ls|mkdir|rm|cp|mv|grep|sed|awk|cat|chmod|chown)\b)|(\b\d+\b)/g;
const COLORS_SHELL: ReadonlyArray<string> = [C_COMMENT, C_PROP, C_STRING, C_STRING, C_KW_PINK, C_NUMBER];

const RE_MD_INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
const COLORS_MD_INLINE: ReadonlyArray<string> = [C_STRING, C_KW_BLUE, C_PROP];

// ── Per-language tokenizer functions ────────────────────────────────────────

function tokJs(line: string): string {
  return applyStatic(line, RE_JS, COLORS_JS);
}

function tokHtml(line: string): string {
  return applyStatic(line, RE_HTML, COLORS_HTML);
}

function tokCss(line: string): string {
  return applyStatic(line, RE_CSS, COLORS_CSS);
}

function tokJson(line: string): string {
  return applyStatic(line, RE_JSON, COLORS_JSON);
}

function tokPy(line: string): string {
  return applyStatic(line, RE_PY, COLORS_PY);
}

function tokYaml(line: string): string {
  return applyStatic(line, RE_YAML, COLORS_YAML);
}

function tokShell(line: string): string {
  return applyStatic(line, RE_SHELL, COLORS_SHELL);
}

function tokMd(line: string): string {
  if (/^#{1,6}\s/.test(line)) { return span(C_KW_BLUE, line); }
  if (/^(?:```|~~~)/.test(line)) { return span(C_COMMENT, line); }
  return applyStatic(line, RE_MD_INLINE, COLORS_MD_INLINE);
}

// ── Exported function (validated switch, no dynamic property access) ────────

/**
 * Tokenizes a single line for syntax highlighting.
 * Returns escaped HTML string. Caller must handle Angular trust.
 */
export function tokenizeForExt(line: string, ext: string): string {
  switch (ext) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'java':
    case 'cjs':
    case 'mjs':
      return tokJs(line);
    case 'html':
    case 'htm':
    case 'xml':
    case 'svg':
      return tokHtml(line);
    case 'css':
    case 'scss':
    case 'less':
      return tokCss(line);
    case 'json':
      return tokJson(line);
    case 'py':
      return tokPy(line);
    case 'yml':
    case 'yaml':
      return tokYaml(line);
    case 'sh':
    case 'bash':
      return tokShell(line);
    case 'md':
      return tokMd(line);
    default:
      return esc(line);
  }
}
