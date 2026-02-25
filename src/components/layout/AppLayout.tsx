import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* ─── Desktop Sidebar — DS: surface bg, 256px ─── */}
      <aside
        id="sidebar"
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{
          width: '256px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
        aria-label="Menu de navegação"
      >
        <Sidebar onClose={() => {}} />
      </aside>

      {/* ─── Mobile Drawer Overlay ─── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 fade-in"
          style={{ zIndex: 'var(--z-overlay)', background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
      {sidebarOpen && (
        <aside
          id="sidebar-mobile"
          className="lg:hidden fixed left-0 top-0 bottom-0 flex flex-col fade-in"
          style={{
            width: '280px',
            zIndex: 'var(--z-modal)',
            background: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xl)',
          }}
          aria-label="Menu de navegação mobile"
          role="dialog"
          aria-modal="true"
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
      )}

      {/* ─── Main content area ─── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(v => !v)} />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: 'var(--space-5)',
            background: 'var(--color-bg)',
          }}
          id="main-content"
          aria-label="Conteúdo principal"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
