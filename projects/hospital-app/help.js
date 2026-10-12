// Floating '?' help button with a context-specific help panel
(function () {
  const helpContent = {
    'home.html': 'This is the hospital home page. Use the nav bar to visit Services, Doctors, Appointments, Register, or Login.',
    'about.html': 'Learn about MediCare Hospital, its mission, and visiting hours.',
    'services.html': 'Browse the departments and facilities we offer.',
    'doctors.html': 'Browse doctors, filter by specialization, and rate them with stars.',
    'appointments.html': 'Sign in first, then book an appointment by specialization, doctor, date, and time.',
    'contact.html': 'Find our location, hours, and send us a message.',
    'apply.html': 'Doctors can apply to join our team. Upload your photo and details.',
    'register.html': 'Create a patient account with your email and password.',
    'login.html': 'Log in with your registered email. Admin/staff users get the dashboard.',
    'guidance.html': 'Step-by-step instructions for using the hospital system.',
    'index.html': 'Staff dashboard. Use the left sidebar to manage patients, doctors, appointments, applications, and records.',
  };

  const page = location.pathname.split('/').pop() || 'home.html';
  const text = helpContent[page] || 'Need help? Contact us on the Contact page.';

  const btn = document.createElement('button');
  btn.id = 'helpBtn';
  btn.textContent = '?';
  btn.title = 'Help';

  const panel = document.createElement('div');
  panel.id = 'helpPanel';
  panel.textContent = text;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  btn.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  });
})();
