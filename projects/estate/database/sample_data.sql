-- ============================================
-- Lil Mosey Estate 6G Edition - Sample Data
-- Version: 1.0
-- Description: Sample data for testing
-- ============================================

USE lil_mosey_estate;

-- ============================================
-- ROLES
-- ============================================
INSERT INTO roles (role_name, description) VALUES
('admin', 'System Administrator with full access'),
('agent', 'Real Estate Agent'),
('customer', 'Regular Customer');

-- ============================================
-- PERMISSIONS
-- ============================================
INSERT INTO permissions (permission_name, description) VALUES
('manage_users', 'Create, update, delete users'),
('manage_properties', 'Create, update, delete properties'),
('manage_agents', 'Manage agent accounts'),
('manage_customers', 'Manage customer accounts'),
('manage_bookings', 'Manage property bookings'),
('manage_payments', 'Process and manage payments'),
('manage_reviews', 'Approve and manage reviews'),
('manage_settings', 'Manage system settings'),
('view_reports', 'View analytics and reports'),
('manage_messages', 'Manage contact messages'),
('manage_maintenance', 'Manage maintenance requests'),
('manage_email_templates', 'Manage email templates');

-- ============================================
-- ROLE PERMISSIONS
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12),
(2, 2), (2, 5), (2, 6), (2, 10), (2, 11),
(3, 5), (3, 6);

-- ============================================
-- USERS (Password: Password@123)
-- ============================================
INSERT INTO users (first_name, last_name, email, password_hash, phone, role_id, is_verified, is_active) VALUES
('Admin', 'User', 'admin@lilmoseyestate.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000001', 1, 1, 1),
('John', 'Kamau', 'john.kamau@lilmoseyestate.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000002', 2, 1, 1),
('Sarah', 'Wanjiku', 'sarah.wanjiku@lilmoseyestate.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000003', 2, 1, 1),
('Peter', 'Otieno', 'peter.otieno@lilmoseyestate.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000004', 2, 1, 1),
('Grace', 'Njeri', 'grace.njeri@email.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000005', 3, 1, 1),
('David', 'Mwangi', 'david.mwangi@email.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000006', 3, 1, 1),
('Mary', 'Akinyi', 'mary.akinyi@email.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000007', 3, 1, 1),
('James', 'Ochieng', 'james.ochieng@email.com', '$2b$10$YourHashedPasswordHere1234567890123456789012345', '+254700000008', 3, 1, 1);

-- ============================================
-- AGENTS
-- ============================================
INSERT INTO agents (user_id, license_number, agency_name, bio, specialization, experience_years, commission_rate, total_sales, total_rentals, rating, is_verified, is_featured) VALUES
(2, 'AG-2024-001', 'Kamau Properties', 'Experienced real estate agent specializing in luxury homes and commercial properties in Nairobi.', 'Luxury Homes', 8, 2.50, 45, 23, 4.80, 1, 1),
(3, 'AG-2024-002', 'Wanjiku Estates', 'Passionate about helping clients find their dream homes. Specializing in residential properties.', 'Residential', 5, 2.00, 32, 18, 4.60, 1, 1),
(4, 'AG-2024-003', 'Otieno Realty', 'Commercial real estate expert with deep knowledge of the Kenyan market.', 'Commercial', 10, 3.00, 58, 31, 4.90, 1, 1);

-- ============================================
-- CUSTOMERS
-- ============================================
INSERT INTO customers (user_id, id_number, gender, occupation, preferred_property_type, preferred_location, budget_min, budget_max) VALUES
(5, 'ID-12345678', 'female', 'Software Engineer', 'Apartment', 'Westlands', 5000000, 15000000),
(6, 'ID-23456789', 'male', 'Business Owner', 'Villa', 'Karen', 20000000, 50000000),
(7, 'ID-34567890', 'female', 'Doctor', 'Townhouse', 'Kilimani', 10000000, 25000000),
(8, 'ID-45678901', 'male', 'Teacher', 'Apartment', 'Kasarani', 3000000, 8000000);

-- ============================================
-- PROPERTY TYPES
-- ============================================
INSERT INTO property_types (type_name, description, icon) VALUES
('Apartment', 'Multi-unit residential building', 'fa-building'),
('Villa', 'Luxury standalone house', 'fa-home'),
('Townhouse', 'Multi-floor attached house', 'fa-city'),
('Bungalow', 'Single-story house', 'fa-house-chimney'),
('Penthouse', 'Top-floor luxury apartment', 'fa-star'),
('Studio', 'Small open-plan apartment', 'fa-door-open'),
('Duplex', 'Two-story apartment', 'fa-layer-group'),
('Mansion', 'Large luxury residence', 'fa-castle');

