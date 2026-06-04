// 1. Interactive Infinite Glasses Gallery Web Component
class GlassesGallery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .carousel-container {
          position: relative;
          width: 100%;
          margin: 0 0 0 0;
          overflow: hidden;
        }

        /* Light boundary fade for pure white header and hero section background */
        .carousel-container::before,
        .carousel-container::after {
          content: '';
          position: absolute;
          top: 0;
          width: 150px;
          height: 100%;
          z-index: 5;
          pointer-events: none;
        }

        .carousel-container::before {
          left: 0;
          background: linear-gradient(to right, #ffffff 0%, rgba(255, 255, 255, 0.8) 30%, transparent 100%);
        }

        .carousel-container::after {
          right: 0;
          background: linear-gradient(to left, #ffffff 0%, rgba(255, 255, 255, 0.8) 30%, transparent 100%);
        }

        .carousel-viewport {
          display: flex;
          overflow-x: scroll;
          scroll-behavior: auto; /* Required for high-performance JS scroll adjustments & drag */
          scrollbar-width: none;
          cursor: grab;
          padding: 20px 0;
          user-select: none;
          -webkit-overflow-scrolling: touch;
        }

        .carousel-viewport::-webkit-scrollbar {
          display: none;
        }

        .carousel-viewport.grabbing {
          cursor: grabbing;
        }

        .carousel-track {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 0 400px; /* Generous padding to allow infinite boundary checks */
        }

        /* Premium Card (Flat Photo-Frame Style) */
        .gallery-card {
          position: relative;
          width: 480px;
          height: 320px;
          flex-shrink: 0;
          border-radius: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          overflow: hidden;
          transition: 
            border-color 0.3s ease, 
            box-shadow 0.3s ease,
            transform 0.3s ease;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.02);
        }

        /* Active and Hover States */
        .gallery-card:hover,
        .gallery-card.active {
          border-color: var(--border-hover);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
          transform: translateY(-2px);
        }

        .card-inner {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .card-image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: #f8fafc;
        }

        .gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        /* Premium Translucent Gradient Caption Overlay */
        .card-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 40px 24px 20px 24px;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          pointer-events: none;
          z-index: 2;
        }

        .card-caption h3 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: -0.1px;
          color: #ffffff;
          line-height: 1.3;
          text-shadow: 0 1px 3px rgba(15, 23, 42, 0.5);
          margin-bottom: 0; /* Override default margin */
        }

        /* Navigation Chevrons */
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
          transition: 
            background-color 0.25s ease, 
            border-color 0.25s ease, 
            transform 0.2s ease,
            color 0.25s ease;
        }

        .nav-btn:hover {
          border-color: var(--accent-red);
          color: var(--accent-red);
        }

        .nav-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        .nav-btn-left { left: 40px; }
        .nav-btn-right { right: 40px; }

        .nav-btn svg {
          width: 22px;
          height: 22px;
          fill: currentColor;
        }

        /* Bottom Controls */
        .controls-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
          margin-bottom: 10px;
          z-index: 10;
          position: relative;
        }

        .progress-bar-container {
          width: 240px;
          height: 3px;
          background: #f1f5f9;
          border-radius: 1.5px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          width: 0%;
          background: var(--accent-red);
          transition: width 0.1s ease-out;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .carousel-container::before,
          .carousel-container::after {
            width: 100px;
          }
        }

        @media (max-width: 768px) {
          .carousel-container {
            padding: 0 0 10px 0;
            margin-top: 15px;
          }
          
          .carousel-container::before,
          .carousel-container::after {
            width: 40px;
          }
          
          .carousel-track {
            gap: 20px;
            padding: 0 200px;
          }
          
          .gallery-card {
            width: 320px;
            height: 215px;
          }
          
          .card-caption {
            padding: 30px 18px 12px 18px;
          }
          
          .card-caption h3 {
            font-size: 0.95rem;
          }
          
          .nav-btn {
            width: 44px;
            height: 44px;
          }
          
          .nav-btn-left { left: 15px; }
          .nav-btn-right { right: 15px; }
        }
      </style>
      <div class="carousel-container">
        <button class="nav-btn nav-btn-left" aria-label="Zurück scrollen">
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div class="carousel-viewport" tabindex="0">
          <div class="carousel-track"></div>
        </div>
        <button class="nav-btn nav-btn-right" aria-label="Vorwärts scrollen">
          <svg viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
        <div class="controls-container">
          <div class="progress-bar-container" aria-hidden="true">
            <div class="progress-bar-fill"></div>
          </div>
        </div>
        <div style="display: none;"><slot></slot></div>
      </div>
    `;

    this.track = this.shadowRoot.querySelector('.carousel-track');
    this.viewport = this.shadowRoot.querySelector('.carousel-viewport');
    this.prevBtn = this.shadowRoot.querySelector('.nav-btn-left');
    this.nextBtn = this.shadowRoot.querySelector('.nav-btn-right');
    this.progressBarFill = this.shadowRoot.querySelector('.progress-bar-fill');
    this.slotEl = this.shadowRoot.querySelector('slot');

    this.config = {
      autoScrollSpeed: 0.5,    // Continuous slow drift speed
      inertiaFriction: 0.93,   // Drag decay rate
      dragMultiplier: 1.25,    // Drag speed multiplier
      resumeDelay: 3000        // Inactivity resume delay (ms)
    };

    this.state = {
      isDragging: false,
      startX: 0,
      scrollLeftStart: 0,
      lastEventTime: 0,
      lastEventX: 0,
      velocity: 0,
      inertiaId: null,
      autoScrollActive: true,
      currentAutoScrollSpeed: this.config.autoScrollSpeed,
      hoveringViewport: false,
      userInteracting: false,
      interactionTimeout: null,
      targetCard: null
    };

    this.initialized = false;
  }

  connectedCallback() {
    this.slotEl.addEventListener('slotchange', () => this.initGallery());
    
    // Fallback if children are loaded synchronously or already parsed
    if (this.querySelectorAll('card').length > 0 && !this.initialized) {
      this.initGallery();
    }
  }

  initGallery() {
    const originalCardElements = Array.from(this.querySelectorAll('card')).filter(el => {
      return el.closest('glasses-gallery') === this;
    });
    if (originalCardElements.length === 0) return;
    if (this.initialized) return;
    this.initialized = true;

    this.itemCount = originalCardElements.length;
    this.track.innerHTML = '';
    this.cards = [];

    const createCardNode = (cardEl, index, originalIndex) => {
      const src = cardEl.getAttribute('src') || '';
      const labelText = cardEl.textContent.trim() || cardEl.getAttribute('label') || '';
      const labelHTML = cardEl.innerHTML.trim() || cardEl.getAttribute('label') || '';
      
      const cardDiv = document.createElement('div');
      cardDiv.className = 'gallery-card';
      cardDiv.setAttribute('data-index', index);
      cardDiv.setAttribute('data-original', originalIndex);
      
      cardDiv.innerHTML = `
        <div class="card-inner">
          <div class="card-image-wrapper">
            <img src="${src}" alt="${labelText.replace(/"/g, '&quot;')}" loading="lazy">
          </div>
          <div class="card-caption">
            <h3>${labelHTML}</h3>
          </div>
        </div>
      `;
      return cardDiv;
    };

    // Set A (clones)
    for (let i = 0; i < this.itemCount; i++) {
      const card = createCardNode(originalCardElements[i], i, i);
      this.track.appendChild(card);
      this.cards.push(card);
    }
    // Set B (core set)
    for (let i = 0; i < this.itemCount; i++) {
      const card = createCardNode(originalCardElements[i], this.itemCount + i, i);
      this.track.appendChild(card);
      this.cards.push(card);
    }
    // Set C (clones)
    for (let i = 0; i < this.itemCount; i++) {
      const card = createCardNode(originalCardElements[i], this.itemCount * 2 + i, i);
      this.track.appendChild(card);
      this.cards.push(card);
    }

    this.setupEvents();

    requestAnimationFrame(() => {
      this.alignViewportToMiddleSet();
      this.updateCardEffects();
      this.startAnimationLoop();
    });
  }

  setupEvents() {
    // Scroll listener for wrapping & highlights
    this.viewport.addEventListener('scroll', () => {
      this.handleBoundaryWrapping();
      this.updateCardEffects();
    });

    // Hover listeners
    this.viewport.addEventListener('mouseenter', () => { this.state.hoveringViewport = true; });
    this.viewport.addEventListener('mouseleave', () => {
      this.state.hoveringViewport = false;
      this.stopDrag();
    });

    // Binding drag functions
    this.boundOnDrag = (e) => this.onDrag(e);
    this.boundStopDrag = () => this.stopDrag();

    // Mouse Drag scroll listeners
    this.viewport.addEventListener('mousedown', (e) => this.startDrag(e));

    // Touch swipe scroll listeners
    this.viewport.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
    this.viewport.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
    this.viewport.addEventListener('touchend', () => this.stopDrag());

    // Trackpad scroll wheel
    this.viewport.addEventListener('wheel', (e) => {
      this.cancelInertia();
      this.pauseAutoScrollTimer();
      this.state.targetCard = null;
      if (e.deltaY !== 0) {
        this.viewport.scrollLeft += (e.deltaY * 0.8);
      }
    }, { passive: true });

    // Buttons
    this.prevBtn.addEventListener('click', () => {
      this.cancelInertia();
      this.pauseAutoScrollTimer();
      const baseCard = this.state.targetCard || this.getClosestCard();
      if (baseCard) {
        const prevCard = baseCard.previousElementSibling;
        if (prevCard) {
          this.scrollToCard(prevCard);
        }
      }
    });

    this.nextBtn.addEventListener('click', () => {
      this.cancelInertia();
      this.pauseAutoScrollTimer();
      const baseCard = this.state.targetCard || this.getClosestCard();
      if (baseCard) {
        const nextCard = baseCard.nextElementSibling;
        if (nextCard) {
          this.scrollToCard(nextCard);
        }
      }
    });

    // Resize
    window.addEventListener('resize', () => {
      this.cancelInertia();
      this.state.targetCard = null;
      this.alignViewportToMiddleSet();
      this.updateCardEffects();
    });
  }

  handleBoundaryWrapping() {
    const scrollLeft = this.viewport.scrollLeft;
    const cards = this.cards;
    const itemCount = this.itemCount;

    if (cards.length < itemCount * 3) return;

    const firstItemB = cards[itemCount];
    const firstItemC = cards[itemCount * 2];

    const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
    const viewportCenterOffset = (this.viewport.offsetWidth - firstItemB.offsetWidth) / 2;

    if (scrollLeft >= (firstItemC.offsetLeft - viewportCenterOffset)) {
      this.viewport.scrollLeft = scrollLeft - setWidth;
      if (this.state.targetCard) {
        const currentIndex = cards.indexOf(this.state.targetCard);
        if (currentIndex !== -1) {
          this.state.targetCard = cards[currentIndex - itemCount] || null;
        }
      }
    } else if (scrollLeft <= (firstItemB.offsetLeft - setWidth - viewportCenterOffset)) {
      this.viewport.scrollLeft = scrollLeft + setWidth;
      if (this.state.targetCard) {
        const currentIndex = cards.indexOf(this.state.targetCard);
        if (currentIndex !== -1) {
          this.state.targetCard = cards[currentIndex + itemCount] || null;
        }
      }
    }
  }

  updateCardEffects() {
    const scrollLeft = this.viewport.scrollLeft;
    const viewportCenter = scrollLeft + this.viewport.offsetWidth / 2;
    const cards = this.cards;
    const itemCount = this.itemCount;

    if (cards.length < itemCount * 3) return;

    const firstItemB = cards[itemCount];
    const firstItemC = cards[itemCount * 2];
    const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
    const startOfB = firstItemB.offsetLeft - (this.viewport.offsetWidth - firstItemB.offsetWidth) / 2;

    const normalizedProgress = ((scrollLeft - startOfB) % setWidth + setWidth) % setWidth;
    const progressPercentage = (normalizedProgress / setWidth) * 100;
    this.progressBarFill.style.width = `${progressPercentage}%`;

    cards.forEach(card => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distFromCenter = cardCenter - viewportCenter;

      if (Math.abs(distFromCenter) < card.offsetWidth / 2) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  alignViewportToMiddleSet() {
    const firstItemB = this.cards[this.itemCount];
    if (!firstItemB) return;
    const viewportCenterOffset = (this.viewport.offsetWidth - firstItemB.offsetWidth) / 2;
    this.viewport.scrollLeft = firstItemB.offsetLeft - viewportCenterOffset;
  }

  startAnimationLoop() {
    const tick = () => {
      let targetSpeed = 0;
      if (this.state.autoScrollActive && !this.state.isDragging && !this.state.hoveringViewport && !this.state.userInteracting) {
        targetSpeed = this.config.autoScrollSpeed;
      }
      this.state.currentAutoScrollSpeed += (targetSpeed - this.state.currentAutoScrollSpeed) * 0.12;

      if (Math.abs(this.state.currentAutoScrollSpeed) > 0.005) {
        this.viewport.scrollLeft += this.state.currentAutoScrollSpeed;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  pauseAutoScrollTimer() {
    this.state.userInteracting = true;
    clearTimeout(this.state.interactionTimeout);
    this.state.interactionTimeout = setTimeout(() => {
      this.state.userInteracting = false;
    }, this.config.resumeDelay);
  }

  startDrag(e) {
    this.cancelInertia();
    this.pauseAutoScrollTimer();
    this.state.targetCard = null;

    this.state.isDragging = true;
    this.viewport.classList.add('grabbing');

    const pageX = e.pageX || (e.touches && e.touches[0].pageX);
    this.state.startX = pageX - this.viewport.offsetLeft;
    this.state.scrollLeftStart = this.viewport.scrollLeft;

    this.state.lastEventX = pageX;
    this.state.lastEventTime = performance.now();
    this.state.velocity = 0;

    if (e.type === 'mousedown') {
      window.addEventListener('mousemove', this.boundOnDrag);
      window.addEventListener('mouseup', this.boundStopDrag);
    }
  }

  onDrag(e) {
    if (!this.state.isDragging) return;

    if (e.type === 'touchmove') {
      if (e.cancelable) e.preventDefault();
    }
    this.pauseAutoScrollTimer();

    const pageX = e.pageX || (e.touches && e.touches[0].pageX);
    if (!pageX) return;

    const currentX = pageX - this.viewport.offsetLeft;
    const walk = (currentX - this.state.startX) * this.config.dragMultiplier;
    this.viewport.scrollLeft = this.state.scrollLeftStart - walk;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.state.lastEventTime;

    if (deltaTime > 0) {
      const deltaX = pageX - this.state.lastEventX;
      const instantVelocity = deltaX / deltaTime;
      this.state.velocity = this.state.velocity * 0.7 + instantVelocity * 0.3;
    }

    this.state.lastEventX = pageX;
    this.state.lastEventTime = currentTime;
  }

  stopDrag() {
    if (!this.state.isDragging) return;
    this.state.isDragging = false;
    this.viewport.classList.remove('grabbing');

    window.removeEventListener('mousemove', this.boundOnDrag);
    window.removeEventListener('mouseup', this.boundStopDrag);

    if (Math.abs(this.state.velocity) > 0.15) {
      this.applyInertiaMomentum(this.state.velocity * 16);
    }
  }

  applyInertiaMomentum(initialVelocity) {
    let currentVelocity = initialVelocity;
    const decayLoop = () => {
      if (this.state.isDragging) return;
      this.viewport.scrollLeft -= currentVelocity;
      currentVelocity *= this.config.inertiaFriction;

      if (Math.abs(currentVelocity) > 0.05) {
        this.state.inertiaId = requestAnimationFrame(decayLoop);
      }
    };
    this.state.inertiaId = requestAnimationFrame(decayLoop);
  }

  cancelInertia() {
    if (this.state.inertiaId) {
      cancelAnimationFrame(this.state.inertiaId);
      this.state.inertiaId = null;
    }
    this.state.velocity = 0;
  }

  getClosestCard() {
    const cards = this.cards;
    if (!cards || cards.length === 0) return null;

    const viewportCenter = this.viewport.scrollLeft + this.viewport.offsetWidth / 2;
    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach(card => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    return closestCard;
  }

  scrollToCard(card) {
    if (!card) return;
    this.state.targetCard = card;
    const targetScrollLeft = card.offsetLeft + card.offsetWidth / 2 - this.viewport.offsetWidth / 2;
    this.viewport.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  }
}
customElements.define('glasses-gallery', GlassesGallery);


// 2. Interactive Text Paragraph Slider Web Component
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


// 3. Document DOMContentLoaded Initializers
document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer to hide floating button at bottom of page
  const footer = document.querySelector('footer');
  const floatingCta = document.querySelector('.floating-cta');
  if (footer && floatingCta) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          floatingCta.classList.add('hide');
        } else {
          floatingCta.classList.remove('hide');
        }
      });
    }, {
      threshold: 0.1
    });
    observer.observe(footer);
  }
});
