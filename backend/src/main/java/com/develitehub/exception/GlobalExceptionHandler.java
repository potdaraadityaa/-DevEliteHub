package com.develitehub.exception;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.develitehub.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Centralised exception handler for the entire API.
 * Converts exceptions to consistent ApiResponse JSON.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        // ── Domain exceptions ─────────────────────────────────────────────

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleNotFound(
                        ResourceNotFoundException ex, WebRequest request) {
                log.warn("Resource not found: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ex.getMessage(), HttpStatus.NOT_FOUND.value()));
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ApiResponse<Void>> handleConflict(
                        ConflictException ex, WebRequest request) {
                log.warn("Conflict: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.error(ex.getMessage(), HttpStatus.CONFLICT.value()));
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadRequest(
                        BadRequestException ex, WebRequest request) {
                log.warn("Bad request: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }

        @ExceptionHandler(ForbiddenException.class)
        public ResponseEntity<ApiResponse<Void>> handleForbidden(
                        ForbiddenException ex, WebRequest request) {
                log.warn("Forbidden: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error(ex.getMessage(), HttpStatus.FORBIDDEN.value()));
        }

        @ExceptionHandler(PaymentException.class)
        public ResponseEntity<ApiResponse<Void>> handlePayment(
                        PaymentException ex, WebRequest request) {
                log.error("Payment error: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                                .body(ApiResponse.error(ex.getMessage(), HttpStatus.PAYMENT_REQUIRED.value()));
        }

        // ── Spring Security exceptions ─────────────────────────────────────

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<Void>> handleAccessDenied(
                        AccessDeniedException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("Access denied", HttpStatus.FORBIDDEN.value()));
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadCredentials(
                        BadCredentialsException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("Invalid credentials", HttpStatus.UNAUTHORIZED.value()));
        }

        // ── Validation exception ──────────────────────────────────────────

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
                        MethodArgumentNotValidException ex) {
                Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                                .collect(Collectors.toMap(
                                                FieldError::getField,
                                                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage()
                                                                : "Invalid value",
                                                (a, b) -> a));
                log.warn("Validation failed: {}", errors);
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                                .body(ApiResponse.validationError(errors));
        }

        // ── Fallback ──────────────────────────────────────────────────────

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGeneric(
                        Exception ex, WebRequest request) {
                log.error("Unhandled exception: {}", ex.getMessage(), ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("An internal server error occurred",
                                                HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
}