-- ============================================
-- PROPERTY CATEGORIES
-- ============================================
INSERT INTO property_categories (category_name, description, icon) VALUES
('Residential', 'Properties for living', 'fa-house-user'),
('Commercial', 'Business properties', 'fa-briefcase'),
('Industrial', 'Warehouses and factories', 'fa-industry'),
('Land', 'Plots and parcels', 'fa-mountain'),
('Mixed Use', 'Combined residential and commercial', 'fa-building');

-- ============================================
-- AMENITIES
-- ============================================
INSERT INTO amenities (amenity_name, icon, category) VALUES
('Swimming Pool', 'fa-swimming-pool', 'Leisure'),
('Gym/Fitness Center', 'fa-dumbbell', 'Leisure'),
('Parking', 'fa-square-parking', 'Essential'),
('24/7 Security', 'fa-shield-halved', 'Security'),
('CCTV Surveillance', 'fa-video', 'Security'),
('Gated Community', 'fa-door-closed', 'Security'),
('Garden', 'fa-seedling', 'Outdoor'),
('Rooftop Terrace', 'fa-cloud', 'Outdoor'),
('Balcony', 'fa-person-walking', 'Outdoor'),
('Elevator', 'fa-elevator', 'Essential'),
('Backup Generator', 'fa-car-battery', 'Essential'),
('Water Tank', 'fa-faucet-drip', 'Essential'),
('Internet/WiFi', 'fa-wifi', 'Essential'),
('Air Conditioning', 'fa-snowflake', 'Comfort'),
('Built-in Wardrobes', 'fa-shirt', 'Comfort'),
('Modern Kitchen', 'fa-kitchen-set', 'Comfort'),
('Fireplace', 'fa-fire', 'Comfort'),
('Laundry Room', 'fa-sink', 'Essential'),
('Storage Room', 'fa-box', 'Essential'),
('Children Play Area', 'fa-children', 'Leisure'),
('Club House', 'fa-champagne-glasses', 'Leisure'),
('Concierge Service', 'fa-bell-concierge', 'Luxury'),
('Pet Friendly', 'fa-paw', 'Lifestyle'),
('Solar Panels', 'fa-solar-panel', 'Green'),
('Smart Home System', 'fa-house-signal', 'Technology'),
('6G Smart Home', 'fas fa-tower-broadcast', 'technology');

