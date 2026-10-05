import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MenuPage from './pages/MenuPage.tsx'
import AdminPage from './pages/AdminPage.tsx'
import './pages/menu.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/admin' ? <AdminPage /> : path === '/menu' ? <MenuPage /> : <App />}
  </StrictMode>,
)
