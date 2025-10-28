// --- IS-MUSIC PLAYER + AUDIO PLAYER + MUSIC DETAILS LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-music");
  const dots = document.querySelectorAll(".dot");
  const title = document.querySelector(".song-title");
  const artist = document.querySelector(".artist-name");
  const desc = document.querySelector(".song-description");
  const metaDesc = document.querySelector(".song-meta-description"); // ✅ new element
  const details = document.querySelector(".music-details");
  const soundOnIcons = document.querySelectorAll(".sound-on");
  const soundOffIcons = document.querySelectorAll(".sound-off");

  const mainSections = [
    document.querySelector(".hero_inital-text-wrap"),
    document.querySelector(".hero_why-wrap"),
    document.querySelector(".hero_what-wrap")
  ];

  let currentDot = null;
  let isMuted = false;
  let hideTimer = null;
  let isShowingDetails = false;

  // --- INITIAL SETUP ---
  if (audio) {
    audio.volume = 0.5;
    audio.muted = false;
  }
  soundOnIcons.forEach(i => (i.style.display = "block"));
  soundOffIcons.forEach(i => (i.style.display = "none"));
  details.style.display = "none";

  // --- PLAY / PAUSE SONG ---
  function playOrPauseSong(dot, forcePlay = false) {
    if (!forcePlay && dot === currentDot && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      dot.classList.remove("active");
      currentDot = null;
      isShowingDetails = false;
      hideMusicDetails(true);
      restoreCurrentSection();
      return;
    }

    const newSrc = dot.getAttribute("data-song");
    const newTitle = dot.getAttribute("data-title");
    const newArtist = dot.getAttribute("data-artist");
    const newDesc = dot.getAttribute("data-description");
    const newMeta = dot.getAttribute("data-metatitle");

    if (newSrc && audio.src !== newSrc) {
      audio.src = newSrc;
      audio.currentTime = 0;
    }

    audio.muted = isMuted;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        document.addEventListener("click", () => audio.play(), { once: true });
      });
    }

    if (!forcePlay) {
      title.textContent = newTitle || "";
      artist.textContent = newArtist || "";
      desc.innerHTML = newDesc || "";
      
// ✅ Update description + meta description in popup if visible
const popupDesc = document.querySelector(".song-description.is-text-popup");
const popupMeta = document.querySelector(".song-meta-description.is-text-popup");

if (popupDesc) popupDesc.innerHTML = newDesc || "";
if (popupMeta) popupMeta.innerText = newMeta || "";
      
      // ✅ Update metadata text
      const metaDescEl = document.querySelector(".song-meta-description");
if (metaDescEl) {
  metaDescEl.innerText = newMeta || "";
} else {
  console.warn("⚠️ No .song-meta-description found when updating meta text");
}

      showMusicDetails();
    }

    if (currentDot) currentDot.classList.remove("active");
    dot.classList.add("active");
    currentDot = dot;
  }

  // --- LOOP AUDIO ---
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    audio.play();
  });

  // --- TOGGLE SOUND ---
  function toggleSound() {
    if (audio.paused && currentDot) audio.play();
    isMuted = !isMuted;
    audio.muted = isMuted;
    soundOnIcons.forEach(i => (i.style.display = isMuted ? "none" : "block"));
    soundOffIcons.forEach(i => (i.style.display = isMuted ? "block" : "none"));
  }

  // --- SOUND ICONS ---
  document.querySelectorAll(".sound-on, .sound-off").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleSound();
    });
  });

  // --- SHOW MUSIC DETAILS ---
  function showMusicDetails() {
    document.dispatchEvent(new Event("musicDetailsShow"));
    isShowingDetails = true;

    mainSections.forEach(sec => {
      if (sec.classList.contains("hero_inital-text-wrap")) {
        sec.style.transition = "none";
        sec.style.opacity = "0";
        sec.style.visibility = "hidden";
      } else {
        sec.style.opacity = "0";
      }
    });

    details.style.transition = "none";
    details.style.display = "block";
    details.style.opacity = "1";

    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hideMusicDetails(false), 15000);
  }

  // --- HIDE MUSIC DETAILS ---
