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
            <h1 className="front-page__title">RevJS 前台验证页</h1>
            <p className="front-page__copy">
              用来记录当前项目前台形态与 JS Deob
              入口，服务于仓库内联调、样式校准和交互验证， 不是面向普通用户的介绍页。
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
              <span>
                浏览器端直接跑工作区源码，方便验证规则改动、参数组合和输出差异。
              </span>
            </article>
            <article className="front-page__metric">
              <strong>CLI</strong>
              <span>
                同一套实现也走 pnpm cli:js-deob，用来避免 Web 和 CLI 的行为漂移。
              </span>
            </article>
            <article className="front-page__metric">
              <strong>Layout</strong>
              <span>正文、标签与操作区按项目态内容页收紧，不按对外产品页去包装。</span>
            </article>
          </div>
        </section>

        <section className="front-page__grid">
          <article className="front-card front-page__panel front-page__panel--feature">
            <div className="front-page__panel-head">
              <div>
                <h2>JS Deob 验证入口</h2>
                <p>当前主入口，用于仓库内粘贴样例、调参数、执行并查看日志。</p>
              </div>
              <span className="front-page__badge">In Repo</span>
            </div>

            <div className="front-page__list">
              <div>
                <strong>输入 / 输出</strong>
                <span>双栏区域保留源码输入、结果输出和实时日志，便于做前后对照。</span>
              </div>
              <div>
                <strong>运行参数</strong>
                <span>
                  覆盖字符串数组、调用次数、注入代码和变量名优化等当前常用开关。
                </span>
              </div>
              <div>
                <strong>工作流</strong>
                <span>优先承载项目验证流程，不额外堆面向普通用户的说明文案。</span>
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
                <h2>当前范围</h2>
                <p>这里只保留当前仓库里已经接上的前台入口和实现边界。</p>
              </div>
            </div>

            <div className="front-page__principles">
              <span>首页当前只承担项目态展示和入口分发</span>
              <span>JS Deob 是现阶段唯一已接通的工作台页面</span>
              <span>浏览器端和 CLI 共用同一套 deob 核心实现</span>
              <span>页面内容优先反映仓库现状，不补对外包装文案</span>
            </div>
          </article>
        </section>
      </main>
    </FrontShell>
  )
}

export default IndexPage
