import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import IndexPage from '@/pages/index'
import JsDeobPage from '@/pages/js-deob'

function RootLayout() {
  return <Outlet />
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

const jsDeobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/js-deob',
  component: JsDeobPage,
})

const routeTree = rootRoute.addChildren([indexRoute, jsDeobRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
