import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AuthPages.css'

function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/dashboard'

    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setErrors({ ...errors, [e.target.name]: '' })
        setApiError('')
    }

    const validate = () => {
        const errs = {}
        if (!form.email) errs.email = 'Email is required'
        if (!form.password) errs.password = 'Password is required'
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setLoading(true)
        try {
            const data = await login(form)
            // Redirect based on role
            const dest = data.role === 'CREATOR' ? '/dashboard'
                : data.role === 'ADMIN' ? '/admin'
                    : from
            navigate(dest, { replace: true })
        } catch (err) {
            setApiError(err.response?.data?.message || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-page__glow" />

            <div className="auth-card">
                {/* Header */}
                <div className="auth-card__header">
                    <Link to="/" className="auth-card__logo">
                        ⚡ DevElite<span className="gradient-text">Hub</span>
                    </Link>
                    <h1 className="auth-card__title">Welcome back</h1>
                    <p className="auth-card__subtitle">Sign in to your account</p>
                </div>

                {/* Error banner */}
                {apiError && (
                    <div className="auth-error-banner">{apiError}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="auth-link">Create one →</Link>
                </p>
            </div>
        </main>
    )
}

export default LoginPage
