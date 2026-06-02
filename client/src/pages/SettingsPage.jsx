import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext.jsx'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match')
    }

    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters')
    }

    if (currentPassword === newPassword) {
      return setError('New password must be different from current password')
    }

    setLoading(true)
    try {
        await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
            { currentPassword, newPassword },
            {
                headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            Settings
          </h2>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Change Password Card */}
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          Change Password
        </div>

        <div style={{ padding: '16px' }}>
          {/* Success message */}
          {success && (
            <div style={{
              padding: '12px',
              background: 'rgba(29,158,117,0.1)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--success)',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              ✓ Password changed successfully!
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(226,75,74,0.1)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--error)',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Current password */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
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
                  onClick={() => setShowPasswords(prev => !prev)}
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
                  {showPasswords ? '🙈' : '🐵'}
                </button>
              </div>
            </div>

            {/* New password */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
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

            {/* Confirm new password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                Confirm New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
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
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}