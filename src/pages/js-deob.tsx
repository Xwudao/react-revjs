import type { Options } from '@revjs/js-deob'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { AppCheckbox } from '@/components/ui/app-checkbox'
import { AppSelect, type AppSelectOption } from '@/components/ui/app-select'
import { CodeEditor } from '@/components/ui/code-editor'
import { FrontShell } from '@/components/front-shell'
import JsDeobWorker from './js-deob.worker?worker'
import './js-deob.scss'

type EditableOptions = Required<Omit<Options, 'sandbox'>>

interface ConsoleEntry {
  id: number
  message: string
  timestamp: number
}

type WorkerMessage =
  | { type: 'log'; message: string; timestamp: number }
  | { type: 'result'; code: string; parseTime: number }
  | { type: 'error'; message: string; timestamp?: number }

const maxLogs = 200

const storageKeys = {
  code: 'revjs:js-deob:code',
  options: 'revjs:js-deob:options',
} as const

const defaultOptions: EditableOptions = {
  decoderLocationMethod: 'stringArray',
  decoderStringArrayLength: 0,
  decoderCallCount: 150,
  setupCode: '',
  decoderNames: '',
  isMarkEnable: true,
  keywords: ['debugger'],
  mangleMode: 'off',
  manglePattern: '',
  mangleFlags: '',
}

const decoderMethodOptions: AppSelectOption<EditableOptions['decoderLocationMethod']>[] =
  [
    {
      value: 'stringArray',
      label: '字符串数组长度',
      description: '适合大多数常见样本，优先按字符串数组定位。',
    },
    {
      value: 'callCount',
      label: '解密函数调用次数',
      description: '适合已知调用规模的样本，按调用次数定位。',
    },
    {
      value: 'evalCode',
      label: '注入自定义代码',
      description: '需要手动补环境或补函数时使用。',
    },
  ]

const mangleModeOptions: AppSelectOption<EditableOptions['mangleMode']>[] = [
  { value: 'off', label: '关闭', description: '保留原始变量名。' },
  { value: 'hex', label: 'Hex (_0x)', description: '优先优化典型十六进制风格变量名。' },
  { value: 'short', label: '短变量名', description: '优化较短的临时变量名。' },
  { value: 'all', label: '全部变量', description: '尽量统一优化变量名。' },
  {
    value: 'custom',
    label: '自定义正则',
    description: '按自定义正则匹配需要优化的变量。',
  },
]

function readStoredCode() {
  if (typeof window === 'undefined') return ''

  return window.localStorage.getItem(storageKeys.code) ?? ''
}

function readStoredOptions(): EditableOptions {
  if (typeof window === 'undefined') return defaultOptions

  const raw = window.localStorage.getItem(storageKeys.options)

  if (!raw) return defaultOptions

  try {
    const parsed = JSON.parse(raw) as Partial<EditableOptions> & { mangle?: boolean }
    const merged = {
      ...defaultOptions,
      ...parsed,
    }

    if (!merged.mangleMode && typeof parsed.mangle === 'boolean') {
      merged.mangleMode = parsed.mangle ? 'all' : 'off'
    }

    merged.keywords = Array.isArray(merged.keywords)
      ? merged.keywords.filter(Boolean)
      : defaultOptions.keywords

    return merged
  } catch {
    return defaultOptions
  }
}

