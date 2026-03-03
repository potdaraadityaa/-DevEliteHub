import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wraps a route that requires authentication.
 * Optionally accepts a required role (e.g. "CREATOR" or "ADMIN").
 */
function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (role && user?.role !== role) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
