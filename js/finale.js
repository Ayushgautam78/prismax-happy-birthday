/**
 * FINALE.JS — Cake Cutting & Celebration
 * GSAP-powered knife animation, confetti explosion, video modal
 */

(function () {
  'use strict';

  const state = {
    initialized: false,
    cakeCut: false,
    wasMutedBeforeVideo: false,
  };

  // ═══════════════════════════════════════════
  // CAKE CUTTING
  // ═══════════════════════════════════════════
  function initCakeCutting() {
    const btn = document.getElementById('cut-cake-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (state.cakeCut) return;
      state.cakeCut = true;

      // Pre-load and unlock video inside click event to bypass browser autoplay restrictions
      const video = document.getElementById('celebration-video');
      if (video) {
        video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            video.pause();
          }).catch(e => {
            console.log('Video pre-unlock context established.');
          });
        }
      }

      // Play sound
      if (window.PrismaXSounds) {
        window.PrismaXSounds.play('celebrate');
      }

      // Animate knife, cut, and split
      const knife = document.getElementById('cake-knife');
      const cutLine = document.getElementById('cake-cut-line');
      const leftHalf = document.querySelector('.cake-half-left');
      const rightHalf = document.querySelector('.cake-half-right');

      if (!knife || !cutLine) return;

      const tl = gsap.timeline();

      // Show knife above
      tl.to(knife, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Knife comes down
      tl.to(knife, {
        y: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      });

      // Show cut line
      tl.to(cutLine, {
        opacity: 1,
        duration: 0.2,
      }, '-=0.2');

      // Split halves apart
      tl.to(leftHalf, {
        x: -25,
        rotation: -3,
        duration: 0.8,
        ease: 'power3.out',
      }, '+=0.3');

      tl.to(rightHalf, {
        x: 25,
        rotation: 3,
        duration: 0.8,
        ease: 'power3.out',
      }, '<');

      // Hide knife
      tl.to(knife, {
        opacity: 0,
        y: -40,
        duration: 0.4,
        ease: 'power2.in',
      }, '<');

      // Fade cut line
      tl.to(cutLine, {
        opacity: 0,
        duration: 0.4,
      }, '<+0.2');

      // Launch confetti, balloons, and party bombs
      tl.call(() => {
        launchConfetti();
        launchCelebration();
        if (window.PrismaXSounds) {
          window.PrismaXSounds.play('confetti');
        }
      }, null, '-=0.3');

      // Hide button
      tl.to(btn, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      }, '<');

      // Show video modal after celebration
      tl.call(() => {
        setTimeout(() => showVideoModal(), 1500);
      });
    });
  }

  // ═══════════════════════════════════════════
  // CONFETTI EXPLOSION
  // ═══════════════════════════════════════════
  function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#FFE135', '#FF8FAB', '#89CFF0', '#5DD39E', '#D4A5FF', '#FFA62F', '#FFD700', '#FF6B6B'];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${40 + Math.random() * 20}%`;
      piece.style.width = `${Math.random() * 10 + 5}px`;
      piece.style.height = `${Math.random() * 10 + 5}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

      container.appendChild(piece);

      const angle = (Math.random() - 0.5) * 120;
      const velocity = 300 + Math.random() * 500;
      const rotateEnd = Math.random() * 720 - 360;

      gsap.fromTo(piece,
        {
          y: window.innerHeight * 0.5,
          x: 0,
          rotation: 0,
          opacity: 1,
          scale: 0,
        },
        {
          y: window.innerHeight + 100,
          x: Math.sin(angle * Math.PI / 180) * velocity,
          rotation: rotateEnd,
          opacity: 0,
          scale: 1,
          duration: 2 + Math.random() * 2,
          ease: 'power1.out',
          delay: Math.random() * 0.3,
          onComplete: () => piece.remove(),
        }
      );
    }
  }

  // ═══════════════════════════════════════════
  // BALLOONS CELEBRATION
  // ═══════════════════════════════════════════
  function launchBalloons() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#FFE135', '#FF8FAB', '#89CFF0', '#5DD39E', '#D4A5FF', '#FFA62F', '#FFD700', '#FF6B6B'];
    const count = 35; // plenty of balloons

    for (let i = 0; i < count; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.style.setProperty('--balloon-color', colors[Math.floor(Math.random() * colors.length)]);

      // Random horizontal start position
      const startX = Math.random() * window.innerWidth;
      balloon.style.left = `${startX}px`;
      balloon.style.bottom = `-120px`; // start fully off-screen at bottom

      // Scale variation
      const scale = Math.random() * 0.4 + 0.8;
      balloon.style.transform = `scale(${scale})`;

      // Append oval, triangle, and string
      const oval = document.createElement('div');
      oval.className = 'balloon__oval';
      const triangle = document.createElement('div');
      triangle.className = 'balloon__triangle';
      const string = document.createElement('div');
      string.className = 'balloon__string';

      balloon.appendChild(oval);
      balloon.appendChild(triangle);
      balloon.appendChild(string);

      container.appendChild(balloon);

      const duration = 6 + Math.random() * 5; // 6 to 11 seconds to rise
      const swayWidth = 40 + Math.random() * 80;
      const delay = Math.random() * 2.5; // stagger starts over 2.5s

      // Float up
      gsap.to(balloon, {
        y: -(window.innerHeight + 300),
        duration: duration,
        delay: delay,
        ease: 'power1.inOut',
        onComplete: () => balloon.remove()
      });

      // Sway left and right
      gsap.to(balloon, {
        x: `+=${swayWidth}`,
        duration: duration / 2,
        delay: delay,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut'
      });
    }
  }

  // ═══════════════════════════════════════════
  // PARTY BOMB EXPLOSION
  // ═══════════════════════════════════════════
  function launchPartyBomb(originX, originY) {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#FFE135', '#FF8FAB', '#89CFF0', '#5DD39E', '#D4A5FF', '#FFA62F', '#FFD700', '#FF6B6B'];
    const particleCount = 35;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'party-bomb-particle';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;

      const size = Math.random() * 12 + 6;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

      container.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 250 + Math.random() * 450;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity - 80;

      gsap.fromTo(p,
        {
          x: 0,
          y: 0,
          scale: 0.2,
          opacity: 1,
          rotation: 0
        },
        {
          x: destX,
          y: destY + 180, // gravity drop
          scale: Math.random() * 0.8 + 0.6,
          opacity: 0,
          rotation: Math.random() * 720 - 360,
          duration: 1.5 + Math.random() * 1.5,
          ease: 'power2.out',
          onComplete: () => p.remove()
        }
      );
    }
  }

  // ═══════════════════════════════════════════
  // COMBINED CELEBRATION
  // ═══════════════════════════════════════════
  function launchCelebration() {
    // 1. Launch floating balloons
    launchBalloons();

    // 2. Launch staggered party bombs across the screen
    const width = window.innerWidth;
    const height = window.innerHeight;

    const bombLocations = [
      { x: width * 0.25, y: height * 0.6 },
      { x: width * 0.75, y: height * 0.6 },
      { x: width * 0.5, y: height * 0.4 },
      { x: width * 0.35, y: height * 0.5 },
      { x: width * 0.65, y: height * 0.5 },
      { x: width * 0.15, y: height * 0.3 },
      { x: width * 0.85, y: height * 0.3 }
    ];

    bombLocations.forEach((loc, idx) => {
      setTimeout(() => {
        launchPartyBomb(loc.x, loc.y);
        if (window.PrismaXSounds) {
          window.PrismaXSounds.play('success');
        }
      }, idx * 350); // every 350ms a bomb explodes
    });
  }

  // ═══════════════════════════════════════════
  // VIDEO MODAL
  // ═══════════════════════════════════════════
  function showVideoModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    modal.classList.add('active');

    const video = document.getElementById('celebration-video');
    if (video) {
      // Play the unlocked video
      video.play().catch(e => {
        console.warn('Video playback was blocked or interrupted:', e);
      });

      // Temporarily mute background music while celebration video plays
      if (window.PrismaXSounds) {
        state.wasMutedBeforeVideo = window.PrismaXSounds.isMuted();
        window.PrismaXSounds.setMuted(true);
      }
    } else {
      if (window.PrismaXSounds) {
        window.PrismaXSounds.play('magical');
      }
    }
  }

  function hideVideoModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    modal.classList.remove('active');

    const video = document.getElementById('celebration-video');
    if (video) {
      video.pause();

      // Restore background music mute state
      if (window.PrismaXSounds) {
        window.PrismaXSounds.setMuted(state.wasMutedBeforeVideo);
      }
    }

    // Show farewell message
    setTimeout(() => showFarewell(), 500);
  }

  function showFarewell() {
    const farewell = document.getElementById('finale-message');
    if (!farewell) return;

    farewell.style.display = 'flex';

    gsap.from(farewell, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from(farewell.querySelector('.finale__farewell-robot'), {
      scale: 0,
      rotation: -20,
      duration: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.3,
    });

    gsap.from(farewell.querySelector('.finale__farewell-card'), {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.5,
    });

    // Animate reset button into view
    const resetBtn = document.getElementById('reset-cake-btn');
    if (resetBtn) {
      resetBtn.style.display = 'inline-flex';
      gsap.to(resetBtn, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.5,
      });
    }

    if (window.PrismaXSounds) {
      window.PrismaXSounds.play('sparkle');
    }
  }

  // ═══════════════════════════════════════════
  // RESET CAKE
  // ═══════════════════════════════════════════
  function resetCake() {
    const btn = document.getElementById('cut-cake-btn');
    const resetBtn = document.getElementById('reset-cake-btn');
    const knife = document.getElementById('cake-knife');
    const cutLine = document.getElementById('cake-cut-line');
    const leftHalf = document.querySelector('.cake-half-left');
    const rightHalf = document.querySelector('.cake-half-right');
    const farewell = document.getElementById('finale-message');

    if (!btn || !resetBtn || !leftHalf || !rightHalf) return;

    // Reset state
    state.cakeCut = false;

    // Reset cake halves back to center
    gsap.to(leftHalf, {
      x: 0,
      rotation: 0,
      duration: 0.8,
      ease: 'power3.inOut',
    });

    gsap.to(rightHalf, {
      x: 0,
      rotation: 0,
      duration: 0.8,
      ease: 'power3.inOut',
    });

    // Reset knife and cut line position/opacity
    if (knife) {
      gsap.set(knife, {
        opacity: 0,
        y: -80,
      });
    }

    if (cutLine) {
      gsap.set(cutLine, {
        opacity: 0,
      });
    }

    // Hide farewell message
    if (farewell) {
      gsap.to(farewell, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          farewell.style.display = 'none';
          // reset opacity for next time
          gsap.set(farewell, { opacity: 1, y: 0 });
        }
      });
    }

    // Hide reset button
    gsap.to(resetBtn, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        resetBtn.style.display = 'none';
      }
    });

    // Show the "Cut the Birthday Cake" button again
    btn.style.display = 'inline-flex';
    gsap.to(btn, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.2
    });

    // Play sparkle sound
    if (window.PrismaXSounds) {
      window.PrismaXSounds.play('sparkle');
    }
  }

  function initResetButton() {
    const resetBtn = document.getElementById('reset-cake-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetCake);
    }
  }

  // ═══════════════════════════════════════════
  // INIT MODAL CLOSE
  // ═══════════════════════════════════════════
  function initModalClose() {
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideVideoModal);
    }

    // Close on backdrop click
    const backdrop = document.querySelector('.modal__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', hideVideoModal);
    }
  }

  // ═══════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════
  window.PrismaXFinale = {
    init() {
      if (state.initialized) return;
      state.initialized = true;

      initCakeCutting();
      initResetButton();
      initModalClose();
    }
  };

})();
