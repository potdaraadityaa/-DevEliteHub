package com.develitehub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks a user's subscription to a creator's tier.
 * Status is updated by the Stripe webhook handler.
 */
@Entity
@Table(name = "subscriptions", indexes = {
        @Index(name = "idx_sub_subscriber", columnList = "subscriber_id"),
        @Index(name = "idx_sub_tier", columnList = "tier_id"),
        @Index(name = "idx_sub_stripe", columnList = "stripe_subscription_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private User subscriber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tier_id", nullable = false)
    private SubscriptionTier tier;

    // Stripe identifiers
    @Column(nullable = false, length = 100, unique = true)
    private String stripeSubscriptionId;

    @Column(length = 100)
    private String stripeCustomerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;

    // When the subscription was cancelled (if applicable)
    private LocalDateTime cancelledAt;

    // Whether cancellation is scheduled at period end (not immediate)
    @Column(nullable = false)
    @Builder.Default
    private boolean cancelAtPeriodEnd = false;
}
