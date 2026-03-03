import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import paymentService from '../../services/paymentService'
import './SubscribePage.css'

/**
 * SubscribePage – displayed when a user clicks "Subscribe" on a creator's tier.
 * tierId comes from the URL param.
 * Clicking "Subscribe Now" calls the backend → gets Stripe Checkout URL → redirects.
 */
function SubscribePage() {
    const { tierId } = useParams()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            navigate(`/login?redirect=/subscribe/${tierId}`)
            return
        }
        setLoading(true)
        setError('')
        try {
            const { url } = await paymentService.createCheckout(tierId)
            window.location.href = url   // redirect to Stripe Checkout
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start checkout. Please try again.')
            setLoading(false)
        }
    }

    return (
        <main className="subscribe-page">
            <div className="subscribe-page__glow" />
            <div className="subscribe-card card">
                <div className="subscribe-card__icon">💳</div>
                <h1 className="subscribe-card__title">Complete Your Subscription</h1>
                <p className="subscribe-card__sub">
                    You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete your payment.
                </p>

                {error && <div className="subscribe-card__error">{error}</div>}

                <div className="subscribe-card__guarantee">
                    🔒 Secure payment powered by Stripe — cancel anytime
                </div>

                <button
                    className="btn btn-primary w-full"
                    onClick={handleSubscribe}
                    disabled={loading}
                    style={{ fontSize: '1rem', padding: '0.875rem' }}
                >
                    {loading ? <span className="spinner" /> : '✦ Subscribe Now'}
                </button>

                <button className="btn btn-ghost w-full" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        </main>
    )
}

export default SubscribePage
