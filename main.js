/**
 * Portfolio — main.js
 *
 * Modules:
 *  1. Page fade-in
 *  2. Nav scroll-progress line — fills the center gap precisely
 *  3. Hero word-by-word stagger
 *  4. Scroll reveal (.reveal)
 *  5. Mobile nav drawer
 *  6. Testimonial carousel (animated, arrows + dots + auto-play + swipe)
 *  7. Lightbox (hobby gallery)
 *  8. Smooth page transitions
 *  9. Image fallback loader
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────
     1. PAGE FADE-IN
  ───────────────────────────────────────────────────── */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .3s ease';
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.style.opacity = '1'; });
  });

  /* ─────────────────────────────────────────────────────
     2. NAV SCROLL-PROGRESS LINE
     ─────────────────────────────────────────────────────
     The line lives inside .nav__center which is flex:1,
     filling the space between the logo and the nav links.
     We measure the actual pixel width of that container
     at runtime (and re-measure on resize) so the line
     fills it exactly when the user reaches the bottom.

     At scroll 0%  → line width = LINE_MIN_PX (short dash)
     At scroll 100% → line width = width of .nav__center
                                   minus a small visual gap
  ───────────────────────────────────────────────────── */
  var scrollLine   = document.querySelector('.nav__scroll-line');
  var centerEl     = document.querySelector('.nav__center');
  var LINE_MIN_PX  = 28;   /* resting dash width in px        */
  var LINE_GAP_PX  = 32;   /* breathing room each side at 100% */
  var lineMaxWidth = 260;  /* fallback; overwritten by measure() */

  function measureLineMax() {
    if (!centerEl) return;
    /* Available width = centre container width minus the gap we keep on each side */
    var available = centerEl.offsetWidth - LINE_GAP_PX * 2;
    lineMaxWidth  = Math.max(available, LINE_MIN_PX + 10);
  }

  function updateScrollLine() {
    if (!scrollLine) return;

    var scrolled  = window.pageYOffset || document.documentElement.scrollTop;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    /* Clamp percentage 0–1 */
    var pct = maxScroll > 0 ? Math.min(Math.max(scrolled / maxScroll, 0), 1) : 0;

    /* Interpolate from the short resting dash to the full available width */
    var width = LINE_MIN_PX + (lineMaxWidth - LINE_MIN_PX) * pct;
    scrollLine.style.width = width.toFixed(1) + 'px';
  }

  /* Initial measure + attach listeners */
  measureLineMax();
  updateScrollLine();
  window.addEventListener('scroll', updateScrollLine, { passive: true });
  window.addEventListener('resize', function () {
    measureLineMax();
    updateScrollLine();
  }, { passive: true });

  /* ─────────────────────────────────────────────────────
     3. HERO WORD-BY-WORD STAGGER
  ───────────────────────────────────────────────────── */
  var heroWords = document.querySelectorAll('.hero__word');
  var heroSub   = document.querySelector('.hero__subheading');
  if (heroWords.length) {
    heroWords.forEach(function (w, i) {
      w.style.transitionDelay = (0.05 + i * 0.04) + 's';
      setTimeout(function () { w.classList.add('is-visible'); }, 80 + i * 40);
    });
  }
  if (heroSub) {
    setTimeout(function () { heroSub.classList.add('is-visible'); }, 600);
  }

  /* ─────────────────────────────────────────────────────
     4. SCROLL REVEAL
  ───────────────────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        revealObs.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ─────────────────────────────────────────────────────
     5. MOBILE NAV DRAWER
  ───────────────────────────────────────────────────── */
  var navHam    = document.getElementById('navHam');
  var navDrawer = document.getElementById('navDrawer');
  if (navHam && navDrawer) {
    navHam.addEventListener('click', function () {
      var isOpen = navDrawer.classList.toggle('nav__drawer--open');
      navHam.setAttribute('aria-expanded', String(isOpen));
    });
    navDrawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navDrawer.classList.remove('nav__drawer--open');
        navHam.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─────────────────────────────────────────────────────
     6. TESTIMONIAL CAROUSEL
     ─ Animated slide transition (translateX + opacity)
     ─ Arrow buttons (prev/next)
     ─ Dot indicators (click to jump)
     ─ Auto-plays every 6 s, pauses on hover/focus
     ─ Touch/swipe support
  ───────────────────────────────────────────────────── */
  var track    = document.getElementById('testimonialTrack');
  var prevBtn  = document.getElementById('testimonialPrev');
  var nextBtn  = document.getElementById('testimonialNext');
  var dots     = document.querySelectorAll('.testimonial-carousel__dot');
  var slides   = track ? Array.from(track.querySelectorAll('.testimonial-slide')) : [];
  var total    = slides.length;
  var current  = 0;
  var autoTimer = null;
  var AUTOPLAY_DELAY = 6000;

  function goTo(index) {
    index = ((index % total) + total) % total;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    slides.forEach(function (s, i) {
      s.classList.toggle('is-active', i === index);
      s.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
    current = index;
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(function () { goTo(current + 1); }, AUTOPLAY_DELAY);
  }
  function stopAutoplay() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if (track && total > 0) {
    slides.forEach(function (s, i) {
      s.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
    });
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); stopAutoplay(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); stopAutoplay(); startAutoplay(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10));
        stopAutoplay(); startAutoplay();
      });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAutoplay(); startAutoplay(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); stopAutoplay(); startAutoplay(); }
    });
    var carouselEl = track.closest('[aria-label="Testimonials"]') || track.parentElement;
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopAutoplay);
      carouselEl.addEventListener('mouseleave', startAutoplay);
      carouselEl.addEventListener('focusin',    stopAutoplay);
      carouselEl.addEventListener('focusout',   startAutoplay);
    }
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var delta = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(delta) > 40) {
        goTo(delta > 0 ? current + 1 : current - 1);
        stopAutoplay(); startAutoplay();
      }
    }, { passive: true });
    startAutoplay();
  }

  /* ─────────────────────────────────────────────────────
     7. LIGHTBOX
  ───────────────────────────────────────────────────── */
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lightboxImg');
  var lbClose = document.getElementById('lightboxClose');
  var lbPrev  = document.getElementById('lightboxPrev');
  var lbNext  = document.getElementById('lightboxNext');
  var lbGal   = [];
  var lbIdx   = 0;

  function lbOpen(imgs, idx) {
    lbGal = imgs; lbIdx = idx;
    lbImg.src = lbGal[lbIdx].src;
    lbImg.alt = lbGal[lbIdx].alt;
    lb.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }
  function lbClose_() { lb.classList.remove('lightbox--open'); document.body.style.overflow = ''; }
  function lbGo(d) {
    lbIdx = (lbIdx + d + lbGal.length) % lbGal.length;
    lbImg.src = lbGal[lbIdx].src;
    lbImg.alt = lbGal[lbIdx].alt;
  }
  if (lb) {
    document.querySelectorAll('.hobby-gallery__img').forEach(function (img) {
      img.addEventListener('click', function () {
        var all = Array.from(img.closest('.hobby-gallery').querySelectorAll('.hobby-gallery__img'));
        lbOpen(all, all.indexOf(img));
      });
    });
    if (lbClose) lbClose.addEventListener('click', lbClose_);
    if (lbPrev)  lbPrev.addEventListener('click',  function (e) { e.stopPropagation(); lbGo(-1); });
    if (lbNext)  lbNext.addEventListener('click',  function (e) { e.stopPropagation(); lbGo(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose_(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape')     lbClose_();
      if (e.key === 'ArrowLeft')  lbGo(-1);
      if (e.key === 'ArrowRight') lbGo(1);
    });
  }

  /* ─────────────────────────────────────────────────────
     8. SMOOTH PAGE TRANSITIONS
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || a.target === '_blank') return;
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(function () { window.location.href = href; }, 270);
    });
  });

  /* ─────────────────────────────────────────────────────
     9. IMAGE FALLBACK LOADER
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function tryFallback() {
      if (img.dataset.fallback && img.src !== img.dataset.fallback) {
        img.src = img.dataset.fallback;
      }
    }
    if (img.complete && img.naturalWidth === 0) tryFallback();
    img.addEventListener('error', tryFallback);
  });

})();
