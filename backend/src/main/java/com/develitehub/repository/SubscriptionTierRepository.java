package com.develitehub.repository;

import com.develitehub.entity.SubscriptionTier;
import com.develitehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionTierRepository extends JpaRepository<SubscriptionTier, Long> {

    List<SubscriptionTier> findByCreatorAndActiveTrueOrderBySortOrderAsc(User creator);

    List<SubscriptionTier> findByCreatorOrderBySortOrderAsc(User creator);

    Optional<SubscriptionTier> findByIdAndCreator(Long id, User creator);

    boolean existsByIdAndCreator(Long id, User creator);
}
