package com.develitehub.repository;

import com.develitehub.entity.Post;
import com.develitehub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // All published posts by a creator (paginated)
    Page<Post> findByCreatorAndPublishedTrueOrderByCreatedAtDesc(User creator, Pageable pageable);

    // Free published posts by a creator (no tier required)
    Page<Post> findByCreatorAndPublishedTrueAndTierIsNullOrderByCreatedAtDesc(User creator, Pageable pageable);

    // All posts by creator (including drafts – for creator dashboard)
    Page<Post> findByCreatorOrderByCreatedAtDesc(User creator, Pageable pageable);

    // Count posts by creator
    long countByCreator(User creator);

    long countByCreatorAndPublishedTrue(User creator);

    // Increment view count atomically
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(Long id);
}
