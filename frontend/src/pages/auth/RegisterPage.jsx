import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AuthPages.css'

const ROLES = [
    {
        value: 'CREATOR',
        label: 'Creator',
        icon: '🚀',
        desc: 'Publish premium technical content and earn recurring revenue',
    },
    {
        value: 'SUBSCRIBER',
        label: 'Subscriber',
        icon: '📚',
        desc: 'Access exclusive content from elite developers and engineers',
    },
]

function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: searchParams.get('role') || 'SUBSCRIBER',
        bio: '',
    })
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
        if (!form.fullName.trim()) errs.fullName = 'Full name is required'
        if (!form.email) errs.email = 'Email is required'
        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 8) errs.password = 'Minimum 8 characters'
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
            errs.password = 'Must include uppercase, lowercase, and a digit'
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setLoading(true)
        try {
            const data = await register(form)
            navigate(data.role === 'CREATOR' ? '/dashboard' : '/', { replace: true })
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-page__glow" />

            <div className="auth-card auth-card--wide">
                <div className="auth-card__header">
                    <Link to="/" className="auth-card__logo">
                        ⚡ DevElite<span className="gradient-text">Hub</span>
                    </Link>
                    <h1 className="auth-card__title">Create your account</h1>
                    <p className="auth-card__subtitle">Join the developer creator economy</p>
                </div>

                {/* Role selector */}
                <div className="role-selector">
                    {ROLES.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            className={`role-option ${form.role === r.value ? 'active' : ''}`}
                            onClick={() => setForm({ ...form, role: r.value })}
                        >
                            <span className="role-option__icon">{r.icon}</span>
                            <span className="role-option__label">{r.label}</span>
                            <span className="role-option__desc">{r.desc}</span>
                        </button>
                    ))}
                </div>

                {apiError && <div className="auth-error-banner">{apiError}</div>}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            className={`form-input ${errors.fullName ? 'error' : ''}`}
                            placeholder="Jane Smith"
                            value={form.fullName}
                            onChange={handleChange}
                        />
                        {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                    </div>

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
                            placeholder="Min 8 chars, upper + lower + digit"
                            value={form.password}
                            onChange={handleChange}
                        />
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    {form.role === 'CREATOR' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="bio">Bio <span style={{ color: 'var(--color-text-muted)' }}>· optional</span></label>
                            <textarea
                                id="bio"
                                name="bio"
                                className="form-input"
                                placeholder="Tell subscribers what you'll be creating..."
                                rows={3}
                                value={form.bio}
                                onChange={handleChange}
                                style={{ resize: 'vertical', minHeight: '80px' }}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? <span className="spinner" /> : `Create ${form.role === 'CREATOR' ? 'Creator' : ''} Account`}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in →</Link>
                </p>
            </div>
        </main>
    )
}

export default RegisterPage
