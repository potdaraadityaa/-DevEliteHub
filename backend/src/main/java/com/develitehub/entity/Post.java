package com.develitehub.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * A piece of content uploaded by a creator.
 * Can be free (visible to all) or premium (requires active subscription).
 * Supports text content + optional file attachment (stored in S3 – Phase 6).
 */
@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_post_creator", columnList = "creator_id"),
        @Index(name = "idx_post_tier", columnList = "tier_id"),
        @Index(name = "idx_post_published", columnList = "published")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    /**
     * If null → free post (visible to everyone).
     * If set → premium post (only subscribers to this tier or above).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id")
    private SubscriptionTier tier;

    @Column(nullable = false, length = 200)
    private String title;

    // Rich text content (HTML or Markdown)
    @Column(columnDefinition = "TEXT")
    private String content;

    // Comma-separated tags for search/filter
    @Column(length = 500)
    private String tags;

    // ── File attachment (Phase 6 – S3) ──────────────────────────────
    // S3 object key (not full URL — URL generated on-demand as presigned)
    @Column(length = 512)
    private String fileKey;

    @Column(length = 200)
    private String fileName;

    @Column(length = 100)
    private String fileType; // MIME type

    private Long fileSizeBytes;

    // ── Publishing ────────────────────────────────────────────────────
    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean premium = false; // true = requires subscription

    // View count (incremented on each read, eventually-consistent)
    @Column(nullable = false)
    @Builder.Default
    private Long viewCount = 0L;
}
