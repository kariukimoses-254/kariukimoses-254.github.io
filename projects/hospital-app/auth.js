// Shared header auth widget: shows the logged-in user's name + Logout
(function () {
  const user = JSON.parse(localStorage.getItem('hms_user') || 'null');
  const nav = document.querySelector('.topbar nav');
  if (!nav) return;

  if (user) {
    const span = document.createElement('span');
    span.style.cssText = 'color:#fff;align-self:center;padding:0 10px;font-size:.9rem;';
    span.textContent = `👤 ${user.name} (${user.role})`;

    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.textContent = 'Logout';
    btn.addEventListener('click', () => {
      localStorage.removeItem('hms_user');
      location.href = 'home.html';
    });

    nav.appendChild(span);
    nav.appendChild(btn);
  }
})();
