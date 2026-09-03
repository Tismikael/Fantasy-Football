import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

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
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })