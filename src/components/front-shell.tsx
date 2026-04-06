import type { PropsWithChildren } from 'react'
import { Link } from '@tanstack/react-router'
import { useAppConfig } from '@/provider/ConfigProvider'
import './front-shell.scss'

type FrontShellProps = PropsWithChildren<{
  current: 'home' | 'js-deob'
}>

const accentOptions = [
  { label: 'Violet', value: 'violet' },
  { label: 'Emerald', value: 'emerald' },
  { label: 'Amber', value: 'amber' },
] as const

const navItems = [
  { key: 'home', label: '首页', to: '/' },
  { key: 'js-deob', label: 'JS Deob', to: '/js-deob' },
] as const

export function FrontShell({ current, children }: FrontShellProps) {
  return (
    <div className="front-shell">
      <FrontHeader current={current} />
      <div className="front-shell__body">{children}</div>
      <FrontFooter />
    </div>
  )
}

function FrontHeader({ current }: { current: FrontShellProps['current'] }) {
  const { accent, setAccent, theme, toggleTheme } = useAppConfig()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-brand">
          <Link to="/" className="site-brand__link">
            <span className="site-brand__mark" aria-hidden="true">
              <span className="i-mdi-code-braces text-[15px]" />
            </span>
            <span>
              <strong>revjs</strong>
              <span>在线工具</span>
            </span>
          </Link>
        </div>

        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="site-nav__link"
              data-current={current === item.key}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__tools">
          <div className="site-accent-switcher" aria-label="Accent preset">
            {accentOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className="site-accent-switcher__item"
                data-active={accent === item.value}
                onClick={() => setAccent(item.value)}
                aria-label={`Switch accent to ${item.label}`}
                title={item.label}
              >
                <span data-accent={item.value} />
              </button>
            ))}
          </div>

          <button type="button" className="site-tool-button" onClick={toggleTheme}>
            <span
              className={
                theme === 'dark'
                  ? 'i-mdi-weather-night text-[15px]'
                  : 'i-mdi-white-balance-sunny text-[15px]'
              }
              aria-hidden="true"
            />
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
    </header>
  )
}

function FrontFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>revjs</strong>
          <span>目前提供简单的在线工具入口，后续会继续补充。</span>
        </div>
      </div>
    </footer>
  )
}
