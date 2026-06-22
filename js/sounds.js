/**
 * SOUNDS.JS — Sound System
 * Lightweight synthesized sounds using Web Audio API
 * Howler.js for cross-browser compatibility
 */

(function () {
  'use strict';

  const state = {
    initialized: false,
    muted: false,
    audioCtx: null,
  };

  let bgm = null;

  // ═══════════════════════════════════════════
  // WEB AUDIO SYNTHESIZER
  // ═══════════════════════════════════════════
  function getAudioCtx() {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return state.audioCtx;
  }

  function playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (state.muted) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail
    }
  }

  // ═══════════════════════════════════════════
  // SOUND EFFECTS
  // ═══════════════════════════════════════════
  const sounds = {
    click() {
      playTone(800, 0.08, 'sine', 0.1);
      setTimeout(() => playTone(1200, 0.05, 'sine', 0.06), 30);
    },

    hover() {
      playTone(600, 0.04, 'sine', 0.05);
    },

    whoosh() {
      if (state.muted) return;
      try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {}
    },

    success() {
      playTone(523, 0.15, 'sine', 0.12);
      setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100);
      setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 200);
    },

    magical() {
      playTone(523, 0.2, 'sine', 0.1);
      setTimeout(() => playTone(659, 0.15, 'sine', 0.08), 120);
      setTimeout(() => playTone(784, 0.15, 'sine', 0.08), 240);
      setTimeout(() => playTone(1047, 0.3, 'sine', 0.1), 360);
    },

    sparkle() {
      const freqs = [1200, 1500, 1800, 2100];
      freqs.forEach((f, i) => {
        setTimeout(() => playTone(f, 0.06, 'sine', 0.04), i * 40);
      });
    },

    confetti() {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          playTone(400 + Math.random() * 800, 0.1, 'sine', 0.06);
        }, i * 60);
      }
    },

    celebrate() {
      sounds.confetti();
      setTimeout(() => sounds.success(), 200);
      setTimeout(() => sounds.sparkle(), 500);
    },
  };

  // ═══════════════════════════════════════════
  // TOGGLE MUTE
  // ═══════════════════════════════════════════
  function initSoundToggle() {
    const toggle = document.getElementById('sound-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      state.muted = !state.muted;
      toggle.setAttribute('data-muted', state.muted);

      if (!state.muted) {
        // Resume audio context on first unmute
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        sounds.click();

        if (bgm) {
          bgm.mute(false);
          if (!bgm.playing()) bgm.play();
        }
      } else {
        if (bgm) {
          bgm.mute(true);
        }
      }
    });
  }

  // ═══════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════
  window.PrismaXSounds = {
    init() {
      if (state.initialized) return;
      state.initialized = true;
      initSoundToggle();

      // Initialize BGM
      if (typeof Howl !== 'undefined') {
        bgm = new Howl({
          src: ['bgm.webm'],
          loop: true,
          volume: 0.06, // Soft background music volume
          mute: state.muted,
          onloaderror: (id, err) => {
            console.warn('BGM load error:', err);
          },
          onplayerror: (id, err) => {
            console.warn('BGM play error:', err);
            // Retry playing on user interaction
            bgm.once('unlock', () => {
              bgm.play();
            });
          }
        });

        // Try playing BGM (browser blocks autoplay, so we register interaction listeners below)
        bgm.play();

        const startBgmOnInteraction = () => {
          if (bgm && !bgm.playing()) {
            bgm.play();
          }
          document.removeEventListener('click', startBgmOnInteraction);
          document.removeEventListener('touchstart', startBgmOnInteraction);
        };
        document.addEventListener('click', startBgmOnInteraction);
        document.addEventListener('touchstart', startBgmOnInteraction);
      }
    },

    play(name) {
      if (sounds[name]) sounds[name]();
    },

    isMuted() {
      return state.muted;
    },

    setMuted(val) {
      state.muted = val;
      const toggle = document.getElementById('sound-toggle');
      if (toggle) toggle.setAttribute('data-muted', val);
      if (bgm) {
        bgm.mute(val);
        if (!val && !bgm.playing()) bgm.play();
      }
    }
  };

})();
