-- Active: 1791190944874@@127.0.0.1@3306@lil_mosey_hospital
-- Seed data for Lil Mosey Hospital
USE lil_mosey_hospital;

INSERT INTO doctors (name, spec, qualification, experience, phone, email, languages, photo, rating, available, bio) VALUES
  ('Dr. James Mwangi', 'Cardiology', 'MBBS, MMed (Cardiology)', '14 years', '+254 700 100 101', 'j.mwangi@lilmosey.example.com', 'English, Kiswahili', 'images/doctor1.jpg', 4.8, 'Mon-Fri, 08:00 - 16:00', 'Interventional cardiologist leading the cath-lab team. Special interest in heart failure and preventive cardiology.'),
  ('Dr. Aisha Patel', 'Pediatrics', 'MBBS, DCH (Child Health)', '11 years', '+254 700 100 102', 'a.patel@lilmosey.example.com', 'English, Kiswahili, Gujarati', 'images/doctor2.jpg', 4.9, 'Mon-Sat, 09:00 - 17:00', 'Paediatrician and newborn care lead. Runs the immunisation clinic and the child growth monitoring programme.'),
  ('Dr. David Lee', 'Orthopedics', 'MBBS, MMed (Orthopaedic Surgery)', '9 years', '+254 700 100 103', 'd.lee@lilmosey.example.com', 'English, Mandarin', 'images/doctor3.jpg', 4.6, 'Tue-Sat, 08:30 - 16:30', 'Orthopaedic surgeon covering joint replacement, sports injuries and fracture care.'),
  ('Dr. Elena Garcia', 'Neurology', 'MBBS, MMed (Neurology)', '12 years', '+254 700 100 104', 'e.garcia@lilmosey.example.com', 'English, Spanish, Kiswahili', 'images/doctor4.jpg', 4.7, 'Mon-Fri, 10:00 - 18:00', 'Neurologist running the stroke and epilepsy clinics, with a focus on headache disorders.');

INSERT INTO patients (name, age, gender, disease, status) VALUES
  ('John Doe', 45, 'Male', 'Hypertension', 'Admitted'),
  ('Jane Smith', 32, 'Female', 'Flu', 'Outpatient'),
  ('Ahmad R.', 60, 'Male', 'Diabetes', 'Admitted'),
  ('Maria C.', 28, 'Female', 'Fracture', 'Discharged');

INSERT INTO appointments (patient, doctor, date, time) VALUES
  ('John Doe', 'Dr. Smith', '2026-10-06', '09:30:00'),
  ('Jane Smith', 'Dr. Patel', '2026-10-06', '11:00:00'),
  ('Ahmad R.', 'Dr. Lee', '2026-10-07', '14:15:00');
