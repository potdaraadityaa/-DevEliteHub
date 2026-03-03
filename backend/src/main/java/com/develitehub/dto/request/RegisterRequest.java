package com.develitehub.dto.request;

import com.develitehub.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Registration request DTO.
 * Role must be CREATOR or SUBSCRIBER (ADMIN is not self-registerable).
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 180)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be 8-72 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit")
    private String password;

    @NotNull(message = "Role is required")
    private Role role; // CREATOR or SUBSCRIBER only

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio; // optional, for creators
}
