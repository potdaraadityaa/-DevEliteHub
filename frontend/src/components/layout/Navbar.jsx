import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const { isAuthenticated, user, logout, isCreator, isAdmin } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => { setMenuOpen(false) }, [location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const dashboardPath = isAdmin ? '/admin' : isCreator ? '/dashboard' : '/explore'

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__inner container">

                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-icon">⚡</span>
                    <span className="navbar__logo-text">
                        DevElite<span className="gradient-text">Hub</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <ul className="navbar__links">
                    {!isAuthenticated && <>
                        <li><Link to="/#features" className="navbar__link">Features</Link></li>
                        <li><Link to="/#pricing" className="navbar__link">Pricing</Link></li>
                    </>}
                    {isAuthenticated && <>
                        <li><Link to="/explore" className="navbar__link">Explore</Link></li>
                        {isCreator && <li><Link to="/dashboard" className="navbar__link">Dashboard</Link></li>}
                        {isAdmin && <li><Link to="/admin" className="navbar__link">Admin</Link></li>}
                    </>}
                </ul>

                {/* CTA */}
                <div className="navbar__cta">
                    {isAuthenticated ? (
                        <>
                            <Link to={dashboardPath} className="navbar__avatar-btn">
                                {user?.avatarUrl
                                    ? <img src={user.avatarUrl} alt={user.fullName} className="navbar__avatar" />
                                    : <span className="navbar__avatar-placeholder">
                                        {user?.fullName?.[0]?.toUpperCase() || '?'}
                                    </span>
                                }
                            </Link>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>

                {/* Hamburger */}
                <button
                    className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`navbar__mobile-menu ${menuOpen ? 'open' : ''}`}>
                {!isAuthenticated && <>
                    <Link to="/#features" className="navbar__link">Features</Link>
                    <Link to="/#pricing" className="navbar__link">Pricing</Link>
                </>}
                {isAuthenticated && <>
                    <Link to="/explore" className="navbar__link">Explore</Link>
                    {isCreator && <Link to="/dashboard" className="navbar__link">Dashboard</Link>}
                    {isAdmin && <Link to="/admin" className="navbar__link">Admin</Link>}
                </>}
                <div className="navbar__mobile-cta">
                    {isAuthenticated
                        ? <button onClick={handleLogout} className="btn btn-ghost w-full">Sign Out</button>
                        : <>
                            <Link to="/login" className="btn btn-ghost w-full">Sign In</Link>
                            <Link to="/register" className="btn btn-primary w-full">Get Started</Link>
                        </>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar
