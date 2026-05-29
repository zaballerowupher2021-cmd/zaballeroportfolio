'use strict';

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

function qsa(selector, context) {
  try {
    return Array.from((context || document).querySelectorAll(selector));
  } catch (e) {
    console.error('[Portfolio] Invalid selector:', selector, e);
    return [];
  }
}

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

function initLoader() {
  var loader = qs('#loader');
  if (!loader) return;

  
  window.addEventListener('load', function () {
    setTimeout(function () {
      loader.classList.add('hidden');
    }, 900);
  });

  
  setTimeout(function () {
    loader.classList.add('hidden');
  }, 4000);
}

function initTheme() {
  var btn  = qs('#themeToggle');
  var html = document.documentElement;

  if (!btn) return;

  
  var saved = null;
  try { saved = localStorage.getItem('jz-theme'); } catch (_) {}
  var isDark = saved !== 'light'; 

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

function initCursor() {
  
  if (!window.matchMedia('(hover: hover)').matches) return;

  var dot  = qs('#cursor-dot');
  var ring = qs('#cursor-ring');
  if (!dot || !ring) return;

  var mx = 0, my = 0;   
  var rx = 0, ry = 0;   
  var rafId = null;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  
  var hoverTargets = qsa(
    'a, button, .skill-card, .project-card, .exp-card, .contact-link-item, .nav-cta, .btn'
  );

  hoverTargets.forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
  });

  
  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

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

function initMobileMenu() {
  var menu       = qs('#mobileMenu');
  var openBtn    = qs('#navHamburger');
  var closeBtn   = qs('#mobileClose');
  var mobileLinks = qsa('.mobile-link');

  if (!menu) return;

  function openMenu() {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden'; 
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    
    if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closeMenu() {
    menu.classList.remove('open');
    document.body.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    
    if (openBtn) openBtn.focus();
  }

  if (openBtn)  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  
  menu.addEventListener('click', function (e) {
    if (e.target === menu) closeMenu();
  });
}

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

function initScrollReveal() {
  var elements = qsa('.fade-up');
  if (!elements.length) return;

  
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
}

function initSmoothAnchors() {
  var NAV_OFFSET = 80; 

  qsa('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return; 

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

function initContactForm() {

  
  var WEB3FORMS_KEY = 'ee803336-082f-47fd-ac63-f0c5d3f4868c';
  

  var submitBtn  = qs('#formSubmitBtn');
  var successMsg = qs('#formSuccess');
  var errorMsg   = qs('#formError');

  if (!submitBtn) return;

  submitBtn.addEventListener('click', handleSubmit);

  
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

    
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    
    fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        name:       name,
        email:      email,
        subject:    subject || 'Portfolio Contact from ' + name,
        message:    message,
        botcheck:   ''          
      })
    })
    .then(function (response) {
      
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      if (data.success) {
        
        submitBtn.textContent = '✓ Sent!';
        showSuccess('✅ Message sent! I\'ll get back to you soon.');

        
        ['fname', 'femail', 'fsubject', 'fmessage'].forEach(function (id) {
          var el = qs('#' + id);
          if (el) el.value = '';
        });

        
        setTimeout(function () {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Send Message ✉';
          hideMessages();
        }, 5000);

      } else {
        
        throw new Error(data.message || 'Web3Forms returned an error');
      }
    })
    .catch(function (err) {
      
      console.error('Web3Forms error:', err);
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message ✉';
      showError('⚠️ Failed to send. Please email me directly at zaballerowupher2021@gmail.com');
    });
  }

  

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

function initParticleCanvas() {
  var canvas = qs('#particle-canvas');
  if (!canvas) return;

  
  var ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (_) {}
  if (!ctx) { canvas.style.display = 'none'; return; }

  var PARTICLE_COUNT = 70;
  var CONNECT_DIST   = 130;
  var pts = [];
  var animId = null;

  
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

  
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildParticles(); 
  }

  resizeCanvas();

  
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  
  function getColour() {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return light ? '0,191,166' : '0,212,255';
  }

  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var col = getColour();

    
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx;
      p.y += p.vy;

      
      if (p.x < 0)              p.x = canvas.width;
      if (p.x > canvas.width)   p.x = 0;
      if (p.y < 0)              p.y = canvas.height;
      if (p.y > canvas.height)  p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col + ',0.65)';
      ctx.fill();
    }

    
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

  
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });
}