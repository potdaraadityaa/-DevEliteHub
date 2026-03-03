package com.develitehub.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for creating or updating a subscription tier.
 */
@Data
public class TierRequest {

    @NotBlank(message = "Tier name is required")
    @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.99", message = "Minimum price is $0.99")
    @DecimalMax(value = "9999.00", message = "Maximum price is $9999.00")
    @Digits(integer = 6, fraction = 2, message = "Invalid price format")
    private BigDecimal price;

    // List of feature bullets (e.g. ["Weekly posts", "Code samples"])
    private List<@NotBlank String> perks;

    @Min(0)
    @Max(100)
    private Integer sortOrder = 0;
}
