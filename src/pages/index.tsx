import { Link } from '@tanstack/react-router'
import { FrontShell } from '@/components/front-shell'
import './index.scss'

function IndexPage() {
  return (
    <FrontShell current="home">
      <main className="front-page">
        <section className="front-card front-page__hero">
          <div className="front-page__hero-main">
            <span className="front-page__eyebrow">revjs / frontend workbench</span>
            <h1 className="front-page__title">RevJS 前台工作台</h1>
            <p className="front-page__copy">
              面向工具与内容页的前台入口。当前先聚焦 JS
              Deob，页面保持紧凑、直接，优先展示能力、状态与处理入口。
            </p>

            <div className="front-page__actions">
              <Link
                to="/js-deob"
                className="front-page__action front-page__action--primary"
              >
                <span className="i-mdi-code-json" aria-hidden="true" />
                打开 JS Deob
              </Link>
              <div className="front-page__tags" aria-label="Workspace highlights">
                <span>Worker 执行</span>
                <span>本地持久化</span>
                <span>共享 deob 核心</span>
              </div>
            </div>
          </div>

          <div className="front-page__hero-side">
            <article className="front-page__metric">
              <strong>Browser</strong>
              <span>浏览器端直接跑工作区源码，适合快速验证规则与输出。</span>
            </article>
            <article className="front-page__metric">
              <strong>CLI</strong>
              <span>同一套实现可走 `pnpm cli:js-deob`，避免 Web / CLI 规则漂移。</span>
            </article>
            <article className="front-page__metric">
              <strong>Layout</strong>
              <span>正文、标签与操作区统一收敛到更小巧的内容页密度。</span>
            </article>
          </div>
        </section>

        <section className="front-page__grid">
          <article className="front-card front-page__panel front-page__panel--feature">
            <div className="front-page__panel-head">
              <div>
                <h2>JS Deob 工作台</h2>
                <p>当前主入口，面向粘贴代码、调参、执行与查看日志。</p>
              </div>
              <span className="front-page__badge">Ready</span>
            </div>

            <div className="front-page__list">
              <div>
                <strong>输入 / 输出</strong>
                <span>双栏工作区，保留源码输入、结果输出和实时日志。</span>
              </div>
              <div>
                <strong>运行参数</strong>
                <span>覆盖字符串数组、调用次数、注入代码和变量名优化等核心开关。</span>
              </div>
              <div>
                <strong>工作流</strong>
                <span>更适合边调边看，而不是承载大段说明性文案。</span>
              </div>
            </div>

            <Link to="/js-deob" className="front-page__text-link">
              进入工作台
              <span className="i-mdi-arrow-right" aria-hidden="true" />
            </Link>
          </article>

          <article className="front-card front-page__panel">
            <div className="front-page__panel-head">
              <div>
                <h2>前台基线</h2>
                <p>当前项目前台页面默认遵循的 UI 方向。</p>
              </div>
            </div>

            <div className="front-page__principles">
              <span>正文与标签优先控制在 12px 到 16px</span>
              <span>卡片、按钮、表单间距保持克制</span>
              <span>层级、边框、浅底色替代重装饰</span>
              <span>搜索、详情、工具页优先信息效率</span>
              <span>避免营销页式 hero 与大面积留白</span>
            </div>
          </article>
        </section>
      </main>
    </FrontShell>
  )
}

export default IndexPage
