import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { useAppConfig } from '@/provider/ConfigProvider'
import './code-editor.scss'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  minHeight?: string
  compact?: boolean
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = '22rem',
  compact = false,
}: CodeEditorProps) {
  const { theme } = useAppConfig()

  const extensions = useMemo(() => [javascript(), EditorView.lineWrapping], [])

  return (
    <div
      className="app-code-editor"
      data-compact={compact}
      data-readonly={readOnly}
      style={{ '--editor-min-height': minHeight } as CSSProperties}
    >
      <CodeMirror
        value={value}
        theme={theme === 'dark' ? oneDark : undefined}
        extensions={extensions}
        editable={!readOnly}
        readOnly={readOnly}
        onChange={onChange}
        basicSetup={{
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          autocompletion: true,
          bracketMatching: true,
        }}
      />
    </div>
  )
}
