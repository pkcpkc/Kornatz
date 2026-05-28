document.addEventListener('DOMContentLoaded', () => {
  // 1. Intersection Observer to hide floating button at bottom of page
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

  // 2. High-Fidelity Visual Gallery (Static Seamless Loop, Auto-Rotation & Drag Swipe with Momentum)
  const viewport = document.getElementById('carouselViewport');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBarFill = document.getElementById('progressBarFill');

  if (viewport && prevBtn && nextBtn && progressBarFill) {
    const itemCount = 6; // 6 original items
    const config = {
      autoScrollSpeed: 0.5,    // Continuous slow drift speed
      inertiaFriction: 0.93,   // Drag decay rate
      dragMultiplier: 1.25,    // Drag speed multiplier
      resumeDelay: 3000        // Inactivity resume delay (ms)
    };

    const state = {
      isDragging: false,
      startX: 0,
      scrollLeftStart: 0,
      lastEventTime: 0,
      lastEventX: 0,
      velocity: 0,
      inertiaId: null,
      autoScrollActive: true,
      currentAutoScrollSpeed: config.autoScrollSpeed,
      hoveringViewport: false,
      userInteracting: false,
      interactionTimeout: null
    };

    // Teleports scroll position seamlessly when boundaries are crossed
    const handleBoundaryWrapping = () => {
      const scrollLeft = viewport.scrollLeft;
      const track = viewport.querySelector('.carousel-track');
      const cards = track.children;

      if (cards.length < itemCount * 3) return;

      const firstItemB = cards[itemCount];
      const firstItemC = cards[itemCount * 2];

      const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
      const viewportCenterOffset = (viewport.offsetWidth - firstItemB.offsetWidth) / 2;

      // Seamless loop checks
      if (scrollLeft >= (firstItemC.offsetLeft - viewportCenterOffset)) {
        viewport.scrollLeft = scrollLeft - setWidth;
      } else if (scrollLeft <= (firstItemB.offsetLeft - setWidth - viewportCenterOffset)) {
        viewport.scrollLeft = scrollLeft + setWidth;
      }
    };

    // Visual effects (centering highlight) and progress bar synchronization
    const updateCardEffects = () => {
      const scrollLeft = viewport.scrollLeft;
      const viewportCenter = scrollLeft + viewport.offsetWidth / 2;
      const track = viewport.querySelector('.carousel-track');
      const cards = Array.from(track.children);

      if (cards.length < itemCount * 3) return;

      const firstItemB = cards[itemCount];
      const firstItemC = cards[itemCount * 2];
      const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
      const startOfB = firstItemB.offsetLeft - (viewport.offsetWidth - firstItemB.offsetWidth) / 2;

      // Progress bar synchronization based strictly on center set
      const normalizedProgress = ((scrollLeft - startOfB) % setWidth + setWidth) % setWidth;
      const progressPercentage = (normalizedProgress / setWidth) * 100;
      progressBarFill.style.width = `${progressPercentage}%`;

      // Center highlighting
      cards.forEach(card => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distFromCenter = cardCenter - viewportCenter;

        if (Math.abs(distFromCenter) < card.offsetWidth / 2) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    };

    // Dynamically positions viewport exactly centered at the start of Set B
    const alignViewportToMiddleSet = () => {
      const track = viewport.querySelector('.carousel-track');
      const cards = track.children;
      const firstItemB = cards[itemCount];
      if (!firstItemB) return;
      const viewportCenterOffset = (viewport.offsetWidth - firstItemB.offsetWidth) / 2;
      viewport.scrollLeft = firstItemB.offsetLeft - viewportCenterOffset;
    };

    // Continuous slow auto-scroll loop
    const startAnimationLoop = () => {
      const tick = () => {
        let targetSpeed = 0;
        if (state.autoScrollActive && !state.isDragging && !state.hoveringViewport && !state.userInteracting) {
          targetSpeed = config.autoScrollSpeed;
        }
        state.currentAutoScrollSpeed += (targetSpeed - state.currentAutoScrollSpeed) * 0.12;

        if (Math.abs(state.currentAutoScrollSpeed) > 0.005) {
          viewport.scrollLeft += state.currentAutoScrollSpeed;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    // Temporarily pauses auto-scroll during mouse/touch interactions
    const pauseAutoScrollTimer = () => {
      state.userInteracting = true;
      clearTimeout(state.interactionTimeout);
      state.interactionTimeout = setTimeout(() => {
        state.userInteracting = false;
      }, config.resumeDelay);
    };

    // Drag swiping implementation
    const startDrag = (e) => {
      cancelInertia();
      pauseAutoScrollTimer();

      state.isDragging = true;
      viewport.classList.add('grabbing');

      const pageX = e.pageX || e.touches[0].pageX;
      state.startX = pageX - viewport.offsetLeft;
      state.scrollLeftStart = viewport.scrollLeft;

      state.lastEventX = pageX;
      state.lastEventTime = performance.now();
      state.velocity = 0;
    };

    const onDrag = (e) => {
      if (!state.isDragging) return;

      // Only prevent default on touchmove if horizontal scrolling is happening
      if (e.cancelable) e.preventDefault();
      pauseAutoScrollTimer();

      const pageX = e.pageX || (e.touches && e.touches[0].pageX);
      if (!pageX) return;

      const currentX = pageX - viewport.offsetLeft;
      const walk = (currentX - state.startX) * config.dragMultiplier;
      viewport.scrollLeft = state.scrollLeftStart - walk;

      const currentTime = performance.now();
      const deltaTime = currentTime - state.lastEventTime;

      if (deltaTime > 0) {
        const deltaX = pageX - state.lastEventX;
        const instantVelocity = deltaX / deltaTime;
        state.velocity = state.velocity * 0.7 + instantVelocity * 0.3;
      }

      state.lastEventX = pageX;
      state.lastEventTime = currentTime;
    };

    const stopDrag = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      viewport.classList.remove('grabbing');

      if (Math.abs(state.velocity) > 0.15) {
        applyInertiaMomentum(state.velocity * 16);
      }
    };

    const applyInertiaMomentum = (initialVelocity) => {
      let currentVelocity = initialVelocity;
      const decayLoop = () => {
        if (state.isDragging) return;
        viewport.scrollLeft -= currentVelocity;
        currentVelocity *= config.inertiaFriction;

        if (Math.abs(currentVelocity) > 0.05) {
          state.inertiaId = requestAnimationFrame(decayLoop);
        }
      };
      state.inertiaId = requestAnimationFrame(decayLoop);
    };

    const cancelInertia = () => {
      if (state.inertiaId) {
        cancelAnimationFrame(state.inertiaId);
        state.inertiaId = null;
      }
      state.velocity = 0;
    };

    // Scroll listener for wrapping & highlights
    viewport.addEventListener('scroll', () => {
      handleBoundaryWrapping();
      updateCardEffects();
    });

    // Hover listeners
    viewport.addEventListener('mouseenter', () => { state.hoveringViewport = true; });
    viewport.addEventListener('mouseleave', () => {
      state.hoveringViewport = false;
      stopDrag();
    });

    // Mouse Drag scroll listeners
    viewport.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);

    // Touch swipe scroll listeners
    viewport.addEventListener('touchstart', startDrag, { passive: true });
    viewport.addEventListener('touchmove', onDrag, { passive: false });
    viewport.addEventListener('touchend', stopDrag);

    // Trackpad scroll wheel
    viewport.addEventListener('wheel', (e) => {
      cancelInertia();
      pauseAutoScrollTimer();
      if (e.deltaY !== 0) {
        viewport.scrollLeft += (e.deltaY * 0.8);
      }
    }, { passive: true });

    // Chevron click navigation step calculation
    const getScrollStep = () => {
      const card = viewport.querySelector('.gallery-card');
      if (!card) return 350;
      const cardWidth = card.offsetWidth;
      const track = viewport.querySelector('.carousel-track');
      let gap = 30;
      if (track) {
        const trackStyle = window.getComputedStyle(track);
        gap = parseFloat(trackStyle.gap) || 30;
      }
      return cardWidth + gap;
    };

    prevBtn.addEventListener('click', () => {
      cancelInertia();
      pauseAutoScrollTimer();
      viewport.scrollTo({
        left: viewport.scrollLeft - getScrollStep(),
        behavior: 'smooth'
      });
    });

    nextBtn.addEventListener('click', () => {
      cancelInertia();
      pauseAutoScrollTimer();
      viewport.scrollTo({
        left: viewport.scrollLeft + getScrollStep(),
        behavior: 'smooth'
      });
    });

    // Initial setup
    requestAnimationFrame(() => {
      alignViewportToMiddleSet();
      updateCardEffects();
      startAnimationLoop();
    });

    // Resize behavior
    window.addEventListener('resize', () => {
      cancelInertia();
      alignViewportToMiddleSet();
      updateCardEffects();
    });
  }
});
