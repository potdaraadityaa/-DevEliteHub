import { useState, useEffect } from 'react'
import creatorService from '../../services/creatorService'
import './CreatorComponents.css'

const EMPTY_POST = { title: '', content: '', tags: '', tierId: null, premium: false, published: false }

function PostManager() {
    const [posts, setPosts] = useState([])
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_POST)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => { loadData() }, [page])

    const loadData = async () => {
        setLoading(true)
        try {
            const [postsPage, tierList] = await Promise.all([
                creatorService.getPosts(page, 8),
                creatorService.getTiers(),
            ])
            setPosts(postsPage.content)
            setTotalPages(postsPage.totalPages)
            setTiers(tierList)
        } catch { setError('Failed to load posts') }
        finally { setLoading(false) }
    }

    const openNew = () => {
        setEditing(null)
        setForm(EMPTY_POST)
        setShowForm(true)
        setError('')
    }

    const openEdit = (post) => {
        setEditing(post)
        setForm({
            title: post.title,
            content: post.content || '',
            tags: post.tags?.join(',') || '',
            tierId: post.tierId || null,
            premium: post.premium,
            published: post.published,
        })
        setShowForm(true)
        setError('')
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            if (editing) {
                const updated = await creatorService.updatePost(editing.id, form)
                setPosts(posts.map(p => p.id === editing.id ? updated : p))
            } else {
                await creatorService.createPost(form)
                await loadData()
            }
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed')
        } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this post?')) return
        try {
            await creatorService.deletePost(id)
            setPosts(posts.filter(p => p.id !== id))
        } catch { setError('Delete failed') }
    }

    return (
        <div className="post-manager">
            <div className="cm-section-header">
                <h2 className="cm-section-title">Posts</h2>
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Post</button>
            </div>

            {error && <div className="cm-error">{error}</div>}

            {/* ── Post Form ──────────────────────────────────────── */}
            {showForm && (
                <div className="cm-form-card card">
                    <h3>{editing ? 'Edit Post' : 'Create New Post'}</h3>
                    <form onSubmit={handleSave} className="cm-form">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input className="form-input" placeholder="Post title..."
                                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Content</label>
                            <textarea className="form-input" rows={10} placeholder="Write your content here (Markdown supported)..."
                                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', resize: 'vertical', minHeight: '200px' }} />
                        </div>
                        <div className="cm-form-row">
                            <div className="form-group">
                                <label className="form-label">Tags <span style={{ color: 'var(--color-text-muted)' }}>· comma separated</span></label>
                                <input className="form-input" placeholder="system-design, java, ai"
                                    value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lock to Tier <span style={{ color: 'var(--color-text-muted)' }}>· optional</span></label>
                                <select className="form-input" value={form.tierId || ''}
                                    onChange={e => setForm({ ...form, tierId: e.target.value || null, premium: !!e.target.value })}>
                                    <option value="">Free (everyone)</option>
                                    {tiers.map(t => <option key={t.id} value={t.id}>{t.name} (${t.price}/mo)</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="cm-checkbox-row">
                            <label className="cm-checkbox">
                                <input type="checkbox" checked={form.published}
                                    onChange={e => setForm({ ...form, published: e.target.checked })} />
                                <span>Publish immediately</span>
                            </label>
                        </div>
                        <div className="cm-form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="spinner" /> : editing ? 'Save Changes' : 'Create Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Post List ──────────────────────────────────────── */}
            {loading ? (
                <div className="cm-list">{[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '80px' }} />)}</div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">📝</span>
                    <p>No posts yet. Write your first post.</p>
                </div>
            ) : (
                <>
                    <div className="cm-list">
                        {posts.map(post => (
                            <div key={post.id} className="card post-row">
                                <div className="post-row__info">
                                    <div className="post-row__title">{post.title}</div>
                                    <div className="post-row__meta">
                                        {post.premium && <span className="badge badge-brand">Premium</span>}
                                        {post.published
                                            ? <span className="badge badge-success">Published</span>
                                            : <span className="badge badge-warning">Draft</span>}
                                        {post.tierName && <span className="post-row__tier">🔒 {post.tierName}</span>}
                                        <span className="post-row__views">👁 {post.viewCount}</span>
                                    </div>
                                </div>
                                <div className="post-row__actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(post)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
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
    )
}

export default PostManager