-- ============================================
-- PROPERTIES
-- ============================================
INSERT INTO properties (agent_id, type_id, category_id, title, description, price, status, purpose, bedrooms, bathrooms, kitchens, parking_spaces, area_sqft, year_built, address, county, city, state, zip_code, country, latitude, longitude, is_featured, is_approved, views_count) VALUES
(1, 1, 1, 'Luxury 3BR Apartment in Westlands', 'Stunning modern apartment with panoramic city views. Features include open-plan living, imported Italian marble floors, German kitchen appliances, and a private balcony. Located in the heart of Westlands with easy access to shopping malls and restaurants.', 15000000, 'available', 'sale', 3, 3, 1, 2, 1800, 2022, 'Westlands Business Park, Waiyaki Way', 'Nairobi', 'Westlands', 'Nairobi County', '00100', 'Kenya', -1.2676, 36.8031, 1, 1, 245),
(1, 2, 1, 'Exquisite 5BR Villa in Karen', 'Magnificent villa set on half an acre of manicured gardens. Features a heated infinity pool, home theater, wine cellar, chef''s kitchen, and staff quarters. The property is enclosed with high security walls and electric fencing.', 45000000, 'available', 'sale', 5, 6, 2, 4, 5500, 2021, 'Karen Road, Near Karen Country Club', 'Nairobi', 'Karen', 'Nairobi County', '00500', 'Kenya', -1.3202, 36.7129, 1, 1, 189),
(2, 3, 1, 'Modern 4BR Townhouse in Kilimani', 'Contemporary townhouse in a secure gated community. Features include a private garden, modern kitchen with island counter, ensuite bedrooms, and a study room. Close to Yaya Center and major hospitals.', 18000000, 'available', 'sale', 4, 4, 1, 2, 2800, 2023, 'Kilimani Estate, Kindaruma Road', 'Nairobi', 'Kilimani', 'Nairobi County', '00100', 'Kenya', -1.2921, 36.7848, 1, 1, 156),
(2, 1, 1, 'Cozy 2BR Apartment in Lavington', 'Well-designed apartment in a quiet neighborhood. Features modern finishes, ample parking, and a communal garden. Perfect for young professionals and small families.', 8500000, 'available', 'sale', 2, 2, 1, 1, 1200, 2020, 'Lavington Green, James Gichuru Road', 'Nairobi', 'Lavington', 'Nairobi County', '00600', 'Kenya', -1.2847, 36.7736, 0, 1, 98),
(3, 4, 1, 'Elegant 3BR Bungalow in Runda', 'Single-story luxury home on a spacious plot. Features include a lush garden, servant quarters, double garage, and modern fittings throughout. Located in the prestigious Runda estate.', 32000000, 'available', 'sale', 3, 3, 1, 3, 3200, 2019, 'Runda Estate, Kiambu Road', 'Kiambu', 'Runda', 'Kiambu County', '00100', 'Kenya', -1.2347, 36.8027, 1, 1, 134),
(1, 5, 1, 'Penthouse Suite in CBD', 'Exclusive penthouse with 360-degree Nairobi skyline views. Features include a private rooftop terrace, jacuzzi, premium finishes, and smart home automation. The ultimate urban living experience.', 55000000, 'available', 'sale', 4, 5, 1, 3, 4200, 2024, 'Kenyatta Avenue, CBD', 'Nairobi', 'CBD', 'Nairobi County', '00100', 'Kenya', -1.2864, 36.8172, 1, 1, 312),
(3, 1, 1, 'Spacious 2BR Apartment for Rent', 'Affordable yet modern apartment in a secure compound. Includes shared amenities like gym and pool. Perfect for rental investment or personal use.', 65000, 'available', 'rent', 2, 2, 1, 1, 1100, 2021, 'South B, Mombasa Road', 'Nairobi', 'South B', 'Nairobi County', '00100', 'Kenya', -1.3100, 36.8300, 0, 1, 87),
(2, 1, 1, 'Furnished 1BR Studio in CBD', 'Fully furnished studio apartment ideal for young professionals. Includes all utilities and is walking distance to major offices and transport hubs.', 45000, 'available', 'rent', 1, 1, 1, 0, 600, 2023, 'Moi Avenue, CBD', 'Nairobi', 'CBD', 'Nairobi County', '00100', 'Kenya', -1.2837, 36.8190, 0, 1, 65),
(3, 7, 1, 'Luxury Duplex in Langata', 'Stunning duplex with breathtaking views of Nairobi National Park. Features include a private garden, modern kitchen, spacious living areas, and staff quarters.', 28000000, 'available', 'sale', 4, 4, 2, 3, 3800, 2022, 'Langata Road, Near National Park', 'Nairobi', 'Langata', 'Nairobi County', '00100', 'Kenya', -1.3352, 36.7821, 1, 1, 198),
(1, 2, 1, 'Beachfront Villa in Diani', 'Paradise found! This stunning beachfront villa offers direct access to Diani Beach. Features include an infinity pool overlooking the Indian Ocean, tropical gardens, and luxury finishes throughout.', 65000000, 'available', 'sale', 6, 5, 2, 3, 6500, 2023, 'Diani Beach Road, Ukunda', 'Kwale', 'Diani', 'Kwale County', '80401', 'Kenya', -4.1747, 39.5914, 1, 1, 421),
(1, 2, 1, 'Executive 4BR Apartment in Kileleshwa', 'Elegant executive apartment in the leafy suburb of Kileleshwa. Open-plan living, floor-to-ceiling windows, fitted kitchen with granite counters, and a spacious balcony overlooking the city.', 22000000, 'available', 'sale', 4, 4, 1, 2, 2600, 2022, 'Kileleshwa, Ring Road', 'Nairobi', 'Kileleshwa', 'Nairobi County', '00502', 'Kenya', -1.2727, 36.7909, 0, 1, 142),
(2, 6, 1, 'Charming 3BR Cottage in Karen', 'Beautifully landscaped cottage in the serene Karen suburb. Features a sunlit garden, private driveway, modern kitchen and a cozy fireplace for cold Nairobi evenings.', 29000000, 'available', 'sale', 3, 3, 1, 2, 2400, 2018, 'Karen, Bogani Road', 'Nairobi', 'Karen', 'Nairobi County', '00500', 'Kenya', -1.3150, 36.7000, 0, 1, 88),
(3, 1, 1, 'Modern 2BR Apartment in South C', 'Contemporary apartment in the bustling South C estate. Secure compound with gym, kids play area, and convenient access to downtown Nairobi.', 12000000, 'available', 'sale', 2, 2, 1, 1, 1300, 2023, 'South C, Mombasa Road', 'Nairobi', 'South C', 'Nairobi County', '00100', 'Kenya', -1.3130, 36.8250, 0, 1, 76),
(1, 7, 1, 'Spacious 3BR Duplex in Kilimani', 'Sun-drenched duplex with split-level design. Two private balconies, a dedicated study, and proximity to Yaya Centre, schools and entertainment hotspots.', 24000000, 'available', 'sale', 3, 4, 2, 2, 3000, 2021, 'Kilimani, Rose Avenue', 'Nairobi', 'Kilimani', 'Nairobi County', '00100', 'Kenya', -1.2900, 36.7900, 0, 1, 103),
(2, 1, 1, 'Cozy 1BR Apartment in Parklands', 'Ideal starter home in lively Parklands. Bright open layout, modern finishing, secure compound with ample parking. Walkable to shopping and restaurants.', 7800000, 'available', 'sale', 1, 1, 1, 1, 800, 2020, 'Parklands, Third Avenue', 'Nairobi', 'Parklands', 'Nairobi County', '00100', 'Kenya', -1.2630, 36.8130, 0, 1, 67),
(3, 1, 2, 'Premium Office Space in Westlands', 'Grade-A office suites in a premium Westlands commercial tower. Modern boardroom, high-speed fiber internet, 24/7 security, and ample visitor parking.', 35000000, 'available', 'sale', 0, 2, 0, 4, 4500, 2021, 'Westlands, Mpaka Road', 'Nairobi', 'Westlands', 'Nairobi County', '00100', 'Kenya', -1.2670, 36.8050, 0, 1, 54),
(1, 8, 1, 'Grand 7BR Mansion in Muthaiga', 'A landmark residence in exclusive Muthaiga. Grand double-volume living room, cinema, gym, indoor pool, staff quarters and spectacular landscaped grounds.', 120000000, 'available', 'sale', 7, 8, 2, 6, 9500, 2020, 'Muthaiga, Riverside Drive', 'Nairobi', 'Muthaiga', 'Nairobi County', '00610', 'Kenya', -1.2400, 36.8200, 0, 1, 233),
(2, 4, 4, 'Prime Land Parcel in Machakos', 'Prime 1-acre freehold plot in a fast-growing area. Surveyed, fenced, and ready for development. Ideal for residential or small commercial projects.', 6000000, 'available', 'sale', 0, 0, 0, 0, 43560, 2019, 'Machakos, Konza Road', 'Machakos', 'Machakos', 'Machakos County', '90100', 'Kenya', -1.5170, 37.2630, 0, 1, 91),
(3, 1, 1, 'Furnished 3BR Apartment for Rent', 'Modern furnished apartment in the diplomatic quarter of Gigiri. Fully fitted with quality furniture and appliances. Ideal for expatriates.', 120000, 'available', 'rent', 3, 3, 1, 2, 2000, 2022, 'Gigiri, UN Avenue', 'Nairobi', 'Gigiri', 'Nairobi County', '00618', 'Kenya', -1.2280, 36.8030, 0, 1, 119),
(1, 3, 1, 'Classy 2BR Townhouse in Lavington', 'Stylish townhouse in a gated community off Gitanga Road. Two en-suite bedrooms, compact garden, open-plan kitchen and dedicated parking.', 9500000, 'available', 'sale', 2, 2, 1, 1, 1400, 2021, 'Lavington, Gitanga Road', 'Nairobi', 'Lavington', 'Nairobi County', '00600', 'Kenya', -1.2830, 36.7900, 0, 1, 72);

