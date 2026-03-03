package com.develitehub.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request DTO for creating or updating a post.
 * File upload is handled via a separate multipart endpoint (Phase 6).
 */
@Data
public class PostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be 5–200 characters")
    private String title;

    @Size(max = 100000, message = "Content too long")
    private String content;

    // Comma-separated tags
    @Size(max = 500)
    private String tags;

    // null = free post; provide tier ID for premium post
    private Long tierId;

    private boolean published = false;
    private boolean premium = false;
}
