package com.develitehub.dto.response;

import com.develitehub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned after successful login or registration.
 * Contains JWT tokens and basic user profile info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;

    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private String avatarUrl;
}