-- ============================================
-- PROPERTY IMAGES
-- ============================================
INSERT INTO property_images (property_id, image_path, alt_text, is_primary, sort_order) VALUES
(1, 'property-1-1.jpg', 'Luxury Apartment Living Room', 1, 1),
(1, 'property-1-2.jpg', 'Luxury Apartment Kitchen', 0, 2),
(1, 'property-1-3.jpg', 'Luxury Apartment Bedroom', 0, 3),
(2, 'property-2-1.jpg', 'Karen Villa Exterior', 1, 1),
(2, 'property-2-2.jpg', 'Karen Villa Pool', 0, 2),
(2, 'property-2-3.jpg', 'Karen Villa Interior', 0, 3),
(3, 'property-3-1.jpg', 'Kilimani Townhouse', 1, 1),
(3, 'property-3-2.jpg', 'Townhouse Garden', 0, 2),
(3, 'property-3-3.jpg', 'Townhouse Bedroom', 0, 3),
(4, 'property-4-1.jpg', 'Lavington Apartment', 1, 1),
(4, 'property-4-2.jpg', 'Lavington Apartment Kitchen', 0, 2),
(4, 'property-4-3.jpg', 'Lavington Apartment Bedroom', 0, 3),
(5, 'property-5-1.jpg', 'Runda Bungalow', 1, 1),
(5, 'property-5-2.jpg', 'Bungalow Garden', 0, 2),
(5, 'property-5-3.jpg', 'Bungalow Living Room', 0, 3),
(6, 'property-6-1.jpg', 'CBD Penthouse', 1, 1),
(6, 'property-6-2.jpg', 'Penthouse Rooftop', 0, 2),
(6, 'property-6-3.jpg', 'Penthouse Interior', 0, 3),
(7, 'property-7-1.jpg', 'South B Apartment', 1, 1),
(7, 'property-7-2.jpg', 'Apartment Kitchen', 0, 2),
(7, 'property-7-3.jpg', 'Apartment Bedroom', 0, 3),
(8, 'property-8-1.jpg', 'CBD Studio', 1, 1),
(8, 'property-8-2.jpg', 'Studio Bathroom', 0, 2),
(8, 'property-8-3.jpg', 'Studio Kitchen', 0, 3),
(9, 'property-9-1.jpg', 'Langata Duplex', 1, 1),
(9, 'property-9-2.jpg', 'Duplex Living Room', 0, 2),
(9, 'property-9-3.jpg', 'Duplex Garden', 0, 3),
(10, 'property-10-1.jpg', 'Diani Beach Villa', 1, 1),
(10, 'property-10-2.jpg', 'Beach Villa Pool', 0, 2),
(10, 'property-10-3.jpg', 'Beach Villa Bedroom', 0, 3),
(11, 'property-11-1.jpg', 'Kileleshwa Executive Apartment', 1, 1),
(11, 'property-11-2.jpg', 'Kileleshwa Dining Area', 0, 2),
(11, 'property-11-3.jpg', 'Kileleshwa Bedroom', 0, 3),
(12, 'property-12-1.jpg', 'Karen Cottage', 1, 1),
(12, 'property-12-2.jpg', 'Cottage Garden', 0, 2),
(12, 'property-12-3.jpg', 'Cottage Interior', 0, 3),
(13, 'property-13-1.jpg', 'South C Apartment', 1, 1),
(13, 'property-13-2.jpg', 'South C Kitchen', 0, 2),
(13, 'property-13-3.jpg', 'South C Building', 0, 3),
(14, 'property-14-1.jpg', 'Kilimani Duplex', 1, 1),
(14, 'property-14-2.jpg', 'Duplex Living Room', 0, 2),
(14, 'property-14-3.jpg', 'Duplex Garden', 0, 3),
(15, 'property-15-1.jpg', 'Parklands Apartment', 1, 1),
(15, 'property-15-2.jpg', 'Parklands Bedroom', 0, 2),
(15, 'property-15-3.jpg', 'Parklands Bathroom', 0, 3),
(16, 'property-16-1.jpg', 'Westlands Office Space', 1, 1),
(16, 'property-16-2.jpg', 'Office Conference Room', 0, 2),
(16, 'property-16-3.jpg', 'Office Lobby', 0, 3),
(17, 'property-17-1.jpg', 'Muthaiga Mansion', 1, 1),
(17, 'property-17-2.jpg', 'Mansion Exterior', 0, 2),
(17, 'property-17-3.jpg', 'Mansion Interior', 0, 3),
(18, 'property-18-1.jpg', 'Machakos Land Parcel', 1, 1),
(18, 'property-18-2.jpg', 'Land Aerial View', 0, 2),
(18, 'property-18-3.jpg', 'Land Scenery', 0, 3),
(19, 'property-19-1.jpg', 'Gigiri Furnished Apartment', 1, 1),
(19, 'property-19-2.jpg', 'Gigiri Dining Area', 0, 2),
(19, 'property-19-3.jpg', 'Gigiri Interior', 0, 3),
(20, 'property-20-1.jpg', 'Lavington Townhouse', 1, 1),
(20, 'property-20-2.jpg', 'Townhouse Exterior', 0, 2),
(20, 'property-20-3.jpg', 'Townhouse Living Room', 0, 3);