function hideMusicDetails(instant = false) {
  if (!isShowingDetails && instant) {
    details.style.display = "none";
    document.dispatchEvent(new Event("musicDetailsHide"));
    return;
  }

  isShowingDetails = false;
  details.style.transition = "none";
  details.style.opacity = "0";
  details.style.display = "none";

  restoreCurrentSection();

  // ✅ Always fire event when hidden (manual or timed)
  document.dispatchEvent(new Event("musicDetailsHide"));
}

  // --- RESTORE CURRENT SECTION ---
  function restoreCurrentSection() {
    const active = mainSections.find(sec => sec.style.visibility === "visible" || sec.style.opacity === "1");
    if (active) {
      active.style.opacity = "1";
      active.style.visibility = "visible";
    } else {
      const first = mainSections[0];
      if (first) {
        first.style.visibility = "visible";
        first.style.opacity = "1";
      }
    }
  }

  // --- DOT CLICK ---
  dots.forEach(dot => dot.addEventListener("click", () => playOrPauseSong(dot)));

  // --- AUTO-PLAY FIRST SONG ---
  const firstDot = dots[0];
  if (firstDot) {
    const firstSrc = firstDot.getAttribute("data-song");
    if (firstSrc) {
      audio.src = firstSrc;
      firstDot.classList.add("active");
      currentDot = firstDot;

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          document.addEventListener("click", () => audio.play(), { once: true });
        });
      }
    }
  }

  // --- HIDE DETAILS ON SCROLL ---
  window.addEventListener("wheel", () => {
    if (isShowingDetails) hideMusicDetails(true);
  });

  // Expose globally
  window.hideMusicDetails = hideMusicDetails;
});




// --- SCROLL + NAV SECTION LOGIC (DESKTOP ONLY) ---
document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    document.querySelector(".hero_inital-text-wrap"),
    document.querySelector(".hero_why-wrap"),
    document.querySelector(".hero_what-wrap")
  ];

  const musicDetails = document.querySelector(".music-details");
  const whyBtn = document.querySelector(".why-link");
  const whatBtn = document.querySelector(".what-link");
  const whyBtnMobile = document.querySelector(".why-link.is-mobile");
  const whatBtnMobile = document.querySelector(".what-link.is-mobile");

  let current = 0;
  let isScrolling = false;

  // --- Helper: Animate Section Transition ---
  function showSection(index) {
    if (musicDetails && musicDetails.style.display === "block") return;

    sections.forEach((sec, i) => {
      const heading = sec.querySelector(".hero-heading");
      const paragraph = sec.querySelector(".hero-paragraph");
      if (!heading || !paragraph) return;

      if (i === index) {
        sec.style.visibility = "visible";
        sec.style.opacity = "1";
        heading.style.opacity = "1";
        paragraph.style.opacity = "1";
        heading.style.transform = "translateY(0)";
        paragraph.style.transform = "translateY(0)";
        heading.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        paragraph.style.transition =
          "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s";
      } else {
        sec.style.opacity = "0";
        heading.style.opacity = "0";
        paragraph.style.opacity = "0";
        heading.style.transform = "translateY(30px)";
        paragraph.style.transform = "translateY(30px)";
        heading.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        paragraph.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        sec.style.visibility = "hidden";
      }
    });
  }

  // --- Initialize first section ---
  showSection(current);

  // --- Hide music details when shown ---
  window.addEventListener("musicDetailsShow", () => {
    if (current === 0) {
      const first = sections[0];
      if (first) {
        first.style.transition = "none";
        first.style.opacity = "0";
        first.style.visibility = "hidden";

        const heading = first.querySelector(".hero-heading");
        const paragraph = first.querySelector(".hero-paragraph");
        if (heading && paragraph) {
          heading.style.transition = "none";
          paragraph.style.transition = "none";
          heading.style.opacity = "0";
          paragraph.style.opacity = "0";
          heading.style.transform = "translateY(30px)";
          paragraph.style.transform = "translateY(30px)";
        }
      }
    }
  });

  // --- Desktop Scroll Logic ---
  function handleScroll(e) {
    // Only run on desktop
    if (window.matchMedia("(max-width: 991px)").matches) return;

    if (isScrolling) return;
    isScrolling = true;

    // Hide music details instantly
    if (musicDetails && musicDetails.style.display === "block") {
      musicDetails.style.display = "none";
      musicDetails.style.opacity = "0";
      if (window.hideMusicDetails) window.hideMusicDetails(true);
    }

    if (e.deltaY > 0 && current < sections.length - 1) {
      current++;
      showSection(current);
    } else if (e.deltaY < 0 && current > 0) {
      current--;
      showSection(current);
    }

    setTimeout(() => (isScrolling = false), 800);
  }

  window.addEventListener("wheel", handleScroll);

  // --- Go To Section (Nav Links) ---
  function goToSection(targetIndex) {
    if (musicDetails && musicDetails.style.display === "block") {
      musicDetails.style.display = "none";
      musicDetails.style.opacity = "0";
      if (window.hideMusicDetails) window.hideMusicDetails(true);
    }

    if (targetIndex === current) return;
    showSection(targetIndex);
    current = targetIndex;

    // Highlight active nav link
    document
      .querySelectorAll(".nav-menu-link")
      .forEach(b => b.classList.remove("active"));

    if (targetIndex === 1) {
      if (whyBtn) whyBtn.classList.add("active");
      if (whyBtnMobile) whyBtnMobile.classList.add("active");
    }

    if (targetIndex === 2) {
      if (whatBtn) whatBtn.classList.add("active");
      if (whatBtnMobile) whatBtnMobile.classList.add("active");
    }
  }

  // --- Attach Events (Desktop + Mobile Nav Links) ---
  const allWhyBtns = [whyBtn, whyBtnMobile].filter(Boolean);
  const allWhatBtns = [whatBtn, whatBtnMobile].filter(Boolean);

  allWhyBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      goToSection(1);
    });
  });

  allWhatBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      goToSection(2);
    });
  });
});



