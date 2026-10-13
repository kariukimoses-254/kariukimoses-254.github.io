/* ============================================================
   Kariuki Moses - Portfolio interactions
   Theme toggle · aurora parallax · scroll reveal · typewriter
   counters · skill bars · 3D tilt · spotlight · ripple · glow
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    /* ---------------------------------------------------------
       1. Theme (dark default, persisted)
       --------------------------------------------------------- */
    var root = document.documentElement;
    var toggle = $('#themeToggle');
    var stored = null;
    try { stored = localStorage.getItem('km-theme'); } catch (e) {}
    var theme = stored || 'dark';
    root.setAttribute('data-theme', theme);

    function syncThemeMeta() {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#05060f' : '#f5f6ff');
    }
    syncThemeMeta();

    if (toggle) {
        toggle.addEventListener('click', function () {
            theme = theme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', theme);
            try { localStorage.setItem('km-theme', theme); } catch (e) {}
            syncThemeMeta();
        });
    }

    /* ---------------------------------------------------------
       2. Year
       --------------------------------------------------------- */
    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------------------------------------------------------
       3. Mobile navigation
       --------------------------------------------------------- */
    var navToggle = $('#navToggle');
    var navMenu = $('#navMenu');

    function closeMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var open = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        $$('.nav__link', navMenu).forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ---------------------------------------------------------
       4. Scroll progress + nav state + scroll spy + back to top
       --------------------------------------------------------- */
    var scrollProgress = $('#scrollProgress');
    var nav = $('#nav');
    var toTop = $('#toTop');
    var sections = $$('section[id], header[id]');
    var navLinks = $$('.nav__link[href^="#"]');

    var ticking = false;
    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;
        var docH = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollProgress) scrollProgress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
        if (nav) nav.classList.toggle('scrolled', y > 24);
        if (toTop) toTop.classList.toggle('show', y > 520);

        // scroll spy
        var current = '';
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop - 140 <= y) current = sections[i].id;
        }
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });

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
       5. Typewriter role
       --------------------------------------------------------- */
    var typed = $('#typedRole');
    if (typed) {
        var roles = ['Web Developer', 'Front-End Developer', 'UI Enthusiast', 'Problem Solver'];
        if (reduceMotion) {
            typed.textContent = roles[0];
        } else {
            var rIdx = 0, cIdx = 0, deleting = false;
            (function type() {
                var word = roles[rIdx];
                typed.textContent = word.slice(0, cIdx);
                if (!deleting && cIdx < word.length) {
                    cIdx++;
                    setTimeout(type, 85);
                } else if (!deleting && cIdx === word.length) {
                    deleting = true;
                    setTimeout(type, 1500);
                } else if (deleting && cIdx > 0) {
                    cIdx--;
                    setTimeout(type, 40);
                } else {
                    deleting = false;
                    rIdx = (rIdx + 1) % roles.length;
                    setTimeout(type, 320);
                }
            })();
        }
    }

    /* ---------------------------------------------------------
       6. Counters + skill bars
       --------------------------------------------------------- */
    function runCounter(el) {
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion) { el.textContent = target + suffix; return; }
        var start = performance.now();
        var dur = 1400;
        (function step(now) {
            var p = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
        })(start);
    }

    function fillBar(el) {
        var level = el.getAttribute('data-level') || '0';
        el.style.width = level + '%';
    }

    /* ---------------------------------------------------------
       7. Scroll reveal (also triggers counters/bars)
       --------------------------------------------------------- */
    var revealEls = $$('.reveal');
    function activate(el) {
        el.classList.add('in-view');
        $$('[data-count]', el).forEach(runCounter);
        $$('.skill__fill[data-level]', el).forEach(fillBar);
    }

    if ('IntersectionObserver' in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    activate(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(activate);
        $$('.skill__fill[data-level]').forEach(fillBar);
        $$('[data-count]').forEach(runCounter);
    }

    /* ---------------------------------------------------------
       8. Cursor glow
       --------------------------------------------------------- */
    var glow = $('#cursorGlow');
    if (glow && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
        var cx = gx, cy = gy, glowOn = false;
        document.addEventListener('mousemove', function (e) {
            gx = e.clientX; gy = e.clientY;
            if (!glowOn) { glowOn = true; glow.classList.add('on'); }
        }, { passive: true });
        (function loop() {
            cx += (gx - cx) * 0.12;
            cy += (gy - cy) * 0.12;
            glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
            window.requestAnimationFrame(loop);
        })();
    }

    /* ---------------------------------------------------------
       9. 3D tilt + spotlight
       --------------------------------------------------------- */
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        $$('[data-tilt]').forEach(function (card) {
            var rect = null;
            var raf = null;
            var rx = 0, ry = 0;

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
                ry = (px - 0.5) * 9;
                rx = (0.5 - py) * 9;
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
       10. Button ripple
       --------------------------------------------------------- */
    $$('.btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            if (reduceMotion) return;
            var rect = btn.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var span = document.createElement('span');
            span.className = 'ripple';
            span.style.width = span.style.height = size + 'px';
            span.style.left = (e.clientX - rect.left - size / 2) + 'px';
            span.style.top = (e.clientY - rect.top - size / 2) + 'px';
            btn.appendChild(span);
            setTimeout(function () { span.remove(); }, 700);
        });
    });

    /* ---------------------------------------------------------
       11. Aurora orbs - gentle parallax with the pointer
       --------------------------------------------------------- */
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        var orbs = $$('.orb');
        if (orbs.length) {
            var ox = 0, oy = 0, tx = 0, ty = 0;
            document.addEventListener('mousemove', function (e) {
                ox = (e.clientX / window.innerWidth - 0.5);
                oy = (e.clientY / window.innerHeight - 0.5);
            }, { passive: true });
            (function orbLoop() {
                tx += (ox - tx) * 0.06;
                ty += (oy - ty) * 0.06;
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
