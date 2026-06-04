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
  const carouselContainers = document.querySelectorAll('.carousel-container');

  carouselContainers.forEach((container) => {
    const viewport = container.querySelector('.carousel-viewport');
    const prevBtn = container.querySelector('.nav-btn-left');
    const nextBtn = container.querySelector('.nav-btn-right');
    const progressBarFill = container.querySelector('.progress-bar-fill');

    if (viewport && prevBtn && nextBtn && progressBarFill) {
      const track = viewport.querySelector('.carousel-track');
      const cards = track ? track.children : [];
      const itemCount = Math.round(cards.length / 3);

      if (itemCount === 0) return;

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
        interactionTimeout: null,
        targetCard: null
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
          if (state.targetCard) {
            const cardsArray = Array.from(cards);
            const currentIndex = cardsArray.indexOf(state.targetCard);
            if (currentIndex !== -1) {
              state.targetCard = cardsArray[currentIndex - itemCount] || null;
            }
          }
        } else if (scrollLeft <= (firstItemB.offsetLeft - setWidth - viewportCenterOffset)) {
          viewport.scrollLeft = scrollLeft + setWidth;
          if (state.targetCard) {
            const cardsArray = Array.from(cards);
            const currentIndex = cardsArray.indexOf(state.targetCard);
            if (currentIndex !== -1) {
              state.targetCard = cardsArray[currentIndex + itemCount] || null;
            }
          }
        }
      };

      // Visual effects (centering highlight) and progress bar synchronization
      const updateCardEffects = () => {
        const scrollLeft = viewport.scrollLeft;
        const viewportCenter = scrollLeft + viewport.offsetWidth / 2;
        const track = viewport.querySelector('.carousel-track');
        if (!track) return;
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
        if (!track) return;
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
        state.targetCard = null;

        state.isDragging = true;
        viewport.classList.add('grabbing');

        const pageX = e.pageX || e.touches[0].pageX;
        state.startX = pageX - viewport.offsetLeft;

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
        state.targetCard = null;
        if (e.deltaY !== 0) {
          viewport.scrollLeft += (e.deltaY * 0.8);
        }
      }, { passive: true });

      // Find the card closest to the current viewport center
      const getClosestCard = () => {
        const track = viewport.querySelector('.carousel-track');
        if (!track) return null;
        const cards = Array.from(track.children);
        if (cards.length === 0) return null;

        const viewportCenter = viewport.scrollLeft + viewport.offsetWidth / 2;
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
      };

      // Smoothly scroll to center a specific card
      const scrollToCard = (card) => {
        if (!card) return;
        state.targetCard = card;
        const targetScrollLeft = card.offsetLeft + card.offsetWidth / 2 - viewport.offsetWidth / 2;
        viewport.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      };

      prevBtn.addEventListener('click', () => {
        cancelInertia();
        pauseAutoScrollTimer();
        const baseCard = state.targetCard || getClosestCard();
        if (baseCard) {
          const prevCard = baseCard.previousElementSibling;
          if (prevCard) {
            scrollToCard(prevCard);
          }
        }
      });

      nextBtn.addEventListener('click', () => {
        cancelInertia();
        pauseAutoScrollTimer();
        const baseCard = state.targetCard || getClosestCard();
        if (baseCard) {
          const nextCard = baseCard.nextElementSibling;
          if (nextCard) {
            scrollToCard(nextCard);
          }
        }
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
        state.targetCard = null;
        alignViewportToMiddleSet();
        updateCardEffects();
      });
    }
  });

  // 3. Text Paragraphs Slider (Generic Loop for Multiple Instances)
  const textSliders = document.querySelectorAll('.text-slider-outer');
  
  textSliders.forEach((slider) => {
    const textViewport = slider.querySelector('.text-slider-viewport');
    const textTrack = slider.querySelector('.text-slider-track');
    const textPrevBtns = slider.querySelectorAll('.text-prev-btn');
    const textNextBtns = slider.querySelectorAll('.text-next-btn');
    const textDots = slider.querySelectorAll('.text-indicator-dot');
    const textSlides = slider.querySelectorAll('.text-slide');

    if (textViewport && textTrack && textPrevBtns.length > 0 && textNextBtns.length > 0 && textDots.length > 0) {
      let currentIndex = 0;
      const totalSlides = textSlides.length;

      let startX = 0;
      let currentX = 0;
      let isDragging = false;
      const dragThreshold = 50; // pixels to trigger slide change

      const updateSlider = () => {
        // Calculate offset percentage
        const offset = -currentIndex * 100;
        textTrack.style.transform = `translateX(${offset}%)`;

        // Update buttons state
        textPrevBtns.forEach(btn => btn.disabled = currentIndex === 0);
        textNextBtns.forEach(btn => btn.disabled = currentIndex === totalSlides - 1);

        // Update dots
        textDots.forEach((dot, idx) => {
          if (idx === currentIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      };

      const goToSlide = (index) => {
        if (index < 0 || index >= totalSlides) return;
        currentIndex = index;
        updateSlider();
      };

      // Button Listeners
      textPrevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          goToSlide(currentIndex - 1);
        });
      });

      textNextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          goToSlide(currentIndex + 1);
        });
      });

      // Dot Listeners
      textDots.forEach((dot) => {
        dot.addEventListener('click', () => {
          const index = parseInt(dot.getAttribute('data-index'), 10);
          goToSlide(index);
        });
      });

      // Touch and Mouse Drag Events
      const handleStart = (clientX) => {
        isDragging = true;
        startX = clientX;
        currentX = clientX;
        textTrack.style.transition = 'none'; // pause transition during drag
        textViewport.classList.add('grabbing');
      };

      const handleMove = (clientX) => {
        if (!isDragging) return;
        currentX = clientX;
        const diffX = currentX - startX;
        
        // Calculate current offset in pixels and add drag distance
        const viewportWidth = textViewport.offsetWidth;
        const currentPixelOffset = -currentIndex * viewportWidth;
        const newPixelOffset = currentPixelOffset + diffX;
        
        // Apply translation in pixels
        textTrack.style.transform = `translateX(${newPixelOffset}px)`;
      };

      const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        textViewport.classList.remove('grabbing');
        textTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

        const diffX = currentX - startX;
        // Reset if we didn't drag or didn't move much
        if (Math.abs(diffX) > dragThreshold) {
          if (diffX > 0 && currentIndex > 0) {
            currentIndex--;
          } else if (diffX < 0 && currentIndex < totalSlides - 1) {
            currentIndex++;
          }
        }
        startX = 0;
        currentX = 0;
        updateSlider();
      };

      // Touch events
      textViewport.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
      }, { passive: true });

      textViewport.addEventListener('touchmove', (e) => {
        if (isDragging) {
          handleMove(e.touches[0].clientX);
          // Only prevent default if horizontal movement is significant
          const diffX = Math.abs(e.touches[0].clientX - startX);
          if (diffX > 5 && e.cancelable) {
            e.preventDefault();
          }
        }
      }, { passive: false });

      textViewport.addEventListener('touchend', handleEnd);

      // Mouse events
      const onMouseMove = (e) => {
        handleMove(e.clientX);
      };

      const onMouseUp = () => {
        handleEnd();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      textViewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only track left click
        handleStart(e.clientX);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      // Keyboard accessibility
      textViewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          goToSlide(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
          goToSlide(currentIndex + 1);
        }
      });

      // Resize adjustment
      window.addEventListener('resize', () => {
        updateSlider();
      });

      // Initial setup
      updateSlider();
    }
  });
});