function formatKeywords(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatLogTime(timestamp: number) {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')

  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

function JsDeobPage() {
  const workerRef = useRef<Worker | null>(null)
  const spawnWorkerRef = useRef<() => void>(() => {})
  const consoleBodyRef = useRef<HTMLDivElement | null>(null)
  const [sourceCode, setSourceCode] = useState(readStoredCode)
  const [outputCode, setOutputCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [parseTime, setParseTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')
  const [logs, setLogs] = useState<ConsoleEntry[]>([])
  const [options, setOptions] = useState<EditableOptions>(readStoredOptions)
  const optionsRef = useRef(options)

  const keywordsValue = useMemo(() => options.keywords.join(', '), [options.keywords])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  function pushLog(message: string, timestamp = Date.now()) {
    setLogs((current) => [
      ...current.slice(-(maxLogs - 1)),
      {
        id: timestamp + Math.random(),
        message,
        timestamp,
      },
    ])
  }

  function handleWorkerError(message: string, timestamp = Date.now()) {
    pushLog(message, timestamp)
    setErrorMessage(message)
    setIsRunning(false)
  }

  spawnWorkerRef.current = () => {
    workerRef.current?.terminate()

    const worker = new JsDeobWorker({ type: 'module' })
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data

      if (message.type === 'log') {
        pushLog(message.message, message.timestamp)
        return
      }

      if (message.type === 'result') {
        pushLog(
          `处理完成，用时 ${message.parseTime} ms | 方式: ${optionsRef.current.decoderLocationMethod}`,
        )
        startTransition(() => {
          setOutputCode(message.code)
          setParseTime(message.parseTime)
          setErrorMessage('')
          setIsRunning(false)
        })
        return
      }

      handleWorkerError(message.message, message.timestamp)
    }

    worker.onerror = () => {
      handleWorkerError('执行失败，请稍后重试或检查输入代码。')
    }
  }

  useEffect(() => {
    spawnWorkerRef.current()

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.code, sourceCode)
  }, [sourceCode])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.options, JSON.stringify(options))
  }, [options])

  useEffect(() => {
    if (copyState === 'idle') return

    const timer = window.setTimeout(() => setCopyState('idle'), 1800)
    return () => window.clearTimeout(timer)
  }, [copyState])

  useEffect(() => {
    const container = consoleBodyRef.current

    if (!container) return

    container.scrollTo({ top: container.scrollHeight })
  }, [logs])

  function updateOptions(patch: Partial<EditableOptions>) {
    setOptions((current) => ({
      ...current,
      ...patch,
    }))
  }

  function runDeobfuscation() {
    const trimmedCode = sourceCode.trim()

    if (!trimmedCode) {
      setErrorMessage('请先输入要处理的 JS 代码。')
      setOutputCode('')
      setParseTime(null)
      return
    }

    setIsRunning(true)
    setErrorMessage('')
    setParseTime(null)
    setLogs([])

    pushLog(
      [
        `开始处理 | 方式: ${options.decoderLocationMethod}`,
        options.decoderLocationMethod === 'stringArray' &&
        options.decoderStringArrayLength > 0
          ? `字符串数组长度: ${options.decoderStringArrayLength}`
          : '',
      ]
        .filter(Boolean)
        .join(' | '),
    )

    if (!workerRef.current) {
      spawnWorkerRef.current()
    }

    workerRef.current?.postMessage({
      code: trimmedCode,
      options: JSON.parse(JSON.stringify(options)) as EditableOptions,
    })
  }

  function cancelDeobfuscation() {
    if (!isRunning) return

    spawnWorkerRef.current()
    setIsRunning(false)
    setErrorMessage('已停止当前任务。')
    pushLog('已停止当前任务。')
  }

  async function copyOutput() {
    if (!outputCode) return

    try {
      await navigator.clipboard.writeText(outputCode)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  function resetAll() {
    setSourceCode('')
    setOutputCode('')
    setErrorMessage('')
    setParseTime(null)
    setLogs([])
    setOptions(defaultOptions)
    window.localStorage.removeItem(storageKeys.code)
    window.localStorage.removeItem(storageKeys.options)
  }

  function clearLogs() {
    setLogs([])
  }

  return (
    <FrontShell current="js-deob">
      <main className="js-deob-page">
        <div className="js-deob-shell">
          <section className="js-deob-panel js-deob-hero">
            <div className="js-deob-hero__main">
              <span className="js-deob-kicker">
                <span className="i-mdi-code-json text-[15px]" aria-hidden="true" />
                在线解混淆
              </span>

              <div className="js-deob-title-row">
                <h1 className="js-deob-title">JS Deob</h1>
                <span className="js-deob-status-badge" data-running={isRunning}>
                  <span
                    className={
                      isRunning
                        ? 'i-mdi-loading animate-spin'
                        : 'i-mdi-check-circle-outline'
                    }
                    aria-hidden="true"
                  />
                  {isRunning ? '处理中' : '已就绪'}
                </span>
              </div>

              <p className="js-deob-copy">
                直接粘贴待处理的
                JavaScript，调整识别方式后运行，即可查看整理后的结果和日志。
              </p>

              <div className="js-deob-highlights">
                <span>适合常见字符串数组场景</span>
                <span>支持自定义注入代码</span>
                <span>输出与日志分区查看</span>
              </div>
            </div>

            <div className="js-deob-actions">
              <button
                type="button"
                className="js-deob-button js-deob-button--primary"
                onClick={runDeobfuscation}
                disabled={isRunning}
              >
                <span
                  className={
                    isRunning ? 'i-mdi-loading animate-spin' : 'i-mdi-play-circle-outline'
                  }
                  aria-hidden="true"
                />
                {isRunning ? '处理中...' : '开始处理'}
              </button>
              <button
                type="button"
                className="js-deob-button"
                onClick={copyOutput}
                disabled={!outputCode}
              >
                <span className="i-mdi-content-copy" aria-hidden="true" />
                {copyState === 'done'
                  ? '已复制结果'
                  : copyState === 'failed'
                    ? '复制失败'
                    : '复制输出'}
              </button>
              <button
                type="button"
                className="js-deob-button"
                onClick={cancelDeobfuscation}
                disabled={!isRunning}
              >
                <span className="i-mdi-stop-circle-outline" aria-hidden="true" />
                停止
              </button>
              <button type="button" className="js-deob-button" onClick={resetAll}>
                <span className="i-mdi-refresh" aria-hidden="true" />
                清空重来
              </button>
            </div>
          </section>

          <section className="js-deob-grid">
            <aside className="js-deob-sidebar">
              <div className="js-deob-panel js-deob-section">
                <div className="js-deob-section-head">
                  <h2 className="js-deob-section-title">处理选项</h2>
                  <p className="js-deob-section-copy">
                    保留最常用的选项，避免一开始就看到过多解释。
                  </p>
                </div>

                <div className="js-deob-form">
                  <div className="js-deob-field">
                    <span className="js-deob-field-label">识别方式</span>
                    <AppSelect
                      value={options.decoderLocationMethod}
                      options={decoderMethodOptions}
                      ariaLabel="选择识别方式"
                      onChange={(value) =>
                        updateOptions({ decoderLocationMethod: value })
                      }
                    />
                  </div>

                  {options.decoderLocationMethod === 'callCount' && (
                    <div className="js-deob-field">
                      <label className="js-deob-field-label" htmlFor="decoder-call-count">
                        调用次数
                      </label>
                      <input
                        id="decoder-call-count"
                        className="js-deob-input"
                        type="number"
                        min="1"
                        step="1"
                        value={options.decoderCallCount}
                        onChange={(event) =>
                          updateOptions({
                            decoderCallCount:
                              Number(event.target.value) ||
                              defaultOptions.decoderCallCount,
                          })
                        }
                      />
                    </div>
                  )}

                  {options.decoderLocationMethod === 'stringArray' && (
                    <div className="js-deob-field">
                      <label
                        className="js-deob-field-label"
                        htmlFor="decoder-string-array-length"
                      >
                        字符串数组长度
                      </label>
                      <input
                        id="decoder-string-array-length"
                        className="js-deob-input"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          options.decoderStringArrayLength > 0
                            ? options.decoderStringArrayLength
                            : ''
                        }
                        placeholder="留空或 0 表示自动匹配"
                        onChange={(event) => {
                          const value = Number(event.target.value)

                          updateOptions({
                            decoderStringArrayLength:
                              Number.isFinite(value) && value > 0 ? value : 0,
                          })
                        }}
                      />
                      <span className="js-deob-field-hint">
                        已知长度时填写会更快命中目标。
                      </span>
                    </div>
                  )}

                  {options.decoderLocationMethod === 'evalCode' && (
                    <>
                      <div className="js-deob-field">
                        <label className="js-deob-field-label" htmlFor="decoder-names">
                          解密函数名
                        </label>
                        <input
                          id="decoder-names"
                          className="js-deob-input"
                          type="text"
                          value={
                            typeof options.decoderNames === 'string'
                              ? options.decoderNames
                              : options.decoderNames.join(', ')
                          }
                          placeholder="例如: _0xabc123"
                          onChange={(event) =>
                            updateOptions({ decoderNames: event.target.value })
                          }
                        />
                      </div>
                      <div className="js-deob-field">
                        <span className="js-deob-field-label">注入代码</span>
                        <CodeEditor
                          compact
                          minHeight="11rem"
                          value={options.setupCode}
                          onChange={(value) => updateOptions({ setupCode: value })}
                        />
                      </div>
                    </>
                  )}

                  <AppCheckbox
                    checked={options.isMarkEnable}
                    label="标记常见关键字"
                    description="帮助快速查看 debugger、签名或环境检测相关片段。"
                    onChange={(checked) => updateOptions({ isMarkEnable: checked })}
                  />

                  {options.isMarkEnable && (
                    <div className="js-deob-field">
                      <label className="js-deob-field-label" htmlFor="keywords">
                        关键字列表
                      </label>
                      <input
                        id="keywords"
                        className="js-deob-input"
                        type="text"
                        value={keywordsValue}
                        placeholder="debugger, sign, token"
                        onChange={(event) =>
                          updateOptions({ keywords: formatKeywords(event.target.value) })
                        }
                      />
                    </div>
                  )}

                  <div className="js-deob-field">
                    <span className="js-deob-field-label">变量名优化</span>
                    <AppSelect
                      value={options.mangleMode}
                      options={mangleModeOptions}
                      ariaLabel="选择变量名优化方式"
                      onChange={(value) => updateOptions({ mangleMode: value })}
                    />
                  </div>

                  {options.mangleMode === 'custom' && (
                    <>
                      <div className="js-deob-field">
                        <label className="js-deob-field-label" htmlFor="mangle-pattern">
                          匹配正则
                        </label>
                        <input
                          id="mangle-pattern"
                          className="js-deob-input"
                          type="text"
                          value={options.manglePattern}
                          placeholder="例如: _0x[a-f\\d]+"
                          onChange={(event) =>
                            updateOptions({ manglePattern: event.target.value })
                          }
                        />
                      </div>
                      <div className="js-deob-field">
                        <label className="js-deob-field-label" htmlFor="mangle-flags">
                          Flags
                        </label>
                        <input
                          id="mangle-flags"
                          className="js-deob-input"
                          type="text"
                          value={options.mangleFlags}
                          placeholder="例如: gim"
                          onChange={(event) =>
                            updateOptions({ mangleFlags: event.target.value })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="js-deob-panel js-deob-section js-deob-tips">
                <div className="js-deob-section-head">
                  <h2 className="js-deob-section-title">使用建议</h2>
                  <p className="js-deob-section-copy">不确定怎么选时，可以从这里开始。</p>
                </div>
                <ul className="js-deob-side-notes">
                  <li>先试字符串数组长度模式，命中率通常更高。</li>
                  <li>已知解密调用规模时，再切到调用次数模式。</li>
                  <li>遇到缺环境或缺函数时，再使用注入自定义代码。</li>
                </ul>
              </div>
            </aside>

            <section className="js-deob-workbench">
              <div className="js-deob-editors-grid">
                <div className="js-deob-panel js-deob-section">
                  <div className="js-deob-editor-head">
                    <div>
                      <h2 className="js-deob-section-title">原始代码</h2>
                      <p>把需要处理的 JavaScript 直接贴进来。</p>
                    </div>
                  </div>

                  <CodeEditor value={sourceCode} onChange={setSourceCode} />
                </div>

                <div className="js-deob-panel js-deob-section">
                  <div className="js-deob-editor-head">
                    <div>
                      <h2 className="js-deob-section-title">处理结果</h2>
                      <p>执行完成后会在这里显示整理后的输出。</p>
                    </div>
                  </div>

                  {errorMessage ? (
                    <div className="js-deob-error">{errorMessage}</div>
                  ) : (
                    <div className="js-deob-note">
                      {parseTime === null
                        ? '还没有结果，点击“开始处理”后会在这里更新。'
                        : `最近一次处理耗时 ${parseTime} ms。`}
                    </div>
                  )}

                  <CodeEditor readOnly value={outputCode} />
                </div>
              </div>

              <div className="js-deob-panel js-deob-section">
                <div className="js-deob-editor-head">
                  <div>
                    <h2 className="js-deob-section-title">运行日志</h2>
                    <p>处理过程中的提示和错误会按时间顺序显示在这里。</p>
                  </div>
                  <button
                    type="button"
                    className="js-deob-inline-action"
                    onClick={clearLogs}
                    disabled={!logs.length}
                  >
                    <span className="i-mdi-delete-outline" aria-hidden="true" />
                    清空日志
                  </button>
                </div>

                <div className="js-deob-console" ref={consoleBodyRef}>
                  {logs.length ? (
                    logs.map((entry) => (
                      <article key={entry.id} className="js-deob-console-entry">
                        <time className="js-deob-console-time">
                          {formatLogTime(entry.timestamp)}
                        </time>
                        <pre className="js-deob-console-message">{entry.message}</pre>
                      </article>
                    ))
                  ) : (
                    <div className="js-deob-console-empty">
                      开始处理后，这里会实时出现日志。
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
    </FrontShell>
  )
}

export default JsDeobPage
