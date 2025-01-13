document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  const swiperContainer = document.getElementById("swiperContainer");
  const swiperWrapper = document.getElementById("swiperWrapper");
  const singleSwiperWrapper = document.getElementById("singleSwiperWrapper");
  const circleWrapper = document.querySelector('.circle-wrapper');
  let gridSwiperInstance = null;
  let singleSwiperInstance = null;

  // Set initial state for Patent view
  function initializePatentView() {
    swiperWrapper.style.display = "block";
    singleSwiperWrapper.style.display = "block";
    circleWrapper.style.display = "none";

    if (window.innerWidth < 768) {
      const frameBox = document.querySelector('.frame');
      if (frameBox) {
        frameBox.style.height = "204px";
      }
    }
  }

  // Initialize Swiper based on device width
  function initializeSwiper() {
    const isMobile = window.matchMedia("(max-width: 1000px)").matches;

    if (isMobile) {
      singleSwiperInstance = new Swiper(".single-swiper", {
        slidesPerView: 3,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        breakpoints: {
          768: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          700: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
        },
        spaceBetween: 10,
        speed: 1000,
      });
    } else {
      gridSwiperInstance = new Swiper(".grid-swiper", {
        slidesPerView: 1,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        speed: 1000,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        }
      });
    }
  }

  // Initialize page with Patent selected
  initializePatentView();
  initializeSwiper();

  // Handle resize events
  window.addEventListener('resize', () => {
    const isMobile = window.matchMedia("(max-width: 1000px)").matches;
    
    if (isMobile && !singleSwiperInstance) {
      if (gridSwiperInstance) {
        gridSwiperInstance.destroy();
        gridSwiperInstance = null;
      }
      initializeSwiper();
    } else if (!isMobile && !gridSwiperInstance) {
      if (singleSwiperInstance) {
        singleSwiperInstance.destroy();
        singleSwiperInstance = null;
      }
      initializeSwiper();
    }

    // Update frame height on mobile
    if (window.innerWidth < 768) {
      const frameBox = document.querySelector('.frame');
      if (frameBox) {
        frameBox.style.height = "204px";
      }
    }
  });
});