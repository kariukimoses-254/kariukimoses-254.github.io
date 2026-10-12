// Apply saved theme immediately
if (localStorage.getItem('hms_theme') === 'dark') document.documentElement.classList.add('dark-root');
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.dark-toggle');
  if (localStorage.getItem('hms_theme') === 'dark') document.body.classList.add('dark');
  if (btn) {
    btn.textContent = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const dark = document.body.classList.contains('dark');
      localStorage.setItem('hms_theme', dark ? 'dark' : 'light');
      btn.textContent = dark ? '☀️ Light' : '🌙 Dark';
    });
  }
});
