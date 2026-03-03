package com.develitehub.controller;

import com.develitehub.dto.response.ApiResponse;
import com.develitehub.entity.SubscriptionTier;
import com.develitehub.entity.User;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.SubscriptionTierRepository;
import com.develitehub.service.StripeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Payment endpoints:
 * POST /api/payments/checkout/:tierId – create Stripe Checkout session
 * (authenticated)
 * POST /api/payments/cancel/:subId – cancel a subscription
 * POST /stripe/webhook – Stripe webhook (public, verified by signature)
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final StripeService stripeService;
    private final SubscriptionTierRepository tierRepository;

    // ── Create checkout session ────────────────────────────────────────

    @PostMapping("/payments/checkout/{tierId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> createCheckout(
            @PathVariable Long tierId,
            @AuthenticationPrincipal User subscriber) {

        SubscriptionTier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new ResourceNotFoundException("Tier", tierId));

        String checkoutUrl = stripeService.createCheckoutSession(subscriber, tier);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("url", checkoutUrl),
                "Checkout session created"));
    }

    // ── Cancel subscription ────────────────────────────────────────────

    @PostMapping("/payments/cancel/{stripeSubId}")
    public ResponseEntity<ApiResponse<Void>> cancelSubscription(
            @PathVariable String stripeSubId,
            @RequestParam(defaultValue = "false") boolean immediately,
            @AuthenticationPrincipal User user) {

        stripeService.cancelSubscription(stripeSubId, immediately);
        return ResponseEntity.ok(ApiResponse.success(null,
                immediately ? "Subscription cancelled immediately" : "Subscription will cancel at period end"));
    }

    // ── Stripe Webhook (public – verified by Stripe signature) ─────────

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }
}
