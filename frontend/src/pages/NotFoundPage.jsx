import { Link } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
    return (
        <main className="not-found">
            <div className="not-found__glow" />
            <div className="container not-found__content">
                <span className="not-found__code gradient-text">404</span>
                <h1 className="not-found__title">Page Not Found</h1>
                <p className="not-found__desc">
                    Looks like this route doesn&apos;t exist. It might have been moved or deleted.
                </p>
                <Link to="/" className="btn btn-primary btn-lg">
                    ← Back to Home
                </Link>
            </div>
        </main>
    )
}

export default NotFoundPage
