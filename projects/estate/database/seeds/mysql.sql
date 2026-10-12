-- ============================================================
-- MySQL Seed Data — fullstack_estate_mysql
-- ============================================================

USE fullstack_estate_mysql;

INSERT IGNORE INTO agents (name, email, phone, specialty) VALUES
  ('Isabella Torres', 'isabella@estate.dev', '+1-555-0201', 'Luxury Homes'),
  ('Marcus Webb', 'marcus@estate.dev', '+1-555-0202', 'Waterfront Properties');

INSERT IGNORE INTO customers (name, email, phone, preferences) VALUES
  ('Olivia Bennett', 'olivia@example.com', '+1-555-0301', 'waterfront, 4+ bedrooms'),
  ('Noah Sullivan', 'noah@example.com', '+1-555-0302', 'condo, downtown, 2 bedrooms');

INSERT IGNORE INTO tour_visitors (name, email, phone, preferred_tour_time, property_interest, created_at, updated_at) VALUES
  ('Grace Park', 'grace@example.com', '+1-555-0501', NOW() + INTERVAL 3 DAY, 'Beverly Hills estate', NOW(), NOW()),
  ('Liam Foster', 'liam@example.com', '+1-555-0502', NOW() + INTERVAL 5 DAY, 'Chicago condo', NOW(), NOW());