-- ============================================
-- PROPERTY AMENITIES
-- ============================================
INSERT INTO property_amenities (property_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 10), (1, 13), (1, 14), (1, 15), (1, 16),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 10), (2, 11), (2, 12), (2, 14), (2, 16), (2, 17), (2, 22), (2, 25),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 10), (3, 13), (3, 14), (3, 15), (3, 16),
(4, 3), (4, 4), (4, 7), (4, 10), (4, 13), (4, 15), (4, 16),
(5, 3), (5, 4), (5, 7), (5, 11), (5, 12), (5, 14), (5, 16), (5, 17),
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 10), (6, 13), (6, 14), (6, 16), (6, 22), (6, 25),
(7, 3), (7, 4), (7, 7), (7, 10), (7, 13),
(8, 3), (8, 4), (8, 10), (8, 13), (8, 14),
(9, 1), (9, 2), (9, 3), (9, 4), (9, 7), (9, 10), (9, 11), (9, 14), (9, 16), (9, 17), (9, 22),
(10, 1), (10, 3), (10, 4), (10, 7), (10, 8), (10, 12), (10, 14), (10, 23);
INSERT INTO property_amenities (property_id, amenity_id) VALUES
(1, 26), (2, 26), (3, 26), (4, 26), (5, 26), (6, 26), (7, 26), (8, 26), (9, 26), (10, 26),
(11, 4), (11, 13), (11, 26),
(12, 4), (12, 13), (12, 26),
(13, 4), (13, 13), (13, 26),
(14, 4), (14, 13), (14, 26),
(15, 4), (15, 13), (15, 26),
(16, 4), (16, 13), (16, 26),
(17, 4), (17, 13), (17, 26),
(18, 4), (18, 13), (18, 26),
(19, 4), (19, 13), (19, 26),
(20, 4), (20, 13), (20, 26);

