import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AdminDashboard.css'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

function StatCard({ icon, label, value }) {
    return (
        <div className="admin-stat-card">
            <span className="admin-stat-card__icon">{icon}</span>
            <div>
                <div className="admin-stat-card__value">{value ?? '—'}</div>
                <div className="admin-stat-card__label">{label}</div>
            </div>
        </div>
    )
}

function AdminDashboard() {
    const { token } = useAuth()
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('Overview')

    const headers = authHeader(token)

    useEffect(() => {
        fetch(`${BASE}/admin/stats`, { headers })
            .then(r => r.json())
            .then(d => setStats(d.data))
            .catch(() => setError('Failed to load stats'))
    }, [])

    useEffect(() => {
        if (activeTab !== 'Users') return
        setLoading(true)
        const url = new URL(`${BASE}/admin/users`)
        url.searchParams.set('page', page)
        url.searchParams.set('size', 15)
        if (roleFilter) url.searchParams.set('role', roleFilter)
        fetch(url.toString(), { headers })
            .then(r => r.json())
            .then(d => { setUsers(d.data?.content || []); setTotal(d.data?.totalPages || 0) })
            .catch(() => setError('Failed to load users'))
            .finally(() => setLoading(false))
    }, [activeTab, page, roleFilter])

    const handleSuspend = async (userId, suspend) => {
        try {
            await fetch(`${BASE}/admin/users/${userId}/suspend?suspend=${suspend}`, {
                method: 'PATCH', headers
            })
            setUsers(users.map(u => u.id === userId ? { ...u, suspended: suspend } : u))
        } catch { setError('Action failed') }
    }

    return (
        <main className="admin-dashboard">
            <div className="admin-header">
                <div className="container">
                    <h1 className="admin-header__title">⚙️ Admin Panel</h1>
                    <p className="admin-header__sub">DevElite Hub — Platform Management</p>
                </div>
            </div>

            <div className="container admin-body">
                <div className="admin-tabs">
                    {['Overview', 'Users'].map(t => (
                        <button key={t} className={`admin-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                    ))}
                </div>

                {error && <div className="cm-error">{error}</div>}

                {activeTab === 'Overview' && (
                    <div className="admin-overview">
                        <div className="admin-stats-grid">
                            <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} />
                            <StatCard icon="🎨" label="Creators" value={stats?.totalCreators} />
                            <StatCard icon="📦" label="Subscribers" value={stats?.totalSubscribers} />
                            <StatCard icon="🚫" label="Suspended" value={stats?.suspendedUsers} />
                            <StatCard icon="💰" label="Total Revenue (est.)" value={stats?.totalRevenue != null ? `$${Number(stats.totalRevenue).toFixed(2)}` : null} />
                        </div>
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="admin-users">
                        <div className="admin-users__toolbar">
                            <select className="form-input" style={{ width: '160px' }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0) }}>
                                <option value="">All Roles</option>
                                <option value="CREATOR">Creators</option>
                                <option value="SUBSCRIBER">Subscribers</option>
                                <option value="ADMIN">Admins</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="cm-list">{[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '56px' }} />)}</div>
                        ) : (
                            <div className="admin-users__table card">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className={u.suspended ? 'row-suspended' : ''}>
                                                <td>{u.fullName}</td>
                                                <td>{u.email}</td>
                                                <td><span className="badge badge-brand">{u.role}</span></td>
                                                <td>
                                                    {u.suspended
                                                        ? <span className="badge badge-danger">Suspended</span>
                                                        : <span className="badge badge-success">Active</span>}
                                                </td>
                                                <td>
                                                    <button
                                                        className={`btn btn-sm ${u.suspended ? 'btn-secondary' : 'btn-danger'}`}
                                                        onClick={() => handleSuspend(u.id, !u.suspended)}
                                                    >
                                                        {u.suspended ? 'Reinstate' : 'Suspend'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {total > 1 && (
                                    <div className="cm-pagination" style={{ paddingTop: 'var(--space-4)' }}>
                                        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                        <span>{page + 1} / {total}</span>
                                        <button className="btn btn-ghost btn-sm" disabled={page >= total - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}

export default AdminDashboard
