package com.develitehub.controller;

import com.develitehub.dto.request.LoginRequest;
import com.develitehub.dto.request.RegisterRequest;
import com.develitehub.dto.response.ApiResponse;
import com.develitehub.dto.response.AuthResponse;
import com.develitehub.dto.response.UserProfileResponse;
import com.develitehub.entity.User;
import com.develitehub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints – public (no JWT required).
 * POST /api/auth/register
 * POST /api/auth/login
 * GET /api/auth/me (requires token)
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Account created successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {

        UserProfileResponse profile = authService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
