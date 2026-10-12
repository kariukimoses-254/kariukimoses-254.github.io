-- ============================================================
-- MySQL Schema — fullstack_estate_mysql
-- Used by: Java (Spring Boot) + PHP/Laravel (tour_visitors)
-- ============================================================

CREATE DATABASE IF NOT EXISTS fullstack_estate_mysql
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fullstack_estate_mysql;

-- Java / Spring Boot entities (auto-managed by Hibernate, but kept here as reference)
CREATE TABLE IF NOT EXISTS listings (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    price        DOUBLE NOT NULL,
    location     VARCHAR(255),
    status       VARCHAR(20) DEFAULT 'available',
    bedrooms     INT DEFAULT 0,
    bathrooms    INT DEFAULT 0,
    area_sqft    DOUBLE DEFAULT 0
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS agents (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(30),
    specialty  VARCHAR(100)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS customers (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(30),
    preferences VARCHAR(500)
) ENGINE = InnoDB;

-- PHP / Laravel (TourVisitor model)
CREATE TABLE IF NOT EXISTS tour_visitors (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                  VARCHAR(255) NOT NULL,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    phone                 VARCHAR(30),
    preferred_tour_time   DATETIME NULL,
    property_interest     VARCHAR(255),
    created_at            TIMESTAMP NULL,
    updated_at            TIMESTAMP NULL
) ENGINE = InnoDB;

-- Indexes
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price  ON listings(price);