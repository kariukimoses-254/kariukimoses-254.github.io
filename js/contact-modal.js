/* ============================================================
   Contact form
   One reusable form component that renders either:

     - inline in the page, where a [data-contact-inline] mount exists
       (the Contact page), or
     - inside the "Get In Touch" dialog on every other page.

   Submissions go straight to the inbox via FormSubmit, with the
   visitor's own mail app as a fallback. Any element marked
   [data-contact-modal] opens it (and degrades to a link without JS).
   ============================================================ */
(function () {
    'use strict';

    var OWNER_EMAIL = 'kariukimoseswambugu@gmail.com';
    var ENDPOINT = 'https://formsubmit.co/ajax/' + OWNER_EMAIL;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    var FIELD_ORDER = ['name', 'email', 'phone', 'subject', 'message'];

    /* ---------------------------------------------------------
       Template
       --------------------------------------------------------- */
    function componentMarkup(doneLabel) {
        return '' +
        '<form class="cform" novalidate>' +
            '<div class="cform__row">' +
                '<label class="cfield" data-field="name">' +
                    '<span class="cfield__label">Full name *</span>' +
                    '<input class="cfield__input" type="text" name="name" autocomplete="name" placeholder="Jane Doe" required>' +
                    '<span class="cfield__error">Please enter your name.</span>' +
                '</label>' +
                '<label class="cfield" data-field="email">' +
                    '<span class="cfield__label">Email *</span>' +
                    '<input class="cfield__input" type="email" name="email" autocomplete="email" placeholder="you@example.com" required>' +
                    '<span class="cfield__error">Please enter a valid email address.</span>' +
                '</label>' +
            '</div>' +
            '<div class="cform__row">' +
                '<label class="cfield" data-field="phone">' +
                    '<span class="cfield__label">Phone / WhatsApp</span>' +
                    '<input class="cfield__input" type="tel" name="phone" autocomplete="tel" placeholder="Optional">' +
                    '<span class="cfield__error">That phone number looks too short.</span>' +
                '</label>' +
                '<label class="cfield" data-field="subject">' +
                    '<span class="cfield__label">Subject *</span>' +
                    '<input class="cfield__input" type="text" name="subject" placeholder="Website project" required>' +
                    '<span class="cfield__error">Please add a short subject.</span>' +
                '</label>' +
            '</div>' +
            '<label class="cfield" data-field="message">' +
                '<span class="cfield__label">Your request *</span>' +
                '<textarea class="cfield__input cfield__input--area" name="message" placeholder="Tell me what you would like built, fixed or improved..." required></textarea>' +
                '<span class="cfield__error">Please write at least 10 characters.</span>' +
            '</label>' +
            '<input class="cform__honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<div class="cform__actions">' +
                '<button type="submit" class="btn btn--primary cform__submit">Send Message <span class="btn__arrow">&rarr;</span></button>' +
                '<button type="button" class="btn btn--secondary cform__mail">Open in my email app</button>' +
            '</div>' +
            '<p class="cform__status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<div class="cform__done" hidden>' +
            '<div class="cform__done-icon">&#10003;</div>' +
            '<h3>Message sent</h3>' +
            '<p>Thanks &mdash; your request is on its way. I will reply to you as soon as I can.</p>' +
            '<button type="button" class="btn btn--primary" data-done-close>' + doneLabel + '</button>' +
        '</div>';
    }

    /* ---------------------------------------------------------
       One form instance: validation, submit, mail-app fallback
       --------------------------------------------------------- */
    function createComponent(options) {
        options = options || {};

        var root = document.createElement('div');
        root.className = 'cform-wrap' + (options.variant ? ' cform-wrap--' + options.variant : '');
        root.setAttribute('data-contact-form', '');
        root.innerHTML = componentMarkup(options.doneLabel || 'Close');

        var form = root.querySelector('.cform');
        var done = root.querySelector('.cform__done');
        var status = root.querySelector('.cform__status');
        var submitBtn = root.querySelector('.cform__submit');
        var mailBtn = root.querySelector('.cform__mail');
        var sending = false;

        function input(name) { return form.querySelector('[name="' + name + '"]'); }
        function fieldWrap(name) { return form.querySelector('[data-field="' + name + '"]'); }

        function values() {
            return {
                name: input('name').value.trim(),
                email: input('email').value.trim(),
                phone: input('phone').value.trim(),
                subject: input('subject').value.trim(),
                message: input('message').value.trim()
            };
        }

        function setStatus(text, kind) {
            status.className = 'cform__status' + (kind ? ' is-' + kind : '');
            status.textContent = text || '';
        }

        function reset() {
            form.reset();
            form.hidden = false;
            done.hidden = true;
            setStatus('');
            Array.prototype.slice.call(form.querySelectorAll('.cfield')).forEach(function (f) {
                f.classList.remove('is-invalid');
            });
        }

        function focusFirstEmpty(preventScroll) {
            var target = submitBtn;
            for (var i = 0; i < FIELD_ORDER.length; i++) {
                var el = input(FIELD_ORDER[i]);
                if (!el.value.trim()) { target = el; break; }
            }
            try { target.focus({ preventScroll: !!preventScroll }); } catch (e) { target.focus(); }
        }

        function validate() {
            var v = values();
            var checks = {
                name: v.name.length >= 2,
                email: EMAIL_RE.test(v.email),
                phone: v.phone === '' || v.phone.replace(/[^0-9]/g, '').length >= 7,
                subject: v.subject.length >= 3,
                message: v.message.length >= 10
            };
            var bad = [];
            Object.keys(checks).forEach(function (key) {
                fieldWrap(key).classList.toggle('is-invalid', !checks[key]);
                if (!checks[key]) bad.push(key);
            });
            return bad;
        }

        form.addEventListener('input', function (e) {
            var wrap = e.target.closest ? e.target.closest('[data-field]') : null;
            if (wrap) wrap.classList.remove('is-invalid');
            if (status.classList.contains('is-err')) setStatus('');
        });

        /* visitor's own mail app */
        mailBtn.addEventListener('click', function () {
            var v = values();
            var body = 'Name: ' + (v.name || '-') + '\n' +
                       'Email: ' + (v.email || '-') + '\n' +
                       'Phone / WhatsApp: ' + (v.phone || '-') + '\n\n' +
                       (v.message || '');
            window.location.href = 'mailto:' + OWNER_EMAIL +
                '?subject=' + encodeURIComponent('[Portfolio] ' + (v.subject || 'New message')) +
                '&body=' + encodeURIComponent(body);
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (sending) return;

            var bad = validate();
            if (bad.length) {
                setStatus('Please fix the highlighted fields.', 'err');
                input(bad[0]).focus();
                return;
            }

            var v = values();
            var originalHTML = submitBtn.innerHTML;
            sending = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending\u2026';
            setStatus('Sending your message\u2026');

            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: v.name,
                    email: v.email,
                    phone: v.phone,
                    subject: v.subject,
                    message: v.message,
                    _subject: 'Portfolio: ' + v.subject,
                    _template: 'table',
                    _captcha: 'false'
                })
            })
            .then(function (res) {
                return res.json().catch(function () { return {}; }).then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (out) {
                var ok = out.ok && out.data && (out.data.success === true || out.data.success === 'true');
                if (!ok) throw new Error((out.data && out.data.message) || 'the service refused the message');
                sending = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                form.hidden = true;
                done.hidden = false;
                var closer = done.querySelector('[data-done-close]');
                if (closer) closer.focus();
            })
            .catch(function (err) {
                sending = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                var msg = (err && err.message) ? String(err.message) : 'network error';
                if (window.console && console.warn) console.warn('[contact form]', msg);
                setStatus(
                    /activ/i.test(msg)
                        ? 'Automatic sending is not switched on yet \u2014 please use "Open in my email app" below. Your details are already filled in.'
                        : 'Could not send automatically. Use "Open in my email app" below \u2014 your details are already filled in.',
                    'err'
                );
            });
        });

        done.querySelector('[data-done-close]').addEventListener('click', function () {
            reset();
            if (options.onClose) options.onClose();
            else focusFirstEmpty();
        });

        return {
            root: root,
            reset: reset,
            focusFirstEmpty: focusFirstEmpty,
            isDone: function () { return !done.hidden; }
        };
    }

    /* ---------------------------------------------------------
       Inline form (Contact page)
       --------------------------------------------------------- */
    var inlineMount = document.querySelector('[data-contact-inline]');
    var inlineForm = null;
    if (inlineMount) {
        inlineForm = createComponent({ variant: 'inline', doneLabel: 'Send another message' });
        inlineMount.appendChild(inlineForm.root);
    }

    /* ---------------------------------------------------------
       Dialog (any page without an inline form)
       --------------------------------------------------------- */
    var modalEl = null;
    var modalForm = null;
    var lastFocus = null;

    function closeModal() {
        if (!modalEl) return;
        modalEl.hidden = true;
        document.body.classList.remove('modal-open');
        if (modalForm.isDone()) modalForm.reset();
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    if (!inlineForm && document.querySelector('[data-contact-modal]')) {
        var host = document.createElement('div');
        host.innerHTML =
            '<div class="modal" id="contactModal" hidden>' +
                '<div class="modal__backdrop" data-modal-close></div>' +
                '<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle">' +
                    '<button type="button" class="modal__close" data-modal-close aria-label="Close dialog">&#10005;</button>' +
                    '<span class="modal__kicker">Get In Touch</span>' +
                    '<h2 class="modal__title" id="contactModalTitle">Send me a <span>message</span></h2>' +
                    '<p class="modal__lead">Leave your details and describe your request &mdash; it goes straight to my inbox.</p>' +
                    '<div data-modal-form-mount></div>' +
                '</div>' +
            '</div>';
        modalEl = host.firstChild;
        document.body.appendChild(modalEl);

        modalForm = createComponent({ variant: 'modal', doneLabel: 'Close', onClose: closeModal });
        modalEl.querySelector('[data-modal-form-mount]').appendChild(modalForm.root);

        Array.prototype.slice.call(modalEl.querySelectorAll('[data-modal-close]')).forEach(function (el) {
            el.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', function (e) {
            if (modalEl.hidden) return;
            if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
            if (e.key !== 'Tab') return;
            var dialog = modalEl.querySelector('.modal__dialog');
            var focusable = Array.prototype.slice.call(dialog.querySelectorAll('button, input, textarea, select, a[href]'))
                .filter(function (el) { return !el.disabled && el.name !== '_honey' && el.offsetParent !== null; });
            if (!focusable.length) return;
            var first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    }

    /* ---------------------------------------------------------
       Triggers - "Hire Me", "Get In Touch", "Work With Me"
       --------------------------------------------------------- */
    Array.prototype.slice.call(document.querySelectorAll('[data-contact-modal]')).forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();

            if (inlineForm) {                       // already on the page: go to it
                var smooth = !window.matchMedia ||
                    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                inlineForm.root.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
                window.setTimeout(function () { inlineForm.focusFirstEmpty(true); }, smooth ? 460 : 60);
                /* Smooth scrolling can be skipped or interrupted (reduced motion,
                   older engines), which would leave the form off-screen while the
                   caret sits in a field the visitor cannot see. Make sure it lands
                   in view either way. */
                window.setTimeout(function () {
                    var box = inlineForm.root.getBoundingClientRect();
                    if (box.top < 0 || box.bottom > window.innerHeight) {
                        inlineForm.root.scrollIntoView({ block: 'center' });
                    }
                }, 900);
                return;
            }

            lastFocus = el;
            modalEl.hidden = false;
            document.body.classList.add('modal-open');
            /* The dialog was display:none a moment ago, so focus cannot move into it
               until the browser has laid it out. Try immediately, then once more after
               paint (the timer also covers throttled/background frames). */
            modalForm.focusFirstEmpty();
            window.requestAnimationFrame(function () { modalForm.focusFirstEmpty(); });
            window.setTimeout(function () { modalForm.focusFirstEmpty(); }, 60);
        });
    });
})();