// Hover tooltip logic (desktop hover only)
document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.querySelectorAll(".music-player-wrapper");

  wrappers.forEach(wrapper => {
    const dot = wrapper.querySelector(".dot");
    const tooltip = wrapper.querySelector(".tool-tip-wrapper");

    if (dot && tooltip) {
      dot.addEventListener("mouseenter", () => {
        tooltip.style.display = "block";
      });
      dot.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
    }
  });
});


// mobile details popup logic
document.addEventListener("DOMContentLoaded", function() {
  if (window.innerWidth > 991) return; // only on mobile

  const popup = document.querySelector(".music-details-popup");
  const popupText = popup?.querySelector(".song-description.is-text-popup");
  const closeBtn = popup?.querySelector(".close-popup");
  const viewBtn = document.querySelector(".view-details-button");

  if (!popup || !popupText || !viewBtn) return;

  // When user clicks "View Details"
  viewBtn.addEventListener("click", function() {
    const activeDot = document.querySelector(".dot.active");
    if (!activeDot) return;

    // get description from active song
    const desc = activeDot.getAttribute("data-description");
    popupText.innerHTML = desc || "No description available.";

    // show popup (you can control animation in Webflow)
    popup.style.display = "block";
    requestAnimationFrame(() => popup.classList.add("active"));
  });

  // Optional close button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.classList.remove("active");
      setTimeout(() => (popup.style.display = "none"), 300);
    });
  }
});



// logo click refresh logic
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".nav-logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault(); // prevent any Webflow link behavior
      location.reload();  // refreshes the page
    });
  }
});


