import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx' 
import NavBar from './components/NavBar.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GoalsPage from './pages/GoalsPage.jsx'
import SavedMealsPage from './pages/SavedMealsPage.jsx'
import CreateSavedMealPage from './pages/CreateSavedMealPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function ProtectedLayout({ children }) {
  return (
    <>
      <NavBar />
      <main style={{ padding: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>
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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            <GoalsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
        <Route path="/saved-meals" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <SavedMealsPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/saved-meals/new" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <CreateSavedMealPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
      <Route path='*' element={<Navigate to='/login' replace />}/>
      <Route path='/settings' element={
        <ProtectedRoute>
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}