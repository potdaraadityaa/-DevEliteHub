package com.develitehub.dto.response;

import com.develitehub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Public-facing user profile DTO.
 * Never exposes password or internal Stripe/AWS fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String bio;
    private String avatarUrl;
    private boolean suspended;
    private LocalDateTime createdAt;
}
