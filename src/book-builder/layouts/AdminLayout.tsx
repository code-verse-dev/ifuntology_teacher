import { Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f7fb',
      }}
    >
      <main>
        <Outlet />
      </main>
    </div>
  )
}
