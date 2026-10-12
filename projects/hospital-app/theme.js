// Dark / Light mode toggle (persisted in localStorage)
const themeBtn = document.createElement('button');
themeBtn.className = 'theme-btn';
themeBtn.title = 'Toggle dark/light mode';

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeBtn.textContent = dark ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('hms_theme', dark ? 'dark' : 'light');
}

const isDark = localStorage.getItem('hms_theme') === 'dark';
applyTheme(isDark);

themeBtn.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

const navHost = document.querySelector('.topbar nav') || document.querySelector('.topbar');
if (navHost) navHost.appendChild(themeBtn);
