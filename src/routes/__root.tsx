import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'react-hot-toast'

const RootLayout = () => (
  <>
    <div>
      {/* <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{' '} */}
      {/* <Link to="/about" className="[&.active]:font-bold">
        About
      </Link> */}
    </div>
    <hr />
    <Outlet />
    <Toaster position="top-center" toastOptions={{ style: { background: '#1a1b21', color: '#fff' } }} />
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })