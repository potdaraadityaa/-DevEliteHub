package com.develitehub.controller;

import com.develitehub.dto.response.ApiResponse;
import com.develitehub.dto.response.UserProfileResponse;
import com.develitehub.entity.Role;
import com.develitehub.entity.User;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.SubscriptionRepository;
import com.develitehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Admin-only endpoints.
 * All routes require ROLE_ADMIN.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    // ── Stats Overview ─────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCreators", userRepository.countByRole(Role.CREATOR));
        stats.put("totalSubscribers", userRepository.countByRole(Role.SUBSCRIBER));
        stats.put("suspendedUsers", userRepository.countBySuspendedTrue());
        stats.put("totalRevenue", subscriptionRepository.findAll().stream()
                .filter(s -> s.getTier() != null)
                .map(s -> s.getTier().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ── User List ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserProfileResponse>>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserProfileResponse> users;

        if (role != null) {
            Role r = Role.valueOf(role.toUpperCase());
            users = userRepository.findByRole(r, pageable).map(this::toProfile);
        } else {
            users = userRepository.findAll(pageable).map(this::toProfile);
        }

        return ResponseEntity.ok(ApiResponse.success(users));
    }

    // ── Suspend / Unsuspend ────────────────────────────────────────────

    @PatchMapping("/users/{userId}/suspend")
    public ResponseEntity<ApiResponse<UserProfileResponse>> suspendUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "true") boolean suspend,
            @AuthenticationPrincipal User admin) {

        if (userId.equals(admin.getId())) {
            @SuppressWarnings("unchecked")
            ApiResponse<UserProfileResponse> errorResponse = (ApiResponse<UserProfileResponse>) (ApiResponse<?>) ApiResponse
                    .error("Cannot suspend yourself", 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setSuspended(suspend);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(
                toProfile(user),
                suspend ? "User suspended" : "User reinstated"));
    }

    // ── Helper ────────────────────────────────────────────────────────

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