// swiper logic
document.addEventListener("DOMContentLoaded", () => {
  // --- Run only on mobile ---
  if (!window.matchMedia("(max-width: 991px)").matches) return;

  if (typeof Swiper === "undefined") {
    console.error("❌ Swiper not loaded");
    return;
  }

  const container = document.querySelector(".swiper.mobile-swiper");
  const musicDetails = document.querySelector(".music-details");
  const arrow = document.querySelector(".arrow"); // 👈 your arrow element

  if (!container || !musicDetails) return;

  // ✅ Init Swiper
  const heroSwiper = new Swiper(container, {
    direction: "horizontal",
    loop: false,
    allowTouchMove: true,
    spaceBetween: 24,
    speed: 500,
    resistanceRatio: 0.85,
  });

  const fadeOutSwiper = () => {
    container.style.transition = "opacity 0.05s linear";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
  };

  const fadeInSwiper = () => {
    container.style.transition = "opacity 0.05s linear";
    container.style.opacity = "1";
    container.style.pointerEvents = "auto";
  };

  // --- Listen for show/hide automatically ---
  const observer = new MutationObserver(() => {
    const isVisible = musicDetails.style.display === "block" || musicDetails.style.opacity === "1";
    if (isVisible) fadeOutSwiper();
    else fadeInSwiper();
  });

  observer.observe(musicDetails, { attributes: true, attributeFilter: ["style"] });

  document.addEventListener("musicDetailsShow", fadeOutSwiper);

  // --- Hide music details if user swipes ---
  heroSwiper.on("slideChange", () => {
    if (musicDetails.style.display === "block") {
      musicDetails.style.display = "none";
      musicDetails.style.opacity = "0";
      if (window.hideMusicDetails) window.hideMusicDetails(true);
    }

    // 👇 Hide/show the arrow based on slide index
    if (arrow) {
      if (heroSwiper.activeIndex === heroSwiper.slides.length - 1) {
        arrow.style.opacity = "0";
        arrow.style.pointerEvents = "none";
      } else {
        arrow.style.opacity = "1";
        arrow.style.pointerEvents = "auto";
      }
    }
  });

  // --- Nav buttons ---
  const whyBtnMobile = document.querySelector(".why-link.is-mobile");
  const whatBtnMobile = document.querySelector(".what-link.is-mobile");
  if (whyBtnMobile)
    whyBtnMobile.addEventListener("click", e => {
      e.preventDefault();
      heroSwiper.slideTo(1);
    });
  if (whatBtnMobile)
    whatBtnMobile.addEventListener("click", e => {
      e.preventDefault();
      heroSwiper.slideTo(2);
    });

  // 👇 Run once on load (in case it starts at the last slide)
  heroSwiper.on("init", () => {
    if (arrow) {
      if (heroSwiper.activeIndex === heroSwiper.slides.length - 1) {
        arrow.style.opacity = "0";
        arrow.style.pointerEvents = "none";
      }
    }
  });
  heroSwiper.init();

  console.log("🎉 Mobile Swiper + Music Sync (observer-based) initialized");
});


(function() {
  function updateVH() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  updateVH();
  window.addEventListener('resize', updateVH);
})();



document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form");
  const submitBtn = document.querySelector(".submit-btn");
  const successMsg = document.querySelector(".success-message");
  const errorMsg = document.querySelector(".error-message");
  const emailInput = document.querySelector(".email-field");

  const mailchimpUrl =
    "https://app.us9.list-manage.com/subscribe/post-json?u=67a78f0feb0cf3fcb69f1dcad&id=53915e63bc&f_id=005154e1f0&c=?";

  if (!form || !submitBtn || !emailInput) return;

  // Prevent Webflow’s default submission behavior
  form.addEventListener("submit", e => e.preventDefault(), true);

  const isMobile = () => window.innerWidth <= 479;
  let stage = 0;

  // --- MOBILE ANIMATION HELPERS ---
  function showEmailField() {
    emailInput.style.display = "block";
    emailInput.style.transition = "transform 0.4s ease";
    requestAnimationFrame(() => {
      emailInput.style.transform = "translateY(-79px)";
    });
  }

  function hideEmailField() {
    emailInput.style.transition = "transform 0.4s ease";
    emailInput.style.transform = "translateY(0)";
    setTimeout(() => {
      emailInput.style.display = "none";
    }, 400);
  }

  // --- SUBMIT LOGIC ---
  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (isMobile()) {
      // 1️⃣ First tap → show email field
      if (stage === 0) {
        showEmailField();
        stage = 1;
        return;
      }

      // 2️⃣ Second tap → submit
      if (stage === 1) {
        const email = emailInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailInput.style.border = "1px solid red";
          return;
        }

        // Slide field down while submitting
        hideEmailField();

        submitBtn.style.backgroundColor = "#068082";
        const url = `${mailchimpUrl}&EMAIL=${encodeURIComponent(email)}`;

        fetch(url, { method: "GET", mode: "no-cors" })
          .then(() => {
            form.style.display = "none";
            successMsg.style.display = "flex";
          })
          .catch(() => {
            errorMsg.style.display = "flex";
          })
          .finally(() => {
            stage = 0; // reset for next submission
          });

        return;
      }
    } else {
      // 💻 Desktop behavior (no animation)
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.style.border = "1px solid red";
        return;
      }

      submitBtn.style.backgroundColor = "#068082";
      const url = `${mailchimpUrl}&EMAIL=${encodeURIComponent(email)}`;

      fetch(url, { method: "GET", mode: "no-cors" })
        .then(() => {
          form.style.display = "none";
          successMsg.style.display = "flex";
        })
        .catch(() => {
          errorMsg.style.display = "flex";
        });
    }
  });
});



