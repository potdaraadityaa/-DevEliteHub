package com.develitehub.entity;

/**
 * Stripe subscription lifecycle statuses.
 */
public enum SubscriptionStatus {
    ACTIVE,
    PAST_DUE,
    CANCELLED,
    INCOMPLETE,
    TRIALING
}
