import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import type { Page } from './types'

function App() {
  const [page, setPage] = useState<Page>(
    () => localStorage.getItem('bouwpro_auth_token') ? 'dashboard' : 'login'
  )

  if (page === 'login') {
    return <LoginPage onLogin={() => setPage('dashboard')} />
  }

  return <DashboardPage onLogout={() => setPage('login')} />
}

export default App
