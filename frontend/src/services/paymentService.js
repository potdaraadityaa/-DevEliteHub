import api from './api'

const paymentService = {

    /**
     * Creates a Stripe Checkout session for the given tier.
     * Returns { url } to redirect the user to Stripe.
     */
    createCheckout: async (tierId) => {
        const res = await api.post(`/payments/checkout/${tierId}`)
        return res.data.data   // { url }
    },

    /**
     * Cancel a subscription.
     * @param {string} stripeSubId  – Stripe subscription ID
     * @param {boolean} immediately – cancel now vs at period end
     */
    cancelSubscription: async (stripeSubId, immediately = false) => {
        const res = await api.post(
            `/payments/cancel/${stripeSubId}`,
            null,
            { params: { immediately } }
        )
        return res.data
    },
}

export default paymentService
