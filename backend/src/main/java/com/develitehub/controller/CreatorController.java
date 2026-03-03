package com.develitehub.controller;

import com.develitehub.dto.request.PostRequest;
import com.develitehub.dto.request.TierRequest;
import com.develitehub.dto.response.ApiResponse;
import com.develitehub.dto.response.PostResponse;
import com.develitehub.dto.response.TierResponse;
import com.develitehub.entity.User;
import com.develitehub.service.PostService;
import com.develitehub.service.TierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * All creator-only endpoints.
 * Base path: /api/creator
 * All routes require ROLE_CREATOR via @PreAuthorize.
 */
@RestController
@RequestMapping("/creator")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CREATOR')")
public class CreatorController {

    private final TierService tierService;
    private final PostService postService;

    // ═══════════════════════════════════════════════════════════════
    // TIER ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    @PostMapping("/tiers")
    public ResponseEntity<ApiResponse<TierResponse>> createTier(
            @Valid @RequestBody TierRequest request,
            @AuthenticationPrincipal User creator) {

        TierResponse tier = tierService.createTier(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(tier, "Tier created successfully"));
    }

    @GetMapping("/tiers")
    public ResponseEntity<ApiResponse<List<TierResponse>>> getMyTiers(
            @AuthenticationPrincipal User creator) {

        return ResponseEntity.ok(ApiResponse.success(tierService.getCreatorTiers(creator)));
    }

    @PutMapping("/tiers/{tierId}")
    public ResponseEntity<ApiResponse<TierResponse>> updateTier(
            @PathVariable Long tierId,
            @Valid @RequestBody TierRequest request,
            @AuthenticationPrincipal User creator) {

        return ResponseEntity.ok(ApiResponse.success(
                tierService.updateTier(tierId, request, creator),
                "Tier updated"));
    }

    @PatchMapping("/tiers/{tierId}/toggle")
    public ResponseEntity<ApiResponse<TierResponse>> toggleTier(
            @PathVariable Long tierId,
            @AuthenticationPrincipal User creator) {

        return ResponseEntity.ok(ApiResponse.success(tierService.toggleActive(tierId, creator)));
    }

    @DeleteMapping("/tiers/{tierId}")
    public ResponseEntity<ApiResponse<Void>> deleteTier(
            @PathVariable Long tierId,
            @AuthenticationPrincipal User creator) {

        tierService.deleteTier(tierId, creator);
        return ResponseEntity.ok(ApiResponse.success(null, "Tier deleted"));
    }

    // ═══════════════════════════════════════════════════════════════
    // POST ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal User creator) {

        PostResponse post = postService.createPost(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(post, "Post created successfully"));
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User creator) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(postService.getCreatorPosts(creator, pageable)));
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal User creator) {

        return ResponseEntity.ok(ApiResponse.success(
                postService.updatePost(postId, request, creator),
                "Post updated"));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User creator) {

        postService.deletePost(postId, creator);
        return ResponseEntity.ok(ApiResponse.success(null, "Post deleted"));
    }

    // ── Dashboard Summary ─────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats(
            @AuthenticationPrincipal User creator) {

        var stats = new java.util.HashMap<String, Object>();
        // Phase 4 will add subscriber + revenue stats
        stats.put("totalPosts", postService.getCreatorPosts(creator,
                PageRequest.of(0, 1)).getTotalElements());
        stats.put("totalTiers", tierService.getCreatorTiers(creator).size());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
