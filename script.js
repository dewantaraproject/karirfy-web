/* ==========================================================================
   KARIRFY WEB — Hero Parallax, Floating Nav, Filter Grid & FAQ Accordion
   ========================================================================== */

(function () {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Scroll Parallax on Hero + Floating Liquid Glass Navbar
  const heroBg = document.getElementById("heroBg");
  const heroText = document.getElementById("heroText");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const floatingNav = document.getElementById("floatingNav");
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = ["showcase", "creed", "jalur", "faq"];

  function onScroll() {
    const y = window.scrollY;
    const vh = Math.max(1, window.innerHeight);
    const ratio = Math.min(1, y / vh);

    if (!prefersReducedMotion) {
      if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${ratio * 16}%, 0) scale(${1 + ratio * 0.06})`;
      }
      if (heroText) {
        heroText.style.transform = `translate3d(0, ${ratio * 24}%, 0)`;
        heroText.style.opacity = String(Math.max(0, 1 - ratio * 1.15));
      }
    }

    const docH = Math.max(1, document.documentElement.scrollHeight - vh);
    if (progressFill) progressFill.style.width = `${Math.min(100, (y / docH) * 100)}%`;

    const pastHero = y > vh * 0.62;
    if (progressBar) progressBar.classList.toggle("is-visible", pastHero);
    if (floatingNav) floatingNav.classList.toggle("is-visible", pastHero);

    const probe = y + 220;
    let active = "";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && probe >= el.offsetTop && probe < el.offsetTop + el.offsetHeight) {
        active = id;
        break;
      }
    }
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("data-nav") === active));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 2. Scroll Reveal Observer
  const reveals = document.querySelectorAll(".reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // 3. Module & Track Filter
  const filterBar = document.getElementById("galleryFilters");
  const museumItems = Array.from(document.querySelectorAll("#museumGrid .museum-item"));
  if (filterBar) {
    filterBar.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-filter]");
      if (!btn) return;
      const cat = btn.getAttribute("data-filter");
      filterBar.querySelectorAll("button").forEach((button) => {
        const active = button === btn;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      museumItems.forEach((item) => {
        item.classList.toggle("is-hidden", cat !== "all" && item.getAttribute("data-cat") !== cat);
      });
    });
  }

  // 4. FAQ Accordion
  const faqList = document.getElementById("faqList");
  if (faqList) {
    faqList.addEventListener("click", (event) => {
      const btn = event.target.closest(".faq-q");
      if (!btn) return;
      const open = btn.getAttribute("aria-expanded") === "false";
      faqList.querySelectorAll(".faq-q").forEach((question) => {
        const expanded = open && question === btn;
        question.setAttribute("aria-expanded", String(expanded));
        question.closest(".faq-item").classList.toggle("is-open", expanded);
        const target = document.getElementById(question.getAttribute("aria-controls"));
        if (target) target.inert = !expanded;
      });
    });
  }
})();
