const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

document.documentElement.classList.add("js-enabled");

// Accept a touch-generated link click only when the pointer did not become a
// drag and did not finish over a different link after scrolling or animation.
let touchPointer = null;
let blockedTouchClickUntil = 0;

document.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  touchPointer = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    link: event.target.closest("a[href]"),
    moved: false,
  };
}, true);

document.addEventListener("pointermove", (event) => {
  if (!touchPointer || event.pointerId !== touchPointer.id) return;
  if (Math.hypot(event.clientX - touchPointer.x, event.clientY - touchPointer.y) > 10) touchPointer.moved = true;
}, true);

document.addEventListener("pointerup", (event) => {
  if (!touchPointer || event.pointerId !== touchPointer.id) return;
  const releasedLink = event.target.closest("a[href]");
  if (touchPointer.moved || releasedLink !== touchPointer.link) blockedTouchClickUntil = performance.now() + 700;
  touchPointer = null;
}, true);

document.addEventListener("pointercancel", () => {
  blockedTouchClickUntil = performance.now() + 700;
  touchPointer = null;
}, true);

document.addEventListener("click", (event) => {
  if (performance.now() > blockedTouchClickUntil || !event.target.closest("a[href]")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

if (navToggle && navMenu) {
  navToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
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

const stopCarouselControlEvent = (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

const bindCarouselControl = (control, action) => {
  if (!control) return;
  control.addEventListener("pointerdown", stopCarouselControlEvent);
  control.addEventListener("click", (event) => {
    stopCarouselControlEvent(event);
    action();
  });
};

if (aboutCarousel) {
  const track = aboutCarousel.querySelector(".carousel-track");
  const slides = Array.from(aboutCarousel.querySelectorAll(".carousel-track img"));
  const prevButton = aboutCarousel.querySelector(".carousel-prev");
  const nextButton = aboutCarousel.querySelector(".carousel-next");
  const dots = Array.from(aboutCarousel.querySelectorAll(".carousel-dots button"));
  let currentSlide = 0;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let trackingPointerId = null;
  let didDrag = false;

  const updateCarousel = (index) => {
    if (!track || slides.length === 0) return;

    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  };

  bindCarouselControl(prevButton, () => updateCarousel(currentSlide - 1));
  bindCarouselControl(nextButton, () => updateCarousel(currentSlide + 1));

  dots.forEach((dot, dotIndex) => {
    bindCarouselControl(dot, () => updateCarousel(dotIndex));
  });

  aboutCarousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest("button")) return;
    trackingPointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    didDrag = false;
  });
  aboutCarousel.addEventListener("pointermove", (event) => {
    if (event.pointerId !== trackingPointerId) return;
    if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 10) didDrag = true;
  });
  aboutCarousel.addEventListener("pointerup", (event) => {
    if (event.pointerId !== trackingPointerId) return;
    const swipeDistance = event.clientX - pointerStartX;
    const verticalDistance = Math.abs(event.clientY - pointerStartY);
    trackingPointerId = null;
    if (didDrag && Math.abs(swipeDistance) >= 42 && Math.abs(swipeDistance) > verticalDistance) {
      event.preventDefault();
      updateCarousel(currentSlide + (swipeDistance < 0 ? 1 : -1));
    }
  });
  aboutCarousel.addEventListener("pointercancel", () => {
    trackingPointerId = null;
    didDrag = false;
  });

  updateCarousel(0);
}

const brandCarousel = document.querySelector(".brand-carousel");

if (brandCarousel) {
  const track = brandCarousel.querySelector(".brand-logo-track");
  const prevButton = brandCarousel.querySelector(".brand-carousel-prev");
  const nextButton = brandCarousel.querySelector(".brand-carousel-next");
  const originalLogos = track ? Array.from(track.children) : [];
  let pointerStartX = 0;
  let pointerStartY = 0;
  let trackingPointerId = null;
  let suppressNextClick = false;

  originalLogos.forEach((logo) => {
    const clone = logo.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    if (clone.matches("a")) {
      clone.setAttribute("tabindex", "-1");
    }
    clone.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    track?.appendChild(clone);
  });

  const nudgeTrack = (direction) => {
    if (!track || originalLogos.length === 0) return;
    const firstLogo = originalLogos[0];
    const gap = Number.parseFloat(getComputedStyle(track).gap || "0");
    const distance = firstLogo.getBoundingClientRect().width + gap;
    const currentDuration = getComputedStyle(track).animationDuration;
    const currentTransform = getComputedStyle(track).transform;

    track.style.animation = "none";
    track.style.transform = `${currentTransform === "none" ? "" : currentTransform} translateX(${-distance * direction}px)`;
    window.setTimeout(() => {
      track.style.animation = "";
      track.style.transform = "";
      track.style.animationDuration = currentDuration;
    }, 280);
  };

  const pause = () => {
    brandCarousel.classList.add("is-paused");
  };

  const resume = () => {
    brandCarousel.classList.remove("is-paused");
  };

  bindCarouselControl(prevButton, () => nudgeTrack(-1));
  bindCarouselControl(nextButton, () => nudgeTrack(1));

  brandCarousel.addEventListener("mouseenter", pause);
  brandCarousel.addEventListener("mouseleave", resume);
  brandCarousel.addEventListener("focusin", pause);
  brandCarousel.addEventListener("focusout", resume);
  brandCarousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest("button")) return;
    trackingPointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    suppressNextClick = false;
    pause();
  });
  brandCarousel.addEventListener("pointermove", (event) => {
    if (event.pointerId !== trackingPointerId) return;
    if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 10) suppressNextClick = true;
  });
  const finishBrandGesture = (event) => {
    if (event.pointerId !== trackingPointerId) return;
    trackingPointerId = null;
    window.setTimeout(resume, 80);
  };
  brandCarousel.addEventListener("pointerup", finishBrandGesture);
  brandCarousel.addEventListener("pointercancel", (event) => {
    suppressNextClick = true;
    finishBrandGesture(event);
  });
  brandCarousel.addEventListener("click", (event) => {
    if (!suppressNextClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressNextClick = false;
  }, true);
}

