/**
 * main.js — Jaspher Zaballero Portfolio
 *
 * Sections:
 *   1. DOMContentLoaded guard (single entry point)
 *   2. Loader
 *   3. Theme toggle
 *   4. Custom cursor
 *   5. Navbar scroll behaviour
 *   6. Mobile menu
 *   7. Scroll-to-top button
 *   8. Scroll-reveal (IntersectionObserver)
 *   9. Smooth anchor navigation
 *  10. Contact form validation
 *  11. Particle canvas
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   HELPER — safe element getter (never throws)
───────────────────────────────────────────────────────────── */
/**
 * Returns the element matching `selector`, or null with a
 * console warning when it cannot be found.
 * @param {string} selector
 * @param {Document|Element} [context=document]
 * @returns {Element|null}
 */
function qs(selector, context) {
  try {
    var el = (context || document).querySelector(selector);
    if (!el) console.warn('[Portfolio] Element not found:', selector);
    return el;
  } catch (e) {
    console.error('[Portfolio] Invalid selector:', selector, e);
    return null;
  }
}

/**
 * Returns all elements matching `selector` as an Array.
 * Never throws.
 * @param {string} selector
 * @param {Document|Element} [context=document]
 * @returns {Element[]}
 */
function qsa(selector, context) {
  try {
    return Array.from((context || document).querySelectorAll(selector));
  } catch (e) {
    console.error('[Portfolio] Invalid selector:', selector, e);
    return [];
  }
}


/* ─────────────────────────────────────────────────────────────
   ENTRY POINT — wait for DOM before touching any elements
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  initLoader();
  initTheme();
  initCursor();
  initNavbar();
  initMobileMenu();
  initScrollTop();
  initScrollReveal();
  initSmoothAnchors();
  initContactForm();
  initParticleCanvas();

});


/* ═══════════════════════════════════════════════════════════
   1. LOADER
   Hides the loading overlay once the full page has loaded.
═══════════════════════════════════════════════════════════ */
function initLoader() {
  var loader = qs('#loader');
  if (!loader) return;

  /* Use 'load' (not DOMContentLoaded) so fonts/images finish */
  window.addEventListener('load', function () {
    setTimeout(function () {
      loader.classList.add('hidden');
    }, 900);
  });

  /* Fallback: hide after 4 s even if 'load' never fires */
  setTimeout(function () {
    loader.classList.add('hidden');
  }, 4000);
}


/* ═══════════════════════════════════════════════════════════
   2. THEME TOGGLE
   Toggles data-theme="dark|light" on <html>.
   Persists choice in localStorage so it survives page refresh.
═══════════════════════════════════════════════════════════ */
function initTheme() {
  var btn  = qs('#themeToggle');
  var html = document.documentElement;

  if (!btn) return;

  /* Restore saved preference */
  var saved = null;
  try { saved = localStorage.getItem('jz-theme'); } catch (_) {}
  var isDark = saved !== 'light'; /* default: dark */

  applyTheme(isDark);

  btn.addEventListener('click', function () {
    isDark = !isDark;
    applyTheme(isDark);
    try { localStorage.setItem('jz-theme', isDark ? 'dark' : 'light'); } catch (_) {}
  });

  function applyTheme(dark) {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? '🌙' : '☀️';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}


/* ═══════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
   Dot follows mouse exactly; ring lags behind with lerp.
   Enlarges when hovering interactive elements.
   Automatically disabled on touch-only devices.
═══════════════════════════════════════════════════════════ */
function initCursor() {
  /* Skip on touch-only devices */
  if (!window.matchMedia('(hover: hover)').matches) return;

  var dot  = qs('#cursor-dot');
  var ring = qs('#cursor-ring');
  if (!dot || !ring) return;

  var mx = 0, my = 0;   /* mouse target */
  var rx = 0, ry = 0;   /* ring current position */
  var rafId = null;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  /* Smooth ring follow via requestAnimationFrame */
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  /* Hover-enlargement on interactive elements */
  var hoverTargets = qsa(
    'a, button, .skill-card, .project-card, .exp-card, .contact-link-item, .nav-cta, .btn'
  );

  hoverTargets.forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
  });

  /* Hide cursors when mouse leaves the viewport */
  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}


