class TextSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          margin-top: 24px;
          margin-bottom: 24px;
        }

        .text-slider-container {
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
          gap: 15px;
        }

        .text-slider-viewport {
          width: 100%;
          overflow: hidden;
          position: relative;
          cursor: grab;
          outline: none;
        }

        .text-slider-viewport.grabbing {
          cursor: grabbing;
        }

        .text-slider-track {
          display: flex;
          width: 100%;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform;
        }

        .text-slide {
          display: block;
          flex: 0 0 100%;
          width: 100%;
          box-sizing: border-box;
          padding: 0 5px;
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-secondary);
        }

        /* Nav buttons styling */
        .text-nav-btn {
          background: #ffffff;
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .text-nav-btn:hover:not(:disabled) {
          border-color: var(--accent-red);
          color: var(--accent-red);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(186, 0, 5, 0.08);
        }

        .text-nav-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.95);
        }

        .text-nav-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          border-color: var(--border-card);
          color: var(--text-muted);
        }

        .text-nav-btn svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        /* Controls row (dots and mobile buttons layout) */
        .text-slider-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 0 5px;
        }

        .text-slider-indicators {
          display: flex;
          gap: 8px;
        }

        .text-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .text-indicator-dot.active {
          background: var(--accent-red);
          width: 24px;
          border-radius: 4px;
        }

        /* Mobile vs Desktop Layout rules */
        .text-nav-btn-side {
          display: none; /* Hidden on mobile by default */
        }

        .text-nav-btn-inline {
          display: flex; /* Shown inline on mobile */
          width: 38px;
          height: 38px;
        }

        @media (max-width: 767px) {
          .text-slider-controls-row {
            justify-content: center;
            gap: 20px;
          }
        }

        @media (min-width: 768px) {
          .text-nav-btn-side {
            display: flex; /* Shown on desktop */
          }
          
          .text-nav-btn-inline {
            display: none; /* Hidden in controls row on desktop */
          }
          
          .text-slider-controls-row {
            justify-content: center;
          }
          
          .text-slide {
            padding: 0 20px;
          }
        }
      </style>
      <div class="text-slider-container">
        <button class="text-nav-btn text-nav-btn-side text-prev-btn" aria-label="Vorheriger Absatz" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div class="text-slider-viewport" tabindex="0" aria-label="Textabschnitte Karussell">
          <div class="text-slider-track"></div>
        </div>
        <div style="display: none;"><slot></slot></div>
        <button class="text-nav-btn text-nav-btn-side text-next-btn" aria-label="Nächster Absatz">
          <svg viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
      </div>
      <div class="text-slider-controls-row">
        <button class="text-nav-btn text-nav-btn-inline text-prev-btn" aria-label="Vorheriger Absatz" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div class="text-slider-indicators"></div>
        <button class="text-nav-btn text-nav-btn-inline text-next-btn" aria-label="Nächster Absatz">
          <svg viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
      </div>
    `;

    this.viewport = this.shadowRoot.querySelector('.text-slider-viewport');
    this.track = this.shadowRoot.querySelector('.text-slider-track');
    this.indicatorsContainer = this.shadowRoot.querySelector('.text-slider-indicators');
    this.slotEl = this.shadowRoot.querySelector('slot');

    this.currentIndex = 0;
    this.totalSlides = 0;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragThreshold = 50;

    this.initialized = false;
  }

  connectedCallback() {
    this.slotEl.addEventListener('slotchange', () => this.initSlider());

    // Fallback if children are loaded synchronously or already parsed
    if (this.querySelectorAll('slide').length > 0 && !this.initialized) {
      this.initSlider();
    }
  }

  initSlider() {
    const slides = Array.from(this.querySelectorAll('slide')).filter(el => {
      return el.closest('text-slider') === this;
    });
    if (slides.length === 0) return;
    if (this.initialized) return;
    this.initialized = true;

    this.totalSlides = slides.length;
    this.currentIndex = 0;

    // Clear track and populate slides
    this.track.innerHTML = '';
    slides.forEach((slideEl) => {
      const text = slideEl.innerHTML.trim() || slideEl.getAttribute('label') || slideEl.getAttribute('text') || '';
      const slideDiv = document.createElement('div');
      slideDiv.className = 'text-slide';
      slideDiv.innerHTML = text;
      this.track.appendChild(slideDiv);
    });

    // Generate indicators
    this.indicatorsContainer.innerHTML = '';
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = `text-indicator-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('data-index', i);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.indicatorsContainer.appendChild(dot);
    }

    this.setupEvents();
    this.updateSlider();
  }

  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;
    this.currentIndex = index;
    this.updateSlider();
  }

  updateSlider() {
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    // Disable state on boundaries
    const prevBtns = this.shadowRoot.querySelectorAll('.text-prev-btn');
    prevBtns.forEach(btn => btn.disabled = this.currentIndex === 0);

    const nextBtns = this.shadowRoot.querySelectorAll('.text-next-btn');
    nextBtns.forEach(btn => btn.disabled = this.currentIndex === this.totalSlides - 1);

    // Update indicators
    const dots = this.shadowRoot.querySelectorAll('.text-indicator-dot');
    dots.forEach((dot, idx) => {
      if (idx === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  setupEvents() {
    // Side and Inline Button click handlers
    const prevBtns = this.shadowRoot.querySelectorAll('.text-prev-btn');
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => this.goToSlide(this.currentIndex - 1));
    });

    const nextBtns = this.shadowRoot.querySelectorAll('.text-next-btn');
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => this.goToSlide(this.currentIndex + 1));
    });

    // Keyboard support
    this.viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.goToSlide(this.currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        this.goToSlide(this.currentIndex + 1);
      }
    });

    // Swipe/Drag touch listeners
    this.viewport.addEventListener('touchstart', (e) => {
      this.handleStart(e.touches[0].clientX);
    }, { passive: true });

    this.viewport.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        this.handleMove(e.touches[0].clientX);
        const diffX = Math.abs(e.touches[0].clientX - this.startX);
        if (diffX > 5 && e.cancelable) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    this.viewport.addEventListener('touchend', () => this.handleEnd());

    // Mouse drag handlers
    this.boundOnMouseMove = (e) => this.handleMove(e.clientX);
    this.boundOnMouseUp = () => {
      this.handleEnd();
      window.removeEventListener('mousemove', this.boundOnMouseMove);
      window.removeEventListener('mouseup', this.boundOnMouseUp);
    };

    this.viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      this.handleStart(e.clientX);
      window.addEventListener('mousemove', this.boundOnMouseMove);
      window.addEventListener('mouseup', this.boundOnMouseUp);
    });

    // Resize adjustment
    window.addEventListener('resize', () => {
      this.updateSlider();
    });
  }

  handleStart(clientX) {
    this.isDragging = true;
    this.startX = clientX;
    this.currentX = clientX;
    this.track.style.transition = 'none'; // pause transition during drag
    this.viewport.classList.add('grabbing');
  }

  handleMove(clientX) {
    if (!this.isDragging) return;
    this.currentX = clientX;
    const diffX = this.currentX - this.startX;

    const viewportWidth = this.viewport.offsetWidth;
    const currentPixelOffset = -this.currentIndex * viewportWidth;
    const newPixelOffset = currentPixelOffset + diffX;

    this.track.style.transform = `translateX(${newPixelOffset}px)`;
  }

  handleEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.viewport.classList.remove('grabbing');
    this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

    const diffX = this.currentX - this.startX;
    if (Math.abs(diffX) > this.dragThreshold) {
      if (diffX > 0 && this.currentIndex > 0) {
        this.currentIndex--;
      } else if (diffX < 0 && this.currentIndex < this.totalSlides - 1) {
        this.currentIndex++;
      }
    }
    this.startX = 0;
    this.currentX = 0;
    this.updateSlider();
  }
}
customElements.define('text-slider', TextSlider);
