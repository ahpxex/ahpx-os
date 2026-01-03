import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Provider } from 'jotai'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <Provider>
      <Outlet />
    </Provider>
  )
}