/* ═══════════════════════════════════════════════════════════
   4. NAVBAR SCROLL BEHAVIOUR
   Adds .scrolled class for glass background when user scrolls.
═══════════════════════════════════════════════════════════ */
function initNavbar() {
  var navbar = qs('#navbar');
  if (!navbar) return;

  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}


/* ═══════════════════════════════════════════════════════════
   5. MOBILE MENU
   Opens/closes full-screen overlay.
   Traps focus, closes on Escape or overlay-click.
═══════════════════════════════════════════════════════════ */
function initMobileMenu() {
  var menu       = qs('#mobileMenu');
  var openBtn    = qs('#navHamburger');
  var closeBtn   = qs('#mobileClose');
  var mobileLinks = qsa('.mobile-link');

  if (!menu) return;

  function openMenu() {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden'; /* prevent background scroll */
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    /* Move focus to close button */
    if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closeMenu() {
    menu.classList.remove('open');
    document.body.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    /* Return focus to hamburger */
    if (openBtn) openBtn.focus();
  }

  if (openBtn)  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  /* Close on link click */
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  /* Close when clicking the dark backdrop (not the menu items) */
  menu.addEventListener('click', function (e) {
    if (e.target === menu) closeMenu();
  });
}


/* ═══════════════════════════════════════════════════════════
   6. SCROLL-TO-TOP BUTTON
   Shows after scrolling 400 px; scrolls to top on click.
═══════════════════════════════════════════════════════════ */
function initScrollTop() {
  var btn     = qs('#scrollTop');
  if (!btn) return;

  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ═══════════════════════════════════════════════════════════
   7. SCROLL REVEAL  (IntersectionObserver)
   Adds .visible to .fade-up elements as they enter the
   viewport.  Falls back gracefully when IO is unsupported.
═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  var elements = qsa('.fade-up');
  if (!elements.length) return;

  /* Fallback for very old browsers */
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          /* Optional: stop watching once revealed */
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
}


/* ═══════════════════════════════════════════════════════════
   8. SMOOTH ANCHOR NAVIGATION
   Intercepts clicks on all in-page href="#..." links and
   scrolls smoothly, accounting for the fixed nav height.
═══════════════════════════════════════════════════════════ */
function initSmoothAnchors() {
  var NAV_OFFSET = 80; /* px to offset for fixed navbar */

  qsa('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return; /* skip bare # links */

      var target = null;
      try { target = document.querySelector(hash); } catch (_) {}

      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   9. CONTACT FORM
   Sends email via Web3Forms (https://web3forms.com).

   HOW TO SET UP (one-time, 2 minutes):
   ─────────────────────────────────────
   1. Go to https://web3forms.com
   2. Enter your email: zaballerowupher2021@gmail.com
   3. Click "Create Access Key" — they'll email you a key
   4. Paste that key below to replace YOUR_ACCESS_KEY_HERE
   5. Done! No account, no dashboard, no SDK needed.

   The access key is safe to leave public in your code.
   It only controls which inbox receives the messages.
═══════════════════════════════════════════════════════════ */
function initContactForm() {

  // ── PASTE YOUR WEB3FORMS KEY HERE (get it free at web3forms.com) ──
  var WEB3FORMS_KEY = 'ee803336-082f-47fd-ac63-f0c5d3f4868c';
  // ──────────────────────────────────────────────────────────────────

  var submitBtn  = qs('#formSubmitBtn');
  var successMsg = qs('#formSuccess');
  var errorMsg   = qs('#formError');

  if (!submitBtn) return;

  submitBtn.addEventListener('click', handleSubmit);

  /* Also allow Ctrl/Cmd+Enter inside the textarea to submit */
  var textarea = qs('#fmessage');
  if (textarea) {
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    });
  }

  function handleSubmit() {
    var nameEl    = qs('#fname');
    var emailEl   = qs('#femail');
    var subjectEl = qs('#fsubject');
    var messageEl = qs('#fmessage');

    if (!nameEl || !emailEl || !messageEl) return;

    var name    = nameEl.value.trim();
    var email   = emailEl.value.trim();
    var subject = subjectEl ? subjectEl.value.trim() : '';
    var message = messageEl.value.trim();

    hideMessages();

    /* ── Client-side validation ── */
    if (!name || !email || !message) {
      showError('⚠️ Please fill in your name, email, and message.');
      if (!name)       nameEl.focus();
      else if (!email) emailEl.focus();
      else             messageEl.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showError('⚠️ Please enter a valid email address.');
      emailEl.focus();
      return;
    }

    /* ── Disable button while sending ── */
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    /*
     * HOW WEB3FORMS WORKS:
     * We send a plain POST request (using fetch) to their API endpoint.
     * No library needed — fetch is built into every modern browser.
     *
     * Required fields:
     *   access_key — your unique key that tells Web3Forms where to deliver
     *   email      — the sender's email (shown in the email you receive)
     *   name       — the sender's name
     *   message    — the message body
     *
     * Optional but useful:
     *   subject    — sets the subject line in your inbox
     *   botcheck   — leave as empty string; prevents spam bots
     */
    fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        name:       name,
        email:      email,
        subject:    subject || 'Portfolio Contact from ' + name,
        message:    message,
        botcheck:   ''          /* honeypot anti-spam field — always empty */
      })
    })
    .then(function (response) {
      /* fetch only rejects on network failure, not HTTP errors,
         so we convert a non-OK response into a real error */
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      if (data.success) {
        /* ── Success ── */
        submitBtn.textContent = '✓ Sent!';
        showSuccess('✅ Message sent! I\'ll get back to you soon.');

        /* Clear all fields */
        ['fname', 'femail', 'fsubject', 'fmessage'].forEach(function (id) {
          var el = qs('#' + id);
          if (el) el.value = '';
        });

        /* Reset button after 5 s */
        setTimeout(function () {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Send Message ✉';
          hideMessages();
        }, 5000);

      } else {
        /* Web3Forms returned success:false (e.g. invalid key) */
        throw new Error(data.message || 'Web3Forms returned an error');
      }
    })
    .catch(function (err) {
      /* ── Any failure lands here ── */
      console.error('Web3Forms error:', err);
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message ✉';
      showError('⚠️ Failed to send. Please email me directly at zaballerowupher2021@gmail.com');
    });
  }

  /* ── Helpers ── */

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showSuccess(msg) {
    if (successMsg) { successMsg.textContent = msg; successMsg.style.display = 'block'; }
    if (errorMsg)   errorMsg.style.display = 'none';
  }

  function showError(msg) {
    if (errorMsg) { errorMsg.textContent = msg; errorMsg.style.display = 'block'; }
    if (successMsg) successMsg.style.display = 'none';
  }

  function hideMessages() {
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg)   errorMsg.style.display   = 'none';
  }
}


