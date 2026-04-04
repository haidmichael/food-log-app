import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from './context/AuthContext.jsx' 
import NavBar from "./components/NavBar.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function ProtectedLayout({ children }) {
  return (
    <>
      <NavBar />
      <main style={{ padding: '1.5rem', maxWidth: '680', margin: '0 auto' }}>
        {children}
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <DashboardPage/>
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <div>Goals coming soon!</div>
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path='*' element={<Navigate to='/login' replace />}/>
    </Routes>
  )
}