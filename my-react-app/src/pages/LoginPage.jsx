import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
        setLoading(true)
        await new Promise(r => setTimeout(r, 600))
        const result = login(form.username, form.password)
        setLoading(false)
        if (result.error) { setError(result.error); return }
        navigate('/')
    }

    return (
        <div className="auth-bg">
            <div className="auth-blob b1" />
            <div className="auth-blob b2" />
            <div className="auth-blob b3" />

            <div className="auth-card">
                <div className="auth-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <defs>
                            <linearGradient id="ssi-grad-login" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <rect width="32" height="32" rx="8" fill="url(#ssi-grad-login)" />
                        <path d="M9 21L16 9L23 21" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="16" cy="18" r="2" fill="#fff" />
                    </svg>
                    <span className="auth-logo-text">SSI_CR</span>
                </div>

                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-sub">Sign in to your account</p>

                {error && (
                    <div className="auth-error">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Username</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            <input
                                type="text" name="username"
                                placeholder="Your username"
                                value={form.username} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'} name="password" autoComplete="current-password"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange}
                            />
                            <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                                {showPass
                                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={`auth-btn${loading ? ' loading' : ''}`} disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Login'}
                    </button>
                </form>

                <div className="auth-hint">
                    <span>Demo: <code>alice</code> / <code>alice123</code></span>
                </div>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    )
}
