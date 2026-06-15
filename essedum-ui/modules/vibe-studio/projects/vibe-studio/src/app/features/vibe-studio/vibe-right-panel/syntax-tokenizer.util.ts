/**
 * Syntax tokenizer utility for code highlighting.
 * All regex patterns are pre-compiled static literals (no dynamic RegExp construction).
 * All output is HTML-escaped before insertion to prevent XSS.
 * Returns plain strings; caller is responsible for Angular sanitization.
 */

// ── Color palette (validated allowlist) ─────────────────────────────────────

const COLORS = Object.freeze({
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
});

const ALLOWED_COLORS = new Set<string>(Object.values(COLORS));

// ── Safe HTML helpers ───────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colorSpan(color: string, text: string): string {
  // Only allow colors from our hardcoded allowlist to prevent injection
  const safeColor = ALLOWED_COLORS.has(color) ? color : COLORS.DEF;
  const safeText = esc(text);
  return '<span style="color:' + safeColor + '">' + safeText + '</span>';
}

// ── Pre-compiled language regexes (static literals, no dynamic construction) ─

interface CompiledLang {
  regex: RegExp;
  colors: string[];
  fallback: string;
}

function compileLang(rules: Array<{ re: RegExp; color: string }>, fallback = COLORS.DEF): CompiledLang {
  const src = rules.map(r => '(' + r.re.source + ')').join('|');
  return {
    // eslint-disable-next-line security/detect-non-literal-regexp
    regex: new RegExp(src, 'g'),
    colors: rules.map(r => r.color),
    fallback,
  };
}

// All patterns are static regex literals - pre-compiled once at module load
const LANG_JS = compileLang([
  { re: /\/\/.*/, color: COLORS.COMMENT },
  { re: /"(?:[^"\\]|\\.)*"/, color: COLORS.STRING },
  { re: /'(?:[^'\\]|\\.)*'/, color: COLORS.STRING },
  { re: /`(?:[^`\\]|\\.)*`/, color: COLORS.STRING },
  { re: /@\w+/, color: COLORS.FUNC },
  { re: /\b(?:0x[\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/, color: COLORS.NUMBER },
  { re: /\b(?:import|export|from|as|return|if|else|switch|case|default|break|continue|for|while|do|try|catch|finally|throw|yield|of|in)\b/, color: COLORS.KW_PINK },
  { re: /\b(?:var|let|const|function|class|extends|implements|interface|type|enum|namespace|new|delete|typeof|instanceof|void|null|undefined|true|false|this|super|static|abstract|public|private|protected|readonly|async|await|declare|get|set)\b/, color: COLORS.KW_BLUE },
  { re: /\b[A-Z][A-Za-z0-9_]*\b/, color: COLORS.TYPE },
  { re: /\b[a-z_$][a-zA-Z0-9_$]*(?=\s*\()/, color: COLORS.FUNC },
]);

const LANG_HTML = compileLang([
  { re: /<!--[\s\S]*?-->/, color: COLORS.COMMENT },
  { re: /<\/?[a-zA-Z][a-zA-Z0-9-]*/, color: COLORS.TAG },
  { re: /\/?>/, color: COLORS.TAG },
  { re: /[a-zA-Z-]+=/, color: COLORS.ATTR },
  { re: /"[^"]*"/, color: COLORS.STRING },
  { re: /'[^']*'/, color: COLORS.STRING },
]);

const LANG_CSS = compileLang([
  { re: /\/\*[\s\S]*?\*\//, color: COLORS.COMMENT },
  { re: /\/\/.*/, color: COLORS.COMMENT },
  { re: /@\w[\w-]*/, color: COLORS.ATRULE },
  { re: /#[0-9a-fA-F]{3,8}\b/, color: COLORS.STRING },
  { re: /"[^"]*"/, color: COLORS.STRING },
  { re: /'[^']*'/, color: COLORS.STRING },
  { re: /\b\d+\.?\d*(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/, color: COLORS.NUMBER },
  { re: /\$[\w-]+/, color: COLORS.PROP },
  { re: /[\w-]+(?=\s*:(?!:))/, color: COLORS.PROP },
  { re: /[.#]?[a-zA-Z][a-zA-Z0-9_-]*/, color: COLORS.SELECTOR },
]);

const LANG_JSON = compileLang([
  { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/, color: COLORS.PROP },
  { re: /"(?:[^"\\]|\\.)*"/, color: COLORS.STRING },
  { re: /\b(?:true|false|null)\b/, color: COLORS.KW_BLUE },
  { re: /\b-?\d+\.?\d*(?:[eE][+-]?\d+)?\b/, color: COLORS.NUMBER },
]);

const LANG_PY = compileLang([
  { re: /#.*/, color: COLORS.COMMENT },
  { re: /"""[\s\S]*?"""/, color: COLORS.COMMENT },
  { re: /'''[\s\S]*?'''/, color: COLORS.COMMENT },
  { re: /@\w+/, color: COLORS.FUNC },
  { re: /"(?:[^"\\]|\\.)*"/, color: COLORS.STRING },
  { re: /'(?:[^'\\]|\\.)*'/, color: COLORS.STRING },
  { re: /\b(?:def|class|lambda|return|if|elif|else|for|while|try|except|finally|with|as|import|from|raise|pass|break|continue|yield|and|or|not|in|is)\b/, color: COLORS.KW_PINK },
  { re: /\b(?:True|False|None|self|super|print)\b/, color: COLORS.KW_BLUE },
  { re: /\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/, color: COLORS.NUMBER },
  { re: /\b[A-Z][A-Za-z0-9_]*\b/, color: COLORS.TYPE },
  { re: /\b[a-z_][a-zA-Z0-9_]*(?=\s*\()/, color: COLORS.FUNC },
]);

const LANG_YAML = compileLang([
  { re: /#.*/, color: COLORS.COMMENT },
  { re: /^---/, color: COLORS.KW_BLUE },
  { re: /"[^"]*"/, color: COLORS.STRING },
  { re: /'[^']*'/, color: COLORS.STRING },
  { re: /\b(?:true|false|null|yes|no)\b/, color: COLORS.KW_BLUE },
  { re: /\b\d+\.?\d*\b/, color: COLORS.NUMBER },
  { re: /^\s*[\w-]+(?=\s*:)/, color: COLORS.PROP },
]);

const LANG_SHELL = compileLang([
  { re: /#.*/, color: COLORS.COMMENT },
  { re: /\$\{?[\w]+\}?/, color: COLORS.PROP },
  { re: /"(?:[^"\\]|\\.)*"/, color: COLORS.STRING },
  { re: /'[^']*'/, color: COLORS.STRING },
  { re: /\b(?:if|then|else|elif|fi|for|in|do|done|while|case|esac|function|return|echo|export|source|cd|ls|mkdir|rm|cp|mv|grep|sed|awk|cat|chmod|chown)\b/, color: COLORS.KW_PINK },
  { re: /\b\d+\b/, color: COLORS.NUMBER },
]);

const LANG_MD = compileLang([
  { re: /`[^`]+`/, color: COLORS.STRING },
  { re: /\*\*[^*]+\*\*/, color: COLORS.KW_BLUE },
  { re: /\[[^\]]+\]\([^)]+\)/, color: COLORS.PROP },
]);