document.querySelectorAll("[data-news-gallery]").forEach((gallery) => {
  const cards = Array.from(gallery.querySelectorAll(".news-photo-card"));
  const prevButton = gallery.querySelector(".news-gallery-prev");
  const nextButton = gallery.querySelector(".news-gallery-next");
  const groupSize = 5;
  let currentGroup = 0;

  const hydrateNewsCardImage = (card) => {
    const image = card.querySelector("img[data-src]");
    if (!image) return;

    image.src = image.dataset.src;
    if (image.dataset.srcset) {
      image.srcset = image.dataset.srcset;
    }
    image.removeAttribute("data-src");
    image.removeAttribute("data-srcset");
  };

  if (cards.length <= groupSize) {
    prevButton?.setAttribute("hidden", "");
    nextButton?.setAttribute("hidden", "");
    cards.forEach(hydrateNewsCardImage);
    return;
  }

  const updateNewsGallery = () => {
    const start = currentGroup * groupSize;
    const end = start + groupSize;

    cards.forEach((card, index) => {
      const isVisible = index >= start && index < end;
      card.hidden = !isVisible;
      if (isVisible) {
        hydrateNewsCardImage(card);
      }
    });

    if (prevButton) prevButton.disabled = currentGroup === 0;
    if (nextButton) nextButton.disabled = end >= cards.length;
  };

  bindCarouselControl(prevButton, () => {
    if (currentGroup === 0) return;
    currentGroup -= 1;
    updateNewsGallery();
  });

  bindCarouselControl(nextButton, () => {
    if ((currentGroup + 1) * groupSize >= cards.length) return;
    currentGroup += 1;
    updateNewsGallery();
  });

  updateNewsGallery();
});

const revealTargets = document.querySelectorAll(
  ".section-head, .about-photo, .feature-card, .brand-carousel, .product-card, .advantage-item, .contact-panel, .intro-strip"
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
