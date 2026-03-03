import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

/**
 * AuthProvider – wraps app, stores user + token in state + localStorage.
 * Exposes: user, token, isAuthenticated, role helpers, login, register, logout.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // ── Restore from localStorage on mount ──────────────────────────
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    // ── Actions ──────────────────────────────────────────────────────
    const login = useCallback(async (credentials) => {
        const data = await authService.login(credentials)
        persist(data)
        return data
    }, [])

    const register = useCallback(async (payload) => {
        const data = await authService.register(payload)
        persist(data)
        return data
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }, [])

    // ── Helpers ──────────────────────────────────────────────────────
    const persist = (data) => {
        const { accessToken, ...userInfo } = data
        setToken(accessToken)
        setUser(userInfo)
        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(userInfo))
    }

    const isAuthenticated = !!token && !!user
    const isCreator = user?.role === 'CREATOR'
    const isSubscriber = user?.role === 'SUBSCRIBER'
    const isAdmin = user?.role === 'ADMIN'

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            isCreator,
            isSubscriber,
            isAdmin,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
