import { Link } from '@tanstack/react-router'
import { FrontShell } from '@/components/front-shell'
import './index.scss'

function IndexPage() {
  return (
    <FrontShell current="home">
      <main className="front-page">
        <section className="front-card front-page__hero">
          <div className="front-page__hero-main">
            <span className="front-page__eyebrow">revjs tools</span>
            <h1 className="front-page__title">简单、直接的在线工具入口</h1>
            <p className="front-page__copy">
              目前这里提供 JS Deob，你可以直接粘贴代码、调整选项并查看处理结果。
            </p>

            <div className="front-page__actions">
              <Link
                to="/js-deob"
                className="front-page__action front-page__action--primary"
              >
                <span className="i-mdi-code-json" aria-hidden="true" />
                打开 JS Deob
              </Link>
              <div className="front-page__tags" aria-label="Tool highlights">
                <span>粘贴源码</span>
                <span>调整选项</span>
                <span>查看结果</span>
              </div>
            </div>
          </div>

          <div className="front-page__hero-side">
            <article className="front-page__metric">
              <strong>现有工具</strong>
              <span>当前只有一个主工具，首页只保留最短入口和必要说明。</span>
            </article>
            <article className="front-page__metric">
              <strong>JS Deob</strong>
              <span>适合快速查看混淆代码的整理结果、运行日志和关键选项。</span>
            </article>
            <article className="front-page__metric">
              <strong>后续扩展</strong>
              <span>以后增加新工具时，这里会继续保持同样简洁的入口结构。</span>
            </article>
          </div>
        </section>

        <section className="front-page__grid">
          <article className="front-card front-page__panel front-page__panel--feature">
            <div className="front-page__panel-head">
              <div>
                <h2>JS Deob</h2>
                <p>粘贴待处理的 JavaScript，选择方式后直接运行。</p>
              </div>
              <span className="front-page__badge">Available now</span>
            </div>

            <div className="front-page__list">
              <div>
                <strong>代码输入</strong>
                <span>直接贴入原始代码，编辑区会保留更适合阅读的结构。</span>
              </div>
              <div>
                <strong>选项切换</strong>
                <span>常用定位方式、关键字标记和变量名优化都在同一侧栏中。</span>
              </div>
              <div>
                <strong>结果与日志</strong>
                <span>运行后可同时查看输出结果和过程日志，方便快速比对。</span>
              </div>
            </div>

            <Link to="/js-deob" className="front-page__text-link">
              进入工具
              <span className="i-mdi-arrow-right" aria-hidden="true" />
            </Link>
          </article>
        </section>
      </main>
    </FrontShell>
  )
}

export default IndexPage