document.addEventListener("DOMContentLoaded", () => {
  // only desktop
  if (window.matchMedia("(max-width: 991px)").matches) return;

  const scrollWrapper = document.querySelector(".scroll-wrapper");
  const arrow = scrollWrapper?.querySelector(".arrow-desktop-main");
  const sections = [
    document.querySelector(".hero_inital-text-wrap"),
    document.querySelector(".hero_why-wrap"),
    document.querySelector(".hero_what-wrap")
  ];

  if (!arrow || !scrollWrapper || sections.some(s => !s)) return;

  arrow.style.transition = "opacity 0.1s ease-out, visibility 0.1s ease-out";

  // helper: check if a section is actually visible (based on computed style)
  function isSectionVisible(sec) {
    if (!sec) return false;
    const cs = window.getComputedStyle(sec);
    // visible if not hidden and opacity > 0.05
    return cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05;
  }

  // returns true if either initial or why is visible (where arrow should show)
  function shouldShowArrow() {
    return isSectionVisible(sections[0]) || isSectionVisible(sections[1]);
  }

  // update arrow by checking DOM state (not relying on fragile counters)
  function updateArrow() {
    const musicDetails = document.querySelector(".music-details");
    const musicShowing = musicDetails && (musicDetails.style.display === "block" || parseFloat(window.getComputedStyle(musicDetails).opacity) > 0.05);

    if (musicShowing) {
      arrow.style.opacity = "0";
      arrow.style.visibility = "hidden";
      return;
    }

    if (shouldShowArrow()) {
      arrow.style.opacity = "1";
      arrow.style.visibility = "visible";
    } else {
      arrow.style.opacity = "0";
      arrow.style.visibility = "hidden";
    }
  }

  // small debounce helper
  let debounceTimer = null;
  function scheduleUpdate(delay = 60) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateArrow, delay);
  }

  // react to wheel (desktop navigation)
  let isScrolling = false;
  window.addEventListener("wheel", (e) => {
    if (window.matchMedia("(max-width: 991px)").matches) return;
    if (isScrolling) return;
    isScrolling = true;

    // allow your existing logic to change sections; after that re-evaluate arrow
    scheduleUpdate(300); // wait a bit for your section transitions to run
    setTimeout(() => (isScrolling = false), 800);
  }, { passive: true });

  // Nav links -> trigger update after click
  document.querySelectorAll(".why-link, .why-link.is-mobile, .what-link, .what-link.is-mobile")
    .forEach(btn => btn.addEventListener("click", () => scheduleUpdate(200)));

  // React to music detail show/hide events
  document.addEventListener("musicDetailsShow", () => {
    // hide immediately
    arrow.style.opacity = "0";
    arrow.style.visibility = "hidden";
  });

  document.addEventListener("musicDetailsHide", () => {
    // wait a beat for main section restore to finish, then re-evaluate
    scheduleUpdate(250);
  });

  // MutationObserver on .music-details style changes (extra safety)
  const detailsEl = document.querySelector(".music-details");
  if (detailsEl) {
    const mo = new MutationObserver(() => {
      // small delay to let style changes apply
      scheduleUpdate(80);
    });
    mo.observe(detailsEl, { attributes: true, attributeFilter: ["style", "class"] });
  }

  // Also re-check when window resizes (breakpoint changes)
  window.addEventListener("resize", () => scheduleUpdate(120));

  // init state
  scheduleUpdate(0);
});

