package com.develitehub.service;

import com.develitehub.dto.request.PostRequest;
import com.develitehub.dto.response.PostResponse;
import com.develitehub.entity.Post;
import com.develitehub.entity.SubscriptionTier;
import com.develitehub.entity.User;
import com.develitehub.exception.ForbiddenException;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.PostRepository;
import com.develitehub.repository.SubscriptionTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Business logic for creator posts.
 * Content gating (premium lock) is enforced here and in Phase 5.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final SubscriptionTierRepository tierRepository;

    // ── Create ────────────────────────────────────────────────────────

    @Transactional
    public PostResponse createPost(PostRequest request, User creator) {
        SubscriptionTier tier = resolveTier(request.getTierId(), creator);

        Post post = Post.builder()
                .creator(creator)
                .tier(tier)
                .title(request.getTitle())
                .content(request.getContent())
                .tags(request.getTags())
                .premium(tier != null || request.isPremium())
                .published(request.isPublished())
                .viewCount(0L)
                .build();

        postRepository.save(post);
        log.info("Post '{}' created by {}", post.getTitle(), creator.getEmail());
        return toResponse(post, true);
    }

    // ── Creator Dashboard List ────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PostResponse> getCreatorPosts(User creator, Pageable pageable) {
        return postRepository
                .findByCreatorOrderByCreatedAtDesc(creator, pageable)
                .map(p -> toResponse(p, true)); // full content for creator
    }

    // ── Public: Published Posts by Creator (with gating) ─────────────

    @Transactional(readOnly = true)
    public Page<PostResponse> getPublishedPosts(User creator, boolean hasSubscription, Pageable pageable) {
        return postRepository
                .findByCreatorAndPublishedTrueOrderByCreatedAtDesc(creator, pageable)
                .map(p -> toResponse(p, !p.isPremium() || hasSubscription));
    }

    // ── Get Single Post ────────────────────────────────────────────────

    @Transactional
    public PostResponse getPost(Long postId, User requester, boolean hasSubscription) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));

        boolean isOwner = post.getCreator().getId().equals(requester.getId());
        boolean canRead = isOwner || !post.isPremium() || hasSubscription;

        if (!post.isPublished() && !isOwner) {
            throw new ForbiddenException("This post is not published");
        }

        postRepository.incrementViewCount(postId);
        return toResponse(post, canRead);
    }

    // ── Update ────────────────────────────────────────────────────────

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request, User creator) {
        Post post = getOwnedPost(postId, creator);
        SubscriptionTier tier = resolveTier(request.getTierId(), creator);

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setTags(request.getTags());
        post.setTier(tier);
        post.setPremium(tier != null || request.isPremium());
        post.setPublished(request.isPublished());
        return toResponse(post, true);
    }

    // ── Delete ────────────────────────────────────────────────────────

    @Transactional
    public void deletePost(Long postId, User creator) {
        Post post = getOwnedPost(postId, creator);
        postRepository.delete(post);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private Post getOwnedPost(Long postId, User creator) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));
        if (!post.getCreator().getId().equals(creator.getId())) {
            throw new ForbiddenException("You do not own this post");
        }
        return post;
    }

    private SubscriptionTier resolveTier(Long tierId, User creator) {
        if (tierId == null)
            return null;
        return tierRepository.findByIdAndCreator(tierId, creator)
                .orElseThrow(() -> new ResourceNotFoundException("Tier", tierId));
    }

    private List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank())
            return List.of();
        return Arrays.asList(tags.split(","));
    }

    public PostResponse toResponse(Post p, boolean includeContent) {
        return PostResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .content(includeContent ? p.getContent() : null)
                .tags(parseTags(p.getTags()))
                .premium(p.isPremium())
                .published(p.isPublished())
                .viewCount(p.getViewCount())
                .tierId(p.getTier() != null ? p.getTier().getId() : null)
                .tierName(p.getTier() != null ? p.getTier().getName() : null)
                .fileName(p.getFileName())
                .fileType(p.getFileType())
                .fileSizeBytes(p.getFileSizeBytes())
                .creatorId(p.getCreator().getId())
                .creatorName(p.getCreator().getFullName())
                .creatorAvatar(p.getCreator().getAvatarUrl())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
