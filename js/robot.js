/**
 * ROBOT.JS — Living Robot Character System
 * Scroll-reactive poses, eye tracking, idle animations
 */

(function () {
  'use strict';

  const robotState = {
    currentSection: 'hero',
    initialized: false,
    eyeTrackingActive: true,
  };

  // ═══════════════════════════════════════════
  // IDLE ANIMATIONS (Preloader Robot)
  // ═══════════════════════════════════════════
  function initPreloaderRobot() {
    const svg = document.querySelector('.preloader__robot-svg');
    if (!svg) return;

    // Blinking
    const eyes = svg.querySelectorAll('.robot-pupil-l, .robot-pupil-r');
    const blink = () => {
      const eyeWhites = svg.querySelectorAll('.robot-eyes circle[fill="white"]');
      gsap.timeline({ repeat: 0 })
        .to(eyeWhites, { scaleY: 0.1, duration: 0.08, transformOrigin: 'center', stagger: 0.02 })
        .to(eyeWhites, { scaleY: 1, duration: 0.12, ease: 'power2.out', stagger: 0.02 });
    };

    // Blink randomly
    const blinkLoop = () => {
      blink();
      setTimeout(blinkLoop, 2000 + Math.random() * 3000);
    };
    setTimeout(blinkLoop, 1000);

    // Breathing (body scale)
    const body = svg.querySelector('.robot-body');
    if (body) {
      gsap.to(body, {
        scaleY: 1.03,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'center bottom',
      });
    }

    // Antenna bob
    const antenna = svg.querySelector('.antenna-bulb');
    if (antenna) {
      gsap.to(antenna, {
        y: -3,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Balloon float
    const balloon = svg.querySelector('.robot-balloon');
    if (balloon) {
      gsap.to(balloon, {
        y: -4,
        x: 2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Arm wave
    const armR = svg.querySelector('.robot-arm-r');
    if (armR) {
      gsap.to(armR, {
        rotation: -10,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'left center',
      });
    }
  }

  // ═══════════════════════════════════════════
  // FAREWELL ROBOT ANIMATIONS
  // ═══════════════════════════════════════════
  function initFarewellRobot() {
    const svg = document.querySelector('.farewell-robot-svg');
    if (!svg) return;

    // Wave arm
    const arm = svg.querySelector('.farewell-wave-arm');
    if (arm) {
      gsap.to(arm, {
        rotation: -25,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'right center',
      });
    }

    // Blinking
    const eyeWhites = svg.querySelectorAll('circle[fill="white"]');
    const blink = () => {
      gsap.timeline()
        .to(eyeWhites, { scaleY: 0.1, duration: 0.08, transformOrigin: 'center' })
        .to(eyeWhites, { scaleY: 1, duration: 0.12, ease: 'power2.out' });
    };

    const blinkLoop = () => {
      blink();
      setTimeout(blinkLoop, 2500 + Math.random() * 2000);
    };
    setTimeout(blinkLoop, 500);
  }

  // ═══════════════════════════════════════════
  // SECTION CHANGE REACTIONS
  // ═══════════════════════════════════════════
  function onSectionChange(sectionId) {
    robotState.currentSection = sectionId;
    // Future: could animate a persistent robot companion here
    // For now, the preloader robot and farewell robot handle their own sections
  }

  // ═══════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════
  window.PrismaXRobot = {
    init() {
      if (robotState.initialized) return;
      robotState.initialized = true;

      initPreloaderRobot();
      initFarewellRobot();

      // Listen for section changes
      window.addEventListener('sectionchange', (e) => {
        if (e.detail && e.detail.sectionId) {
          onSectionChange(e.detail.sectionId);
        }
      });
    }
  };

})();
