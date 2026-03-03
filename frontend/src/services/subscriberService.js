import api from './api'

const subscriberService = {

    // Public creator list
    getCreators: async (page = 0, size = 12) => {
        const res = await api.get('/explore/creators', { params: { page, size } })
        return res.data.data
    },

    // Single creator profile
    getCreatorProfile: async (creatorId) => {
        const res = await api.get(`/creators/${creatorId}/profile`)
        return res.data.data
    },

    // Creator's active tiers
    getCreatorTiers: async (creatorId) => {
        const res = await api.get(`/creators/${creatorId}/tiers`)
        return res.data.data
    },

    // Creator's published posts (gated by subscription)
    getCreatorPosts: async (creatorId, page = 0, size = 10) => {
        const res = await api.get(`/creators/${creatorId}/posts`, { params: { page, size } })
        return res.data.data
    },

    // Single post
    getPost: async (postId) => {
        const res = await api.get(`/posts/${postId}`)
        return res.data.data
    },
}

export default subscriberService
