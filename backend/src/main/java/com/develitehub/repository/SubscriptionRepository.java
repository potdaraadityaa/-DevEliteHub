package com.develitehub.repository;

import com.develitehub.entity.Subscription;
import com.develitehub.entity.SubscriptionStatus;
import com.develitehub.entity.SubscriptionTier;
import com.develitehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // Check if subscriber has an active subscription to a specific tier
    Optional<Subscription> findBySubscriberAndTierAndStatus(
            User subscriber, SubscriptionTier tier, SubscriptionStatus status);

    // Find all active subscriptions of a subscriber (subscriber view)
    List<Subscription> findBySubscriberAndStatus(User subscriber, SubscriptionStatus status);

    // Check if subscriber has any active subscription to any of a creator's tiers
    @Query("""
            SELECT COUNT(s) > 0 FROM Subscription s
            WHERE s.subscriber = :subscriber
            AND s.tier.creator = :creator
            AND s.status = 'ACTIVE'
            """)
    boolean hasActiveSubscriptionToCreator(User subscriber, User creator);

    // Find by Stripe subscription ID
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);

    // Count active subscribers for a creator
    @Query("""
            SELECT COUNT(DISTINCT s.subscriber) FROM Subscription s
            WHERE s.tier.creator = :creator AND s.status = 'ACTIVE'
            """)
    long countActiveSubscribers(User creator);

    // Monthly recurring revenue for a creator
    @Query("""
            SELECT COALESCE(SUM(s.tier.price), 0) FROM Subscription s
            WHERE s.tier.creator = :creator AND s.status = 'ACTIVE'
            """)
    BigDecimal calculateMRR(User creator);
}
