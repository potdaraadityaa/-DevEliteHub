package com.develitehub.service;

import com.develitehub.dto.request.TierRequest;
import com.develitehub.dto.response.TierResponse;
import com.develitehub.entity.SubscriptionTier;
import com.develitehub.entity.User;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.SubscriptionTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for creator subscription tiers.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TierService {

    private final SubscriptionTierRepository tierRepository;

    // ── Create ────────────────────────────────────────────────────────

    @Transactional
    public TierResponse createTier(TierRequest request, User creator) {
        SubscriptionTier tier = SubscriptionTier.builder()
                .creator(creator)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .perks(joinPerks(request.getPerks()))
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .active(true)
                .build();

        tierRepository.save(tier);
        log.info("Tier '{}' created for creator {}", tier.getName(), creator.getEmail());
        return toResponse(tier);
    }

    // ── Read ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TierResponse> getCreatorTiers(User creator) {
        return tierRepository
                .findByCreatorOrderBySortOrderAsc(creator)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TierResponse> getPublicTiers(User creator) {
        return tierRepository
                .findByCreatorAndActiveTrueOrderBySortOrderAsc(creator)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Update ────────────────────────────────────────────────────────

    @Transactional
    public TierResponse updateTier(Long tierId, TierRequest request, User creator) {
        SubscriptionTier tier = getOwnedTier(tierId, creator);
        tier.setName(request.getName());
        tier.setDescription(request.getDescription());
        tier.setPrice(request.getPrice());
        tier.setPerks(joinPerks(request.getPerks()));
        if (request.getSortOrder() != null)
            tier.setSortOrder(request.getSortOrder());
        return toResponse(tier);
    }

    // ── Delete / Toggle ───────────────────────────────────────────────

    @Transactional
    public void deleteTier(Long tierId, User creator) {
        SubscriptionTier tier = getOwnedTier(tierId, creator);
        tierRepository.delete(tier);
    }

    @Transactional
    public TierResponse toggleActive(Long tierId, User creator) {
        SubscriptionTier tier = getOwnedTier(tierId, creator);
        tier.setActive(!tier.isActive());
        return toResponse(tier);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private SubscriptionTier getOwnedTier(Long tierId, User creator) {
        return tierRepository.findByIdAndCreator(tierId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Tier", tierId));
    }

    private String joinPerks(List<String> perks) {
        if (perks == null || perks.isEmpty())
            return null;
        return String.join("||", perks);
    }

    private List<String> splitPerks(String perks) {
        if (perks == null || perks.isBlank())
            return List.of();
        return Arrays.asList(perks.split("\\|\\|"));
    }

    public TierResponse toResponse(SubscriptionTier t) {
        return TierResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .description(t.getDescription())
                .price(t.getPrice())
                .perks(splitPerks(t.getPerks()))
                .active(t.isActive())
                .sortOrder(t.getSortOrder())
                .stripePriceId(t.getStripePriceId())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
