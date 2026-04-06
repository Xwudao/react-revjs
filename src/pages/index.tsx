import { Link } from '@tanstack/react-router'
import App from '@/App'

function IndexPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-6">
        <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-[28px] border border-black/8 bg-white/78 px-5 py-4 shadow-[0_20px_60px_rgba(8,6,13,0.08)] backdrop-blur dark:border-white/10 dark:bg-[rgba(32,36,45,0.82)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              New Workspace Tool
            </p>
            <p className="mt-1 text-sm text-black/65 dark:text-white/68">
              JS Deob 已迁入 revjs，可直接在浏览器工作台和 CLI 中使用同一套核心代码。
            </p>
          </div>
          <Link
            to="/js-deob"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <span className="i-mdi-code-json text-base" aria-hidden="true" />
            Open JS Deob
          </Link>
        </div>
      </div>
      <App />
    </div>
  )
}

export default IndexPage
