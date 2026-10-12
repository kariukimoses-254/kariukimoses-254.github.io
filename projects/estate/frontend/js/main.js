/* ============================================
   Lil Mosey Estate 6G Edition - Main JavaScript
   Version: 1.0
   ============================================ */

const API_BASE = (window.location.port === '5000' || window.location.protocol === 'file:')
  ? 'http://localhost:5000/api/v1'
  : `${window.location.protocol}//${window.location.hostname}:5000/api/v1`;

// ===== API Helper =====
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },
  upload(endpoint, formData) {
    return this.request(endpoint, { method: 'PUT', body: formData });
  }
};

// ===== Auth Manager =====
const auth = {
  user: null,

  init() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.updateUI();
    }
  },

  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
    this.updateUI();
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user = null;
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    window.location.href = depth > 1 ? '../index.html' : 'index.html';
  },

  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  isAdmin() {
    return this.user && this.user.role === 'admin';
  },

  isAgent() {
    return this.user && this.user.role === 'agent';
  },

  isCustomer() {
    return this.user && this.user.role === 'customer';
  },

  updateUI() {
    const authBtns = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');

    if (authBtns && userMenu) {
      if (this.isLoggedIn()) {
        authBtns.style.display = 'none';
        userMenu.style.display = 'block';

        const userName = document.getElementById('user-name');
        if (userName) userName.textContent = `${this.user.first_name} ${this.user.last_name}`;

        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar && this.user.avatar) {
          userAvatar.src = `/uploads/avatars/${this.user.avatar}`;
        }

        const dashboardLink = document.getElementById('dashboard-link');
        if (dashboardLink) {
          if (this.isAdmin()) {
            dashboardLink.href = 'admin/dashboard.html';
          } else if (this.isAgent()) {
            dashboardLink.href = 'dashboard.html?tab=agent';
          } else {
            dashboardLink.href = 'customer/dashboard.html';
          }
        }
      } else {
        authBtns.style.display = 'flex';
        userMenu.style.display = 'none';
      }
    }
  }
};

// ===== Preloader =====
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('loaded'), 500);
    setTimeout(() => preloader.remove(), 1000);
  }
});

// ===== Navbar Scroll =====
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// ===== Counter Animation =====
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };

    updateCounter();
  });
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
    <button class="btn-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ===== SweetAlert Helpers =====
function showSuccess(message, title = 'Success!') {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#D4AF37',
    confirmButtonText: 'OK'
  });
}

function showError(message, title = 'Error!') {
  Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#D4AF37',
    confirmButtonText: 'OK'
  });
}

function showConfirm(message, title = 'Are you sure?') {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#D4AF37',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });
}

// ===== Form Helpers =====
function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => data[key] = value);
  return data;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''));
}

// ===== Format Currency =====
function formatCurrency(amount) {
  return 'KES ' + Number(amount).toLocaleString();
}

