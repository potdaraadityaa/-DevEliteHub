package com.develitehub.entity;

/**
 * Platform roles for Role-Based Access Control (RBAC).
 * Used as Spring Security GrantedAuthority names.
 */
public enum Role {
    ADMIN,
    CREATOR,
    SUBSCRIBER
}
