import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import axiosClient from '../api/axiosClient.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axiosClient.post('/api/auth/forgot-password', { email })
      setSubmitted(true)
    } catch (err) {
      // Always show success to prevent email enumeration
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
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

      {submitted ? (
        <div>
          <div style={{
            padding: '16px',
            background: 'rgba(29,158,117,0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            marginTop: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ color: 'var(--success)', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              ✓ Check your email
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              If that email exists you will receive a reset link shortly. 
              Check your spam folder if you don't see it.
            </p>
          </div>
          <Link
            to="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}
          >
            ← Back to login
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1.5rem' }}>
            Enter your email and we'll send you a reset link
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
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
                opacity: loading ? 0.7 : 1,
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              Login
            </Link>
          </p>
        </>
      )}
    </div>
  )
}