/* ═══════════════════════════════════════════════════════════
   10. PARTICLE CANVAS
   Draws small dots and connecting lines on a fixed <canvas>.
   Adapts colour automatically when the theme changes.
   Properly handles canvas unavailability and resize events.
═══════════════════════════════════════════════════════════ */
function initParticleCanvas() {
  var canvas = qs('#particle-canvas');
  if (!canvas) return;

  /* Guard: 2-D context may not be available (e.g. GPU block) */
  var ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (_) {}
  if (!ctx) { canvas.style.display = 'none'; return; }

  var PARTICLE_COUNT = 70;
  var CONNECT_DIST   = 130;
  var pts = [];
  var animId = null;

  /* Build / rebuild particle array */
  function buildParticles() {
    pts = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      pts.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r:  Math.random() * 1.4 + 0.4
      });
    }
  }

  /* Resize canvas to fill viewport */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildParticles(); /* spread particles over new dimensions */
  }

  resizeCanvas();

  /* Debounced resize handler */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  /* Get colour based on current theme */
  function getColour() {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return light ? '0,191,166' : '0,212,255';
  }

  /* Animation loop */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var col = getColour();

    /* Move and draw each particle */
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap around edges */
      if (p.x < 0)              p.x = canvas.width;
      if (p.x > canvas.width)   p.x = 0;
      if (p.y < 0)              p.y = canvas.height;
      if (p.y > canvas.height)  p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col + ',0.65)';
      ctx.fill();
    }

    /* Draw connecting lines between nearby particles */
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x;
        var dy = pts[i].y - pts[j].y;
        var d  = Math.sqrt(dx * dx + dy * dy);

        if (d < CONNECT_DIST) {
          var alpha = 0.12 * (1 - d / CONNECT_DIST);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = 'rgba(' + col + ',' + alpha + ')';
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  draw();

  /* Pause when tab is hidden to save CPU */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });
}