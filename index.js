document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('carouselViewport');
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBarFill = document.getElementById('progressBarFill');

  const loadingState = document.getElementById('loadingState');

  // Global carousel configuration and interaction state
  const config = {
    autoScrollSpeed: 0.5,    // Pixels per frame of the auto rotation (slower, premium feel)
    inertiaFriction: 0.93,   // Drag inertia decay rate (0.9-0.95 is ideal)
    dragMultiplier: 1.25,    // Drag distance speed multiplier
    resumeDelay: 3000        // Duration (ms) before auto scroll resumes after user input (3s)
  };

  const state = {
    items: [],               // Original parsed items
    itemCount: 0,            // Total original items
    isDragging: false,       // Current mouse drag state
    startX: 0,               // Drag starting horizontal coordinate
    scrollLeftStart: 0,      // Drag starting viewport scroll coordinate
    lastEventTime: 0,        // Timestamp of last pointer event (to calculate drag speed)
    lastEventX: 0,           // X-coordinate of last pointer event
    velocity: 0,             // Moving speed for inertia calculations
    inertiaId: null,         // requestAnimationFrame reference for inertia momentum
    autoScrollActive: true,  // Auto rotation state toggled by controls
    currentAutoScrollSpeed: config.autoScrollSpeed, // Interpolated auto scroll speed
    hoveringViewport: false, // Active hover state over viewport
    userInteracting: false,  // Active interaction timeout trigger (pauses auto scroll)
    interactionTimeout: null // Inactivity timeout reference to resume auto scroll
  };

  // --------------------------------------------------------------------------
  // 1. DATA SOURCE FETCH & PARSE
  // --------------------------------------------------------------------------
  fetch('gallery.txt')
    .then(response => {
      if (!response.ok) throw new Error('Die Katalogdatei gallery.txt wurde nicht gefunden.');
      return response.text();
    })
    .then(text => {
      const lines = text.split('\n').map(line => line.trim()).filter(l => l.length > 0);
      const parsed = [];
      for (let i = 0; i < lines.length; i += 2) {
        if (i + 1 < lines.length) {
          parsed.push({
            image: lines[i],
            caption: lines[i + 1]
          });
        }
      }
      if (parsed.length === 0) throw new Error('Keine Einträge in gallery.txt gefunden.');
      
      state.items = parsed;
      state.itemCount = parsed.length;
      initGallery();
    })
    .catch(error => {
      console.error('Gallery initialization failed:', error);
      showErrorState(error.message || 'Prüfen Sie das Format in gallery.txt.');
    });

  // Render custom error feedback state inside viewport
  function showErrorState(msg) {
    track.innerHTML = `
      <div class="gallery-status-message status-error">
        <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="15"></line>
          <line x1="15" y1="9" x2="9" y2="15"></line>
        </svg>
        <div class="status-title">Fehler beim Laden</div>
        <div class="status-description">${msg}<br><br><span style="opacity:0.6;">Stellen Sie sicher, dass "gallery.txt" im gleichen Ordner liegt und wie folgt aufgebaut ist:<br>images/bildname.jpg<br>Beschreibung des Bildes</span></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 2. DOM GENERATION & INITIAL SETUP
  // --------------------------------------------------------------------------
  function initGallery() {
    // Create 3 sets of items (Set A [clones], Set B [core], Set C [clones]) for seamless loop
    const loopedItems = [...state.items, ...state.items, ...state.items];
    
    let html = '';
    loopedItems.forEach((item, index) => {
      // Identify index mapped back to original set
      const originalIndex = index % state.itemCount;
      html += `
        <div class="gallery-card" data-index="${index}" data-original="${originalIndex}">
          <div class="card-inner">
            <div class="card-image-wrapper">
              <img src="${item.image}" alt="${item.caption}" loading="lazy" />
              <div class="card-caption">
                <h3>${item.caption}</h3>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    track.innerHTML = html;

    // Force browser layout reflow before centering
    requestAnimationFrame(() => {
      alignViewportToMiddleSet();
      setupEventListeners();
      
      // Trigger first frame of animations
      updateCardEffects();
      startAnimationLoop();
    });
  }

  // Automatically positions viewport right at the start of Set B
  function alignViewportToMiddleSet() {
    const firstItemB = track.children[state.itemCount];
    // Center the first item of the middle set inside the viewport scrollport
    const viewportCenterOffset = (viewport.offsetWidth - firstItemB.offsetWidth) / 2;
    viewport.scrollLeft = firstItemB.offsetLeft - viewportCenterOffset;
  }

  // --------------------------------------------------------------------------
  // 3. SEAMLESS INFINITE LOOPING LOGIC
  // --------------------------------------------------------------------------
  function handleBoundaryWrapping() {
    const scrollLeft = viewport.scrollLeft;
    
    // Exact horizontal dimension of one full set of items
    const firstItemB = track.children[state.itemCount];
    const firstItemC = track.children[state.itemCount * 2];
    const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
    const viewportCenterOffset = (viewport.offsetWidth - firstItemB.offsetWidth) / 2;

    // If user scrolls past Set B into Set C, seamlessly teleport back to Set B
    if (scrollLeft >= (firstItemC.offsetLeft - viewportCenterOffset)) {
      viewport.scrollLeft = scrollLeft - setWidth;
    } 
    // If user scrolls back into Set A, seamlessly teleport forward to Set B
    else if (scrollLeft <= (firstItemB.offsetLeft - setWidth - viewportCenterOffset)) {
      viewport.scrollLeft = scrollLeft + setWidth;
    }
  }

  // --------------------------------------------------------------------------
  // 4. CINEMATIC 3D PERSPECTIVE EFFECTS ON SCROLL
  // --------------------------------------------------------------------------
  function updateCardEffects() {
    const scrollLeft = viewport.scrollLeft;
    const viewportCenter = scrollLeft + viewport.offsetWidth / 2;
    
    // Calculate dynamic infinite scroll width
    const firstItemB = track.children[state.itemCount];
    const firstItemC = track.children[state.itemCount * 2];
    const setWidth = firstItemC.offsetLeft - firstItemB.offsetLeft;
    const startOfB = firstItemB.offsetLeft - (viewport.offsetWidth - firstItemB.offsetWidth) / 2;

    // Update progress bar percentage based strictly on middle set scroll progress
    const normalizedProgress = ((scrollLeft - startOfB) % setWidth + setWidth) % setWidth;
    const progressPercentage = (normalizedProgress / setWidth) * 100;
    progressBarFill.style.width = `${progressPercentage}%`;

    // Toggle active class on the card closest to the center
    const cards = track.querySelectorAll('.gallery-card');

    cards.forEach(card => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distFromCenter = cardCenter - viewportCenter;

      // Toggle high-fidelity glass borders and shadows on the centered card
      if (Math.abs(distFromCenter) < card.offsetWidth / 2) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. AUTO-ROTATION SYSTEM & SMOOTH CONTROL
  // --------------------------------------------------------------------------
  function startAnimationLoop() {
    const tick = () => {
      // Check if speed needs to transition to stop/run based on user interactions
      let targetSpeed = 0;
      if (state.autoScrollActive && !state.isDragging && !state.hoveringViewport && !state.userInteracting) {
        targetSpeed = config.autoScrollSpeed;
      }

      // Ease speed transition to prevent jarring jumps on pause/resume
      state.currentAutoScrollSpeed += (targetSpeed - state.currentAutoScrollSpeed) * 0.12;

      if (Math.abs(state.currentAutoScrollSpeed) > 0.005) {
        viewport.scrollLeft += state.currentAutoScrollSpeed;
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Trigger temporary suspension of auto rotation when active input occurs
  function pauseAutoScrollTimer() {
    state.userInteracting = true;
    clearTimeout(state.interactionTimeout);
    state.interactionTimeout = setTimeout(() => {
      state.userInteracting = false;
    }, config.resumeDelay);
  }



  // --------------------------------------------------------------------------
  // 6. MOUSE & TOUCH SWIPE/DRAG IMPLEMENTATION WITH INERTIA
  // --------------------------------------------------------------------------
  function startDrag(e) {
    cancelInertia();
    pauseAutoScrollTimer();
    
    state.isDragging = true;
    viewport.classList.add('grabbing');
    
    const pageX = e.pageX || e.touches[0].pageX;
    state.startX = pageX - viewport.offsetLeft;
    state.scrollLeftStart = viewport.scrollLeft;
    
    // Track coordinate & time delta for momentum calculation
    state.lastEventX = pageX;
    state.lastEventTime = performance.now();
    state.velocity = 0;
  }

  function onDrag(e) {
    if (!state.isDragging) return;
    
    e.preventDefault(); // Stop text highlight or image drag ghosting
    pauseAutoScrollTimer();
    
    const pageX = e.pageX || e.touches[0].pageX;
    const currentX = pageX - viewport.offsetLeft;
    const walk = (currentX - state.startX) * config.dragMultiplier;
    
    viewport.scrollLeft = state.scrollLeftStart - walk;

    // Calculate drag instantaneous velocity (px per millisecond)
    const currentTime = performance.now();
    const deltaTime = currentTime - state.lastEventTime;
    
    if (deltaTime > 0) {
      const deltaX = pageX - state.lastEventX;
      const instantVelocity = deltaX / deltaTime;
      state.velocity = state.velocity * 0.7 + instantVelocity * 0.3;
    }

    state.lastEventX = pageX;
    state.lastEventTime = currentTime;
  }

  function stopDrag() {
    if (!state.isDragging) return;
    state.isDragging = false;
    viewport.classList.remove('grabbing');

    // If drag speed was notable, release viewport with momentum slide
    if (Math.abs(state.velocity) > 0.15) {
      applyInertiaMomentum(state.velocity * 16);
    }
  }

  function applyInertiaMomentum(initialVelocity) {
    let currentVelocity = initialVelocity;
    
    const decayLoop = () => {
      if (state.isDragging) return; // Terminate slide if new user drag starts
      
      viewport.scrollLeft -= currentVelocity;
      currentVelocity *= config.inertiaFriction;
      
      if (Math.abs(currentVelocity) > 0.05) {
        state.inertiaId = requestAnimationFrame(decayLoop);
      }
    };
    state.inertiaId = requestAnimationFrame(decayLoop);
  }

  function cancelInertia() {
    if (state.inertiaId) {
      cancelAnimationFrame(state.inertiaId);
      state.inertiaId = null;
    }
    state.velocity = 0;
  }

  // --------------------------------------------------------------------------
  // 7. EVENT REGISTRATION & WRAPPERS
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Scroll Listeners for Effects and Infinite Boundary Wrapping
    viewport.addEventListener('scroll', () => {
      handleBoundaryWrapping();
      updateCardEffects();
    });

    // Hover hooks to stop/resume slow rotation gracefully
    viewport.addEventListener('mouseenter', () => {
      state.hoveringViewport = true;
    });
    
    viewport.addEventListener('mouseleave', () => {
      state.hoveringViewport = false;
      stopDrag();
    });

    // Drag to scroll listeners (Mouse hooks)
    viewport.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);

    // Responsive Drag listeners (Touch hooks)
    viewport.addEventListener('touchstart', startDrag, { passive: true });
    viewport.addEventListener('touchmove', onDrag, { passive: false });
    viewport.addEventListener('touchend', stopDrag);

    // Smooth Mouse Wheel/Trackpad support inside scroll view
    viewport.addEventListener('wheel', (e) => {
      cancelInertia();
      pauseAutoScrollTimer();
      if (e.deltaY !== 0) {
        viewport.scrollLeft += (e.deltaY * 0.8);
      }
    }, { passive: true });

    // Chevron Arrow Button clicks
    prevBtn.addEventListener('click', () => {
      navigateGallery('prev');
    });

    nextBtn.addEventListener('click', () => {
      navigateGallery('next');
    });

    // Keyboard accessibility
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        navigateGallery('prev');
      } else if (e.key === 'ArrowRight') {
        navigateGallery('next');
      }
    });

    // Recalculate dimensions cleanly if user rotates device or resizes browser
    window.addEventListener('resize', () => {
      cancelInertia();
      alignViewportToMiddleSet();
      updateCardEffects();
    });

    // Non-3D flat layout - no tilt needed

    // Double Tap / Double Click to Center Card
    let lastTap = 0;
    const handleDoubleTap = (e) => {
      const card = e.target.closest('.gallery-card');
      if (!card) return;

      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        centerCard(card);
      }
      lastTap = currentTime;
    };

    track.addEventListener('click', handleDoubleTap);
    track.addEventListener('touchend', handleDoubleTap, { passive: false });
  }

  // Slides track position cleanly by one card segment on action
  function navigateGallery(direction) {
    cancelInertia();
    pauseAutoScrollTimer();

    const card = track.children[0];
    const cardStyle = window.getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const gap = parseFloat(cardStyle.marginRight) || parseFloat(window.getComputedStyle(track).gap) || 60;
    const step = cardWidth + gap;

    const currentScroll = viewport.scrollLeft;
    const targetScroll = direction === 'next' ? currentScroll + step : currentScroll - step;

    viewport.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  // Centers a specific card inside the viewport with smooth animation
  function centerCard(card) {
    cancelInertia();
    pauseAutoScrollTimer();

    const cardWidth = card.offsetWidth;
    const viewportWidth = viewport.offsetWidth;
    const cardLeft = card.offsetLeft;
    const targetScrollLeft = cardLeft - (viewportWidth - cardWidth) / 2;

    viewport.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  }
});
