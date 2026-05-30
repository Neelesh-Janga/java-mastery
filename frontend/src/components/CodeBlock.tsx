/**
 * Instant read-only code display — no Monaco, no loading delay.
 * Applies lightweight Java syntax coloring via regex.
 */

interface Props {
  code: string
}

const KEYWORDS = new Set([
  'abstract','assert','boolean','break','byte','case','catch','char','class',
  'const','continue','default','do','double','else','enum','extends','final',
  'finally','float','for','goto','if','implements','import','instanceof','int',
  'interface','long','native','new','package','private','protected','public',
  'return','short','static','strictfp','super','switch','synchronized','this',
  'throw','throws','transient','try','var','void','volatile','while',
  'true','false','null','record','sealed','permits','yield',
])

type Token = { kind: 'keyword'|'string'|'number'|'comment'|'annotation'|'type'|'plain'; text: string }

function tokenise(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Single-line comment
    if (line[i] === '/' && line[i+1] === '/') {
      tokens.push({ kind: 'comment', text: line.slice(i) })
      break
    }
    // String literal (simplified, handles escaped quotes)
    if (line[i] === '"') {
      let j = i + 1
      while (j < line.length && !(line[j] === '"' && line[j-1] !== '\\')) j++
      tokens.push({ kind: 'string', text: line.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Char literal
    if (line[i] === "'") {
      let j = i + 1
      while (j < line.length && !(line[j] === "'" && line[j-1] !== '\\')) j++
      tokens.push({ kind: 'string', text: line.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Annotation
    if (line[i] === '@') {
      let j = i + 1
      while (j < line.length && /\w/.test(line[j])) j++
      tokens.push({ kind: 'annotation', text: line.slice(i, j) })
      i = j
      continue
    }
    // Number
    if (/[0-9]/.test(line[i]) && (i === 0 || /\W/.test(line[i-1]))) {
      let j = i
      while (j < line.length && /[0-9._xXbBlLfFdD]/.test(line[j])) j++
      tokens.push({ kind: 'number', text: line.slice(i, j) })
      i = j
      continue
    }
    // Word — check for keyword or type (UpperCamelCase)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i
      while (j < line.length && /\w/.test(line[j])) j++
      const word = line.slice(i, j)
      if (KEYWORDS.has(word)) {
        tokens.push({ kind: 'keyword', text: word })
      } else if (/^[A-Z]/.test(word)) {
        tokens.push({ kind: 'type', text: word })
      } else {
        tokens.push({ kind: 'plain', text: word })
      }
      i = j
      continue
    }
    // Plain character
    const last = tokens[tokens.length - 1]
    if (last?.kind === 'plain') {
      last.text += line[i]
    } else {
      tokens.push({ kind: 'plain', text: line[i] })
    }
    i++
  }
  return tokens
}

const COLOR: Record<Token['kind'], string> = {
  keyword:    '#f97316',  // orange
  string:     '#86efac',  // green
  number:     '#60a5fa',  // blue
  comment:    '#6b7280',  // gray italic
  annotation: '#a78bfa',  // purple
  type:       '#fb923c',  // light orange
  plain:      '#e6edf3',  // near-white
}

export function CodeBlock({ code }: Props) {
  const lines = code.split('\n')
  // Detect block comments spanning lines
  let inBlock = false

  return (
    <pre
      style={{
        background: '#0d1117',
        margin: 0,
        padding: '16px',
        overflowX: 'auto',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '13px',
        lineHeight: '1.6',
        borderRadius: '0',
      }}
    >
      {lines.map((line, li) => {
        // Block comment detection
        if (inBlock) {
          const ends = line.includes('*/')
          if (ends) inBlock = false
          return (
            <div key={li}>
              <span style={{ color: COLOR.comment }}>{line}</span>
              {'\n'}
            </div>
          )
        }
        if (line.trimStart().startsWith('/*') || line.trimStart().startsWith('/**')) {
          if (!line.includes('*/')) inBlock = true
          return (
            <div key={li}>
              <span style={{ color: COLOR.comment }}>{line}</span>
              {'\n'}
            </div>
          )
        }

        const tokens = tokenise(line)
        return (
          <div key={li}>
            {tokens.map((tok, ti) => (
              <span
                key={ti}
                style={{
                  color: COLOR[tok.kind],
                  fontStyle: tok.kind === 'comment' ? 'italic' : undefined,
                  fontWeight: tok.kind === 'keyword' ? 600 : undefined,
                }}
              >
                {tok.text}
              </span>
            ))}
            {'\n'}
          </div>
        )
      })}
    </pre>
  )
}
