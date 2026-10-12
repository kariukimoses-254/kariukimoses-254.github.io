-- ============================================================
-- PostgreSQL Seed Data — fullstack_estate
-- ============================================================

INSERT INTO agents (name, email, phone, license) VALUES
  ('Sarah Mitchell', 'sarah@estate.dev', '+1-555-0101', 'LA-2481'),
  ('James Rodriguez', 'james@estate.dev', '+1-555-0102', 'LA-2482'),
  ('Emily Chen', 'emily@estate.dev', '+1-555-0103', 'LA-2483'),
  ('Rachel Adams', 'rachel@estate.dev', '+1-555-0401', 'TX-10101'),
  ('David Kim', 'david@estate.dev', '+1-555-0402', 'TX-10102')
ON CONFLICT (email) DO NOTHING;

INSERT INTO properties (title, description, price, location, type, bedrooms, bathrooms, area, status, agent_id) VALUES
  ('Modern Downtown Loft', 'Sleek urban loft with floor-to-ceiling windows and open concept living.', 425000, 'Austin, TX', 'apartment', 2, 2, 1180, 'available', 1),
  ('Family Home with Garden', 'Spacious 4-bedroom family home on a quiet cul-de-sac.', 675000, 'Portland, OR', 'house', 4, 3, 2450, 'available', 2),
  ('Commercial Retail Space', 'Prime retail corner lot in the heart of the business district.', 1200000, 'Seattle, WA', 'commercial', 0, 2, 3800, 'available', 3),
  ('Hilltop Estate with Views', 'Grand estate on a hilltop with panoramic valley views.', 3200000, 'Beverly Hills, CA', 'house', 7, 8, 8900, 'available', 4),
  ('Urban Condo with Amenities', 'Modern condo with rooftop pool and gym access.', 540000, 'Chicago, IL', 'apartment', 2, 2, 1150, 'pending', 5)
ON CONFLICT DO NOTHING;