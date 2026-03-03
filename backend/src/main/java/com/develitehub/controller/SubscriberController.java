package com.develitehub.controller;

import com.develitehub.dto.response.ApiResponse;
import com.develitehub.dto.response.PostResponse;
import com.develitehub.dto.response.TierResponse;
import com.develitehub.dto.response.UserProfileResponse;
import com.develitehub.entity.Role;
import com.develitehub.entity.User;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.SubscriptionRepository;
import com.develitehub.repository.UserRepository;
import com.develitehub.service.PostService;
import com.develitehub.service.TierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public and subscriber-facing endpoints.
 * /explore – list all creators
 * /creators/:id/tiers – get creator's active tiers
 * /creators/:id/posts – get creator's published posts (gated)
 * /posts/:id – single post (gated)
 */
@RestController
@RequiredArgsConstructor
public class SubscriberController {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TierService tierService;
    private final PostService postService;

    // ── Explore: list creators ─────────────────────────────────────────

    @GetMapping("/explore/creators")
    public ResponseEntity<ApiResponse<Page<UserProfileResponse>>> exploreCreators(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserProfileResponse> creators = userRepository
                .findByRole(Role.CREATOR, pageable)
                .map(this::toProfile);

        return ResponseEntity.ok(ApiResponse.success(creators));
    }

    // ── Creator public profile ─────────────────────────────────────────

    @GetMapping("/creators/{creatorId}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCreatorProfile(
            @PathVariable Long creatorId) {

        User creator = getCreator(creatorId);
        return ResponseEntity.ok(ApiResponse.success(toProfile(creator)));
    }

    // ── Creator public tiers ───────────────────────────────────────────

    @GetMapping("/creators/{creatorId}/tiers")
    public ResponseEntity<ApiResponse<List<TierResponse>>> getCreatorTiers(
            @PathVariable Long creatorId) {

        User creator = getCreator(creatorId);
        return ResponseEntity.ok(ApiResponse.success(tierService.getPublicTiers(creator)));
    }

    // ── Creator public posts (with gating) ────────────────────────────

    @GetMapping("/creators/{creatorId}/posts")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getCreatorPosts(
            @PathVariable Long creatorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User requester) {

        User creator = getCreator(creatorId);
        boolean hasSubscription = requester != null &&
                subscriptionRepository.hasActiveSubscriptionToCreator(requester, creator);

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PostResponse> posts = postService.getPublishedPosts(creator, hasSubscription, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    // ── Single post ────────────────────────────────────────────────────

    @GetMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User requester) {

        boolean hasSubscription = false;
        if (requester != null) {
            // will be checked inside PostService per post's creator
            hasSubscription = true; // PostService re-validates on creator
        }
        PostResponse post = postService.getPost(postId, requester, hasSubscription);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private User getCreator(Long id) {
        return userRepository.findById(id)
                .filter(u -> u.getRole().name().equals("CREATOR"))
                .orElseThrow(() -> new ResourceNotFoundException("Creator", id));
    }

    private UserProfileResponse toProfile(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .bio(u.getBio())
                .avatarUrl(u.getAvatarUrl())
                .suspended(u.isSuspended())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