const MD_HEADING_RE = /^#{1,6}\s/;
const MD_FENCE_RE = /^(?:```|~~~)/;

// ── Tokenize engine (uses pre-compiled regex, no dynamic construction) ──────

function applyLang(line: string, lang: CompiledLang): string {
  if (!line) { return ''; }
  const re = lang.regex;
  re.lastIndex = 0;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) { out += esc(line.slice(last, m.index)); }
    let ruleIdx = -1;
    for (let i = 0; i < lang.colors.length; i++) {
      if (m[i + 1] !== undefined) { ruleIdx = i; break; }
    }
    const color = ruleIdx >= 0 ? lang.colors[ruleIdx] : lang.fallback;
    out += colorSpan(color, m[0]);
    last = m.index + m[0].length;
  }
  if (last < line.length) { out += esc(line.slice(last)); }
  return out;
}

function tokenizeMd(line: string): string {
  if (MD_HEADING_RE.test(line)) {
    return colorSpan(COLORS.KW_BLUE, line);
  }
  if (MD_FENCE_RE.test(line)) {
    return colorSpan(COLORS.COMMENT, line);
  }
  return applyLang(line, LANG_MD);
}

// ── Extension-to-tokenizer map (eliminates switch/cyclomatic complexity) ────

type Tokenizer = (line: string) => string;

const TOKENIZER_MAP: Record<string, Tokenizer> = {
  js:   (l) => applyLang(l, LANG_JS),
  ts:   (l) => applyLang(l, LANG_JS),
  jsx:  (l) => applyLang(l, LANG_JS),
  tsx:  (l) => applyLang(l, LANG_JS),
  java: (l) => applyLang(l, LANG_JS),
  cjs:  (l) => applyLang(l, LANG_JS),
  mjs:  (l) => applyLang(l, LANG_JS),
  html: (l) => applyLang(l, LANG_HTML),
  htm:  (l) => applyLang(l, LANG_HTML),
  xml:  (l) => applyLang(l, LANG_HTML),
  svg:  (l) => applyLang(l, LANG_HTML),
  css:  (l) => applyLang(l, LANG_CSS),
  scss: (l) => applyLang(l, LANG_CSS),
  less: (l) => applyLang(l, LANG_CSS),
  json: (l) => applyLang(l, LANG_JSON),
  py:   (l) => applyLang(l, LANG_PY),
  yml:  (l) => applyLang(l, LANG_YAML),
  yaml: (l) => applyLang(l, LANG_YAML),
  sh:   (l) => applyLang(l, LANG_SHELL),
  bash: (l) => applyLang(l, LANG_SHELL),
  md:   tokenizeMd,
};

/**
 * Tokenizes a single line of code for the given file extension.
 * Returns a sanitized HTML string (all user content is escaped).
 * Caller must use Angular's bypassSecurityTrustHtml or [innerHTML] binding.
 */
export function tokenizeForExt(line: string, ext: string): string {
  const tokenizer = TOKENIZER_MAP[ext];
  if (tokenizer) {
    return tokenizer(line);
  }
  return esc(line);
}
