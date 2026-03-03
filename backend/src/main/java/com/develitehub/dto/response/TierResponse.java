package com.develitehub.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Public-facing subscription tier DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TierResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private List<String> perks;
    private boolean active;
    private Integer sortOrder;
    private String stripePriceId; // exposed so frontend can pass to Stripe
    private LocalDateTime createdAt;
}
