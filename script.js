const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

document.documentElement.classList.add("js-enabled");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!navToggle || !navMenu) return;

    navMenu.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const aboutCarousel = document.querySelector(".about-carousel");

if (aboutCarousel) {
  const track = aboutCarousel.querySelector(".carousel-track");
  const slides = Array.from(aboutCarousel.querySelectorAll(".carousel-track img"));
  const prevButton = aboutCarousel.querySelector(".carousel-prev");
  const nextButton = aboutCarousel.querySelector(".carousel-next");
  const dots = Array.from(aboutCarousel.querySelectorAll(".carousel-dots button"));
  let currentSlide = 0;
  let touchStartX = 0;

  const updateCarousel = (index) => {
    if (!track || slides.length === 0) return;

    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  };

  prevButton?.addEventListener("click", () => updateCarousel(currentSlide - 1));
  nextButton?.addEventListener("click", () => updateCarousel(currentSlide + 1));

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => updateCarousel(dotIndex));
  });

  aboutCarousel.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  aboutCarousel.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) < 42) return;
      updateCarousel(currentSlide + (swipeDistance < 0 ? 1 : -1));
    },
    { passive: true }
  );

  updateCarousel(0);
}

const revealTargets = document.querySelectorAll(
  ".section-head, .about-photo, .feature-card, .brand-logo, .product-card, .advantage-item, .contact-panel, .intro-strip"
);

revealTargets.forEach((target) => target.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("visible"));
}