-- ============================================
-- BOOKINGS
-- ============================================
INSERT INTO bookings (property_id, customer_id, agent_id, booking_date, booking_time, status, notes) VALUES
(1, 1, 1, '2026-07-25', '10:00:00', 'confirmed', 'Interested in the master bedroom layout'),
(2, 2, 1, '2026-07-26', '14:00:00', 'pending', 'Want to see the garden and pool area'),
(3, 3, 2, '2026-07-24', '11:00:00', 'confirmed', 'First time buyer, needs detailed walkthrough'),
(5, 2, 3, '2026-07-28', '09:00:00', 'pending', 'Planning to view with family'),
(10, 4, 1, '2026-08-01', '15:00:00', 'confirmed', 'Interested in investment property');

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payments (user_id, property_id, amount, payment_method, transaction_id, status, description, invoice_number, receipt_number, paid_at) VALUES
(5, 1, 750000, 'mpesa', 'MPESA-2026-001', 'completed', 'Down payment for Luxury Apartment', 'INV-2026-001', 'REC-2026-001', '2026-07-20 10:30:00'),
(6, 2, 2250000, 'bank_transfer', 'BANK-2026-001', 'completed', 'Deposit for Karen Villa', 'INV-2026-002', 'REC-2026-002', '2026-07-19 14:00:00'),
(7, 3, 900000, 'stripe', 'STR-2026-001', 'completed', 'Down payment for Kilimani Townhouse', 'INV-2026-003', 'REC-2026-003', '2026-07-18 09:15:00'),
(8, 7, 130000, 'mpesa', 'MPESA-2026-002', 'completed', 'Security deposit + 2 months rent', 'INV-2026-004', 'REC-2026-004', '2026-07-17 16:45:00'),
(5, NULL, 25000, 'paypal', 'PAY-2026-001', 'completed', 'Agent consultation fee', 'INV-2026-005', 'REC-2026-005', '2026-07-15 11:00:00');

-- ============================================
-- REVIEWS
-- ============================================
INSERT INTO reviews (user_id, property_id, agent_id, rating, title, comment, is_approved) VALUES
(5, 1, 1, 5, 'Amazing Apartment!', 'The apartment exceeded my expectations. John was very professional and helpful throughout the viewing process.', 1),
(6, 2, 1, 5, 'Dream Home Found', 'The villa is absolutely stunning. Kamau Properties delivered an exceptional experience.', 1),
(7, 3, 2, 4, 'Great Townhouse', 'Beautiful property with modern finishes. Sarah was very knowledgeable about the area.', 1),
(8, 7, 3, 4, 'Good Value Rental', 'Clean, well-maintained apartment. Peter helped with all the paperwork efficiently.', 1),
(5, NULL, 3, 5, 'Excellent Agent', 'Very professional and responsive. Highly recommend Otieno Realty.', 0);

-- ============================================
-- MESSAGES
-- ============================================
INSERT INTO messages (sender_id, receiver_id, property_id, subject, message, is_read) VALUES
(5, 2, 1, 'Inquiry about Westlands Apartment', 'Hi, I would like to schedule a viewing for the Westlands apartment. Is it still available?', 1),
(2, 5, 1, 'Re: Inquiry about Westlands Apartment', 'Hello Grace! Yes, the apartment is still available. I have scheduled a viewing for you on July 25th at 10 AM. Looking forward to meeting you!', 1),
(6, 2, 2, 'Karen Villa Question', 'What is the exact plot size for the Karen villa?', 0),
(7, 3, 3, 'Negotiation Request', 'Would the seller consider a price of 16M for the Kilimani townhouse?', 0);

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'New Booking Request', 'You have a new booking request for Luxury Apartment in Westlands', 'info', 1),
(2, 'Message Received', 'Grace Njeri sent you a message about Westlands Apartment', 'info', 1),
(3, 'New Booking Request', 'New booking for 4BR Townhouse in Kilimani', 'info', 0),
(5, 'Booking Confirmed', 'Your booking for Westlands Apartment has been confirmed for July 25th', 'success', 0),
(6, 'Payment Received', 'Payment of KES 2,250,000 received for Karen Villa deposit', 'success', 0),
(1, 'New Property Listed', 'A new property has been listed and needs approval', 'warning', 0),
(5, 'Welcome!', 'Welcome to Lil Mosey Estate 6G Edition! Start exploring properties today.', 'success', 1);

