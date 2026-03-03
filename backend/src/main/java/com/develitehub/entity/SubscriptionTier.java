package com.develitehub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * A creator's subscription tier (e.g. "Starter $9/mo", "Pro $29/mo").
 * Each tier belongs to one creator (User with role CREATOR).
 * A tier can have multiple Posts associated with it.
 */
@Entity
@Table(name = "subscription_tiers", indexes = {
        @Index(name = "idx_tier_creator", columnList = "creator_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionTier extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 100)
    private String name; // e.g. "Starter", "Pro", "Elite"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Monthly USD price

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    // Comma-separated perks stored as text; parsed in service layer
    @Column(columnDefinition = "TEXT")
    private String perks;

    // Stripe Price ID (created when tier is activated with Stripe – Phase 4)
    @Column(length = 100)
    private String stripePriceId;

    // Stripe Product ID
    @Column(length = 100)
    private String stripeProductId;

    // Sort order for display
    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
