import { useState } from 'react'
import { useAppConfig } from '@/provider/ConfigProvider'
import IconMdiRouterNetwork from '~icons/mdi/router-network'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const accentOptions = [
  { label: 'Violet', value: 'violet' },
  { label: 'Emerald', value: 'emerald' },
  { label: 'Amber', value: 'amber' },
] as const

function App() {
  const [count, setCount] = useState(0)
  const { accent, setAccent, theme, toggleTheme } = useAppConfig()

  return (
    <>
      <section id="center">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-black/70 dark:bg-white/10 dark:text-white/75">
          <span
            className="i-mdi-lightning-bolt text-base text-amber-500"
            aria-hidden="true"
          />
          UnoCSS, icons, checker, auto-import and TanStack Router are ready
        </div>
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
          <p className="mx-auto max-w-150 text-balance text-sm leading-6 text-black/60 dark:text-white/60">
            This starter now ships with a routed entrypoint, utility-first styling, icon
            components, and background type checking.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 px-4">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-black/75 transition hover:border-[var(--accent-border)] hover:text-[var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white/75"
            onClick={toggleTheme}
          >
            <span
              className={
                theme === 'dark'
                  ? 'i-mdi-weather-night text-base'
                  : 'i-mdi-white-balance-sunny text-base'
              }
              aria-hidden="true"
            />
            Theme: {theme}
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {accentOptions.map((item) => (
              <button
                key={item.value}
                className={[
                  'rounded-full px-3 py-1.5 text-sm transition',
                  accent === item.value
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)] ring-1 ring-[var(--accent-border)]'
                    : 'bg-black/5 text-black/60 hover:bg-black/8 dark:bg-white/8 dark:text-white/65',
                ].join(' ')}
                onClick={() => setAccent(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <button className="counter" onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
            <li>
              <a href="https://tanstack.com/router/latest" target="_blank">
                <IconMdiRouterNetwork className="button-icon" />
                TanStack Router
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
