const root = document.documentElement;

/* ELEMENTS */
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");

const nav = document.querySelector(".nav");
const navLinksContainer = document.querySelector(".nav-links");
const navLinks = document.querySelectorAll(".nav-links a");

const sections = [...document.querySelectorAll("section")];
const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const progressBars = document.querySelectorAll(".level-fill");

/* =========================
   THEME SYSTEM
========================= */
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

themeToggle?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";

  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (!themeToggle) return;

  themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
}

/* =========================
   MOBILE MENU CONTROL (FIXED)
========================= */

function openMenu() {
  navLinksContainer?.classList.add("active");
  menuToggle?.classList.add("open");
}

function closeMenu() {
  navLinksContainer?.classList.remove("active");
  menuToggle?.classList.remove("open");
}

function toggleMenu() {
  navLinksContainer?.classList.toggle("active");
  menuToggle?.classList.toggle("open");
}

/* hamburger click */
menuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

/* link click → close menu + scroll */
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

/* outside click → close menu */
document.addEventListener("click", (e) => {
  const isClickInsideNav =
    navLinksContainer?.contains(e.target) ||
    menuToggle?.contains(e.target);

  if (!isClickInsideNav) {
    closeMenu();
  }
});

/* ESC key → close menu */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* =========================
   SECTION NAVIGATION
========================= */
function getNearestSectionIndex() {
  const midpoint = window.scrollY + window.innerHeight / 2;

  let nearest = 0;
  let distance = Infinity;

  sections.forEach((section, index) => {
    const sectionMid = section.offsetTop + section.offsetHeight / 2;
    const diff = Math.abs(midpoint - sectionMid);

    if (diff < distance) {
      distance = diff;
      nearest = index;
    }
  });

  return nearest;
}

function goToSection(index) {
  if (index < 0 || index >= sections.length) return;

  sections[index].scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* =========================
   WHEEL SNAP (DESKTOP)
========================= */
window.addEventListener(
  "wheel",
  (e) => {
    if (window.innerWidth < 900) return;

    if (Math.abs(e.deltaY) < 30) return;

    e.preventDefault();

    const currentIndex = getNearestSectionIndex();

    if (e.deltaY > 0) {
      goToSection(Math.min(currentIndex + 1, sections.length - 1));
    } else {
      goToSection(Math.max(currentIndex - 1, 0));
    }
  },
  { passive: false }
);

/* =========================
   KEYBOARD NAVIGATION
========================= */
window.addEventListener("keydown", (e) => {
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (["ArrowDown", "PageDown"].includes(e.code)) {
    e.preventDefault();
    goToSection(Math.min(getNearestSectionIndex() + 1, sections.length - 1));
  }

  if (["ArrowUp", "PageUp"].includes(e.code)) {
    e.preventDefault();
    goToSection(Math.max(getNearestSectionIndex() - 1, 0));
  }
});

/* =========================
   SMOOTH SCROLL LINKS
========================= */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

/* =========================
   SCROLL SPY
========================= */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;

      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${id}`
        );
      });
    });
  },
  { threshold: 0.6 }
);

sections.forEach((section) => sectionObserver.observe(section));

/* =========================
   REVEAL ANIMATION
========================= */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("show");
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);

reveals.forEach((el) => revealObserver.observe(el));

/* =========================
   COUNTERS
========================= */
const counterObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.count || 0);

      const duration = 1300;
      const start = performance.now();

      function animate(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        el.textContent = Math.floor(eased * target);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (target === 99) el.textContent = "99.9";
        }
      }

      requestAnimationFrame(animate);
      obs.unobserve(el);
    });
  },
  { threshold: 0.65 }
);

counters.forEach((counter) => counterObserver.observe(counter));

/* =========================
   PROGRESS BARS
========================= */
const barObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const bar = entry.target;
      const targetWidth = bar.style.width;

      bar.style.width = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = targetWidth;
        });
      });

      obs.unobserve(bar);
    });
  },
  { threshold: 0.4 }
);

progressBars.forEach((bar) => barObserver.observe(bar));

/* =========================
   NAV SCROLL EFFECT
========================= */
window.addEventListener("scroll", () => {
  if (window.scrollY > 30) {
    nav?.classList.add("scrolled");
  } else {
    nav?.classList.remove("scrolled");
  }
});

/* =========================
   LOAD
========================= */
window.addEventListener("load", () => {
  document.querySelector(".portrait")?.classList.add("show");
});