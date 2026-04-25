import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx' 
import { useTheme } from '../context/ThemeContext.jsx' 

export default function NavBar() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme() 
    const navigate = useNavigate() 

    const fistName = user?.name?.split(' ')[0]
    const capitalizedName = fistName 
        ? fistName.charAt(0).toUpperCase() + fistName.slice(1).toLowerCase() 
        : ''

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav style={{
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border)',
            padding: '0 1.5rem',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Left - app title */}
            <Link
                to='/dashboard'
                style={{
                    textDecoration: 'none', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: 'var(--text-primary)'
                }}
            >
                🥗 {capitalizedName}'s Food Log 
            </Link>

            {/* Right - nav actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                {/* Welcome message */}
                <span style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                }}>
                    Hey, {capitalizedName}!
                </span>
                {/* Goals link */}
                <Link
                to="/goals"
                style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)'
                }}
                >
                    Goals
                </Link>
                <Link 
                    to="/saved-meals"
                    style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)'
                    }}
                >
                    Saved Meals
                </Link>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontSize: '13px'
                    }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontSize: '13px' 
                    }} 
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}