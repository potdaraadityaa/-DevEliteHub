import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import subscriberService from '../../services/subscriberService'
import './ExplorePage.css'

function CreatorCard({ creator }) {
    return (
        <Link to={`/creator/${creator.id}`} className="creator-card card">
            <div className="creator-card__avatar">
                {creator.avatarUrl
                    ? <img src={creator.avatarUrl} alt={creator.fullName} />
                    : <span>{creator.fullName?.[0]?.toUpperCase()}</span>
                }
            </div>
            <div className="creator-card__info">
                <h3 className="creator-card__name">{creator.fullName}</h3>
                {creator.bio && (
                    <p className="creator-card__bio">{creator.bio.slice(0, 100)}{creator.bio.length > 100 ? '…' : ''}</p>
                )}
            </div>
            <div className="creator-card__cta">View Profile →</div>
        </Link>
    )
}

function ExplorePage() {
    const [creators, setCreators] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => { loadCreators() }, [page])

    const loadCreators = async () => {
        setLoading(true)
        try {
            const data = await subscriberService.getCreators(page, 12)
            setCreators(data.content)
            setTotalPages(data.totalPages)
        } catch {
            setError('Failed to load creators.')
        } finally { setLoading(false) }
    }

    return (
        <main className="explore-page">
            <div className="explore-page__hero">
                <div className="container">
                    <h1>Explore <span className="gradient-text">Creators</span></h1>
                    <p>Discover elite developers sharing premium technical knowledge</p>
                </div>
            </div>

            <div className="container explore-page__body">
                {error && <div className="cm-error">{error}</div>}

                {loading ? (
                    <div className="creators-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card skeleton" style={{ height: '220px' }} />
                        ))}
                    </div>
                ) : creators.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon">🔍</span>
                        <p>No creators yet. Be the first to join as a creator!</p>
                        <Link to="/register?role=CREATOR" className="btn btn-primary">Become a Creator</Link>
                    </div>
                ) : (
                    <>
                        <div className="creators-grid">
                            {creators.map(c => <CreatorCard key={c.id} creator={c} />)}
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
            </div>
        </main>
    )
}

export default ExplorePage