-- ============================================
-- CONTACT MESSAGES
-- ============================================
INSERT INTO contact_messages (name, email, phone, subject, message, is_read, is_replied) VALUES
('James Kimani', 'james.kimani@email.com', '+254711223344', 'Property Inquiry', 'I am looking for a 3-bedroom apartment in Nairobi under 10 million. Do you have any listings?', 1, 1),
('Anne Wambui', 'anne.wambui@email.com', '+254722334455', 'Agent Services', 'I would like to become a registered agent with your company. What are the requirements?', 0, 0),
('Robert Ouma', 'robert.ouma@email.com', '+254733445566', 'Maintenance Request', 'The swimming pool at my apartment complex needs maintenance. Can you help?', 0, 0);

-- ============================================
-- MAINTENANCE REQUESTS
-- ============================================
INSERT INTO maintenance_requests (property_id, customer_id, agent_id, title, description, priority, status, estimated_cost) VALUES
(7, 4, 3, 'Plumbing Issue', 'Kitchen sink is leaking and needs urgent repair.', 'high', 'pending', 5000),
(1, 1, 1, 'AC Unit Not Working', 'The air conditioning unit in the master bedroom is not cooling properly.', 'medium', 'in_progress', 15000),
(3, 3, 2, 'Garden Maintenance', 'Regular garden maintenance and hedge trimming needed.', 'low', 'completed', 8000);

-- ============================================
-- TENANTS
-- ============================================
INSERT INTO tenants (user_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, occupation, employer_name) VALUES
(5, 'John Njeri', '+254711223344', 'Brother', 'Software Engineer', 'Tech Solutions Ltd'),
(6, 'Mary Mwangi', '+254722334455', 'Sister', 'Business Owner', 'Mwangi Enterprises'),
(7, 'Peter Akinyi', '+254733445566', 'Spouse', 'Doctor', 'Kenyatta National Hospital'),
(8, 'Sarah Ochieng', '+254744556677', 'Friend', 'Teacher', 'Nairobi School');

-- ============================================
-- LEASES
-- ============================================
INSERT INTO leases (tenant_id, property_id, agent_id, lease_type, start_date, end_date, rent_amount, deposit_amount, deposit_paid, payment_frequency, due_day, late_fee, status) VALUES
(1, 7, 3, 'residential', '2026-01-01', '2026-12-31', 65000, 130000, 1, 'monthly', 5, 1000, 'active'),
(2, 8, 2, 'residential', '2026-02-01', '2026-07-31', 45000, 90000, 1, 'monthly', 5, 500, 'active'),
(3, 2, 1, 'residential', '2026-03-01', '2029-02-28', 150000, 300000, 1, 'quarterly', 1, 2000, 'active'),
(4, 4, 2, 'residential', '2025-06-01', '2026-05-31', 70000, 140000, 1, 'monthly', 10, 1000, 'active');

-- ============================================
-- RENT PAYMENTS
-- ============================================
INSERT INTO rent_payments (lease_id, tenant_id, amount, payment_method, transaction_id, status, payment_date, due_date, payment_month, receipt_number, paid_at) VALUES
(1, 1, 65000, 'mpesa', 'MPESA-RENT-001', 'completed', '2026-07-05', '2026-07-05', '2026-07', 'RENT-REC-001', '2026-07-05 08:30:00'),
(1, 1, 65000, 'mpesa', 'MPESA-RENT-002', 'completed', '2026-06-05', '2026-06-05', '2026-06', 'RENT-REC-002', '2026-06-05 09:00:00'),
(2, 2, 45000, 'bank_transfer', 'BANK-RENT-001', 'completed', '2026-07-05', '2026-07-05', '2026-07', 'RENT-REC-003', '2026-07-05 10:00:00'),
(3, 3, 450000, 'mpesa', 'MPESA-RENT-003', 'completed', '2026-07-01', '2026-07-01', '2026-07', 'RENT-REC-004', '2026-07-01 14:00:00'),
(4, 4, 70000, 'cash', 'CASH-RENT-001', 'completed', '2026-06-10', '2026-06-10', '2026-06', 'RENT-REC-005', '2026-06-10 11:00:00'),
(1, 1, 65000, 'mpesa', 'MPESA-RENT-004', 'pending', NULL, '2026-08-05', '2026-08', NULL, NULL);

