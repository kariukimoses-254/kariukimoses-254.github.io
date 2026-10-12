-- ============================================================
-- PostgreSQL Schema — fullstack_estate
-- Used by: Node.js/Express (main) + PHP/Laravel
-- ============================================================

CREATE DATABASE IF NOT EXISTS fullstack_estate;

\c fullstack_estate;

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(30),
    license     VARCHAR(30),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price       DECIMAL(12,2) NOT NULL,
    location    VARCHAR(255) NOT NULL,
    type        VARCHAR(20) CHECK (type IN ('house','apartment','land','commercial')),
    bedrooms    INTEGER DEFAULT 0,
    bathrooms   INTEGER DEFAULT 0,
    area        DECIMAL(10,2) DEFAULT 0,
    status      VARCHAR(20) DEFAULT 'available'
                CHECK (status IN ('available','sold','pending')),
    agent_id    INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(20) DEFAULT 'buyer'
                 CHECK (role IN ('admin','buyer','seller')),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price  ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type   ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city   ON properties(location);
CREATE INDEX IF NOT EXISTS idx_agents_email      ON agents(email);