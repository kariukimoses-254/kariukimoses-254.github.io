-- Lil Mosey Hospital Management System - Database Schema
CREATE DATABASE IF NOT EXISTS lil_mosey_hospital;
USE lil_mosey_hospital;

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  spec VARCHAR(100) NOT NULL,
  qualification VARCHAR(150),
  experience VARCHAR(50),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  languages VARCHAR(120),
  photo TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  available VARCHAR(120) DEFAULT 'Mon-Fri 09:00-17:00',
  bio TEXT,
  patient_rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male','Female','Other') NOT NULL,
  disease VARCHAR(150) NOT NULL,
  status ENUM('Admitted','Outpatient','Discharged') DEFAULT 'Outpatient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  spec VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  experience VARCHAR(50),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(100),
  department VARCHAR(100),
  doctor VARCHAR(100),
  diagnosis VARCHAR(150),
  treatment VARCHAR(150),
  admission_date DATE,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  subject VARCHAR(150),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(100),
  role VARCHAR(20) DEFAULT 'patient',
  photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient VARCHAR(100) NOT NULL,
  doctor VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Upgrading an existing database? Run these once to add the doctor profile columns
-- (they are already part of the doctors table above, so skip this on a fresh install):
-- ALTER TABLE doctors
--   ADD COLUMN qualification VARCHAR(150) AFTER spec,
--   ADD COLUMN experience VARCHAR(50) AFTER qualification,
--   ADD COLUMN email VARCHAR(100) AFTER phone,
--   ADD COLUMN languages VARCHAR(120) AFTER email,
--   ADD COLUMN bio TEXT AFTER available;
