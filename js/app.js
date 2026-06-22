/**
 * APP.JS — Master Orchestrator
 * Initializes all modules, manages preloader, coordinates the experience
 */

(function () {
  'use strict';

  const state = {
    initialized: false,
    currentSection: 'hero',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  // ═══════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════
  function init() {
    if (state.initialized) return;
    state.initialized = true;

    console.log('🎂 Happy Birthday PrismaX! Initializing...');

    // Lock scroll during preloader
    document.body.style.overflow = 'hidden';

    // Initialize engine (GSAP + Lenis + SplitType)
    if (window.PrismaXEngine) {
      window.PrismaXEngine.init();
    }

    // Initialize robot
    if (window.PrismaXRobot) {
      window.PrismaXRobot.init();
    }

    // Initialize sounds
    if (window.PrismaXSounds) {
      window.PrismaXSounds.init();
    }

    // Initialize carousel
    if (window.PrismaXCarousel) {
      window.PrismaXCarousel.init();
    }

    // Initialize finale
    if (window.PrismaXFinale) {
      window.PrismaXFinale.init();
    }

    // Setup navigation
    setupNavigation();

    // Setup section tracking
    setupSectionTracking();

    // Initialize custom cursor
    initCustomCursor();

    // Run preloader
    runPreloader(() => {
      // Unlock scroll
      document.body.style.overflow = '';

      // Start hero animations
      if (window.PrismaXEngine) {
        window.PrismaXEngine.startHeroAnimations();
      }

      // Initialize scroll-triggered animations
      if (window.PrismaXEngine) {
        window.PrismaXEngine.initScrollAnimations();
      }

      // Play opening sound
      if (window.PrismaXSounds) {
        window.PrismaXSounds.play('magical');
      }

      console.log('🎉 PrismaX Birthday Website Ready!');
    });
  }

  // ═══════════════════════════════════════════
  // PRELOADER
  // ═══════════════════════════════════════════
  function runPreloader(onComplete) {
    const preloader = document.getElementById('preloader');
    const ring = document.getElementById('preloader-ring');
    const percentText = document.getElementById('preloader-percent');

    if (!preloader) {
      if (onComplete) onComplete();
      return;
    }

    const circumference = 2 * Math.PI * 54; // r=54
    let progress = 0;
    const duration = 2400;
    const start = performance.now();

    function updateProgress(now) {
      const elapsed = now - start;
      progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const percent = Math.floor(eased * 100);

      // Update ring
      if (ring) {
        const offset = circumference * (1 - eased);
        ring.style.strokeDashoffset = offset;
      }

      // Update text
      if (percentText) {
        percentText.textContent = percent;
      }

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        // Preloader exit animation
        gsap.to(preloader, {
          opacity: 0,
          scale: 1.05,
          duration: 0.6,
          ease: 'power3.inOut',
          onComplete: () => {
            preloader.classList.add('hidden');
            preloader.style.display = 'none';
            if (onComplete) onComplete();
          }
        });
      }
    }

    requestAnimationFrame(updateProgress);
  }

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════
  function setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!navToggle || !navLinks) return;

    // Mobile toggle
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      if (window.PrismaXSounds) window.PrismaXSounds.play('click');
    });

    // Close on link click + smooth scroll
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');

        const target = link.getAttribute('href');
        if (window.PrismaXEngine) {
          window.PrismaXEngine.scrollTo(target);
        }

        if (window.PrismaXSounds) window.PrismaXSounds.play('click');
      });
    });

    // Logo click
    const logo = document.querySelector('.nav__logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.PrismaXEngine) {
          window.PrismaXEngine.scrollTo('#hero');
        }
      });
    }
  }

  // ═══════════════════════════════════════════
  // SECTION TRACKING
  // ═══════════════════════════════════════════
  function setupSectionTracking() {
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => onSectionChange(section.id),
        onEnterBack: () => onSectionChange(section.id),
      });
    });
  }

  function onSectionChange(sectionId) {
    if (sectionId === state.currentSection) return;
    state.currentSection = sectionId;

    // Update nav active state
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionId);
    });

    // Dispatch event
    const event = new CustomEvent('sectionchange', {
      detail: { section: sectionId, sectionId: sectionId }
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);

    // Section-specific sounds
    if (window.PrismaXSounds && !window.PrismaXSounds.isMuted()) {
      if (sectionId === 'groundbreaker') {
        window.PrismaXSounds.play('success');
      } else if (sectionId === 'finale') {
        window.PrismaXSounds.play('magical');
      }
    }
  }

  // ═══════════════════════════════════════════
  // CUSTOM CURSOR
  // ═══════════════════════════════════════════
  function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    // Set initial position offscreen
    gsap.set(cursor, { x: -100, y: -100 });

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }, { passive: true });

    // Add hover states for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], .family-card, .memory-card, .learned__card, .journey__milestone, .color-picker__toggle, .color-picker__circle, .sound-toggle'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
      });
    });

    // Carousel grabbing state
    const carousels = document.querySelectorAll('.carousel, #journey-track');
    carousels.forEach(c => {
      c.addEventListener('mousedown', () => {
        cursor.classList.add('grabbing');
      });
      window.addEventListener('mouseup', () => {
        cursor.classList.remove('grabbing');
      });
    });
  }

  // ═══════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════
  window.PrismaXApp = {
    getState: () => ({ ...state }),
    getCurrentSection: () => state.currentSection,
  };

  // ═══════════════════════════════════════════
  // START
  // ═══════════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
