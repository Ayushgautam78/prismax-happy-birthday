/**
 * CAROUSEL.JS — Draggable Horizontal Carousel
 * Spencer Gabor-inspired curved card rotation with momentum
 */

(function () {
  'use strict';

  class DragCarousel {
    constructor(el) {
      this.el = el;
      this.track = el.querySelector('.carousel__track');
      if (!this.track) return;

      this.slides = [...this.track.querySelectorAll('.carousel__slide')];
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      this.offset = 0;
      this.velocity = 0;
      this.lastX = 0;
      this.lastTime = 0;
      this.rafId = null;

      // Click prevention variables during drag
      this.preventClick = false;
      this.startXPosition = 0;
      this.hasMoved = false;

      this.init();
    }

    init() {
      this.setupInfiniteClones();
      this.calculateBounds();

      // Mouse events
      this.el.addEventListener('mousedown', (e) => this.onStart(e.clientX, e));
      window.addEventListener('mousemove', (e) => this.onMove(e.clientX));
      window.addEventListener('mouseup', () => this.onEnd());

      // Touch events
      this.el.addEventListener('touchstart', (e) => this.onStart(e.touches[0].clientX, e), { passive: true });
      window.addEventListener('touchmove', (e) => this.onMove(e.touches[0].clientX), { passive: true });
      window.addEventListener('touchend', () => this.onEnd());

      // Prevent accidental clicking when dragging carousel
      this.el.addEventListener('click', (e) => {
        if (this.preventClick) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { capture: true });

      // Resize
      window.addEventListener('resize', () => {
        this.calculateBounds();
        this.applyTransform();
      });

      // Position offset to start at the original set (index originalCount)
      if (this.loopWidth) {
        this.offset = -this.loopWidth;
      }
      this.applyTransform();
    }

    setupInfiniteClones() {
      const originalSlides = [...this.track.querySelectorAll('.carousel__slide')];
      this.originalCount = originalSlides.length;
      if (this.originalCount === 0) return;

      // Capture pre-cloned width as a reliable layout fallback
      this.preClonedWidth = this.track.scrollWidth || (this.originalCount * 344);

      // Duplicate slides: prepend a copy before and append a copy after
      const clonesStart = originalSlides.map(slide => slide.cloneNode(true));
      const clonesEnd = originalSlides.map(slide => slide.cloneNode(true));

      clonesStart.forEach(clone => {
        clone.classList.add('carousel__slide--clone');
        this.track.insertBefore(clone, this.track.firstChild);
      });

      clonesEnd.forEach(clone => {
        clone.classList.add('carousel__slide--clone');
        this.track.appendChild(clone);
      });

      // Update slides array to include originals and clones
      this.slides = [...this.track.querySelectorAll('.carousel__slide')];
    }

    calculateBounds() {
      if (!this.track || !this.originalCount) return;

      // loopWidth is the offset from the first slide of Set 1 to first slide of Set 2 (originals)
      const firstOriginalIndex = this.originalCount;
      const slide1 = this.slides[0];
      const slide2 = this.slides[firstOriginalIndex];

      if (slide1 && slide2) {
        const dist = slide2.offsetLeft - slide1.offsetLeft;
        if (dist > 0) {
          this.loopWidth = dist;
        }
      }

      // If offsetLeft hasn't computed yet, fallback to the pre-cloned width
      if (!this.loopWidth || this.loopWidth === 0) {
        this.loopWidth = this.preClonedWidth;
      }
    }

    onStart(x, e) {
      // Re-calculate bounds on interaction start to ensure we have the live layout geometry
      this.calculateBounds();

      this.isDragging = true;
      this.startX = x - this.offset;
      this.lastX = x;
      this.lastTime = performance.now();
      this.velocity = 0;
      this.el.style.cursor = 'grabbing';

      this.startXPosition = x;
      this.hasMoved = false;

      if (e && e.type === 'mousedown') e.preventDefault();
    }

    onMove(x) {
      if (!this.isDragging) return;

      const now = performance.now();
      const dt = now - this.lastTime;

      this.offset = x - this.startX;

      // Detect if user dragged significantly (more than 8px)
      if (Math.abs(x - this.startXPosition) > 8) {
        this.hasMoved = true;
      }

      // Calculate velocity
      if (dt > 0) {
        this.velocity = (x - this.lastX) / dt * 16;
      }

      this.lastX = x;
      this.lastTime = now;

      this.applyTransform();
    }

    onEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.el.style.cursor = 'grab';

      // If user dragged, block click handler triggering details
      if (this.hasMoved) {
        this.preventClick = true;
        setTimeout(() => {
          this.preventClick = false;
        }, 50);
      }

      // Apply momentum
      this.decelerate();
    }

    decelerate() {
      const friction = 0.95;
      const minVelocity = 0.5;

      const animate = () => {
        if (Math.abs(this.velocity) < minVelocity) {
          return;
        }

        this.velocity *= friction;
        this.offset += this.velocity;

        this.applyTransform();
        this.rafId = requestAnimationFrame(animate);
      };

      this.rafId = requestAnimationFrame(animate);
    }

    applyTransform() {
      if (!this.track || !this.loopWidth) return;

      // Wrap coordinates infinitely
      const minLimit = -this.loopWidth * 2;
      const maxLimit = -this.loopWidth;

      while (this.offset < minLimit) {
        this.offset += this.loopWidth;
        if (this.isDragging) {
          this.startX -= this.loopWidth;
        }
      }
      while (this.offset > maxLimit) {
        this.offset -= this.loopWidth;
        if (this.isDragging) {
          this.startX += this.loopWidth;
        }
      }

      this.track.style.transform = `translateX(${this.offset}px)`;

      // Apply curved rotation to slides
      if (this.el.classList.contains('curve')) {
        const center = -this.offset + this.el.offsetWidth / 2;

        this.slides.forEach(slide => {
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const distance = slideCenter - center;
          const rotation = distance * 0.02;
          const translateY = Math.abs(distance) * 0.03;
          const opacity = Math.max(0.3, 1 - Math.abs(distance) / (this.el.offsetWidth * 0.8));

          slide.style.transform = `rotate(${rotation}deg) translateY(${translateY}px)`;
          slide.style.opacity = 1; // clearly visible, no dull effect
        });
      }
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  // ═══════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════
  window.PrismaXCarousel = {
    instances: [],

    init() {
      document.querySelectorAll('.carousel').forEach(el => {
        el.classList.add('curve');
        const carousel = new DragCarousel(el);
        this.instances.push(carousel);
      });
    },

    destroy() {
      this.instances.forEach(c => c.destroy());
      this.instances = [];
    }
  };

})();
