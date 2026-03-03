import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import creatorService from '../../services/creatorService'
import TierManager from '../../components/creator/TierManager.jsx'
import PostManager from '../../components/creator/PostManager.jsx'
import './CreatorDashboard.css'

const TABS = ['Overview', 'Tiers', 'Posts']

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="stat-card">
            <span className="stat-card__icon">{icon}</span>
            <div className="stat-card__body">
                <span className="stat-card__value">{value ?? '—'}</span>
                <span className="stat-card__label">{label}</span>
                {sub && <span className="stat-card__sub">{sub}</span>}
            </div>
        </div>
    )
}

function CreatorDashboard() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('Overview')
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        creatorService.getStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <main className="creator-dashboard">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="cd-header">
                <div className="container cd-header__inner">
                    <div className="cd-header__info">
                        <div className="cd-avatar">
                            {user?.avatarUrl
                                ? <img src={user.avatarUrl} alt={user.fullName} />
                                : <span>{user?.fullName?.[0]?.toUpperCase()}</span>
                            }
                        </div>
                        <div>
                            <h1 className="cd-header__name">{user?.fullName}</h1>
                            <p className="cd-header__email">{user?.email}</p>
                        </div>
                    </div>
                    <div className="badge badge-brand">Creator</div>
                </div>
            </div>

            <div className="container cd-body">
                {/* ── Tab bar ────────────────────────────────────────── */}
                <div className="cd-tabs">
                    {TABS.map(t => (
                        <button
                            key={t}
                            className={`cd-tab ${activeTab === t ? 'active' : ''}`}
                            onClick={() => setActiveTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* ── Overview Tab ───────────────────────────────────── */}
                {activeTab === 'Overview' && (
                    <div className="cd-overview">
                        {loading ? (
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="stat-card skeleton" style={{ height: '100px', flex: 1 }} />
                                ))}
                            </div>
                        ) : (
                            <div className="stats-grid">
                                <StatCard icon="📝" label="Total Posts" value={stats?.totalPosts} />
                                <StatCard icon="💎" label="Active Tiers" value={stats?.totalTiers} />
                                <StatCard icon="👥" label="Subscribers" value={stats?.totalSubscribers ?? 0} sub="Phase 4" />
                                <StatCard icon="💰" label="Monthly Revenue" value={stats?.monthlyRevenue ? `$${stats.monthlyRevenue}` : '$0'} sub="Phase 4" />
                            </div>
                        )}

                        <div className="cd-welcome card">
                            <h3>👋 Welcome to your Creator Dashboard</h3>
                            <p>
                                Use the <strong>Tiers</strong> tab to create subscription plans,
                                then the <strong>Posts</strong> tab to publish premium content.
                                Stripe payments will be activated in Phase 4.
                            </p>
                            <div className="flex gap-3" style={{ marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={() => setActiveTab('Tiers')}>
                                    Create a Tier
                                </button>
                                <button className="btn btn-secondary" onClick={() => setActiveTab('Posts')}>
                                    Write a Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tiers Tab ──────────────────────────────────────── */}
                {activeTab === 'Tiers' && <TierManager />}

                {/* ── Posts Tab ──────────────────────────────────────── */}
                {activeTab === 'Posts' && <PostManager />}
            </div>
        </main>
    )
}

export default CreatorDashboard
