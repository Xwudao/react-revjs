import type { Options } from '@revjs/js-deob'
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FrontShell } from '@/components/front-shell'
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

const workerUrl = new URL('./js-deob.worker.ts', import.meta.url)
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
  const consoleBodyRef = useRef<HTMLDivElement | null>(null)
  const [sourceCode, setSourceCode] = useState(readStoredCode)
  const [outputCode, setOutputCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [parseTime, setParseTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')
  const [logs, setLogs] = useState<ConsoleEntry[]>([])
  const [options, setOptions] = useState<EditableOptions>(readStoredOptions)

  const keywordsValue = useMemo(() => options.keywords.join(', '), [options.keywords])

  const pushLog = useEffectEvent((message: string, timestamp = Date.now()) => {
    setLogs((current) => [
      ...current.slice(-(maxLogs - 1)),
      {
        id: timestamp + Math.random(),
        message,
        timestamp,
      },
    ])
  })

  const handleWorkerError = useEffectEvent((message: string, timestamp = Date.now()) => {
    pushLog(message, timestamp)
    setErrorMessage(message)
    setIsRunning(false)
  })

  const handleWorkerMessage = useEffectEvent((event: MessageEvent<WorkerMessage>) => {
    const message = event.data

    if (message.type === 'log') {
      pushLog(message.message, message.timestamp)
      return
    }

    if (message.type === 'result') {
      pushLog(
        `反混淆完成，用时 ${message.parseTime} ms | 定位方式: ${options.decoderLocationMethod}`,
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
  })

  const spawnWorker = useEffectEvent(() => {
    workerRef.current?.terminate()

    const worker = new Worker(workerUrl, { type: 'module' })
    workerRef.current = worker
    worker.onmessage = handleWorkerMessage
    worker.onerror = () => {
      handleWorkerError('浏览器 worker 执行失败，请查看控制台。')
    }
  })

  useEffect(() => {
    spawnWorker()

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [spawnWorker])

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
        `开始反混淆 | 定位方式: ${options.decoderLocationMethod}`,
        options.decoderLocationMethod === 'stringArray' &&
        options.decoderStringArrayLength > 0
          ? `字符串数组长度: ${options.decoderStringArrayLength}`
          : '',
      ]
        .filter(Boolean)
        .join(' | '),
    )

    if (!workerRef.current) {
      spawnWorker()
    }

    workerRef.current?.postMessage({
      code: trimmedCode,
      options: JSON.parse(JSON.stringify(options)) as EditableOptions,
    })
  }

  function cancelDeobfuscation() {
    if (!isRunning) return

    spawnWorker()
    setIsRunning(false)
    setErrorMessage('已终止当前运行。')
    pushLog('已终止当前运行。')
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
          <section className="js-deob-panel js-deob-overview">
            <div className="js-deob-overview__main">
              <span className="js-deob-kicker">
                <span className="i-mdi-console text-[15px]" aria-hidden="true" />
                js deob workbench
              </span>

              <div className="js-deob-title-row">
                <h1 className="js-deob-title">JS Deob 工作台</h1>
                <span className="js-deob-status-badge" data-running={isRunning}>
                  <span
                    className={
                      isRunning
                        ? 'i-mdi-loading animate-spin'
                        : 'i-mdi-check-circle-outline'
                    }
                    aria-hidden="true"
                  />
                  {isRunning ? 'Worker running' : 'Worker ready'}
                </span>
              </div>

              <p className="js-deob-copy">
                浏览器端直接执行仓库里的 deob
                核心，适合快速贴代码、调参数、看日志和比对输出。
              </p>
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
                {isRunning ? '处理中...' : '运行反混淆'}
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
                终止运行
              </button>
              <button type="button" className="js-deob-button" onClick={resetAll}>
                <span className="i-mdi-refresh" aria-hidden="true" />
                重置工作台
              </button>
            </div>
          </section>

          <section className="js-deob-summary">
            <article className="js-deob-panel js-deob-summary-card">
              <strong>Last Run</strong>
              <span>{parseTime === null ? '尚未执行' : `最近一次 ${parseTime} ms`}</span>
              <code>{options.decoderLocationMethod}</code>
            </article>
            <article className="js-deob-panel js-deob-summary-card">
              <strong>Runtime</strong>
              <span>使用 browser worker 执行，尽量避免阻塞主线程。</span>
              <code>@revjs/js-deob</code>
            </article>
            <article className="js-deob-panel js-deob-summary-card">
              <strong>Storage</strong>
              <span>输入代码和选项保存在本地，刷新页面仍可继续调试。</span>
              <code>localStorage</code>
            </article>
          </section>

          <section className="js-deob-grid">
            <aside className="js-deob-sidebar">
              <div className="js-deob-panel js-deob-section">
                <h2 className="js-deob-section-title">运行选项</h2>
                <p className="js-deob-section-copy">
                  优先保留最常用的定位、标记和变量名优化能力，避免配置区过度膨胀。
                </p>

                <div className="js-deob-form">
                  <div className="js-deob-field">
                    <label htmlFor="decoder-method">解密器定位方式</label>
                    <select
                      id="decoder-method"
                      className="js-deob-select"
                      value={options.decoderLocationMethod}
                      onChange={(event) =>
                        updateOptions({
                          decoderLocationMethod: event.target
                            .value as EditableOptions['decoderLocationMethod'],
                        })
                      }
                    >
                      <option value="stringArray">字符串数组长度</option>
                      <option value="callCount">解密函数调用次数</option>
                      <option value="evalCode">注入自定义解密代码</option>
                    </select>
                  </div>

                  {options.decoderLocationMethod === 'callCount' && (
                    <div className="js-deob-field">
                      <label htmlFor="decoder-call-count">调用次数</label>
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
                      <label htmlFor="decoder-string-array-length">字符串数组长度</label>
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
                        指定长度可优先命中目标字符串数组，减少误匹配导致的长时间执行。
                      </span>
                    </div>
                  )}

                  {options.decoderLocationMethod === 'evalCode' && (
                    <>
                      <div className="js-deob-field">
                        <label htmlFor="decoder-names">解密函数名</label>
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
                        <label htmlFor="setup-code">注入执行代码</label>
                        <textarea
                          id="setup-code"
                          className="js-deob-textarea"
                          value={options.setupCode}
                          placeholder="// 需要在执行前注入的代码"
                          spellCheck={false}
                          onChange={(event) =>
                            updateOptions({ setupCode: event.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  <label className="js-deob-checkbox">
                    <input
                      type="checkbox"
                      checked={options.isMarkEnable}
                      onChange={(event) =>
                        updateOptions({ isMarkEnable: event.target.checked })
                      }
                    />
                    启用关键字标记
                  </label>

                  {options.isMarkEnable && (
                    <div className="js-deob-field">
                      <label htmlFor="keywords">关键字列表</label>
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
                    <label htmlFor="mangle-mode">变量名优化</label>
                    <select
                      id="mangle-mode"
                      className="js-deob-select"
                      value={options.mangleMode}
                      onChange={(event) =>
                        updateOptions({
                          mangleMode: event.target.value as EditableOptions['mangleMode'],
                        })
                      }
                    >
                      <option value="off">关闭</option>
                      <option value="hex">Hex (_0x)</option>
                      <option value="short">短变量名</option>
                      <option value="all">全部变量</option>
                      <option value="custom">自定义正则</option>
                    </select>
                  </div>

                  {options.mangleMode === 'custom' && (
                    <>
                      <div className="js-deob-field">
                        <label htmlFor="mangle-pattern">正则</label>
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
                        <label htmlFor="mangle-flags">Flags</label>
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

              <div className="js-deob-panel js-deob-section">
                <h2 className="js-deob-section-title">执行说明</h2>
                <p className="js-deob-section-copy">
                  保持短说明，重点放在定位策略和排障节奏。
                </p>
                <ul className="js-deob-side-notes">
                  <li>字符串数组模式适合大多数典型字符串解密场景。</li>
                  <li>调用次数模式适合已知解密器调用规模的样本。</li>
                  <li>注入代码模式适合需要手动补环境或补函数的情况。</li>
                  <li>关键字标记可帮助快速定位 `debugger`、签名与环境检测逻辑。</li>
                </ul>
              </div>
            </aside>

            <section className="js-deob-editors">
              <div className="js-deob-panel js-deob-section">
                <div className="js-deob-editor-head">
                  <div>
                    <h2 className="js-deob-section-title">输入代码</h2>
                    <p>粘贴待处理代码，执行前只保留必要说明。</p>
                  </div>
                </div>
                <textarea
                  className="js-deob-textarea"
                  value={sourceCode}
                  placeholder="在这里粘贴需要反混淆的 JS 代码..."
                  spellCheck={false}
                  onChange={(event) => setSourceCode(event.target.value)}
                />
              </div>

              <div className="js-deob-panel js-deob-section">
                <div className="js-deob-editor-head">
                  <div>
                    <h2 className="js-deob-section-title">输出结果</h2>
                    <p>成功执行后显示格式化输出与最近一次运行状态。</p>
                  </div>
                </div>

                {errorMessage ? (
                  <div className="js-deob-error">{errorMessage}</div>
                ) : (
                  <div className="js-deob-note">
                    {parseTime === null
                      ? '尚未执行。调整参数后点击“运行反混淆”即可。'
                      : `最近一次运行耗时 ${parseTime} ms。`}
                  </div>
                )}

                <div className="mt-4">
                  <textarea
                    className="js-deob-textarea"
                    data-output="true"
                    value={outputCode}
                    placeholder="反混淆结果会显示在这里..."
                    spellCheck={false}
                    readOnly
                  />
                </div>
              </div>

              <div className="js-deob-panel js-deob-section">
                <div className="js-deob-editor-head">
                  <div>
                    <h2 className="js-deob-section-title">运行日志</h2>
                    <p>定位、解密和错误信息在这里按时间顺序输出。</p>
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
                      运行反混淆后，这里会实时显示日志输出。
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