// ===== Format Date =====
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===== Image Error Handling =====
function handleImageError(img) {
  img.src = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#f5f7fa" width="400" height="300"/>
      <text fill="#999" font-family="Arial" font-size="16" text-anchor="middle" x="200" y="150">No Image Available</text>
    </svg>
  `);
}

// ===== Debounce =====
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ===== Scroll to Top Button =====
function initScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Particle Effect for Hero =====
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 12000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  init();
  animate();

  window.addEventListener('resize', () => {
    init();
  });
}

// ===== Scroll Reveal Animations =====
function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ===== Newsletter Form =====
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (!email) return;

    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      await api.post('/contact/newsletter', { email });
      showToast('Subscribed successfully!', 'success');
      form.reset();
    } catch (err) {
      showToast(err.message || 'Subscription failed', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  auth.init();
  initThemeToggle();

  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }

  // Initialize additional features
  initScrollTop();
  initParticles();
  initRevealAnimations();
  initNewsletter();
  animateCounters();
  initTypingEffect();
  initMarketCharts();
  initFloatingCalc();
});

// ===== Theme Toggle (Dark/Light Mode) =====
function initThemeToggle() {
  if (window.location.pathname.includes('/admin/') ||
      window.location.pathname.includes('/customer/') ||
      window.location.pathname.includes('/tenant/') ||
      window.location.pathname.endsWith('/dashboard.html')) return;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  const toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', 'Toggle dark/light mode');
  toggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  toggle.title = savedTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  document.body.appendChild(toggle);

  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    const mode = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', mode);
    toggle.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    toggle.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  });
}

// ===== Typing Effect =====
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const words = ['Find Your Dream', 'Discover Premium', 'Explore Luxury'];
  let wordIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const word = words[wordIdx];
    if (!deleting) {
      el.textContent = word.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        setTimeout(() => { deleting = true; tick(); }, 1800);
        return;
      }
      setTimeout(tick, 80);
    } else {
      el.textContent = word.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 40);
    }
  }
  tick();
}

// ===== Market Charts =====
function initMarketCharts() {
  if (typeof Chart === 'undefined') return;

  const gold = '#D4AF37';
  const navy = '#0B1F3A';
  const green = '#2E8B57';
  const lightGold = 'rgba(212,175,55,0.15)';

  Chart.defaults.font.family = "'Inter', sans-serif";

  // Homepage mini price chart
  const miniChart = document.getElementById('mini-price-chart');
  if (miniChart) {
    new Chart(miniChart, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          { label: 'Westlands', data: [18,19,20,21,22,24,23,25,26,27,28,29], borderColor: gold, backgroundColor: lightGold, fill: true, tension: 0.4, pointRadius: 2 },
          { label: 'Karen', data: [42,44,45,48,50,52,55,54,58,60,62,65], borderColor: navy, backgroundColor: 'rgba(11,31,58,0.08)', fill: true, tension: 0.4, pointRadius: 2 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, font: { size: 11 } } } },
        scales: { y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
      }
    });
  }

  // Market insights page full charts
  if (!document.getElementById('price-trends-chart')) return;

  // Price Trends
  new Chart(document.getElementById('price-trends-chart'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Westlands', data: [18,19,20,21,22,24,23,25,26,27,28,29], borderColor: gold, backgroundColor: lightGold, fill: true, tension: 0.4 },
        { label: 'Karen', data: [42,44,45,48,50,52,55,54,58,60,62,65], borderColor: navy, backgroundColor: 'rgba(11,31,58,0.1)', fill: true, tension: 0.4 },
        { label: 'Kilimani', data: [15,16,17,18,19,20,22,23,24,25,26,27], borderColor: green, backgroundColor: 'rgba(46,139,87,0.1)', fill: true, tension: 0.4 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } } },
      scales: { y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
    }
  });

  // Type Distribution
  new Chart(document.getElementById('type-dist-chart'), {
    type: 'doughnut',
    data: {
      labels: ['Apartments', 'Villas', 'Townhouses', 'Bungalows', 'Penthouses'],
      datasets: [{ data: [38, 22, 20, 12, 8], backgroundColor: [navy, gold, green, '#e6c84a', '#1a3a5c'], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }
    }
  });

  // Popular Areas
  new Chart(document.getElementById('popular-areas-chart'), {
    type: 'bar',
    data: {
      labels: ['Westlands', 'Kilimani', 'Karen', 'Langata', 'CBD', 'Runda'],
      datasets: [{ label: 'Searches', data: [320, 280, 210, 190, 170, 120], backgroundColor: [gold, navy, green, gold, navy, green], borderRadius: 8, barThickness: 35 }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { grid: { color: 'rgba(0,0,0,0.05)' } }, y: { grid: { display: false } } }
    }
  });

  // Price per Sqft
  new Chart(document.getElementById('sqft-chart'), {
    type: 'bar',
    data: {
      labels: ['Westlands', 'Karen', 'Kilimani', 'Runda', 'Langata', 'CBD'],
      datasets: [{ label: 'KES/sqft', data: [15500, 14200, 12800, 18500, 11200, 9800], backgroundColor: navy, borderRadius: 6, barThickness: 30 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
    }
  });
}

// ===== Floating Calculator Button =====
function initFloatingCalc() {
  if (window.location.pathname.includes('mortgage-calculator') ||
      window.location.pathname.includes('/admin/') ||
      window.location.pathname.includes('/customer/') ||
      window.location.pathname.includes('/tenant/') ||
      window.location.pathname.endsWith('/dashboard.html')) return;
  const btn = document.createElement('a');
  btn.href = 'mortgage-calculator.html';
  btn.className = 'calc-float-btn';
  btn.innerHTML = '<i class="fas fa-calculator"></i> Mortgage Calc';
  document.body.appendChild(btn);
}

// ===== 3D Interactive Tilt Effect =====
function init3DTilt() {
  document.querySelectorAll('.card-3d, .tilt-interactive').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease-out';
      const shadowX = rotateY * 2;
      const shadowY = rotateX * -2;
      card.style.boxShadow = `${shadowX}px ${shadowY + 20}px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(212,175,55,0.08)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.boxShadow = '';
    });
  });
}

