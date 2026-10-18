-- Active: 1791190944874@@127.0.0.1@3306@Lil Mosey
-- Seed data for Lil Mosey Hospital
USE Lil Mosey;

INSERT INTO doctors (name, spec, phone) VALUES
  ('Dr. Smith', 'Cardiology', '555-0101'),
  ('Dr. Patel', 'Pediatrics', '555-0102'),
  ('Dr. Lee', 'Orthopedics', '555-0103'),
  ('Dr. Garcia', 'Neurology', '555-0104');

INSERT INTO patients (name, age, gender, disease, status) VALUES
  ('John Doe', 45, 'Male', 'Hypertension', 'Admitted'),
  ('Jane Smith', 32, 'Female', 'Flu', 'Outpatient'),
  ('Ahmad R.', 60, 'Male', 'Diabetes', 'Admitted'),
  ('Maria C.', 28, 'Female', 'Fracture', 'Discharged');

INSERT INTO appointments (patient, doctor, date, time) VALUES
  ('John Doe', 'Dr. Smith', '2026-10-06', '09:30:00'),
  ('Jane Smith', 'Dr. Patel', '2026-10-06', '11:00:00'),
  ('Ahmad R.', 'Dr. Lee', '2026-10-07', '14:15:00');
