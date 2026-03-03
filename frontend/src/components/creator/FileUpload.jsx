import { useState, useRef } from 'react'
import fileService from '../../services/fileService'
import './FileUpload.css'

/**
 * Drag-and-drop file upload component.
 * Props:
 *   postId      – required when uploading (post must be saved first)
 *   onUploaded  – callback({ fileKey, fileName }) after successful upload
 *   existingFile – { fileName, fileType } to show current attachment
 */
function FileUpload({ postId, onUploaded, existingFile }) {
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [uploaded, setUploaded] = useState(existingFile || null)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    const ALLOWED_TYPES = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'text/plain',
        'text/markdown',
        'image/png', 'image/jpeg', 'image/gif', 'image/webp',
        'video/mp4',
    ]
    const MAX_SIZE_MB = 100

    const handleFile = async (file) => {
        if (!postId) { setError('Save the post first before attaching a file.'); return }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File too large (max ${MAX_SIZE_MB} MB)`)
            return
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('File type not supported. Allowed: PDF, ZIP, TXT, MD, images, MP4.')
            return
        }

        setError('')
        setUploading(true)
        setProgress(0)
        try {
            const result = await fileService.uploadFile(postId, file, setProgress)
            setUploaded({ fileName: result.fileName, fileType: file.type })
            onUploaded?.(result)
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }

    const onDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const onInputChange = (e) => {
        const file = e.target.files[0]
        if (file) handleFile(file)
    }

    const fileIcon = (type) => {
        if (!type) return '📎'
        if (type.includes('pdf')) return '📄'
        if (type.includes('zip')) return '🗜️'
        if (type.includes('image')) return '🖼️'
        if (type.includes('video')) return '🎬'
        return '📎'
    }

    return (
        <div className="file-upload">
            {error && <div className="file-upload__error">{error}</div>}

            {uploaded ? (
                <div className="file-upload__existing">
                    <span className="file-upload__existing-icon">{fileIcon(uploaded.fileType)}</span>
                    <span className="file-upload__existing-name">{uploaded.fileName}</span>
                    <button
                        type="button"
                        className="file-upload__replace-btn"
                        onClick={() => inputRef.current?.click()}
                    >
                        Replace
                    </button>
                </div>
            ) : (
                <div
                    className={`file-upload__dropzone ${dragOver ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                >
                    {uploading ? (
                        <div className="file-upload__progress-wrap">
                            <div className="file-upload__progress-bar" style={{ width: `${progress}%` }} />
                            <span className="file-upload__progress-label">{progress}%</span>
                        </div>
                    ) : (
                        <>
                            <span className="file-upload__dropzone-icon">📁</span>
                            <p className="file-upload__dropzone-text">
                                Drop a file here or <span className="file-upload__browse">browse</span>
                            </p>
                            <p className="file-upload__dropzone-hint">PDF, ZIP, TXT, MD, Images, MP4 — max 100MB</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.zip,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4"
                onChange={onInputChange}
            />
        </div>
    )
}

export default FileUpload
