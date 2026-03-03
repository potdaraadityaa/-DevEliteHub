import api from './api'

const fileService = {

    /**
     * Upload a file to a post (multipart).
     * @param {number} postId
     * @param {File} file
     * @param {function} onProgress (optional, 0-100)
     */
    uploadFile: async (postId, file, onProgress) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await api.post(`/files/posts/${postId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total))
                }
            },
        })
        return res.data.data  // { fileKey, fileName }
    },

    /**
     * Get presigned download URL for a post's file.
     */
    getFileUrl: async (postId) => {
        const res = await api.get(`/files/posts/${postId}/url`)
        return res.data.data  // { url, fileName }
    },
}

export default fileService
