import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [success, setSuccess] = useState(false)
    const [privateKey, setPrivateKey] = useState('')

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        if (!form.username.trim() || !form.password || !form.confirm) {
            setError('Please fill in all fields.'); return
        }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
        setLoading(true)

        try {
            const result = await register(form.username.trim(), form.password)
            setLoading(false)
            if (result.error) {
                setError(result.error)
                return
            }
            setSuccess(true)
        } catch (err) {
            setLoading(false)
            setError('Failed to generate secure keys. Please try again.')
        }
    }

    if (success) {
        return (
            <div className="auth-bg">
                <div className="auth-blob b1" />
                <div className="auth-blob b2" />
                <div className="auth-blob b3" />

                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ padding: '20px 0' }}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <h2 className="auth-title" style={{ marginTop: 20 }}>Account & RSA Keys Created!</h2>
                        <p className="auth-sub">2 secure RSA-2048 key pairs have been generated for your account.</p>
                    </div>

                    <p style={{ color: 'var(--text-3)', fontSize: '14px', marginBottom: '24px' }}>
                        You can view and download all your CRT parameters (n, e, d, p, q, dp, dq, qInv) in your secure dashboard.
                    </p>

                    <button onClick={() => navigate('/keys')} className="auth-btn" style={{ marginBottom: 10 }}>
                        View My RSA Keys
                    </button>
                    <button onClick={() => navigate('/')} className="auth-btn" style={{ background: 'transparent', border: '1px solid var(--border-dark)' }}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-bg">
            <div className="auth-blob b1" />
            <div className="auth-blob b2" />
            <div className="auth-blob b3" />

            <div className="auth-card auth-card-reg">
                <div className="auth-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <defs>
                            <linearGradient id="ssi-grad-reg" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <rect width="32" height="32" rx="8" fill="url(#ssi-grad-reg)" />
                        <path d="M9 21L16 9L23 21" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="16" cy="18" r="2" fill="#fff" />
                    </svg>
                    <span className="auth-logo-text">SSI_CR</span>
                </div>

                <h2 className="auth-title">Create account</h2>

                {error && (
                    <div className="auth-error">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
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
                                placeholder="Choose a username"
                                value={form.username} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'} name="password"
                                placeholder="Minimum 6 characters"
                                value={form.password} onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                                {showPass
                                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                }
                            </button>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Confirm password</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'} name="confirm"
                                placeholder="Repeat your password"
                                value={form.confirm} onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`auth-btn${loading ? ' loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? <span className="auth-spinner" /> : 'Register'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
