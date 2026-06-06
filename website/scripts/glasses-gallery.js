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
          flex: 1;
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

        /* Premium Caption below the image */
        .card-caption {
          position: relative;
          width: 100%;
          padding: 16px 20px;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          pointer-events: none;
          z-index: 2;
        }

        .card-caption h3 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: -0.1px;
          color: var(--text-primary);
          line-height: 1.4;
          margin-top: 0; /* Remove default margin-top */
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
            padding: 12px 16px;
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

  getScrollLeft() {
    return this.preciseScrollLeft !== undefined ? this.preciseScrollLeft : this.viewport.scrollLeft;
  }

  setScrollLeft(val) {
    this.preciseScrollLeft = val;
    this.viewport.scrollLeft = Math.round(val);
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
      const currentScroll = this.viewport.scrollLeft;
      if (this.preciseScrollLeft === undefined || Math.abs(currentScroll - this.preciseScrollLeft) > 1.5) {
        this.preciseScrollLeft = currentScroll;
      }
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
        this.setScrollLeft(this.getScrollLeft() + e.deltaY * 0.8);
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
    const scrollLeft = this.getScrollLeft();
    const cards = this.cards;
    const itemCount = this.itemCount;

    if (cards.length < itemCount * 3) return;

    const firstItemB = cards[itemCount];
    const firstItemC = cards[itemCount * 2];

    const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
    const viewportCenterOffset = (this.viewport.offsetWidth - firstItemB.offsetWidth) / 2;

    if (scrollLeft >= (firstItemC.offsetLeft - viewportCenterOffset)) {
      this.setScrollLeft(scrollLeft - setWidth);
      if (this.state.targetCard) {
        const currentIndex = cards.indexOf(this.state.targetCard);
        if (currentIndex !== -1) {
          this.state.targetCard = cards[currentIndex - itemCount] || null;
        }
      }
    } else if (scrollLeft <= (firstItemB.offsetLeft - setWidth - viewportCenterOffset)) {
      this.setScrollLeft(scrollLeft + setWidth);
      if (this.state.targetCard) {
        const currentIndex = cards.indexOf(this.state.targetCard);
        if (currentIndex !== -1) {
          this.state.targetCard = cards[currentIndex + itemCount] || null;
        }
      }
    }
  }

  updateCardEffects() {
    const scrollLeft = this.getScrollLeft();
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
    this.setScrollLeft(firstItemB.offsetLeft - viewportCenterOffset);
  }

  startAnimationLoop() {
    const tick = () => {
      let targetSpeed = 0;
      if (this.state.autoScrollActive && !this.state.isDragging && !this.state.hoveringViewport && !this.state.userInteracting) {
        targetSpeed = this.config.autoScrollSpeed;
      }
      this.state.currentAutoScrollSpeed += (targetSpeed - this.state.currentAutoScrollSpeed) * 0.12;

      if (Math.abs(this.state.currentAutoScrollSpeed) > 0.005) {
        this.setScrollLeft(this.getScrollLeft() + this.state.currentAutoScrollSpeed);
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
    this.state.scrollLeftStart = this.getScrollLeft();

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
    this.setScrollLeft(this.state.scrollLeftStart - walk);

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
      this.setScrollLeft(this.getScrollLeft() - currentVelocity);
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

    const viewportCenter = this.getScrollLeft() + this.viewport.offsetWidth / 2;
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
