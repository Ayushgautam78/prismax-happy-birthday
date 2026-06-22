/**
 * ENGINE.JS — Core Animation Engine
 * GSAP + Lenis + SplitType powered animation system
 * Inspired by spencergabor.work motion design
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // LENIS SMOOTH SCROLL
  // ═══════════════════════════════════════════
  let lenis = null;
  let aboutJoinDate = new Date('2025-12-17T00:00:00');
  let timeCounterInterval = null;

  function initLenis() {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // ═══════════════════════════════════════════
  // GSAP DEFAULTS
  // ═══════════════════════════════════════════
  function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Set GSAP defaults
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    });

    // Custom eases
    gsap.registerEase('springElastic', function(progress) {
      const p = progress;
      return p === 0 || p === 1
        ? p
        : -Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    });
  }

  // ═══════════════════════════════════════════
  // TEXT SPLITTING
  // ═══════════════════════════════════════════
  function splitTextElements() {
    // Split section titles into words
    document.querySelectorAll('[data-animate="split-words"]').forEach(el => {
      const text = el.textContent.trim();
      const emojis = el.querySelectorAll('.section__title-emoji');
      const emojiTexts = [];
      emojis.forEach(e => { emojiTexts.push(e.outerHTML); e.remove(); });

      // Get remaining text
      const rawText = el.textContent.trim();
      const words = rawText.split(/\s+/);

      el.innerHTML = '';

      // Prepend first emoji if exists
      if (emojiTexts.length > 0) {
        el.insertAdjacentHTML('beforeend', emojiTexts[0] + ' ');
      }

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.style.setProperty('--delay', i);
        span.textContent = word;
        span.setAttribute('aria-hidden', 'true');
        el.appendChild(span);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      // Append last emoji if exists
      if (emojiTexts.length > 1) {
        el.insertAdjacentHTML('beforeend', ' ' + emojiTexts[1]);
      }
    });
  }

  // ═══════════════════════════════════════════
  // HERO ANIMATIONS
  // ═══════════════════════════════════════════
  function animateHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Hero entrance timeline
    const heroTl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        hero.setAttribute('mounted', 'true');
      }
    });

    // Greeting badge
    const greeting = document.getElementById('hero-greeting');
    if (greeting) {
      heroTl.to(greeting, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => greeting.classList.add('revealed')
      }, 0);
    }

    // Title words — elastic spring from scaleY(0)
    const titleWords = hero.querySelectorAll('.hero__title .word');
    titleWords.forEach((word, i) => {
      gsap.set(word, { scaleY: 0, translateY: '0.25ch', transformOrigin: 'bottom center' });
      heroTl.to(word, {
        scaleY: 1,
        translateY: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
      }, 0.1 + i * 0.1);
    });

    // Image cards — pop in with elastic
    const imageCards = hero.querySelectorAll('.hero__image');
    imageCards.forEach((card, i) => {
      gsap.set(card, { scale: 0 });
      heroTl.to(card, {
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
      }, 0.4 + i * 0.08);
    });

    // Subtitle
    const subtitle = hero.querySelector('.hero__subtitle');
    if (subtitle) {
      heroTl.to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        onComplete: () => subtitle.classList.add('revealed')
      }, 0.6);
    }

    // Scroll indicator
    const scrollInd = hero.querySelector('.hero__bot');
    if (scrollInd) {
      gsap.set(scrollInd, { opacity: 0 });
      heroTl.to(scrollInd, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      }, 1);
    }

    // Mouse parallax on image cards
    initHeroParallax(hero);
  }

  // ═══════════════════════════════════════════
  // HERO MOUSE PARALLAX
  // ═══════════════════════════════════════════
  function initHeroParallax(hero) {
    const images = hero.querySelector('.hero__images');
    if (!images) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let velocity = 0;
    let lastMouseX = 0;

    const cards = images.querySelectorAll('.hero__image');

    function onMouseMove(e) {
      const rect = images.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX = (e.clientX - centerX) * 0.15;
      mouseY = (e.clientY - centerY) * 0.15;

      velocity = (e.clientX - lastMouseX) * 0.1;
      lastMouseX = e.clientX;
    }

    function animate() {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      velocity *= 0.95;

      cards.forEach((card, i) => {
        const factor = 1 - i * 0.15;
        card.style.setProperty('--offsetX', (currentX * factor).toFixed(2));
        card.style.setProperty('--offsetY', (currentY * factor).toFixed(2));
        card.style.setProperty('--velocity', velocity.toFixed(2));
      });

      requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animate();
  }

  // ═══════════════════════════════════════════
  // SCROLL-TRIGGERED SECTION ANIMATIONS
  // ═══════════════════════════════════════════
  function initScrollAnimations() {
    // --- About Section ---
    initAboutAnimations();
    // --- Journey Section (Horizontal Scroll) ---
    initJourneyAnimations();
    // --- Learned Section ---
    initLearnedAnimations();
    // --- Memories Section ---
    initMemoriesAnimations();
    // --- Family Section ---
    initFamilyAnimations();
    // --- Special Section ---
    initSpecialAnimations();
    // --- Groundbreaker Section ---
    initGroundbreakerAnimations();
    // --- Wishes Section ---
    initWishesAnimations();
    // --- Finale Section ---
    initFinaleAnimations();
    // --- Generic fade-ups ---
    initGenericAnimations();
  }

  // ── About ──
  function initAboutAnimations() {
    const section = document.querySelector('.about');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    const card = section.querySelector('.about__card');
    if (card) {
      gsap.fromTo(card,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out'
        }
      );
    }

    // Stat counters
    const stats = section.querySelectorAll('.stat__number[data-count]');
    stats.forEach(stat => {
      const target = parseInt(stat.dataset.count, 10);
      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        once: true,
        onEnter: () => animateCounter(stat, target)
      });
    });

    // Initialize live time counter
    initAboutTimeCounter();
  }

  function initAboutTimeCounter() {
    const counterEl = document.getElementById('time-counter');
    if (!counterEl) return;

    if (timeCounterInterval) {
      clearInterval(timeCounterInterval);
    }

    function updateCounter() {
      const now = new Date();
      const diffMs = now - aboutJoinDate;

      if (diffMs < 0) {
        counterEl.textContent = '0d 0h 0m 0s';
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(diffSecs / 86400);
      const hours = Math.floor((diffSecs % 86400) / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      counterEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCounter();
    timeCounterInterval = setInterval(updateCounter, 1000);
  }

  function animateCounter(el, target) {
    const obj = { val: 0 };
    const suffix = el.dataset.suffix || '';
    const final = el.dataset.final || '';
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        const v = Math.round(obj.val);
        if (final && v >= target) {
          el.textContent = final;
        } else {
          el.textContent = (v >= 999 && !suffix) ? '999+' : v + suffix;
        }
      },
      onComplete: () => {
        if (final) {
          el.textContent = final;
        }
      }
    });
  }

  // ── Journey (Horizontal Scroll) ──
  function initJourneyAnimations() {
    const section = document.querySelector('.journey');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    const subtitle = section.querySelector('.section__subtitle');
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: { trigger: subtitle, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
        }
      );
    }

    const track = document.getElementById('journey-track');
    if (!track) return;

    const milestones = track.querySelectorAll('.journey__milestone');

    // Calculate total scroll width
    const getScrollWidth = () => track.scrollWidth - window.innerWidth;

    // Pin section and scroll track horizontally
    const journeyTween = gsap.to(track, {
      x: () => -getScrollWidth(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollWidth()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      }
    });

    // Stagger milestone cards entrance
    milestones.forEach((ms, i) => {
      gsap.from(ms, {
        scrollTrigger: {
          trigger: ms,
          start: 'left 90%',
          toggleActions: 'play none none reverse',
          containerAnimation: journeyTween,
        },
        y: 40,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.05,
      });
    });
  }

  // ── Learned ──
  function initLearnedAnimations() {
    const section = document.querySelector('.learned');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    const subtitle = section.querySelector('.section__subtitle');
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: { trigger: subtitle, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
        }
      );
    }

    // Cards stagger
    const cards = section.querySelectorAll('.learned__card');
    gsap.from(cards, {
      scrollTrigger: {
        trigger: section.querySelector('.learned__grid'),
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
    });

    // 3D Tilt on hover
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 12,
          rotateX: -y * 12,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // ── Memories ──
  function initMemoriesAnimations() {
    const section = document.querySelector('.memories');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    const subtitle = section.querySelector('.section__subtitle');
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: { trigger: subtitle, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
        }
      );
    }

    // Carousel slides entrance (animating the memory-card inside slides to avoid conflict with carousel.js)
    const cards = section.querySelectorAll('.memory-card');
    gsap.from(cards, {
      scrollTrigger: {
        trigger: section.querySelector('.carousel'),
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      y: 40,
      opacity: 0,
      scale: 0.85,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.08,
    });
  }

  // ── Family ──
  function initFamilyAnimations() {
    const section = document.querySelector('.family');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    const subtitle = section.querySelector('.section__subtitle');
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: { trigger: subtitle, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
        }
      );
    }

    // Carousel slides entrance (animating the family-card inside slides to avoid conflict with carousel.js)
    const cards = section.querySelectorAll('.family-card');
    gsap.from(cards, {
      scrollTrigger: {
        trigger: section.querySelector('.carousel'),
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      y: 40,
      opacity: 0,
      scale: 0.85,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.08,
    });
  }

  // ── Special ──
  function initSpecialAnimations() {
    const section = document.querySelector('.special');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    // Text paragraphs stagger reveal
    const paragraphs = section.querySelectorAll('.special__text');
    paragraphs.forEach((p, i) => {
      gsap.from(p, {
        scrollTrigger: {
          trigger: p,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          onEnter: () => p.classList.add('in-view'),
          onLeaveBack: () => p.classList.remove('in-view'),
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: i * 0.05,
      });
    });
  }

  // ── Groundbreaker ──
  function initGroundbreakerAnimations() {
    const section = document.querySelector('.groundbreaker');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    // Trophy reveal
    const trophy = section.querySelector('.groundbreaker__trophy');
    if (trophy) {
      gsap.from(trophy, {
        scrollTrigger: { trigger: trophy, start: 'top 80%' },
        scale: 0.5,
        opacity: 0,
        rotation: -15,
        duration: 1.2,
        ease: 'elastic.out(1, 0.4)',
      });
    }

    // Card
    const card = section.querySelector('.groundbreaker__card');
    if (card) {
      gsap.fromTo(card,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2
        }
      );
    }

    // Medals stagger
    const medals = section.querySelectorAll('.groundbreaker__medal');
    gsap.from(medals, {
      scrollTrigger: { trigger: section.querySelector('.groundbreaker__medals'), start: 'top 85%' },
      scale: 0,
      rotation: -30,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
      stagger: 0.08,
    });
  }

  // ── Wishes ──
  function initWishesAnimations() {
    const section = document.querySelector('.wishes');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    // Paragraphs progressive reveal
    const paragraphs = section.querySelectorAll('.wishes__paragraph');
    paragraphs.forEach((p, i) => {
      gsap.fromTo(p,
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: p,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.05,
        }
      );
    });

    // Thank you card
    const thankyou = section.querySelector('.wishes__thankyou');
    if (thankyou) {
      gsap.fromTo(thankyou,
        { scale: 0.9, opacity: 0 },
        {
          scrollTrigger: { trigger: thankyou, start: 'top 80%', toggleActions: 'play none none reverse' },
          scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)'
        }
      );
    }
  }

  // ── Finale ──
  function initFinaleAnimations() {
    const section = document.querySelector('.finale');
    if (!section) return;

    const title = section.querySelector('.section__title');
    if (title) animateTitle(title);

    const subtitle = section.querySelector('.section__subtitle');
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: { trigger: subtitle, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
        }
      );
    }

    // Cake entrance
    const cake = section.querySelector('.finale__cake');
    if (cake) {
      gsap.fromTo(cake,
        { scale: 0.7, opacity: 0 },
        {
          scrollTrigger: { trigger: cake, start: 'top 80%', toggleActions: 'play none none reverse' },
          scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)'
        }
      );
    }

    // Button entrance
    const btn = section.querySelector('.finale__btn');
    if (btn) {
      gsap.fromTo(btn,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: { trigger: btn, start: 'top 90%', toggleActions: 'play none none reverse' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2
        }
      );
    }
  }

  // ── Generic Animations ──
  function initGenericAnimations() {
    document.querySelectorAll('[data-animate="fade-up"]').forEach(el => {
      // Skip if already animated by a specific section handler
      if (el.closest('.hero')) return;
      if (el.classList.contains('section__subtitle')) return;
      if (el.classList.contains('groundbreaker__card')) return;
      if (el.classList.contains('finale__btn')) return;

      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    document.querySelectorAll('[data-animate="scale-in"]').forEach(el => {
      // Skip if already animated by a specific section handler
      if (el.closest('.hero')) return;
      if (el.classList.contains('about__card')) return;
      if (el.classList.contains('wishes__thankyou')) return;
      if (el.classList.contains('finale__cake')) return;

      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });
    });
  }

  // ═══════════════════════════════════════════
  // TITLE ANIMATION HELPER
  // ═══════════════════════════════════════════
  function animateTitle(el) {
    const words = el.querySelectorAll('.word');
    if (words.length === 0) return;

    words.forEach(w => {
      gsap.set(w, { scaleY: 0, transformOrigin: 'bottom center' });
    });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        words.forEach((w, i) => {
          gsap.to(w, {
            scaleY: 1,
            duration: 1,
            ease: 'elastic.out(1, 0.5)',
            delay: i * 0.08,
          });
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  // PARTICLES (CSS-based, GPU accelerated)
  // ═══════════════════════════════════════════
  function initParticles() {
    const heroParticles = document.getElementById('hero-particles');
    if (!heroParticles) return;

    // Create floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        border-radius: 50%;
        background: ${['#FFE135', '#FF8FAB', '#89CFF0', '#5DD39E', '#D4A5FF', '#FFA62F'][Math.floor(Math.random() * 6)]};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.4 + 0.1};
        pointer-events: none;
        will-change: transform;
      `;
      heroParticles.appendChild(particle);

      gsap.to(particle, {
        y: -100 - Math.random() * 200,
        x: (Math.random() - 0.5) * 100,
        opacity: 0,
        duration: 4 + Math.random() * 6,
        repeat: -1,
        delay: Math.random() * 5,
        ease: 'none',
      });
    }
  }

  // ═══════════════════════════════════════════
  // COLOR PICKER
  // ═══════════════════════════════════════════
  function initColorPicker() {
    const picker = document.getElementById('color-picker');
    const toggle = document.getElementById('color-picker-toggle');
    if (!picker || !toggle) return;

    toggle.addEventListener('click', () => {
      const isOpen = picker.getAttribute('open') === 'true';
      picker.setAttribute('open', isOpen ? 'false' : 'true');
    });

    // Theme switching
    const themes = {
      birthday: {
        '--color-primary': '#FFFEF5',
        '--color-secondary': '#FFE135',
        '--color-accent': '#FF8FAB',
        '--color-surface': '#ffffff',
      },
      rose: {
        '--color-primary': '#FFF5F7',
        '--color-secondary': '#FF8FAB',
        '--color-accent': '#D4A5FF',
        '--color-surface': '#ffffff',
      },
      ocean: {
        '--color-primary': '#F5FAFF',
        '--color-secondary': '#89CFF0',
        '--color-accent': '#5DD39E',
        '--color-surface': '#ffffff',
      },
      forest: {
        '--color-primary': '#F5FFF8',
        '--color-secondary': '#5DD39E',
        '--color-accent': '#FFE135',
        '--color-surface': '#ffffff',
      },
      sunset: {
        '--color-primary': '#FFFAF5',
        '--color-secondary': '#FFA62F',
        '--color-accent': '#FF8FAB',
        '--color-surface': '#ffffff',
      },
    };

    picker.querySelectorAll('input[name="theme-color"]').forEach(input => {
      input.addEventListener('change', () => {
        const theme = themes[input.value];
        if (!theme) return;

        Object.entries(theme).forEach(([prop, val]) => {
          document.documentElement.style.setProperty(prop, val);
        });

        // Close picker
        setTimeout(() => picker.setAttribute('open', 'false'), 300);
      });
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) {
        picker.setAttribute('open', 'false');
      }
    });
  }

  // ═══════════════════════════════════════════
  // GREETINGS CYCLER
  // ═══════════════════════════════════════════
  function startGreetingsCycler() {
    const greetings = [
      "🇺🇸 🎂 Happy Birthday PrismaX 🎂",
      "🇪🇸 🎂 Feliz Cumpleaños PrismaX 🎂",
      "🇫🇷 🎂 Joyeux Anniversaire PrismaX 🎂",
      "🇩🇪 🎂 Alles Gute zum Geburtstag PrismaX 🎂",
      "🇮🇹 🎂 Buon Compleanno PrismaX 🎂",
      "🇵🇹 🎂 Feliz Aniversário PrismaX 🎂",
      "🇷🇺 🎂 С Днем Рождения, PrismaX 🎂",
      "🇯🇵 🎂 PrismaX、お誕生日おめでとう 🎂",
      "🇨🇳 🎂 PrismaX，生日快乐 🎂",
      "🇰🇷 🎂 PrismaX, 생일 축하해요 🎂",
      "🇮🇳 🎂 PrismaX, जन्मदिन मुबारक हो 🎂",
      "🇸🇦 🎂 عيد ميلاد سعيد يا PrismaX 🎂",
      "🇹🇷 🎂 İyi ki doğdun PrismaX 🎂",
      "🇳🇱 🎂 Gefeliciteerd met je verjaardag, PrismaX 🎂",
      "🇵🇱 🎂 Wszystkiego najlepszego, PrismaX 🎂",
      "🇸🇪 🎂 Grattis på födelsedagen, PrismaX 🎂",
      "🇳🇴 🎂 Gratulerer med dagen, PrismaX 🎂",
      "🇩🇰 🎂 Tillykke med fødselsdagen, PrismaX 🎂",
      "🇫🇮 🎂 Hyvää syntymäpäivää PrismaX 🎂",
      "🇬🇷 🎂 Χρόνια Πολλά PrismaX 🎂",
      "🇮🇱 🎂 יום הולדת שמח PrismaX 🎂",
      "🇹🇭 🎂 สุขสันต์วันเกิด PrismaX 🎂",
      "🇻🇳 🎂 Chúc mừng sinh nhật PrismaX 🎂",
      "🇮🇩 🎂 Selamat Ulang Tahun PrismaX 🎂",
      "🇲🇾 🎂 Selamat Hari Lahir PrismaX 🎂",
      "🇵🇭 🎂 Maligayang Kaarawan PrismaX 🎂",
      "🇨🇿 🎂 Všechno nejlepší k narozeninám, PrismaX 🎂",
      "🇸🇰 🎂 Všetko najlepšie, PrismaX 🎂",
      "🇭🇺 🎂 Boldog születésnapot, PrismaX 🎂",
      "🇷🇴 🎂 La mulți ani, PrismaX 🎂",
      "🇺🇦 🎂 З днем народження, PrismaX 🎂",
      "🇧🇬 🎂 Честит рожден ден, PrismaX 🎂",
      "🇷🇸 🎂 Срећан рођендан, PrismaX 🎂",
      "🇭🇷 🎂 Sretan rođendan, PrismaX 🎂",
      "🇸🇮 🎂 Vse najboljše za rojstni dan, PrismaX 🎂",
      "🇱🇹 🎂 Su gimtadieniu, PrismaX 🎂",
      "🇱🇻 🎂 Daudz laimes dzimšanas dienā, PrismaX 🎂",
      "🇪🇪 🎂 Palju õnne sünnipäevaks, PrismaX 🎂",
      "🇮🇪 🎂 Lá breithe shona duit, PrismaX 🎂",
      "🏴󠁧󠁢󠁷󠁬󠁳󠁿 🎂 Penblwydd Hapus PrismaX 🎂",
      "🇮🇸 🎂 Til hamingju með afmælið, PrismaX 🎂",
      "🇰🇪 🎂 Heri ya siku ya kuzaliwa, PrismaX 🎂",
      "🇿🇦 🎂 Usuku lokuzalwa oluhle, PrismaX 🎂",
      "🇿🇦 🎂 Veels geluk met jou verjaarsdag, PrismaX 🎂",
      "🇮🇷 🎂 تولدت مبارک PrismaX 🎂",
      "🇵🇰 🎂 PrismaX, سالگرہ مبارک 🎂",
      "🇮🇳 🎂 PrismaX, జన్మదిన శుభాకాంక్షలు 🎂",
      "🇮🇳 🎂 PrismaX, பிறந்தநாள் வாழ்த்துக்கள் 🎂",
      "🇮🇳 🎂 PrismaX, वाढदिवसाच्या हार्दिक शुभेच्छा 🎂",
      "🇮🇳 🎂 PrismaX, જન્મદિવસ મુબારક 🎂",
      "🇮🇳 🎂 PrismaX, ಹುಟ್ಟುহಬ್ಬದ ಶುಭಾಶయಗಳು 🎂",
      "🇮🇳 🎂 PrismaX, ജന്മദിനാശംസകൾ 🎂",
      "🇮🇳 🎂 PrismaX, ਜਨਮਦਿਨ ਮੁਬਾਰਕ 🎂",
      "🇳🇵 🎂 PrismaX, जन्मदिनको शुभकामना 🎂",
      "🇱🇰 🎂 PrismaX, සුබ උපන්දිනයක් 🎂",
      "🇻🇦 🎂 Felix dies natalis, PrismaX 🎂",
      "🇪🇬 🎂 سنة حلوة يا PrismaX 🎂",
      "🇧🇪 🎂 Gelukkige verjaardag PrismaX 🎂",
      "🇦🇩 🎂 Bon aniversari PrismaX 🎂",
      "🇳🇱 🎂 Hartelijk gefeliciteerd, PrismaX 🎂"
    ];
    let index = 0;
    const textEl = document.getElementById('hero-greeting-text');
    if (!textEl) return;

    setInterval(() => {
      index = (index + 1) % greetings.length;

      gsap.to(textEl, {
        opacity: 0,
        y: -5,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          textEl.textContent = greetings[index];
          gsap.fromTo(textEl,
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
          );
        }
      });
    }, 2500);
  }

  // ═══════════════════════════════════════════
  // NAV SCROLL BEHAVIOR
  // ═══════════════════════════════════════════
  function initNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    let lastScroll = 0;

    if (lenis) {
      lenis.on('scroll', ({ scroll }) => {
        if (scroll > 100) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        if (scroll > lastScroll && scroll > 300) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }
        lastScroll = scroll;
      });
    }
  }

  // ═══════════════════════════════════════════
  // SCROLL INDICATOR HIDE
  // ═══════════════════════════════════════════
  function initScrollIndicatorHide() {
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;

    ScrollTrigger.create({
      trigger: document.querySelector('.about'),
      start: 'top 80%',
      onEnter: () => {
        gsap.to(indicator, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.in' });
      },
      onLeaveBack: () => {
        gsap.to(indicator, { opacity: 0.6, y: 0, duration: 0.5, ease: 'power2.out' });
      }
    });
  }

  // ═══════════════════════════════════════════
  // FAMILY DETAILS MODAL
  // ═══════════════════════════════════════════
  const familyMembers = [
    {
      name: "Bayley",
      role: "CEO",
      img: "assets/bayley.jpeg",
      desc: "Bayley is our CEO and someone the whole community looks up to for his leadership and dedication. He consistently shares valuable articles, podcasts, and insights that help us better understand PrismaX and its vision. I'm truly grateful to be part of this community, and it's inspiring to see a CEO so actively helping PrismaX grow stronger."
    },
    {
      name: "Vivian",
      role: "Marketing Head",
      img: "assets/vivian.jpeg",
      desc: "Vivian is our Marketing Head, and I really admire the way she hosts events, quizzes, and Content Clinic sessions. She genuinely appreciates creativity and always encourages contributors by recognizing the great work happening across the community. What I respect most is how seriously she takes feedback and continuously works to improve PrismaX for everyone."
    },
    {
      name: "MaxCC",
      role: "Moderator",
      img: "assets/Maxcc.png",
      desc: "Max is always working behind the scenes to make the PrismaX community stronger and better for everyone. He carefully reviews our content, provides valuable feedback, and helps us improve while showing how important constructive feedback really is. I also appreciate that he consistently recognizes creative content and meaningful contributions from the community."
    },
    {
      name: "Altmax",
      role: "Regional Ambassador",
      img: "assets/Altmax.png",
      desc: "Altmax is one of the best people in PrismaX and someone I truly look up to as our Regional Ambassador. He was the first person to review my content, give me honest feedback, and guide me on how to improve, making him an incredible mentor. I'm truly grateful for his support, and seeing him lead the Indian community is completely well deserved."
    },
    {
      name: "Shifu",
      role: "Regional Ambassador (Bangladesh)",
      img: "assets/Shifu.png",
      desc: "Shifu is one of the OG contributors in PrismaX and has done an incredible job leading the Bangladesh community. He's a great content creator whose dedication and contributions are appreciated by everyone in the community. What I admire most is that he always puts PrismaX first and is always there whenever someone needs help."
    },
    {
      name: "Sarcastic",
      role: "Regional Ambassador (Pakistan)",
      img: "assets/Sarcastic.png",
      desc: "Sarcastic is one of the Regional Ambassadors from Pakistan and easily one of the friendliest people I've met in PrismaX. I'm a huge admirer of his work ethic and discipline, and he's always available to help or offer valuable suggestions whenever needed. He's a great leader who motivates others, guides the community with confidence, and always inspires people to do better."
    },
    {
      name: "Fahd",
      role: "Regional Ambassador (Egypt)",
      img: "assets/FAHD.png",
      desc: "Fahd is the Regional Ambassador from Egypt, and I really admire the way he shares his teleoperation experience and PrismaX knowledge. His videos and clips on X are always insightful, and I've learned a lot by watching the content he creates. What makes him stand out is how he guides and encourages others to share teleoperation videos and contribute more to the community."
    },
    {
      name: "Mehidi",
      role: "Groundbreaker",
      img: "assets/Mehedi.png",
      desc: "Mehidi is a Groundbreaker from Bangladesh, a good friend, and one of the OG contributors who has been consistently supporting PrismaX for a long time. What I admire most is his consistency, the way he guides new members, and how openly he shares his journey and experience of growing within PrismaX. On top of that, he has a great sense of humor, which makes him even more enjoyable to interact with."
    },
    {
      name: "Chris",
      role: "Content Creator",
      img: "assets/Chris.png",
      desc: "Chris is one of the top content creators from India, and I really admire the way he explains PrismaX topics through his videos. His discipline, consistency, and the hard work he puts into every piece of content truly make him stand out. He's also a great event host within PrismaX, and I wish him nothing but the best for the future."
    },
    {
      name: "Katty",
      role: "Content Creator",
      img: "assets/Katty.png",
      desc: "Katty is one of the top content creators from India, and I love how she explains complex PrismaX topics using a whiteboard in such a simple and creative way. I've genuinely learned a lot from her content, and her ability to make difficult concepts easy to understand makes her stand out. She's also one of the most talented contributors in the Indian community, and after hearing her in karaoke... I have to say she's a secret singer with a really cute voice!"
    },
    {
      name: "Nixkhil",
      role: "Groundbreaker",
      img: "assets/Nickhil.png",
      desc: "Nixkhil joined PrismaX around the same time as me, and he's been a good friend of mine for many years. I really admire his determination, the way he supports the community, guides others, helps with events, and is always ready to lend a hand whenever needed. He's a consistent contributor, and seeing him achieve the Groundbreaker role is well deserved because of his dedication and hard work."
    },
    {
      name: "Kingop03",
      role: "Groundbreaker",
      img: "assets/KingOPw3.png",
      desc: "Kingop03 is one of the oldest contributors in the Indian community, and I've learned a lot by following his content since my early days in PrismaX. He has always been there to guide and help others, and I truly admire his dedication and willingness to support the community. It felt really special that both of us achieved the Groundbreaker role around the same time, making that milestone even more memorable."
    },
    {
      name: "KitesuuX",
      role: "Content Creator",
      img: "assets/KitesuuX.png",
      desc: "KitesuuX is one of the earliest PrismaX members I got to know when I joined, and he's become a really good friend. I've learned a lot from his content, and he's always willing to help anyone in the community whenever they need it. What I admire most is his creativity—he has one of the most creative minds I've seen in PrismaX."
    },
    {
      name: "Kastew",
      role: "Content Creator",
      img: "assets/Kastew.png",
      desc: "Kastew is one of the most talented content creators in PrismaX, and I love the creativity she brings through her handmade charts, graphics, and visual explanations. Her videos make even the most complex topics easy to understand, and the effort she puts into every piece of content is truly impressive. Watching her work always amazes me—I genuinely think she's one of the most creative and talented contributors in the community."
    },
    {
      name: "Chetan",
      role: "Content Creator",
      img: "assets/Chetan.png",
      desc: "Chetan is one of the most active members and one of the most consistent content creators in PrismaX today. His content is always informative, and I really enjoy the detailed posts he creates along with creative banners and graphics. I truly admire his consistency and dedication, and I'm always looking forward to seeing more of his amazing work."
    },
    {
      name: "Akash",
      role: "Digital Artist",
      img: "assets/Akash.png",
      desc: "Akash is one of the best digital artists in the Indian PrismaX community, and his work always stands out. His artwork is among the best content I've seen in PrismaX, with creativity and quality in every piece. What I admire most is his consistency, as he continues to deliver amazing work time after time."
    },
    {
      name: "Likith",
      role: "Content Creator",
      img: "assets/Likith.k.png",
      desc: "Likith is one of the most active members in the PrismaX community and consistently creates great content. He's always present in regional and global events, and I really admire how involved he is in every community activity. His knowledge of what PrismaX is building is impressive, and he's always willing to share and help others learn."
    },
    {
      name: "Byakuya",
      role: "Content Creator",
      img: "assets/Byakuya.png",
      desc: "Byakuya is one of the most consistent contributors in PrismaX, and I truly admire his dedication to the community. Whenever I visit the PrismaX server, I can always find him helping, guiding, and supporting other members. His activity, consistency, and willingness to help make him one of the most valuable people in the community."
    },
    {
      name: "GTA",
      role: "Content Creator",
      img: "assets/Gta.png",
      desc: "GTA is a really cool member who consistently creates great content and stays active throughout the PrismaX community. He's always joining regional events, which shows his enthusiasm and dedication to the community. I also have to say his gaming skills during those events are seriously impressive!"
    },
    {
      name: "0xDumbDegen",
      role: "Content Creator",
      img: "assets/0xdumbdegen.png",
      desc: "0xDumbDegen is one of the teleoperators from the Indian community who consistently creates informative and engaging PrismaX content. His contributions and overall activity in the community are always impressive and show his dedication. On top of that, he has one of the best senses of humor I've seen in PrismaX, which makes interacting with him even more enjoyable."
    },
    {
      name: "Creed",
      role: "Content Creator",
      img: "assets/Creed.png",
      desc: "Creed is a good friend from Egypt who consistently creates high quality content that always stands out. Whether it's on X Spaces or Discord regional activities, he's always present and actively contributing to the PrismaX community. I really admire his consistency, dedication, and the positive energy he brings wherever he participates."
    },
    {
      name: "Hitesh",
      role: "Content Creator",
      img: "assets/Hitesh.png",
      desc: "Hitesh is one of my oldest friends, and I've known him since even before PrismaX. His banner and infographic design skills are absolutely top notch, and every piece of content he creates reflects his creativity. I genuinely believe he's someone we can all learn a lot from, and I always admire the quality of his work."
    },
    {
      name: "Dex",
      role: "Content Creator",
      img: "assets/Dex - Asta.png",
      desc: "Dex is one of my good friends, and we both started our PrismaX journey around the same time. He consistently creates high impact content, hosts regional VC events, and has built some really creative PrismaX websites that I genuinely admire. I love his creative mindset, and it's been amazing to see how much he's grown and contributed to the community."
    },
    {
      name: "Ifeoma",
      role: "Digital Artist",
      img: "assets/Ifeoma1010.png",
      desc: "Ifeoma is from Nigeria but contributes actively to the Indian region, and I'm glad to call her a good friend. Her digital art, banners, flowcharts, and infographics are always creative, and I really admire the effort she puts into every piece of content. Her creativity truly speaks for itself, and she's undoubtedly one of the most admirable creators in the Indian community."
    },
    {
      name: "Shelly",
      role: "Content Creator",
      img: "assets/Shelly.png",
      desc: "Shelly started contributing around the same time as me, and I've always admired her discipline and consistency. She creates banners and infographics almost every day, and the effort she puts into her content is impossible to overlook. Her hard work and dedication truly inspire me, and it's been amazing to watch her grow within the PrismaX community."
    },
    {
      name: "Devi ceo",
      role: "Content Creator",
      img: "assets/Devi Ceo.png",
      desc: "Devi ceo is one of my good friends, and I'm really grateful that PrismaX gave me the chance to meet someone like him. He has been consistently creating content since before I joined, and his dedication has always been something I truly admire. It's been amazing to see his growth over time, and I have to say his gaming skills have improved a lot too! 😄"
    },
    {
      name: "Salted Juice",
      role: "Content Creator",
      img: "assets/Salted juice.jpg",
      desc: "Salted Juice is a talented content creator from the Philippines who previously contributed alongside the Indian community. I really admire her banner designs and the deep understanding she has of what PrismaX is building, which is reflected in her content. She's always someone you can learn from, and it's no surprise that she's one of the most well known and respected members across the PrismaX community."
    },
    {
      name: "Azittt",
      role: "Content Creator",
      img: "assets/Azittt.jpg",
      desc: "Azittt is one of the talented creators from India who consistently delivers high quality content for the PrismaX community. I really admire his development skills, especially the useful websites, tools, and the amazing PrismaX game he recently created. He's also very active in the community chat, and his creativity and dedication make him someone I truly respect."
    },
    {
      name: "Who am I",
      role: "Content Creator",
      img: "assets/who am i.jpg",
      desc: "Who am I is a good friend from Pakistan and one of the oldest PrismaX contributors I've known, whose creativity has always impressed me. He's among the top contributors in the community, and I've genuinely learned a lot from his content and dedication over the years. I'm grateful to know someone like him, and I also admire how active he is on X, consistently posting, engaging, and supporting the community."
    },
    {
      name: "ZaMarti",
      role: "Content Creator",
      img: "assets/zamarti.jpg",
      desc: "ZaMarti is from Ukraine and one of the oldest and most respected content creators I've known in the PrismaX community. She's consistently active on X, Discord, and community spaces, always sharing high quality content and staying involved. I also have to mention that she has an amazing voice. I've heard her in karaoke sessions, and it was a pleasure to listen to! 🎤"
    }
  ];

  function initFamilyModal() {
    const modal = document.getElementById('family-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('family-modal-close');
    const backdrop = modal.querySelector('.modal__backdrop');

    const modalImg = document.getElementById('family-modal-img');
    const modalName = document.getElementById('family-modal-name');
    const modalRole = document.getElementById('family-modal-role');
    const modalDesc = document.getElementById('family-modal-desc');

    const modalContent = modal.querySelector('.family-modal__content');

    // Use event delegation to handle clicks on original and cloned family cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.family-card');
      if (!card) return;

      const id = parseInt(card.dataset.familyId, 10);
      const member = familyMembers[id];
      if (!member) return;

      // Populate modal data
      if (modalImg) modalImg.src = member.img;
      if (modalImg) modalImg.alt = member.name;
      if (modalName) modalName.textContent = member.name;
      if (modalRole) modalRole.textContent = member.role;
      if (modalDesc) modalDesc.textContent = member.desc;

      // Stop Lenis smooth scroll while modal is active
      if (lenis) lenis.stop();

      // Open modal
      modal.classList.add('active');

      // Play click sound
      if (window.PrismaXSounds) window.PrismaXSounds.play('click');

      // Spring scale in animation
      if (modalContent) {
        gsap.killTweensOf(modalContent);
        gsap.fromTo(modalContent, 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'springElastic' }
        );
      }
    });

    function closeModal() {
      // Play click sound
      if (window.PrismaXSounds) window.PrismaXSounds.play('click');

      if (modalContent) {
        gsap.killTweensOf(modalContent);
        gsap.to(modalContent, {
          scale: 0.85,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            modal.classList.remove('active');
            // Resume Lenis smooth scroll
            if (lenis) lenis.start();
          }
        });
      } else {
        modal.classList.remove('active');
        if (lenis) lenis.start();
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
  }

  function updateAndAnimateStat(el, rawValue) {
    const value = rawValue.trim();
    const match = value.match(/^(\d+)(.*)$/);
    
    let target = 0;
    let suffix = '';
    let final = '';
    
    if (match) {
      target = parseInt(match[1], 10);
      suffix = match[2];
      el.removeAttribute('data-final');
      el.setAttribute('data-count', target);
      if (suffix) {
        el.setAttribute('data-suffix', suffix);
      } else {
        el.removeAttribute('data-suffix');
      }
    } else {
      target = 100;
      final = value;
      el.setAttribute('data-count', target);
      el.setAttribute('data-final', final);
      el.removeAttribute('data-suffix');
    }
    
    animateCounter(el, target);
  }

  function initAboutCardCustomizer() {
    const modal = document.getElementById('customize-modal');
    if (!modal) return;

    const STORAGE_KEY = 'prismax-card-custom';
    const DEFAULTS = {
      name: 'Ayush',
      role: 'GroundBreaker, Content Creator',
      joinDate: '2025-12-17',
      content: '100+',
      memories: '1000+',
      smiles: 'Infinite',
      pfp: null // null means use original assets/pfp.jpg
    };

    const customizeBtn = document.getElementById('about-customize-btn');
    const resetBtn = document.getElementById('about-reset-btn');
    const closeBtn = document.getElementById('customize-modal-close');
    const backdrop = modal.querySelector('.modal__backdrop');
    const form = document.getElementById('customize-form');
    const modalContent = modal.querySelector('.customize-modal__content');
    
    const pfpInput = document.getElementById('input-pfp');
    const fileNameDisplay = document.getElementById('file-name-display');
    let uploadedPfpDataUrl = null;

    // ── Apply saved data to the card ──
    function applyToCard(data) {
      const nameEl = document.getElementById('about-name');
      const roleEl = document.getElementById('about-role');
      const avatarImg = document.getElementById('about-avatar-img');
      const contentEl = document.getElementById('about-stat-content');
      const memoriesEl = document.getElementById('about-stat-memories');
      const smilesEl = document.getElementById('about-stat-smiles');

      if (nameEl) nameEl.textContent = data.name;
      if (roleEl) roleEl.textContent = data.role;

      aboutJoinDate = new Date(data.joinDate + 'T00:00:00');
      initAboutTimeCounter();

      if (contentEl) updateAndAnimateStat(contentEl, data.content);
      if (memoriesEl) updateAndAnimateStat(memoriesEl, data.memories);
      if (smilesEl) updateAndAnimateStat(smilesEl, data.smiles);

      if (avatarImg && data.pfp) {
        avatarImg.src = data.pfp;
      } else if (avatarImg && !data.pfp) {
        avatarImg.src = 'assets/pfp.jpg';
      }
    }

    // ── Toggle reset button visibility (always visible) ──
    function toggleResetBtn() {
      // Reset button is always visible
    }

    // ── Load from localStorage on init ──
    function loadSaved() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          applyToCard(data);
        }
      } catch (e) {
        // corrupted data — ignore
        localStorage.removeItem(STORAGE_KEY);
      }
      toggleResetBtn();
    }

    // ── Save to localStorage ──
    function saveToStorage(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // storage full or blocked — silently fail
      }
      toggleResetBtn();
    }

    // ── File input handler ──
    if (pfpInput && fileNameDisplay) {
      pfpInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            pfpInput.value = '';
            fileNameDisplay.textContent = 'No file selected';
            uploadedPfpDataUrl = null;
            return;
          }
          fileNameDisplay.textContent = file.name;
          const reader = new FileReader();
          reader.onload = (evt) => {
            uploadedPfpDataUrl = evt.target.result;
          };
          reader.readAsDataURL(file);
        } else {
          fileNameDisplay.textContent = 'No file selected';
          uploadedPfpDataUrl = null;
        }
      });
    }

    // ── Open modal ──
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        const nameEl = document.getElementById('about-name');
        const roleEl = document.getElementById('about-role');
        const contentEl = document.getElementById('about-stat-content');
        const memoriesEl = document.getElementById('about-stat-memories');
        const smilesEl = document.getElementById('about-stat-smiles');
        
        if (nameEl && document.getElementById('input-name')) {
          document.getElementById('input-name').value = nameEl.textContent;
        }
        if (roleEl && document.getElementById('input-role')) {
          document.getElementById('input-role').value = roleEl.textContent;
        }
        
        if (contentEl && document.getElementById('input-content')) {
          const suffix = contentEl.dataset.suffix || '';
          const count = contentEl.dataset.count || '0';
          const final = contentEl.dataset.final || '';
          document.getElementById('input-content').value = final || (count + suffix);
        }
        if (memoriesEl && document.getElementById('input-memories')) {
          const suffix = memoriesEl.dataset.suffix || '';
          const count = memoriesEl.dataset.count || '0';
          const final = memoriesEl.dataset.final || '';
          document.getElementById('input-memories').value = final || (count + suffix);
        }
        if (smilesEl && document.getElementById('input-smiles')) {
          const suffix = smilesEl.dataset.suffix || '';
          const count = smilesEl.dataset.count || '0';
          const final = smilesEl.dataset.final || '';
          document.getElementById('input-smiles').value = final || (count + suffix);
        }
        
        const dateInput = document.getElementById('input-joindate');
        if (dateInput && aboutJoinDate) {
          const yyyy = aboutJoinDate.getFullYear();
          const mm = String(aboutJoinDate.getMonth() + 1).padStart(2, '0');
          const dd = String(aboutJoinDate.getDate()).padStart(2, '0');
          dateInput.value = `${yyyy}-${mm}-${dd}`;
        }

        if (pfpInput) pfpInput.value = '';
        if (fileNameDisplay) fileNameDisplay.textContent = 'No file selected';
        uploadedPfpDataUrl = null;

        if (lenis) lenis.stop();

        modal.classList.add('active');

        if (window.PrismaXSounds) window.PrismaXSounds.play('click');

        if (modalContent) {
          gsap.killTweensOf(modalContent);
          gsap.fromTo(modalContent, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: 'springElastic' }
          );
        }
      });
    }

    // ── Close modal ──
    function closeModal() {
      if (window.PrismaXSounds) window.PrismaXSounds.play('click');

      if (modalContent) {
        gsap.killTweensOf(modalContent);
        gsap.to(modalContent, {
          scale: 0.85,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            modal.classList.remove('active');
            if (lenis) lenis.start();
          }
        });
      } else {
        modal.classList.remove('active');
        if (lenis) lenis.start();
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // ── Form submit → apply + save ──
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameVal = document.getElementById('input-name').value;
        const roleVal = document.getElementById('input-role').value;
        const dateVal = document.getElementById('input-joindate').value;
        const contentVal = document.getElementById('input-content').value;
        const memoriesVal = document.getElementById('input-memories').value;
        const smilesVal = document.getElementById('input-smiles').value;

        const dataToSave = {
          name: nameVal,
          role: roleVal,
          joinDate: dateVal,
          content: contentVal,
          memories: memoriesVal,
          smiles: smilesVal,
          pfp: uploadedPfpDataUrl || null
        };

        // If no new pfp was uploaded, preserve the existing saved pfp
        if (!uploadedPfpDataUrl) {
          try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (existing && existing.pfp) {
              dataToSave.pfp = existing.pfp;
            }
          } catch (e) { /* ignore */ }
        }

        applyToCard(dataToSave);
        saveToStorage(dataToSave);
        closeModal();
      });
    }

    // ── Reset button → clear cache, restore defaults ──
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.PrismaXSounds) window.PrismaXSounds.play('click');

        localStorage.removeItem(STORAGE_KEY);
        applyToCard(DEFAULTS);
        toggleResetBtn();
      });
    }

    // ── Download button → capture card & trigger download ──
    const downloadBtn = document.getElementById('about-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (window.PrismaXSounds) window.PrismaXSounds.play('click');

        downloadBtn.disabled = true;
        const originalHTML = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span>⏳</span> Generating...';

        const card = document.querySelector('.about__card');
        if (!card) {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalHTML;
          return;
        }

        // Use html2canvas to capture the card
        html2canvas(card, {
          backgroundColor: null,
          useCORS: true,
          scale: 2,
          logging: false
        }).then(canvas => {
          const nameEl = document.getElementById('about-name');
          const nameVal = (nameEl ? nameEl.textContent : 'Ayush').trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

          const imgUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.href = imgUrl;
          link.download = `prismax-journey-${nameVal || 'card'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalHTML;

          if (window.PrismaXSounds) window.PrismaXSounds.play('success');
        }).catch(err => {
          console.error('Failed to download card:', err);
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalHTML;
          alert('Failed to generate image. Please try again.');
        });
      });
    }

    // ── On page load: restore from cache ──
    loadSaved();
  }

  // ═══════════════════════════════════════════
  // EXPOSE ENGINE
  // ═══════════════════════════════════════════
  window.PrismaXEngine = {
    init() {
      initGSAP();
      initLenis();
      splitTextElements();
      initParticles();
      initColorPicker();
      initNavScroll();
      initScrollIndicatorHide();
      initFamilyModal();
      initAboutCardCustomizer();
    },

    startHeroAnimations() {
      animateHero();
      startGreetingsCycler();
    },

    initScrollAnimations() {
      initScrollAnimations();
    },

    getLenis() {
      return lenis;
    },

    scrollTo(target) {
      if (lenis) lenis.scrollTo(target);
    }
  };

})();
