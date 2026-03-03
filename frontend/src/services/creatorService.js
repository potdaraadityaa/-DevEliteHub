import api from './api'

const creatorService = {

    // ── Tiers ──────────────────────────────────────────────────────
    createTier: async (data) => {
        const res = await api.post('/creator/tiers', data)
        return res.data.data
    },
    getTiers: async () => {
        const res = await api.get('/creator/tiers')
        return res.data.data
    },
    updateTier: async (id, data) => {
        const res = await api.put(`/creator/tiers/${id}`, data)
        return res.data.data
    },
    deleteTier: async (id) => {
        await api.delete(`/creator/tiers/${id}`)
    },
    toggleTier: async (id) => {
        const res = await api.patch(`/creator/tiers/${id}/toggle`)
        return res.data.data
    },

    // ── Posts ──────────────────────────────────────────────────────
    createPost: async (data) => {
        const res = await api.post('/creator/posts', data)
        return res.data.data
    },
    getPosts: async (page = 0, size = 10) => {
        const res = await api.get('/creator/posts', { params: { page, size } })
        return res.data.data
    },
    updatePost: async (id, data) => {
        const res = await api.put(`/creator/posts/${id}`, data)
        return res.data.data
    },
    deletePost: async (id) => {
        await api.delete(`/creator/posts/${id}`)
    },

    // ── Stats ──────────────────────────────────────────────────────
    getStats: async () => {
        const res = await api.get('/creator/dashboard/stats')
        return res.data.data
    },
}

export default creatorService
