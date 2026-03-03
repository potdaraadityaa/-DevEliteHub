package com.develitehub.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Post response DTO.
 * When a post is premium and the requester is not subscribed,
 * the 'content' field will be null (gated in service layer – Phase 5).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String content; // null if premium & not subscribed
    private List<String> tags;
    private boolean premium;
    private boolean published;
    private Long viewCount;

    // Tier info (if premium)
    private Long tierId;
    private String tierName;

    // File attachment info (Phase 6 – presigned URL filled in service)
    private String fileName;
    private String fileType;
    private Long fileSizeBytes;
    private String fileUrl; // presigned S3 URL (populated on request)

    // Creator info
    private Long creatorId;
    private String creatorName;
    private String creatorAvatar;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
