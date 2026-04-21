import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import type { Page } from './types'

function App() {
  const [page, setPage] = useState<Page>('login')

  if (page === 'login') {
    return <LoginPage onLogin={() => setPage('dashboard')} />
  }

  return <DashboardPage />
}

export default App
