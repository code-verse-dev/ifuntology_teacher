import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { BuilderWorkspace } from './pages/BuilderWorkspace'
import { AdminLayout } from './layouts/AdminLayout'
import { BuilderLayout } from './layouts/BuilderLayout'
import { AdminBackgroundsPage } from './pages/admin/AdminBackgroundsPage'
import { AdminElementCategoriesPage } from './pages/admin/AdminElementCategoriesPage'
import { AdminElementsPage } from './pages/admin/AdminElementsPage'
import { AdminCharacterPage } from './pages/admin/AdminCharacterPage'
import { AdminShapesPage } from './pages/admin/AdminShapesPage'
import { AdminThoughtBubblesPage } from './pages/admin/AdminThoughtBubblesPage'
import './App.css'

function BooksHub() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: "'Poppins', system-ui, sans-serif",
        background: '#faf9e8',
        color: '#1e293b',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', marginTop: 0 }}>Books</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Your library will list here. For now, open the builder to edit a book.
      </p>
      <Link
        to="/builder"
        style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
      >
        Open book builder →
      </Link>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/builder" replace />} />
        <Route path="/books" element={<BooksHub />} />
        <Route element={<BuilderLayout />}>
          <Route path="/builder/*" element={<BuilderWorkspace />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/backgrounds" replace />} />
          <Route path="/admin/backgrounds" element={<AdminBackgroundsPage />} />
          <Route path="/admin/elements" element={<AdminElementsPage />} />
          <Route
            path="/admin/element-categories"
            element={<AdminElementCategoriesPage />}
          />
          <Route path="/admin/props" element={<Navigate to="/admin/elements" replace />} />
          <Route path="/admin/shapes" element={<AdminShapesPage />} />
          <Route path="/admin/character" element={<AdminCharacterPage />} />
          <Route
            path="/admin/thought-bubbles"
            element={<AdminThoughtBubblesPage />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/builder" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
