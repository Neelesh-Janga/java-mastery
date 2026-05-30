import Editor from '@monaco-editor/react'

interface Props {
  value: string
  onChange: (value: string | undefined) => void
  onRun?: () => void
  readOnly?: boolean
}

const LoadingPlaceholder = (
  <div style={{
    height: '100%', background: '#0d1117',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'monospace', color: '#484f58', fontSize: '13px',
  }}>
    <span style={{ marginRight: 8, display: 'inline-block', width: 14, height: 14,
      border: '2px solid #f97316', borderTopColor: 'transparent',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    Initialising editor…
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export function CodeEditor({ value, onChange, onRun, readOnly = false }: Props) {
  return (
    <Editor
      height="100%"
      defaultLanguage="java"
      value={value}
      onChange={onChange}
      theme="vs-dark"
      loading={LoadingPlaceholder}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'gutter',
        readOnly,
        padding: { top: 16, bottom: 16 },
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        parameterHints: { enabled: true },
        formatOnPaste: true,
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true },
      }}
      onMount={(editor, monaco) => {
        // Cmd+Enter / Ctrl+Enter to run
        if (onRun) {
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            onRun
          )
        }
        // Set dark background
        monaco.editor.defineTheme('java-mastery-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword', foreground: 'f97316', fontStyle: 'bold' },
            { token: 'string', foreground: '86efac' },
            { token: 'number', foreground: '60a5fa' },
            { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
            { token: 'type', foreground: 'fb923c' },
            { token: 'annotation', foreground: 'a78bfa' },
          ],
          colors: {
            'editor.background': '#0d1117',
            'editor.lineHighlightBackground': '#161b22',
            'editorLineNumber.foreground': '#484f58',
            'editorLineNumber.activeForeground': '#f97316',
            'editor.selectionBackground': '#264f7855',
            'editorCursor.foreground': '#f97316',
          }
        })
        monaco.editor.setTheme('java-mastery-dark')
      }}
    />
  )
}