-- ============================================
-- LEASE DOCUMENTS
-- ============================================
INSERT INTO lease_documents (lease_id, tenant_id, document_name, document_path, document_type, uploaded_by, is_signed, signed_at) VALUES
(1, 1, 'Lease Agreement - South B Apartment', 'documents/lease-001.pdf', 'lease_agreement', 1, 1, '2026-01-01 10:00:00'),
(1, 1, 'Property Inspection Report', 'documents/inspection-001.pdf', 'inspection_report', 2, 0, NULL),
(2, 2, 'Lease Agreement - CBD Studio', 'documents/lease-002.pdf', 'lease_agreement', 1, 1, '2026-02-01 10:00:00'),
(3, 3, 'Lease Agreement - Karen Villa', 'documents/lease-003.pdf', 'lease_agreement', 1, 1, '2026-03-01 10:00:00');

-- ============================================
-- ACTIVITY LOGS
-- ============================================
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address) VALUES
(1, 'login', 'user', 1, '192.168.1.100'),
(2, 'login', 'user', 2, '192.168.1.101'),
(2, 'create_property', 'property', 1, '192.168.1.101'),
(3, 'create_property', 'property', 3, '192.168.1.102'),
(5, 'register', 'user', 5, '192.168.1.103'),
(5, 'create_booking', 'booking', 1, '192.168.1.103'),
(6, 'make_payment', 'payment', 2, '192.168.1.104');

-- ============================================
-- SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Lil Mosey Estate 6G Edition', 'string', 'Website name'),
('site_tagline', 'Finding Your Perfect Property, Simplified.', 'string', 'Website tagline'),
('site_email', 'info@lilmoseyestate.com', 'string', 'Contact email'),
('site_phone', '+254 700 000 000', 'string', 'Contact phone'),
('site_address', 'Westlands Business Park, Nairobi, Kenya', 'string', 'Office address'),
('currency', 'KES', 'string', 'Default currency'),
('currency_symbol', 'KES', 'string', 'Currency symbol'),
('tax_rate', '16', 'number', 'Tax rate percentage'),
('commission_rate', '2.5', 'number', 'Default agent commission rate'),
('max_upload_size', '10', 'number', 'Maximum upload size in MB'),
('items_per_page', '12', 'number', 'Items per page for listings'),
('smtp_host', 'smtp.gmail.com', 'string', 'SMTP host'),
('smtp_port', '587', 'number', 'SMTP port'),
('smtp_user', '', 'string', 'SMTP username'),
('smtp_pass', '', 'string', 'SMTP password'),
('mpesa_consumer_key', '', 'string', 'M-Pesa consumer key'),
('mpesa_consumer_secret', '', 'string', 'M-Pesa consumer secret'),
('mpesa_shortcode', '', 'string', 'M-Pesa business shortcode'),
('stripe_publishable_key', '', 'string', 'Stripe publishable key'),
('stripe_secret_key', '', 'string', 'Stripe secret key'),
('paypal_client_id', '', 'string', 'PayPal client ID'),
('google_maps_api_key', '', 'string', 'Google Maps API key'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode toggle'),
('registration_enabled', 'true', 'boolean', 'Allow new registrations');

-- ============================================
-- EMAIL TEMPLATES
-- ============================================
INSERT INTO email_templates (template_name, subject, body, variables) VALUES
('welcome', 'Welcome to Lil Mosey Estate 6G Edition!', '<h1>Welcome {{name}}!</h1><p>Thank you for joining Lil Mosey Estate 6G Edition. We are excited to help you find your perfect property.</p><p><a href="{{verification_url}}">Verify Your Email</a></p>', '["name", "verification_url"]'),
('verification', 'Verify Your Email Address', '<h1>Email Verification</h1><p>Hi {{name}},</p><p>Please click the link below to verify your email address:</p><p><a href="{{verification_url}}">Verify Email</a></p>', '["name", "verification_url"]'),
('reset_password', 'Reset Your Password', '<h1>Password Reset</h1><p>Hi {{name}},</p><p>Click the link below to reset your password:</p><p><a href="{{reset_url}}">Reset Password</a></p><p>This link expires in 1 hour.</p>', '["name", "reset_url"]'),
('booking_confirmation', 'Booking Confirmed', '<h1>Booking Confirmed!</h1><p>Hi {{name}},</p><p>Your booking for <strong>{{property_title}}</strong> has been confirmed.</p><p>Date: {{booking_date}}</p><p>Time: {{booking_time}}</p>', '["name", "property_title", "booking_date", "booking_time"]'),
('payment_receipt', 'Payment Receipt', '<h1>Payment Receipt</h1><p>Hi {{name}},</p><p>Thank you for your payment.</p><p>Amount: {{amount}}</p><p>Reference: {{reference}}</p><p>Date: {{date}}</p>', '["name", "amount", "reference", "date"]'),
('new_message', 'New Message Received', '<h1>New Message</h1><p>Hi {{name}},</p><p>You have a new message from {{sender_name}}.</p><p>Subject: {{subject}}</p><p><a href="{{message_url}}">View Message</a></p>', '["name", "sender_name", "subject", "message_url"]');
