CREATE DATABASE IF NOT EXISTS antixorcar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE antixorcar;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  mileage INT UNSIGNED NOT NULL DEFAULT 0,
  transmission VARCHAR(40) NOT NULL DEFAULT 'Automatic',
  fuel_type VARCHAR(40) NOT NULL DEFAULT 'Petrol',
  category VARCHAR(60) NOT NULL DEFAULT 'Sedan',
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_vehicle_search (brand, model),
  INDEX idx_vehicle_status_featured (status, featured),
  INDEX idx_vehicle_price (price)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  vehicle_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NULL,
  message TEXT NOT NULL,
  status ENUM('new','in_progress','resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enquiry_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_enquiry_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  INDEX idx_enquiry_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_vehicles (
  user_id BIGINT UNSIGNED NOT NULL,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, vehicle_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Optional demo inventory. Remove these rows if you prefer an empty inventory.
INSERT INTO vehicles (brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,status)
SELECT 'Mercedes-Benz','GLE 350',2022,68000,18500,'Automatic','Petrol','SUV','Premium SUV with refined comfort.','https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',1,'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand='Mercedes-Benz' AND model='GLE 350');
INSERT INTO vehicles (brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,status)
SELECT 'Porsche','911 Carrera',2023,125000,7200,'Automatic','Petrol','Sports Car','Performance-focused sports coupe.','https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',1,'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand='Porsche' AND model='911 Carrera');
INSERT INTO vehicles (brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,status)
SELECT 'Range Rover','Evoque',2021,56600,24000,'Automatic','Petrol','SUV','Compact luxury SUV for city and travel.','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',1,'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand='Range Rover' AND model='Evoque');
INSERT INTO vehicles (brand,model,year,price,mileage,transmission,fuel_type,category,description,image_url,featured,status)
SELECT 'BMW','5 Series',2023,62000,12000,'Automatic','Diesel','Sedan','Executive sedan with a premium interior.','https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',1,'available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE brand='BMW' AND model='5 Series');
