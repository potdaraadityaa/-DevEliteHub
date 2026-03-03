import { useState, useEffect } from 'react'
import creatorService from '../../services/creatorService'
import './CreatorComponents.css'

const EMPTY_TIER = { name: '', description: '', price: '', perks: [''], sortOrder: 0 }

function TierManager() {
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)   // tier object being edited
    const [form, setForm] = useState(EMPTY_TIER)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { loadTiers() }, [])

    const loadTiers = async () => {
        setLoading(true)
        try { setTiers(await creatorService.getTiers()) }
        catch { setError('Failed to load tiers') }
        finally { setLoading(false) }
    }

    const openNew = () => {
        setEditing(null)
        setForm(EMPTY_TIER)
        setShowForm(true)
        setError('')
    }

    const openEdit = (tier) => {
        setEditing(tier)
        setForm({
            name: tier.name,
            description: tier.description || '',
            price: tier.price,
            perks: tier.perks?.length ? tier.perks : [''],
            sortOrder: tier.sortOrder,
        })
        setShowForm(true)
        setError('')
    }

    const handlePerkChange = (i, val) => {
        const p = [...form.perks]
        p[i] = val
        setForm({ ...form, perks: p })
    }
    const addPerk = () => setForm({ ...form, perks: [...form.perks, ''] })
    const removePerk = (i) => setForm({ ...form, perks: form.perks.filter((_, idx) => idx !== i) })

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            const payload = { ...form, perks: form.perks.filter(Boolean) }
            if (editing) {
                const updated = await creatorService.updateTier(editing.id, payload)
                setTiers(tiers.map(t => t.id === editing.id ? updated : t))
            } else {
                const created = await creatorService.createTier(payload)
                setTiers([...tiers, created])
            }
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed')
        } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this tier?')) return
        try {
            await creatorService.deleteTier(id)
            setTiers(tiers.filter(t => t.id !== id))
        } catch { setError('Delete failed') }
    }

    const handleToggle = async (id) => {
        try {
            const updated = await creatorService.toggleTier(id)
            setTiers(tiers.map(t => t.id === id ? updated : t))
        } catch { setError('Toggle failed') }
    }

    return (
        <div className="tier-manager">
            <div className="cm-section-header">
                <h2 className="cm-section-title">Subscription Tiers</h2>
                <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Tier</button>
            </div>

            {error && <div className="cm-error">{error}</div>}

            {/* ── Tier Form ──────────────────────────────────────── */}
            {showForm && (
                <div className="cm-form-card card">
                    <h3>{editing ? 'Edit Tier' : 'Create New Tier'}</h3>
                    <form onSubmit={handleSave} className="cm-form">
                        <div className="cm-form-row">
                            <div className="form-group">
                                <label className="form-label">Tier Name</label>
                                <input className="form-input" placeholder="e.g. Pro" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Monthly Price (USD)</label>
                                <input className="form-input" type="number" min="0.99" step="0.01"
                                    placeholder="29.00" value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={2} placeholder="What subscribers get..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Perks</label>
                            {form.perks.map((p, i) => (
                                <div key={i} className="cm-perk-row">
                                    <input className="form-input" placeholder={`Perk ${i + 1}`} value={p}
                                        onChange={e => handlePerkChange(i, e.target.value)} />
                                    {form.perks.length > 1 && (
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removePerk(i)}>✕</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }} onClick={addPerk}>
                                + Add Perk
                            </button>
                        </div>
                        <div className="cm-form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="spinner" /> : editing ? 'Save Changes' : 'Create Tier'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Tier List ──────────────────────────────────────── */}
            {loading ? (
                <div className="cm-grid">{[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '180px' }} />)}</div>
            ) : tiers.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">💎</span>
                    <p>No tiers yet. Create your first subscription tier.</p>
                </div>
            ) : (
                <div className="cm-grid">
                    {tiers.map(tier => (
                        <div key={tier.id} className={`card tier-card ${!tier.active ? 'tier-card--inactive' : ''}`}>
                            <div className="tier-card__header">
                                <h4>{tier.name}</h4>
                                <span className={`badge ${tier.active ? 'badge-success' : 'badge-warning'}`}>
                                    {tier.active ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            <div className="tier-card__price">${tier.price}<small>/mo</small></div>
                            {tier.perks?.length > 0 && (
                                <ul className="tier-card__perks">
                                    {tier.perks.slice(0, 4).map((p, i) => <li key={i}>✓ {p}</li>)}
                                </ul>
                            )}
                            <div className="tier-card__actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(tier)}>Edit</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(tier.id)}>
                                    {tier.active ? 'Pause' : 'Activate'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tier.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TierManager
