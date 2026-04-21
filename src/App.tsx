import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useFirebase } from './contexts/FirebaseContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import type { Page } from './types'

function App() {
  const { app } = useFirebase()
  const [page, setPage] = useState<Page>('login')
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), async (user) => {
      if (user) {
        const token = await user.getIdToken()
        localStorage.setItem('bouwpro_auth_token', token)
        setPage('dashboard')
      } else {
        localStorage.removeItem('bouwpro_auth_token')
        setPage('login')
      }
      setAuthReady(true)
    })
    return unsubscribe
  }, [app])

  if (!authReady) return null

  if (page === 'login') {
    return <LoginPage onLogin={() => setPage('dashboard')} />
  }

  return <DashboardPage onLogout={() => setPage('login')} />
}

export default App
