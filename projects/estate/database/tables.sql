-- ============================================
-- Lil Mosey Estate 6G Edition - Database Schema
-- Version: 1.0
-- Description: Complete database schema for
--              Real Estate Management System
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS lil_mosey_estate;
USE lil_mosey_estate;

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- ROLE PERMISSIONS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500) DEFAULT 'default-avatar.png',
    role_id INT NOT NULL DEFAULT 3,
    is_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    refresh_token TEXT,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role (role_id)
) ENGINE=InnoDB;

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
    agent_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    license_number VARCHAR(100) UNIQUE,
    agency_name VARCHAR(200),
    bio TEXT,
    specialization VARCHAR(200),
    experience_years INT DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 2.50,
    total_sales INT DEFAULT 0,
    total_rentals INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_verified TINYINT(1) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    office_address TEXT,
    working_hours VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    id_number VARCHAR(50),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    occupation VARCHAR(200),
    annual_income DECIMAL(15,2),
    preferred_property_type VARCHAR(100),
    preferred_location VARCHAR(200),
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- PROPERTY TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- PROPERTY CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- AMENITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS amenities (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    category VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    type_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    status ENUM('available', 'sold', 'rented', 'pending', 'under_offer') DEFAULT 'available',
    purpose ENUM('sale', 'rent', 'both') DEFAULT 'sale',
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    kitchens INT DEFAULT 0,
    parking_spaces INT DEFAULT 0,
    area_sqft DECIMAL(10,2),
    year_built YEAR,
    address TEXT NOT NULL,
    county VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    google_map_link VARCHAR(500),
    virtual_tour_url VARCHAR(500),
    floor_plan VARCHAR(500),
    qr_code VARCHAR(500),
    is_featured TINYINT(1) DEFAULT 0,
    is_approved TINYINT(1) DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES property_types(type_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES property_categories(category_id) ON DELETE RESTRICT,
    INDEX idx_price (price),
    INDEX idx_status (status),
    INDEX idx_purpose (purpose),
    INDEX idx_city (city),
    INDEX idx_county (county),
    INDEX idx_agent (agent_id),
    FULLTEXT INDEX idx_search (title, description, address, city, county),
    INDEX idx_bedrooms (bedrooms),
    INDEX idx_created (created_at),
    INDEX idx_featured_approved (is_featured, is_approved, status)
) ENGINE=InnoDB;

-- ============================================
-- PROPERTY IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- PROPERTY VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_videos (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    video_path VARCHAR(500) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- PROPERTY AMENITIES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS property_amenities (
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- PROPERTY DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    document_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB;

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    customer_id INT NOT NULL,
    agent_id INT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled') DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    rescheduled_date DATE,
    rescheduled_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE SET NULL,
    INDEX idx_property (property_id),
    INDEX idx_customer_status (customer_id, status),
    INDEX idx_agent_date (agent_id, booking_date)
) ENGINE=InnoDB;

-- ============================================
-- PAYMENTS TABLE
-- ============================================
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT,
    booking_id INT,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('mpesa', 'paypal', 'stripe', 'bank_transfer', 'cash') NOT NULL,
    transaction_id VARCHAR(200),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    description TEXT,
    invoice_number VARCHAR(50) UNIQUE,
    receipt_number VARCHAR(50) UNIQUE,
    paid_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT,
    agent_id INT,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    is_approved TINYINT(1) DEFAULT 0,
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE SET NULL,
    INDEX idx_property_approved (property_id, is_approved)
) ENGINE=InnoDB;

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT,
    property_id INT,
    subject VARCHAR(300),
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    parent_message_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
    FOREIGN KEY (parent_message_id) REFERENCES messages(message_id) ON DELETE SET NULL,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver_read (receiver_id, is_read)
) ENGINE=InnoDB;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ============================================
-- MAINTENANCE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    customer_id INT NOT NULL,
    agent_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE SET NULL,
    INDEX idx_customer (customer_id)
) ENGINE=InnoDB;

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(300) NOT NULL,
    body TEXT NOT NULL,
    variables JSON,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(300),
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    is_replied TINYINT(1) DEFAULT 0,
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_read (is_read)
) ENGINE=InnoDB;

-- ============================================
-- TENANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    occupation VARCHAR(200),
    employer_name VARCHAR(200),
    employer_address TEXT,
    id_document_path VARCHAR(500),
    payment_pin VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- LEASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leases (
    lease_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    agent_id INT,
    lease_type ENUM('residential', 'commercial', 'industrial') DEFAULT 'residential',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount DECIMAL(15,2) NOT NULL,
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    deposit_paid TINYINT(1) DEFAULT 0,
    payment_frequency ENUM('monthly', 'quarterly', 'semi_annual', 'annual') DEFAULT 'monthly',
    due_day INT DEFAULT 1,
    late_fee DECIMAL(10,2) DEFAULT 0,
    lease_document_path VARCHAR(500),
    terms_and_conditions TEXT,
    status ENUM('active', 'expired', 'terminated', 'renewed') DEFAULT 'active',
    renewal_count INT DEFAULT 0,
    next_renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE SET NULL,
    INDEX idx_tenant (tenant_id),
    INDEX idx_property (property_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- RENT PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rent_payments (
    rent_payment_id INT AUTO_INCREMENT PRIMARY KEY,
    lease_id INT NOT NULL,
    tenant_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('mpesa', 'bank_transfer', 'cash', 'cheque', 'paypal', 'stripe') NOT NULL,
    transaction_id VARCHAR(200),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date DATE,
    due_date DATE,
    payment_month VARCHAR(7),
    receipt_number VARCHAR(50) UNIQUE,
    paid_at DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lease_id) REFERENCES leases(lease_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    INDEX idx_lease (lease_id),
    INDEX idx_tenant_payment (tenant_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

-- ============================================
-- LEASE DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lease_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    lease_id INT NOT NULL,
    tenant_id INT NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    document_type ENUM('lease_agreement', 'inspection_report', 'inventory_list', 'maintenance_report', 'notice', 'other') DEFAULT 'other',
    uploaded_by INT,
    is_signed TINYINT(1) DEFAULT 0,
    signed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lease_id) REFERENCES leases(lease_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    customer_id INT NOT NULL,
    agent_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    meeting_type ENUM('in_person', 'virtual', 'phone') DEFAULT 'in_person',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE,
    INDEX idx_agent_date (agent_id, appointment_date)
) ENGINE=InnoDB;
