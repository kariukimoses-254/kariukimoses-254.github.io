/* ============================================================
   Kariuki Moses - Portfolio interactions
   Works across every page (home / about / skills / projects / contact)
   Theme · nav · reveal · typewriter · counters · skill bars
   3D tilt · spotlight · ripple on every button · cursor glow
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    /* ---------------------------------------------------------
       1. Theme (dark default, persisted)
       --------------------------------------------------------- */
    var root = document.documentElement;
    var themeToggle = document.getElementById('themeToggle');
    var stored = null;
    try { stored = localStorage.getItem('km-theme'); } catch (e) {}
    var theme = stored || 'dark';
    root.setAttribute('data-theme', theme);

    function syncThemeMeta() {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#05060f' : '#f5f6ff');
    }
    syncThemeMeta();

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            theme = theme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', theme);
            try { localStorage.setItem('km-theme', theme); } catch (e) {}
            syncThemeMeta();
        });
    }

    /* ---------------------------------------------------------
       2. Year
       --------------------------------------------------------- */
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------------------------------------------------------
       3. Active nav link for the current page
       --------------------------------------------------------- */
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!page || page === '') page = 'index.html';
    /* Case studies live in their own folder but still belong to the Projects
       section, so the nav keeps pointing at Projects while they are open. */
    if (window.location.pathname.indexOf('/case-studies/') !== -1) page = 'projects.html';
    $$('.nav__link').forEach(function (link) {
        var href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
        if (href === page) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    /* ---------------------------------------------------------
       4. Mobile navigation
       --------------------------------------------------------- */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    function closeMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var open = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            // lock the page behind the open menu (matters on short landscape screens)
            document.body.classList.toggle('menu-open', open);
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) closeMenu();
        });
        $$('.nav__link', navMenu).forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ---------------------------------------------------------
       5. Scroll progress · nav state · back to top
       --------------------------------------------------------- */
    var scrollProgress = document.getElementById('scrollProgress');
    var nav = document.getElementById('nav');
    var toTop = document.getElementById('toTop');
    var ticking = false;

    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollProgress) scrollProgress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
        if (nav) nav.classList.toggle('scrolled', y > 24);
        if (toTop) toTop.classList.toggle('show', y > 480);
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------------------------------------------------------
       6. Typewriter role (home page)
       --------------------------------------------------------- */
    var typed = document.getElementById('typedRole');
    if (typed) {
        var roles = ['Web Developer', 'Front-End Developer', 'Back-End Developer', 'Full-Stack Builder', 'Problem Solver'];
        if (reduceMotion) {
            typed.textContent = roles[0];
        } else {
            var rIdx = 0, cIdx = 0, deleting = false;
            (function type() {
                var word = roles[rIdx];
                typed.textContent = word.slice(0, cIdx);
                if (!deleting && cIdx < word.length) { cIdx++; setTimeout(type, 85); }
                else if (!deleting && cIdx === word.length) { deleting = true; setTimeout(type, 1500); }
                else if (deleting && cIdx > 0) { cIdx--; setTimeout(type, 40); }
                else { deleting = false; rIdx = (rIdx + 1) % roles.length; setTimeout(type, 320); }
            })();
        }
    }

    /* ---------------------------------------------------------
       7. Counters + skill bars
       --------------------------------------------------------- */
    function runCounter(el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion) { el.textContent = target + suffix; return; }
        var start = performance.now(), dur = 1400;
        (function step(now) {
            var p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
        })(start);
    }
    function fillBar(el) { el.style.width = (el.getAttribute('data-level') || '0') + '%'; }

    /* ---------------------------------------------------------
       8. Scroll reveal (also triggers counters/bars)
       --------------------------------------------------------- */
    function activate(el) {
        el.classList.add('in-view');
        $$('[data-count]', el).forEach(runCounter);
        $$('.skill__fill[data-level]', el).forEach(fillBar);
    }

    var revealEls = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { activate(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
        // Safety net: anything still hidden after load gets shown (short pages)
        window.addEventListener('load', function () {
            setTimeout(function () {
                revealEls.forEach(function (el) {
                    var r = el.getBoundingClientRect();
                    if (r.top < window.innerHeight) activate(el);
                });
            }, 250);
        });
    } else {
        revealEls.forEach(activate);
        $$('.skill__fill[data-level]').forEach(fillBar);
        $$('[data-count]').forEach(runCounter);
    }

    /* ---------------------------------------------------------
       9. Cursor glow
       --------------------------------------------------------- */
    var glow = document.getElementById('cursorGlow');
    if (glow && !reduceMotion && finePointer) {
        var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy, on = false;
        document.addEventListener('mousemove', function (e) {
            gx = e.clientX; gy = e.clientY;
            if (!on) { on = true; glow.classList.add('on'); }
        }, { passive: true });
        (function loop() {
            cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
            glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
            window.requestAnimationFrame(loop);
        })();
    }

    /* ---------------------------------------------------------
       10. 3D tilt + spotlight
       --------------------------------------------------------- */
    if (!reduceMotion && finePointer) {
        $$('[data-tilt]').forEach(function (card) {
            var rect = null, raf = null, rx = 0, ry = 0;
            function apply() {
                card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
                raf = null;
            }
            card.addEventListener('mouseenter', function () {
                rect = card.getBoundingClientRect();
                card.style.transition = 'transform .18s ease-out, box-shadow .4s ease, border-color .4s ease';
            });
            card.addEventListener('mousemove', function (e) {
                if (!rect) rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width;
                var py = (e.clientY - rect.top) / rect.height;
                card.style.setProperty('--mx', (px * 100) + '%');
                card.style.setProperty('--my', (py * 100) + '%');
                ry = (px - 0.5) * 9; rx = (0.5 - py) * 9;
                if (!raf) raf = window.requestAnimationFrame(apply);
            });
            card.addEventListener('mouseleave', function () {
                rx = 0; ry = 0;
                card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), box-shadow .4s ease, border-color .4s ease';
                card.style.transform = '';
                card.style.removeProperty('--mx');
                card.style.removeProperty('--my');
                rect = null;
            });
        });
    }

    /* ---------------------------------------------------------
       11. Ripple on every button
       --------------------------------------------------------- */
    var rippleTargets = '.btn, .project__link, .contact__method, .pager__btn, .pager__dot, .nav__link--resume, .to-top, .theme-toggle, .explore__card';
    $$(rippleTargets).forEach(function (el) {
        el.addEventListener('click', function (e) {
            if (reduceMotion) return;
            var rect = el.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var span = document.createElement('span');
            span.className = 'ripple';
            span.style.width = span.style.height = size + 'px';
            var x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
            var y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
            span.style.left = x + 'px';
            span.style.top = y + 'px';
            el.appendChild(span);
            setTimeout(function () { if (span.parentNode) span.parentNode.removeChild(span); }, 700);
        });
    });

    /* ---------------------------------------------------------
       12. Aurora orbs - gentle pointer parallax
       --------------------------------------------------------- */
    if (!reduceMotion && finePointer) {
        var orbs = $$('.orb');
        if (orbs.length) {
            var ox = 0, oy = 0, tx = 0, ty = 0;
            document.addEventListener('mousemove', function (e) {
                ox = (e.clientX / window.innerWidth - 0.5);
                oy = (e.clientY / window.innerHeight - 0.5);
            }, { passive: true });
            (function orbLoop() {
                tx += (ox - tx) * 0.06; ty += (oy - ty) * 0.06;
                orbs.forEach(function (orb, i) {
                    var depth = (i + 1) * 14;
                    orb.style.marginLeft = (tx * depth) + 'px';
                    orb.style.marginTop = (ty * depth) + 'px';
                });
                window.requestAnimationFrame(orbLoop);
            })();
        }
    }
})();
