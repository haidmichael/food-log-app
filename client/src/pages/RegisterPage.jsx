import { useState } from 'react' 
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/auth.js'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('') 
    const [password, setPassword] = useState('') 
    const [error, setError] = useState(null) 
    const [loading, setLoading] = useState(false) 

    const navigate = useNavigate() 

    const handleSubmit = async (e) => {
        e.preventDefault() 
        setLoading(true)
        setError(null) 

        try {
            await registerUser({ name, email, password })
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false) 
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem' }}>
            <h1>Food Log</h1>
            <h2>Create Account</h2>

            {error && (
                <p style={{ color: 'red' }}></p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Name</label><br />
                    <input
                        type="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
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
                    type='submit'
                    disabled={loading}
                    style={{ width: '100%', padding: '0.75rem' }} 
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <p>
                Already have an account? <Link to="/logini">Login</Link>
            </p>
        </div>
    )
}