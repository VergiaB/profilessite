/* ==========================================================
   PROFILES SALON — Interaction Engine
   Sections: Nav / Form / Scroll Progress / Reveal on Scroll /
             Parallax / Tilt / Magnetic Buttons / Cursor Glow
   All motion respects prefers-reduced-motion and is skipped
   on touch devices where it wouldn't apply anyway.
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  var enableMotion = !reduceMotion && isFinePointer;

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initForm();
    initScrollProgress();
    initRevealOnScroll();
    initStatCounters();
    if (enableMotion) {
      initParallaxHero();
      initTilt();
      initMagneticButtons();
      initCursorGlow();
    }
  });

  /* ---------------- Nav ---------------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    var nav = document.querySelector('.nav');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      });
    }

    if (nav) {
      var onScroll = throttleRAF(function () {
        nav.classList.toggle('is-scrolled', window.scrollY > 12);
      });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------------- Contact form ---------------- */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = document.querySelector('.form-success');
      var error = document.querySelector('.form-error');
      var submitBtn = form.querySelector('button[type="submit"]');
      if (error) error.style.display = 'none';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.style.display = 'none';
            if (success) success.classList.add('is-visible');
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          if (error) error.style.display = 'block';
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Request'; }
        });
    });
  }

  /* ---------------- Scroll progress bar ---------------- */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    var onScroll = throttleRAF(function () {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initRevealOnScroll() {
    var selectors = [
      '.section-head', '.diptych__tile', '.team-card', '.testimonial',
      '.service-block', '.about-split', '.trust-bar__item',
      '.hero-medium__image', '.gallery img', '.award-strip',
      '.contact-info-card', '#contact-form', '.location-split__info'
    ];
    var els = document.querySelectorAll(selectors.join(','));
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('reveal-io', 'is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el, i) {
      el.classList.add('reveal-io');
      el.style.setProperty('--reveal-delay', Math.min(i % 4, 3) * 70 + 'ms');
      io.observe(el);
    });
  }

  /* ---------------- Parallax hero image ---------------- */
  function initParallaxHero() {
    var wraps = document.querySelectorAll('.hero-split__image, .hero-medium__image');
    if (!wraps.length) return;
    var onScroll = throttleRAF(function () {
      var y = window.scrollY;
      wraps.forEach(function (wrap) {
        var rect = wrap.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var img = wrap.querySelector('img');
        if (!img) return;
        var offset = Math.min(y * 0.12, 60);
        img.style.transform = 'translateY(' + offset + 'px) scale(1.08)';
      });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Tilt on hover ---------------- */
  function initTilt() {
    var targets = document.querySelectorAll(
      '.diptych__tile, .team-card, .service-block__image, .about-split__image, .contact-info-card, .hero-medium__image'
    );
    targets.forEach(function (el) {
      el.classList.add('tilt');
      var bounds;

      el.addEventListener('mouseenter', function () {
        bounds = el.getBoundingClientRect();
      });

      el.addEventListener('mousemove', function (e) {
        if (!bounds) bounds = el.getBoundingClientRect();
        var px = (e.clientX - bounds.left) / bounds.width - 0.5;
        var py = (e.clientY - bounds.top) / bounds.height - 0.5;
        var rotateX = (py * -6).toFixed(2);
        var rotateY = (px * 8).toFixed(2);
        el.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagneticButtons() {
    var buttons = document.querySelectorAll('.btn--primary');
    buttons.forEach(function (btn) {
      var bounds;
      btn.addEventListener('mouseenter', function () { bounds = btn.getBoundingClientRect(); });
      btn.addEventListener('mousemove', function (e) {
        if (!bounds) bounds = btn.getBoundingClientRect();
        var x = (e.clientX - bounds.left - bounds.width / 2) * 0.25;
        var y = (e.clientY - bounds.top - bounds.height / 2) * 0.35;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------------- Cursor glow (hero only) ---------------- */
  function initCursorGlow() {
    var glow = document.querySelector('.cursor-glow');
    var hero = document.querySelector('.hero-split, .hero-medium');
    if (!glow || !hero) return;

    hero.addEventListener('mousemove', function (e) {
      glow.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px) translate(-50%, -50%)';
      glow.classList.add('is-active');
    });
    hero.addEventListener('mouseleave', function () {
      glow.classList.remove('is-active');
    });
  }

  /* ---------------- Animated stat counters ---------------- */
  function initStatCounters() {
    var stats = document.querySelectorAll('.trust-bar__item .stat-number');
    if (!stats.length) return;

    stats.forEach(function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^(\d+)(.*)$/); // e.g. "30" -> counts up; "2nd"/"5★" fall through untouched
      if (!match) return;

      var target = parseInt(match[1], 10);
      var suffix = match[2] || '';
      el.textContent = '0' + suffix;

      var run = function () {
        var start = null;
        var duration = enableMotion ? 1100 : 1;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      };

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { run(); io.unobserve(entry.target); }
          });
        }, { threshold: 0.5 });
        io.observe(el);
      } else {
        run();
      }
    });
  }

  /* ---------------- Utility: rAF throttle ---------------- */
  function throttleRAF(fn) {
    var ticking = false;
    return function () {
      if (!ticking) {
        requestAnimationFrame(function () { fn(); ticking = false; });
        ticking = true;
      }
    };
  }
})();
