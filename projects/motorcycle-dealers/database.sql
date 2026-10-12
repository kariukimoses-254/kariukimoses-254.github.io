CREATE DATABASE IF NOT EXISTS lil_mosey_dealers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lil_mosey_dealers;
CREATE TABLE IF NOT EXISTS vehicles (id INT PRIMARY KEY, make VARCHAR(100) NOT NULL, model VARCHAR(150) NOT NULL, year SMALLINT NOT NULL, price DECIMAL(14,2) NOT NULL DEFAULT 0, mileage INT NOT NULL DEFAULT 0, status ENUM('Available','Reserved','Sold') NOT NULL DEFAULT 'Available', stock VARCHAR(40) NOT NULL, image VARCHAR(1000), added VARCHAR(80));
CREATE TABLE IF NOT EXISTS enquiries (id INT PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(190) NOT NULL, phone VARCHAR(50), vehicle VARCHAR(200), date VARCHAR(80), status ENUM('New','In progress','Resolved') NOT NULL DEFAULT 'New', message TEXT);


CREATE TABLE IF NOT EXISTS sell_requests (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 seller_name VARCHAR(150) NOT NULL, seller_email VARCHAR(190) NOT NULL, seller_phone VARCHAR(50) NOT NULL,
 make VARCHAR(100) NOT NULL, model VARCHAR(150) NOT NULL, year SMALLINT NOT NULL, mileage INT DEFAULT 0, asking_price DECIMAL(14,2) DEFAULT 0, description TEXT, image_path VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status ENUM('New','Contacted','Closed') DEFAULT 'New'
);
