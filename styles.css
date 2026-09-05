document.addEventListener("DOMContentLoaded", function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Set --nav-h so sticky elements (e.g. the Events tab bar) sit
     right below the real nav height instead of a hardcoded guess ---------- */
  var siteNav = document.querySelector(".site-nav");
  if (siteNav) {
    document.documentElement.style.setProperty("--nav-h", siteNav.offsetHeight + "px");
    window.addEventListener("resize", function () {
      document.documentElement.style.setProperty("--nav-h", siteNav.offsetHeight + "px");
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll-reveal: fade/slide elements in as they enter view ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    // Stagger items that share a data-reveal-group container
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = group.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
      items.forEach(function (item, i) {
        item.style.transitionDelay = (i * 90) + "ms";
      });
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Scroll-linked progress fills (History timeline, Dates stepper) ---------- */
  var progressTargets = [];

  var timelineEl = document.querySelector(".timeline");
  if (timelineEl) progressTargets.push({ type: "css-var", el: timelineEl });

  var stepperBar = document.querySelector(".section-progress span");
  var stepperTrack = document.querySelector("#dates-stepper");
  if (stepperBar && stepperTrack) progressTargets.push({ type: "bar", el: stepperTrack, bar: stepperBar });

  function progressFor(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = rect.height + vh * 0.5;
    var scrolled = vh - rect.top;
    var p = scrolled / total;
    return Math.max(0, Math.min(1, p));
  }

  var ticking = false;
  function updateProgress() {
    progressTargets.forEach(function (t) {
      var p = progressFor(t.el);
      if (t.type === "css-var") {
        t.el.style.setProperty("--progress", reduceMotion ? 1 : p);
      } else if (t.type === "bar") {
        t.bar.style.width = (reduceMotion ? 100 : p * 100) + "%";
      }
    });
    ticking = false;
  }

  if (progressTargets.length) {
    updateProgress();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ---------- Events page: scroll-driven year sections ---------- */
  var yearTabsWrap = document.querySelector(".year-tabs-wrap");
  var yearTabs = document.querySelectorAll(".year-tab");
  var yearBlocks = document.querySelectorAll(".year-block");
  var indicator = document.querySelector(".year-tab-indicator");
  var indicatorColors = { "2023-24": "#7C8B85", "2024-25": "#2F8F4E", "2025-26": "#0B2545", "2026-27": "#C97A21" };

  if (yearTabsWrap && yearTabs.length && yearBlocks.length && indicator) {
    var tabsContainer = document.querySelector(".year-tabs");

    function moveIndicator(tab, animate) {
      var cRect = tabsContainer.getBoundingClientRect();
      var tRect = tab.getBoundingClientRect();
      if (!animate) indicator.style.transition = "none";
      indicator.style.left = (tRect.left - cRect.left) + "px";
      indicator.style.width = tRect.width + "px";
      var year = tab.getAttribute("data-year");
      indicator.style.background = indicatorColors[year] || "var(--green)";
      if (!animate) {
        // force reflow, then restore transition
        indicator.offsetHeight;
        indicator.style.transition = "";
      }
    }

    function setActiveTab(year) {
      yearTabs.forEach(function (t) {
        var isActive = t.getAttribute("data-year") === year;
        t.classList.toggle("active", isActive);
        if (isActive) {
          t.setAttribute("aria-current", "true");
        } else {
          t.removeAttribute("aria-current");
        }
      });
      var activeTab = document.querySelector('.year-tab[data-year="' + year + '"]');
      if (activeTab) moveIndicator(activeTab, true);
    }

    yearTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var year = tab.getAttribute("data-year");
        var block = document.querySelector('.year-block[data-year="' + year + '"]');
        if (block) {
          block.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
      });
    });

    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActiveTab(entry.target.getAttribute("data-year"));
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      yearBlocks.forEach(function (block) { spy.observe(block); });
    }

    // Initial indicator placement (no transition on first paint)
    window.requestAnimationFrame(function () {
      moveIndicator(yearTabs[0], false);
    });
    window.addEventListener("resize", function () {
      var current = document.querySelector(".year-tab.active") || yearTabs[0];
      moveIndicator(current, false);
    });
  }
});
