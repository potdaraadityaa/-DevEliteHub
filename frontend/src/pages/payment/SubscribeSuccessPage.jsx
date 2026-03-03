import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './SubscribePage.css'

/**
 * Shown after Stripe redirects back on successful checkout.
 * Stripe passes ?session_id=... in the URL.
 */
function SubscribeSuccessPage() {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')

    return (
        <main className="subscribe-page">
            <div className="subscribe-page__glow" style={{ background: 'radial-gradient(ellipse, rgba(0,210,147,0.18) 0%, transparent 70%)' }} />
            <div className="subscribe-card card" style={{ borderColor: 'var(--color-success)' }}>
                <div className="subscribe-card__icon">🎉</div>
                <h1 className="subscribe-card__title">
                    You&apos;re subscribed!
                </h1>
                <p className="subscribe-card__sub">
                    Payment confirmed. You now have full access to the creator&apos;s premium content.
                </p>
                {sessionId && (
                    <div className="subscribe-card__guarantee">
                        Session: {sessionId.slice(0, 20)}…
                    </div>
                )}
                <Link to="/explore" className="btn btn-primary w-full">
                    Browse Premium Content
                </Link>
                <Link to="/" className="btn btn-ghost w-full">
                    Back to Home
                </Link>
            </div>
        </main>
    )
}

export default SubscribeSuccessPage
