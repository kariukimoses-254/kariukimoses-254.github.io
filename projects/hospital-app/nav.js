// Shared top navigation: mobile menu toggle + sticky shadow + helpers.
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const topbar = document.querySelector('.topbar');

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      setMenu(!nav.classList.contains('open'));
    });

    // Close with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });

    // Close when a link is chosen (the page-fade transition still runs)
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });

    // Back to full bar when leaving the mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  // Subtle depth on the bar once the page is scrolled
  if (topbar) {
    const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