// ===== 3D Button Press Effect =====
function init3DButtons() {
  document.querySelectorAll('.btn-3d').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(2px)';
      btn.style.borderBottomWidth = '2px';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = '';
      btn.style.borderBottomWidth = '';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.borderBottomWidth = '';
    });
  });
}

// ===== Intersection Observer for Scroll Animations =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .stagger-fade, .card-3d, .card-glow').forEach(el => {
    observer.observe(el);
  });
}

// ===== Parallax Tilt on Hero =====
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    const svg = hero.querySelector('.iso-card');
    if (svg) {
      svg.style.transform = `rotateX(${-y * 0.3}deg) rotateY(${x * 0.3}deg) translateZ(${Math.abs(x) * 0.5}px)`;
    }
  });
}

// ===== Sidebar Toggle (Mobile) =====
function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== toggle &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ===== Hero Slideshow =====
function initHeroSlideshow() {
  const slideshow = document.querySelector('.hero-slideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.hero-slide');
  const dots = slideshow.querySelectorAll('.dot');
  const prevBtn = slideshow.querySelector('.prev-btn');
  const nextBtn = slideshow.querySelector('.next-btn');
  if (slides.length === 0) return;

  let current = 0;
  let interval;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function startAutoplay() {
    interval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(interval);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAutoplay(); goToSlide(i); startAutoplay(); });
  });

  startAutoplay();
}

// ===== Video Tour Player =====
function initVideoTour() {
  const mainPlayer = document.getElementById('main-video');
  const mainTitle = document.getElementById('main-video-title');
  const cards = document.querySelectorAll('.video-card-sm');
  if (!mainPlayer || cards.length === 0) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-video');
      const title = card.getAttribute('data-title');
      if (src) {
        mainPlayer.src = src;
        mainPlayer.play();
      }
      if (mainTitle && title) mainTitle.textContent = title;
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

// ===== Gallery Slideshow =====
function initGallerySlideshow() {
  const galleries = document.querySelectorAll('.gallery-slideshow');
  galleries.forEach(gallery => {
    const slides = gallery.querySelectorAll('.slide');
    const dots = gallery.querySelectorAll('.dot');
    const prevBtn = gallery.querySelector('.nav-btn.prev');
    const nextBtn = gallery.querySelector('.nav-btn.next');
    if (slides.length === 0) return;

    let current = 0;

    function goTo(index) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    setInterval(() => goTo(current + 1), 6000);
  });
}

// ===== Init 3D Effects =====
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    init3DTilt();
    init3DButtons();
    initScrollAnimations();
    initHeroParallax();
    initSidebarToggle();
    initHeroSlideshow();
    initVideoTour();
    initGallerySlideshow();
  }, 300);
});
