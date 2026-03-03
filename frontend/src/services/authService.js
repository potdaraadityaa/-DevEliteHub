import api from './api'

const authService = {

    register: async (payload) => {
        const res = await api.post('/auth/register', payload)
        return res.data.data   // unwrap ApiResponse<AuthResponse>
    },

    login: async (credentials) => {
        const res = await api.post('/auth/login', credentials)
        return res.data.data
    },

    getMe: async () => {
        const res = await api.get('/auth/me')
        return res.data.data
    },
}

export default authService
