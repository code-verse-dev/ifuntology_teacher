import { Outlet } from 'react-router-dom'

export function BuilderLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9e8' }}>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
