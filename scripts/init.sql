-- ═══════════════════════════════════════════════════════════
--  DevElite Hub – Database Initialization Script
--  Runs once on first Docker MySQL container startup
-- ═══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS develitehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE develitehub;

-- Full-text search and proper unicode support
SET GLOBAL max_allowed_packet = 67108864;  -- 64MB for large content
