import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import axiosClient from '../api/axiosClient.js'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      await axiosClient.post('/api/auth/reset-password', { token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '80px auto',
        padding: '2rem',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>
          Invalid reset link
        </p>
        <Link to="/forgot-password" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
          Request a new one
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '2rem',
      background: 'var(--bg-primary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)'
    }}>
      {/* Theme toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <h1 style={{ fontSize: '22px', marginBottom: '4px', color: 'var(--text-primary)' }}>
        🥗 Chomp Tracker
      </h1>

      {success ? (
        <div>
          <div style={{
            padding: '16px',
            background: 'rgba(29,158,117,0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            marginTop: '1rem'
          }}>
            <p style={{ color: 'var(--success)', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              ✓ Password reset successfully!
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Redirecting you to login in 3 seconds...
            </p>
          </div>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1.5rem' }}>
            Enter your new password
          </p>

          {error && (
            <p style={{
              color: 'var(--error)',
              fontSize: '13px',
              marginBottom: '1rem',
              padding: '8px',
              background: 'rgba(226,75,74,0.1)',
              borderRadius: 'var(--radius-sm)'
            }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? '🙈' : '🐵'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your new password"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}