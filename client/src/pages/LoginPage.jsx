import { useState } from 'react' 
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth.js' 
import { useAuth } from '../context/AuthContext.jsx' 

export default function LoginPage() {
    const [email, setEmail] = useState('') 
    const [password, setPassword] = useState('') 
    const [error, setError] = useState(null) 
    const [loading, setLoading] = useState(false) 

    const { login } = useAuth() 
    const navigate = useNavigate() 

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true) 
        setError(null)

        try {
            const data = await loginUser({ email, password })
            login(data.user, data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Login Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem' }}>
            <h1>Food Log</h1>
            <h2>Login</h2>

            {error && (
                <p style={{ color: 'red' }}>{error}</p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email</label><br />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Password</label><br />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '0.75rem' }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p>
                Dont have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}