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

  /* ---------- History page: chapter staircase timeline ---------- */
  var chapterYears = document.querySelectorAll(".chapter-year");
  var yearBlocks = document.querySelectorAll(".year-block");

  if (chapterYears.length && yearBlocks.length) {
    function setActiveYear(year) {
      chapterYears.forEach(function (btn) {
        var isActive = btn.getAttribute("data-year") === year;
        btn.classList.toggle("active", isActive);
        if (isActive) { btn.setAttribute("aria-current", "true"); }
        else { btn.removeAttribute("aria-current"); }
      });
    }

    chapterYears.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var year = btn.getAttribute("data-year");
        var block = document.querySelector('.year-block[data-year="' + year + '"]');
        if (block) {
          block.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
      });
    });

    if ("IntersectionObserver" in window) {
      var chapterSpy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActiveYear(entry.target.getAttribute("data-year"));
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      yearBlocks.forEach(function (block) { chapterSpy.observe(block); });
    }
  }
});

/* ==========================================================================
   Green Level TSA — feature additions (dark mode, stats, event explorer,
   quiz, officer flip cards, FAQ accordion, countdown)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Nav shrink-on-scroll ---------- */
  var siteNavEl = document.querySelector(".site-nav");
  if (siteNavEl) {
    var onNavScroll = function () {
      siteNavEl.classList.toggle("scrolled", window.scrollY > 12);
    };
    onNavScroll();
    window.addEventListener("scroll", onNavScroll, { passive: true });
  }

  /* ---------- Animated statistic counters ---------- */
  var statEls = document.querySelectorAll(".stat-number[data-target]");
  var reduceMotionStats = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (statEls.length) {
    var animateStat = function (el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotionStats) {
        el.textContent = target + suffix;
        return;
      }
      var start = null;
      var duration = 1400;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      statEls.forEach(function (el) { statObserver.observe(el); });
    } else {
      statEls.forEach(animateStat);
    }
  }

  /* ---------- Event explorer data ---------- */
  var TSA_EVENTS = [
    { name: "Engineering Design", cat: "engineering", team: "team", format: "build", beginner: false, desc: "Design and build a physical solution to an engineering problem, then present the finished product and documentation to judges." },
    { name: "Structural Design & Engineering", cat: "engineering", team: "team", format: "build", beginner: false, desc: "Plan and construct a scale structure built to hold as much weight as possible within strict material and size limits." },
    { name: "Dragster", cat: "engineering", team: "individual", format: "build", beginner: true, desc: "Design, build, and race a small CO2-powered dragster, balancing speed, craftsmanship, and documentation." },
    { name: "Flight Endurance", cat: "engineering", team: "individual", format: "build", beginner: true, desc: "Build a rubber-band powered model aircraft engineered to stay airborne as long as possible." },
    { name: "Transportation Modeling", cat: "engineering", team: "team", format: "build", beginner: false, desc: "Design and model a future transportation concept that responds to the year's theme and real-world constraints." },
    { name: "Off the Grid", cat: "engineering", team: "team", format: "build", beginner: false, desc: "Design a small-scale system that generates or manages energy independent of the traditional power grid." },
    { name: "Computer Aided Design (CAD) Foundations", cat: "engineering", team: "individual", format: "build", beginner: true, desc: "Use CAD software to model a part or assembly to spec, testing precision and technical drawing skills." },
    { name: "Coding", cat: "coding", team: "individual", format: "coding", beginner: true, desc: "Take a written test on programming concepts, then solve an onsite coding challenge to show real programming ability." },
    { name: "Software Development", cat: "coding", team: "team", format: "coding", beginner: false, desc: "Design and build an original piece of software that solves a real problem, complete with documentation and a live demo." },
    { name: "Video Game Design", cat: "coding", team: "team", format: "coding", beginner: false, desc: "Create an original playable video game, judged on gameplay, design choices, and technical execution." },
    { name: "Webmaster", cat: "coding", team: "team", format: "coding", beginner: false, desc: "Design, build, and maintain a website addressing the annual theme, judged on design, usability, and code quality." },
    { name: "Technology Bowl", cat: "coding", team: "team", format: "test", beginner: true, desc: "A fast-paced knowledge competition testing technology and engineering concepts, head-to-head with other chapters." },
    { name: "Digital Photography", cat: "media", team: "individual", format: "presentation", beginner: true, desc: "Submit an original photo portfolio tied to the annual theme, then complete an onsite photo challenge." },
    { name: "On Demand Video", cat: "media", team: "team", format: "build", beginner: false, desc: "Write, shoot, and edit a short video responding to a prompt revealed on the day of competition." },
    { name: "Music Production", cat: "media", team: "individual", format: "build", beginner: false, desc: "Compose and produce an original piece of music, documenting the creative and technical process behind it." },
    { name: "Community Service Video", cat: "media", team: "team", format: "build", beginner: true, desc: "Produce a short video highlighting a real community service project your chapter has taken on." },
    { name: "Children's Stories", cat: "media", team: "individual", format: "build", beginner: true, desc: "Write and illustrate an original children's book connected to the year's theme, aimed at a young audience." },
    { name: "Extemporaneous Speech", cat: "leadership", team: "individual", format: "presentation", beginner: true, desc: "Draw a topic on the spot and deliver a short, organized speech with minimal preparation time." },
    { name: "Debating Technological Issues", cat: "leadership", team: "team", format: "presentation", beginner: false, desc: "Research a tech-related issue and argue either side in a structured debate format against another team." },
    { name: "Career Prep", cat: "leadership", team: "individual", format: "presentation", beginner: true, desc: "Practice real job-search skills — resume, cover letter, and interview — judged like an actual hiring process." },
    { name: "Chapter Team", cat: "leadership", team: "team", format: "test", beginner: false, desc: "A team event testing knowledge of parliamentary procedure and delivering a presentation on the chapter." },
    { name: "Biotechnology", cat: "science", team: "team", format: "presentation", beginner: false, desc: "Research a current biotechnology issue tied to the annual theme and present findings through an original display." },
    { name: "Forensic Science", cat: "science", team: "individual", format: "test", beginner: true, desc: "Apply forensic science concepts to analyze a simulated case, then present conclusions to judges." }
  ];

  var TEAM_LABELS = { individual: "Individual", team: "Team Event" };
  var FORMAT_LABELS = { presentation: "Presentation", build: "Build / Design", test: "Test", coding: "Coding" };

  var CAT_LABELS = {
    engineering: "Engineering",
    coding: "Coding & Tech",
    media: "Design & Media",
    leadership: "Leadership & Speech",
    science: "Science"
  };

  /* Category icons — plain line-art SVGs, no emoji */
  var CAT_ICONS = {
    engineering: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a3 3 0 0 1 3 3l3.3 3.3-2.1 2.1-3.3-3.3a3 3 0 0 1-3-3l-4.2 4.2a2 2 0 1 0 2.8 2.8L15.4 10" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 19.5l3-3" stroke-linecap="round"/></svg>',
    coding: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 8l-4.5 4L9 16M15 8l4.5 4-4.5 4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l4.5-4.5 3 3L16 10l4 4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    leadership: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10l8-4.5v13L4 14z" stroke-linejoin="round"/><path d="M12 5.5l8-1.5v13l-8-2" stroke-linejoin="round"/><path d="M7 14v3a2 2 0 0 0 2 2h0" stroke-linecap="round"/></svg>',
    science: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 3h4M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 15h8" stroke-linecap="round"/></svg>'
  };
  function catIconHTML(cat) { return CAT_ICONS[cat] || CAT_ICONS.engineering; }

  var eventGrid = document.getElementById("event-grid");
  var eventSearch = document.getElementById("event-search");
  var eventFilters = document.getElementById("event-filters");
  var eventTypeFilters = document.getElementById("event-type-filters");
  var eventModal = document.getElementById("event-modal");

  if (eventGrid) {
    var activeFilter = "all";
    var activeTypes = [];
    var activeQuery = "";

    function eventMatchesType(ev, type) {
      if (type === "individual") return ev.team === "individual";
      if (type === "team") return ev.team === "team";
      if (type === "beginner") return ev.beginner === true;
      return ev.format === type; // presentation, build, test, coding
    }

    function renderEvents() {
      var q = activeQuery.trim().toLowerCase();
      var filtered = TSA_EVENTS.filter(function (ev) {
        var matchesCat = activeFilter === "all" || ev.cat === activeFilter;
        var matchesQuery = !q || ev.name.toLowerCase().indexOf(q) !== -1;
        var matchesTypes = activeTypes.every(function (t) { return eventMatchesType(ev, t); });
        return matchesCat && matchesQuery && matchesTypes;
      });

      eventGrid.innerHTML = "";
      if (!filtered.length) {
        var none = document.createElement("p");
        none.className = "no-results";
        none.textContent = "No events match that search. Try a different word or fewer filters.";
        eventGrid.appendChild(none);
        return;
      }

      filtered.forEach(function (ev, i) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "event-card reveal-scale";
        card.style.transitionDelay = (Math.min(i, 8) * 60) + "ms";
        card.setAttribute("data-name", ev.name);
        card.innerHTML =
          '<span class="event-icon" aria-hidden="true">' + catIconHTML(ev.cat) + '</span>' +
          '<h3>' + ev.name + '</h3>' +
          '<div class="event-badges">' +
            '<span class="tag tag-green">' + CAT_LABELS[ev.cat] + '</span>' +
            '<span class="badge">' + TEAM_LABELS[ev.team] + '</span>' +
            '<span class="badge">' + FORMAT_LABELS[ev.format] + '</span>' +
            (ev.beginner ? '<span class="badge badge-beginner">Beginner Friendly</span>' : '') +
          '</div>' +
          '<p>' + ev.desc + '</p>' +
          '<span class="event-learn-more">Learn more <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
        card.addEventListener("click", function () { openEventModal(ev); });
        eventGrid.appendChild(card);

        if ("IntersectionObserver" in window && !reduceMotionStats) {
          var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
              }
            });
          }, { threshold: 0.1 });
          obs.observe(card);
        } else {
          card.classList.add("is-visible");
        }
      });
    }

    if (eventFilters) {
      eventFilters.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          eventFilters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
          chip.classList.add("active");
          activeFilter = chip.getAttribute("data-filter");
          renderEvents();
        });
      });
    }

    if (eventTypeFilters) {
      eventTypeFilters.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var type = chip.getAttribute("data-type");
          var idx = activeTypes.indexOf(type);
          if (idx > -1) {
            activeTypes.splice(idx, 1);
            chip.classList.remove("active");
          } else {
            activeTypes.push(type);
            chip.classList.add("active");
          }
          renderEvents();
        });
      });
    }

    if (eventSearch) {
      eventSearch.addEventListener("input", function () {
        activeQuery = eventSearch.value;
        renderEvents();
      });
    }

    renderEvents();
  }

  function openEventModal(ev) {
    if (!eventModal) return;
    eventModal.querySelector(".modal-icon").innerHTML = catIconHTML(ev.cat);
    eventModal.querySelector(".modal-title").textContent = ev.name;
    eventModal.querySelector(".modal-cat").textContent = CAT_LABELS[ev.cat];
    eventModal.querySelector(".modal-desc").textContent = ev.desc;
    var extraMeta = eventModal.querySelector(".modal-meta-extra");
    if (extraMeta) {
      extraMeta.innerHTML =
        '<span class="badge">' + TEAM_LABELS[ev.team] + '</span>' +
        '<span class="badge">' + FORMAT_LABELS[ev.format] + '</span>' +
        (ev.beginner ? '<span class="badge badge-beginner">Beginner Friendly</span>' : '');
    }
    openModal(eventModal);
  }

  /* ---------- Generic modal open/close ---------- */
  function openModal(modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".modal-overlay").forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal(modal);
    });
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.addEventListener("click", function () { closeModal(modal); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach(closeModal);
    }
  });

  /* ---------- "Find your event" quiz ---------- */
  var quizModal = document.getElementById("quiz-modal");
  var quizTriggers = document.querySelectorAll(".quiz-trigger");
  if (quizModal && quizTriggers.length) {
    var quizSteps = quizModal.querySelectorAll(".quiz-step");
    var quizProgress = quizModal.querySelectorAll(".quiz-progress span");
    var quizAnswers = {};

    function showQuizStep(index) {
      quizSteps.forEach(function (s, i) { s.classList.toggle("active", i === index); });
      quizProgress.forEach(function (p, i) { p.classList.toggle("done", i < index); });
    }

    function resetQuiz() {
      quizAnswers = {};
      showQuizStep(0);
    }

    quizModal.querySelectorAll("[data-quiz-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = btn.closest(".quiz-step");
        var field = step.getAttribute("data-field");
        quizAnswers[field] = btn.getAttribute("data-quiz-option");
        var nextIndex = Array.prototype.indexOf.call(quizSteps, step) + 1;

        if (field === "interest") {
          showQuizStep(nextIndex);
        } else {
          // final answer collected -> compute results
          var interestCat = quizAnswers.interest;
          var matches = TSA_EVENTS.filter(function (ev) { return ev.cat === interestCat; }).slice(0, 3);
          var resultsStep = quizModal.querySelector('.quiz-step[data-field="results"]');
          var list = resultsStep.querySelector(".quiz-result-list");
          list.innerHTML = "";
          matches.forEach(function (ev, i) {
            var li = document.createElement("li");
            li.innerHTML = '<span class="quiz-result-rank">#' + (i + 1) + '</span><span class="event-icon" aria-hidden="true">' + catIconHTML(ev.cat) + '</span><span>' + ev.name + '</span>';
            list.appendChild(li);
          });
          showQuizStep(Array.prototype.indexOf.call(quizSteps, resultsStep));
        }
      });
    });

    quizModal.querySelectorAll(".quiz-restart").forEach(function (btn) {
      btn.addEventListener("click", resetQuiz);
    });

    quizTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        resetQuiz();
        openModal(quizModal);
      });
    });
  }

  /* ---------- Officer cards: expand on click ---------- */
  document.querySelectorAll(".officer-card").forEach(function (card) {
    var details = card.querySelector(".officer-card-details");
    if (!details) return;
    function toggleCard() {
      var isOpen = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", isOpen ? "false" : "true");
      details.style.maxHeight = isOpen ? null : (details.scrollHeight + "px");
    }
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return; // let mailto links work without toggling
      toggleCard();
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCard();
      }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = !isOpen ? (answer.scrollHeight + "px") : null;
    });
  });

  /* ---------- Countdown timer(s) — supports multiple per page, pulses on change ---------- */
  document.querySelectorAll("[data-countdown-to]").forEach(function (countdownEl) {
    var targetDate = new Date(countdownEl.getAttribute("data-countdown-to"));
    var dEl = countdownEl.querySelector(".cd-days");
    var hEl = countdownEl.querySelector(".cd-hours");
    var mEl = countdownEl.querySelector(".cd-mins");
    var sEl = countdownEl.querySelector(".cd-secs");
    var lastValues = {};

    function setUnit(el, key, value) {
      if (!el) return;
      var str = String(value);
      if (lastValues[key] !== undefined && lastValues[key] !== str) {
        el.classList.remove("pulse");
        void el.offsetWidth; // restart animation
        el.classList.add("pulse");
      }
      lastValues[key] = str;
      el.textContent = str;
    }

    function tick() {
      var diff = targetDate - new Date();
      if (diff <= 0) {
        countdownEl.querySelector(".countdown-units").innerHTML = '<span class="countdown-unit"><strong>Now</strong><span>Happening</span></span>';
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      setUnit(dEl, "d", days);
      setUnit(hEl, "h", String(hours).padStart(2, "0"));
      setUnit(mEl, "m", String(mins).padStart(2, "0"));
      setUnit(sEl, "s", String(secs).padStart(2, "0"));
    }
    tick();
    window.setInterval(tick, 1000);
  });

  /* ---------- "Latest from the chapter" — array-driven, edit this list to update ---------- */
  var latestGrid = document.getElementById("latest-grid");
  if (latestGrid) {
    var LATEST_UPDATES = [
      {
        type: "Competition",
        tagClass: "tag-coral",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0zM6 5H3v1a4 4 0 0 0 3 3.9M18 5h3v1a4 4 0 0 1-3 3.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        title: "Latest competition",
        text: "Add a recap of your most recent competition here — who competed, what event, and how it went."
      },
      {
        type: "Projects",
        tagClass: "tag-navy",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a3 3 0 0 1 3 3l3.3 3.3-2.1 2.1-3.3-3.3a3 3 0 0 1-3-3l-4.2 4.2a2 2 0 1 0 2.8 2.8L15.4 10" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 19.5l3-3" stroke-linecap="round"/></svg>',
        title: "What members are building",
        text: "Add what members are currently working on for this year's events."
      },
      {
        type: "Announcement",
        tagClass: "tag-green",
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10l8-4.5v13L4 14z" stroke-linejoin="round"/><path d="M12 5.5l8-1.5v13l-8-2" stroke-linejoin="round"/><path d="M7 14v3a2 2 0 0 0 2 2h0" stroke-linecap="round"/></svg>',
        title: "Chapter announcement",
        text: "Add your latest chapter announcement here — applications, deadlines, or events."
      }
    ];

    LATEST_UPDATES.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "latest-card";
      card.innerHTML =
        '<span class="tag ' + item.tagClass + '">' + item.type + '</span>' +
        '<span class="event-icon" aria-hidden="true" style="margin-bottom:12px;">' + item.icon + '</span>' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.text + '</p>';
      latestGrid.appendChild(card);
    });
  }

  /* ---------- Gallery lightbox (activates once real <img> tags replace placeholders) ---------- */
  var lightbox = document.getElementById("gallery-lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    document.querySelectorAll(".masonry-item").forEach(function (item) {
      var img = item.querySelector("img");
      if (!img) return;
      item.style.cursor = "pointer";
      item.addEventListener("click", function () {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "";
        openModal(lightbox);
      });
    });
  }
});
