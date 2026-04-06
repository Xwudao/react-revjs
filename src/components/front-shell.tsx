import type { PropsWithChildren } from 'react'
import clsx from 'clsx'
import { Link } from '@tanstack/react-router'
import { useAppConfig } from '@/provider/ConfigProvider'
import classes from './front-shell.module.scss'

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
    <div className={clsx(classes.frontShell)}>
      <FrontHeader current={current} />
      <div className={clsx(classes.frontShellBody)}>{children}</div>
      <FrontFooter />
    </div>
  )
}

function FrontHeader({ current }: { current: FrontShellProps['current'] }) {
  const { accent, setAccent, theme, toggleTheme } = useAppConfig()

  return (
    <header className={clsx(classes.siteHeader)}>
      <div className={clsx(classes.siteHeaderInner)}>
        <div className={clsx(classes.siteBrand)}>
          <Link to="/" className={clsx(classes.siteBrandLink)}>
            <span className={clsx(classes.siteBrandMark)} aria-hidden="true">
              <span className="i-mdi-code-braces text-[15px]" />
            </span>
            <span>
              <strong>revjs</strong>
              <span>在线工具</span>
            </span>
          </Link>
        </div>

        <nav className={clsx(classes.siteNav)} aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={clsx(classes.siteNavLink)}
              data-current={current === item.key}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={clsx(classes.siteHeaderTools)}>
          <div className={clsx(classes.siteAccentSwitcher)} aria-label="Accent preset">
            {accentOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className={clsx(classes.siteAccentSwitcherItem)}
                data-active={accent === item.value}
                onClick={() => setAccent(item.value)}
                aria-label={`Switch accent to ${item.label}`}
                title={item.label}
              >
                <span data-accent={item.value} />
              </button>
            ))}
          </div>

          <button
            type="button"
            className={clsx(classes.siteToolButton)}
            onClick={toggleTheme}
          >
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
    <footer className={clsx(classes.siteFooter)}>
      <div className={clsx(classes.siteFooterInner)}>
        <div className={clsx(classes.siteFooterBrand)}>
          <strong>revjs</strong>
          <span>目前提供简单的在线工具入口，后续会继续补充。</span>
        </div>
      </div>
    </footer>
  )
}
