package com.develitehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * DevElite Hub – Developer Creator Subscription Platform
 * Entry point for the Spring Boot backend application.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableConfigurationProperties
public class DevEliteHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevEliteHubApplication.class, args);
    }
}
