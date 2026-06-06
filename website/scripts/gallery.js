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

  // Intercept navigation links and logo link to enable smooth scrolling on index.html
  document.querySelectorAll('.nav-links a, .logo-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('index.html#')) {
        const hash = href.substring(10); // get '#...'
        if (hash === '#home') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          // Uncheck menu-btn checkbox
          const menuBtn = document.getElementById('menu-btn');
          if (menuBtn) {
            menuBtn.checked = false;
          }
          return;
        }

        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          
          // Find the main section headline inside the target section
          const headline = targetElement.querySelector('.section-chapter-title') || targetElement;
          
          // Align the headline exactly 15px below the 80px fixed header
          const headerHeight = 80;
          const spacing = 15;
          const headlinePosition = headline.getBoundingClientRect().top;
          const offsetPosition = headlinePosition + (window.scrollY || window.pageYOffset) - headerHeight - spacing;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL hash
          history.pushState(null, null, hash);
          // Uncheck menu-btn checkbox
          const menuBtn = document.getElementById('menu-btn');
          if (menuBtn) {
            menuBtn.checked = false;
          }
        }
      }
    });
  });
});
