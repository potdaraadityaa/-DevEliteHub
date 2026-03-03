package com.develitehub.service;

import com.develitehub.entity.*;
import com.develitehub.exception.PaymentException;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.SubscriptionRepository;
import com.develitehub.repository.SubscriptionTierRepository;
import com.develitehub.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.Invoice;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.*;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Handles all Stripe operations:
 * - Customer creation
 * - Stripe Price / Product creation per tier
 * - Checkout session creation
 * - Webhook event processing
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionTierRepository tierRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    // ── Customer ──────────────────────────────────────────────────────

    @Transactional
    public String getOrCreateStripeCustomer(User user) {
        if (user.getStripeCustomerId() != null)
            return user.getStripeCustomerId();
        try {
            CustomerCreateParams params = CustomerCreateParams.builder()
                    .setEmail(user.getEmail())
                    .setName(user.getFullName())
                    .putMetadata("userId", user.getId().toString())
                    .build();
            Customer customer = Customer.create(params);
            user.setStripeCustomerId(customer.getId());
            userRepository.save(user);
            return customer.getId();
        } catch (StripeException e) {
            throw new PaymentException("Failed to create Stripe customer: " + e.getMessage());
        }
    }

    // ── Product + Price for Tier ──────────────────────────────────────

    @Transactional
    public void createStripeProductForTier(SubscriptionTier tier) {
        if (tier.getStripePriceId() != null)
            return;
        try {
            // Create product
            ProductCreateParams productParams = ProductCreateParams.builder()
                    .setName(tier.getCreator().getFullName() + " – " + tier.getName())
                    .setDescription(tier.getDescription())
                    .putMetadata("tierId", tier.getId().toString())
                    .build();
            Product product = Product.create(productParams);

            // Create recurring price in cents
            long unitAmount = tier.getPrice()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            PriceCreateParams priceParams = PriceCreateParams.builder()
                    .setProduct(product.getId())
                    .setCurrency("usd")
                    .setUnitAmount(unitAmount)
                    .setRecurring(PriceCreateParams.Recurring.builder()
                            .setInterval(PriceCreateParams.Recurring.Interval.MONTH)
                            .build())
                    .build();
            Price price = Price.create(priceParams);

            tier.setStripeProductId(product.getId());
            tier.setStripePriceId(price.getId());
            tierRepository.save(tier);

            log.info("Created Stripe product/price for tier {}", tier.getId());
        } catch (StripeException e) {
            throw new PaymentException("Failed to create Stripe product: " + e.getMessage());
        }
    }

    // ── Checkout Session ──────────────────────────────────────────────

    public String createCheckoutSession(User subscriber, SubscriptionTier tier) {
        // Ensure Stripe product exists for this tier
        createStripeProductForTier(tier);

        String customerId = getOrCreateStripeCustomer(subscriber);
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(tier.getStripePriceId())
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(frontendUrl + "/subscribe/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/creator/" + tier.getCreator().getId())
                    .putMetadata("subscriberId", subscriber.getId().toString())
                    .putMetadata("tierId", tier.getId().toString())
                    .build();
            Session session = Session.create(params);
            return session.getUrl();
        } catch (StripeException e) {
            throw new PaymentException("Failed to create checkout session: " + e.getMessage());
        }
    }

    // ── Cancel Subscription ────────────────────────────────────────────

    @Transactional
    public void cancelSubscription(String stripeSubscriptionId, boolean immediately) {
        try {
            com.stripe.model.Subscription stripeSub = com.stripe.model.Subscription.retrieve(stripeSubscriptionId);
            if (immediately) {
                stripeSub.cancel();
            } else {
                com.stripe.model.Subscription.retrieve(stripeSubscriptionId)
                        .update(com.stripe.param.SubscriptionUpdateParams.builder()
                                .setCancelAtPeriodEnd(true).build());
            }
            // DB update happens via webhook
        } catch (StripeException e) {
            throw new PaymentException("Failed to cancel subscription: " + e.getMessage());
        }
    }

    // ── Webhook ───────────────────────────────────────────────────────

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            throw new PaymentException("Webhook signature verification failed");
        }

        log.info("Stripe webhook received: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "invoice.payment_succeeded" -> handlePaymentSucceeded(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            default -> log.debug("Unhandled Stripe event: {}", event.getType());
        }
    }

    private void handleCheckoutCompleted(Event event) {
        EventDataObjectDeserializer deser = event.getDataObjectDeserializer();
        if (deser.getObject().isEmpty())
            return;
        Session session = (Session) deser.getObject().get();

        Long subscriberId = Long.parseLong(session.getMetadata().get("subscriberId"));
        Long tierId = Long.parseLong(session.getMetadata().get("tierId"));

        User subscriber = userRepository.findById(subscriberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", subscriberId));
        SubscriptionTier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new ResourceNotFoundException("Tier", tierId));

        // Retrieve the created Stripe subscription
        String stripeSubId = session.getSubscription();
        com.stripe.model.Subscription stripeSub;
        try {
            stripeSub = com.stripe.model.Subscription.retrieve(stripeSubId);
        } catch (StripeException e) {
            throw new PaymentException("Failed to retrieve subscription: " + e.getMessage());
        }

        Subscription sub = Subscription.builder()
                .subscriber(subscriber)
                .tier(tier)
                .stripeSubscriptionId(stripeSubId)
                .stripeCustomerId(session.getCustomer())
                .status(SubscriptionStatus.ACTIVE)
                .currentPeriodStart(toLocalDateTime(stripeSub.getCurrentPeriodStart()))
                .currentPeriodEnd(toLocalDateTime(stripeSub.getCurrentPeriodEnd()))
                .build();
        subscriptionRepository.save(sub);
        log.info("New subscription: user {} → tier {}", subscriberId, tierId);
    }

    private void handlePaymentSucceeded(Event event) {
        // Renew period dates on successful invoice
        EventDataObjectDeserializer deser = event.getDataObjectDeserializer();
        if (deser.getObject().isEmpty())
            return;
        Invoice invoice = (Invoice) deser.getObject().get();
        String stripeSubId = invoice.getSubscription();
        subscriptionRepository.findByStripeSubscriptionId(stripeSubId).ifPresent(sub -> {
            sub.setStatus(SubscriptionStatus.ACTIVE);
            try {
                com.stripe.model.Subscription s = com.stripe.model.Subscription.retrieve(stripeSubId);
                sub.setCurrentPeriodStart(toLocalDateTime(s.getCurrentPeriodStart()));
                sub.setCurrentPeriodEnd(toLocalDateTime(s.getCurrentPeriodEnd()));
            } catch (StripeException ignored) {
            }
        });
    }

    private void handlePaymentFailed(Event event) {
        EventDataObjectDeserializer deser = event.getDataObjectDeserializer();
        if (deser.getObject().isEmpty())
            return;
        Invoice invoice = (Invoice) deser.getObject().get();
        subscriptionRepository.findByStripeSubscriptionId(invoice.getSubscription())
                .ifPresent(sub -> sub.setStatus(SubscriptionStatus.PAST_DUE));
    }

    private void handleSubscriptionDeleted(Event event) {
        EventDataObjectDeserializer deser = event.getDataObjectDeserializer();
        if (deser.getObject().isEmpty())
            return;
        com.stripe.model.Subscription s = (com.stripe.model.Subscription) deser.getObject().get();
        subscriptionRepository.findByStripeSubscriptionId(s.getId())
                .ifPresent(sub -> {
                    sub.setStatus(SubscriptionStatus.CANCELLED);
                    sub.setCancelledAt(LocalDateTime.now());
                });
    }

    private void handleSubscriptionUpdated(Event event) {
        EventDataObjectDeserializer deser = event.getDataObjectDeserializer();
        if (deser.getObject().isEmpty())
            return;
        com.stripe.model.Subscription s = (com.stripe.model.Subscription) deser.getObject().get();
        subscriptionRepository.findByStripeSubscriptionId(s.getId())
                .ifPresent(sub -> sub.setCancelAtPeriodEnd(s.getCancelAtPeriodEnd()));
    }

    private LocalDateTime toLocalDateTime(Long epochSeconds) {
        if (epochSeconds == null)
            return null;
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }
}
