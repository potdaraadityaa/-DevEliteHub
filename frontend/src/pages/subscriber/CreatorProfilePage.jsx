import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import subscriberService from '../../services/subscriberService'
import paymentService from '../../services/paymentService'
import './ExplorePage.css'

function PostCard({ post, hasSubscription, creatorId }) {
    const isLocked = post.premium && !hasSubscription

    return (
        <div className={`card post-card ${isLocked ? 'post-card--locked' : ''}`}>
            {isLocked && <span className="post-card__lock">🔒</span>}
            <h3 className="post-card__title">{post.title}</h3>
            {post.content && (
                <p className="post-card__preview">{post.content.replace(/<[^>]+>/g, '')}</p>
            )}
            <div className="post-card__meta">
                {post.premium && <span className="badge badge-brand">Premium</span>}
                {post.tierName && <span className="badge" style={{ background: 'var(--color-bg-elevated)' }}>🔒 {post.tierName}</span>}
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>👁 {post.viewCount}</span>
            </div>
            {isLocked && (
                <div className="post-card__locked-cta">
                    Subscribe to unlock this post
                </div>
            )}
        </div>
    )
}

function TierCard({ tier, onSubscribe, subscribing }) {
    return (
        <div className="card tier-card">
            <div className="tier-card__header">
                <h4>{tier.name}</h4>
            </div>
            <div className="tier-card__price">${tier.price}<small>/mo</small></div>
            {tier.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{tier.description}</p>}
            {tier.perks?.length > 0 && (
                <ul className="tier-card__perks">
                    {tier.perks.map((p, i) => <li key={i}>✓ {p}</li>)}
                </ul>
            )}
            <button
                className="btn btn-primary w-full"
                onClick={() => onSubscribe(tier.id)}
                disabled={subscribing === tier.id}
            >
                {subscribing === tier.id ? <span className="spinner" /> : '✦ Subscribe'}
            </button>
        </div>
    )
}

function CreatorProfilePage() {
    const { creatorId } = useParams()
    const { isAuthenticated } = useAuth()
    const [creator, setCreator] = useState(null)
    const [tiers, setTiers] = useState([])
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState(null)
    const [hasSubscription, setHasSubscription] = useState(false)
    const [error, setError] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        Promise.all([
            subscriberService.getCreatorProfile(creatorId),
            subscriberService.getCreatorTiers(creatorId),
        ]).then(([prof, tierList]) => {
            setCreator(prof)
            setTiers(tierList)
        }).catch(() => setError('Failed to load creator.'))
            .finally(() => setLoading(false))
    }, [creatorId])

    useEffect(() => {
        subscriberService.getCreatorPosts(creatorId, page, 8).then(data => {
            setPosts(data.content)
            setTotalPages(data.totalPages)
        })
    }, [creatorId, page])

    const handleSubscribe = async (tierId) => {
        if (!isAuthenticated) {
            window.location.href = `/login?redirect=/creator/${creatorId}`
            return
        }
        setSubscribing(tierId)
        try {
            const { url } = await paymentService.createCheckout(tierId)
            window.location.href = url
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed')
            setSubscribing(null)
        }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    if (!creator) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}><h2>Creator not found</h2><Link to="/explore" className="btn btn-ghost" style={{ marginTop: '1rem' }}>← Explore</Link></div>

    return (
        <main className="creator-profile">
            {/* ── Header ────────────────────────────────────────── */}
            <div className="cp-header">
                <div className="container cp-header__inner">
                    <div className="cp-avatar">
                        {creator.avatarUrl
                            ? <img src={creator.avatarUrl} alt={creator.fullName} />
                            : <span>{creator.fullName?.[0]?.toUpperCase()}</span>
                        }
                    </div>
                    <div className="cp-info">
                        <h1 className="cp-info__name">{creator.fullName}</h1>
                        {creator.bio && <p className="cp-info__bio">{creator.bio}</p>}
                    </div>
                </div>
            </div>

            <div className="container">
                {error && <div className="cm-error" style={{ marginTop: '1.5rem' }}>{error}</div>}

                {/* ── Tiers ────────────────────────────────────────── */}
                {tiers.length > 0 && (
                    <section className="cp-tiers">
                        <h2>Subscription Plans</h2>
                        <div className="cp-tiers-grid">
                            {tiers.map(t => (
                                <TierCard key={t.id} tier={t} onSubscribe={handleSubscribe} subscribing={subscribing} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Posts ────────────────────────────────────────── */}
                <section className="cp-posts">
                    <h2>Content</h2>
                    {posts.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">📝</span>
                            <p>No posts yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="cm-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
                                {posts.map(post => (
                                    <PostCard key={post.id} post={post} hasSubscription={hasSubscription} creatorId={creatorId} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="cm-pagination">
                                    <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                    <span>{page + 1} / {totalPages}</span>
                                    <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default CreatorProfilePage
