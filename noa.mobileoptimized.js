// is-music player_dots + audio player + music details logic (optimized)
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 991;

  const audio = document.getElementById("bg-music");
  const dots = document.querySelectorAll(".dot");
  const title = document.querySelector(".song-title");
  const artist = document.querySelector(".artist-name");
  const desc = document.querySelector(".song-description");
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
  if (details) details.style.display = "none";

  // --- PLAY / PAUSE SONG ---
  function playOrPauseSong(dot, forcePlay = false) {
    if (!audio) return;

    // Disable autoplay on mobile (user must tap)
    if (isMobile && audio.paused && !forcePlay && !currentDot) return;

    // Stop if clicking same dot
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

    if (newSrc && audio.src !== newSrc) {
      audio.src = newSrc;
      audio.currentTime = 0;
    }

    audio.muted = isMuted;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Only add fallback click on desktop
        if (!isMobile) {
          document.addEventListener("click", () => audio.play(), { once: true });
        }
      });
    }

    if (!forcePlay) {
      title.textContent = newTitle || "";
      artist.textContent = newArtist || "";
      desc.innerHTML = newDesc || "";
      showMusicDetails();
    }

    if (currentDot) currentDot.classList.remove("active");
    dot.classList.add("active");
    currentDot = dot;
  }

  // --- LOOP AUDIO ---
  if (audio) {
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.play();
    });
  }

  // --- TOGGLE SOUND ---
  function toggleSound() {
    if (!audio) return;
    if (audio.paused && currentDot && !isMobile) audio.play(); // don't auto-play on mobile
    isMuted = !isMuted;
    audio.muted = isMuted;
    soundOnIcons.forEach(i => (i.style.display = isMuted ? "none" : "block"));
    soundOffIcons.forEach(i => (i.style.display = isMuted ? "block" : "none"));
  }

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

    // Skip hiding hero sections on mobile (static layout)
    if (!isMobile) {
      mainSections.forEach(sec => {
        if (!sec) return;
        if (sec.classList.contains("hero_inital-text-wrap")) {
          sec.style.transition = "none";
          sec.style.opacity = "0";
          sec.style.visibility = "hidden";
        } else {
          sec.style.opacity = "0";
        }
      });
    }

    details.style.display = "block";
    details.style.opacity = "1";

    if (hideTimer) clearTimeout(hideTimer);
    if (!isMobile) hideTimer = setTimeout(() => hideMusicDetails(false), 5000);
  }

  function hideMusicDetails(instant = false) {
    if (!details) return;
    if (!isShowingDetails && instant) {
      details.style.display = "none";
      return;
    }

    isShowingDetails = false;
    details.style.opacity = "0";
    details.style.display = "none";

    if (!isMobile) restoreCurrentSection();
  }

  function restoreCurrentSection() {
    if (isMobile) return; // skip on mobile
    const active = mainSections.find(sec => sec?.style.visibility === "visible" || sec?.style.opacity === "1");
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

  // --- DOT CLICK → TOGGLE SONG ---
  dots.forEach(dot => dot.addEventListener("click", () => playOrPauseSong(dot)));

  // --- AUTO-PLAY FIRST SONG ON LOAD (DESKTOP ONLY) ---
  if (!isMobile) {
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
  }

  // --- HIDE DETAILS ON SCROLL (desktop only) ---
  if (!isMobile) {
    window.addEventListener("wheel", () => {
      if (isShowingDetails) hideMusicDetails(true);
    });
  }

  // Expose globally
  window.hideMusicDetails = hideMusicDetails;
});



// scroll + nav section logic (optimized)
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 991;

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
    if (!sections[index]) return;

    // Skip animations entirely on mobile → set only visibility
    if (isMobile) {
      sections.forEach((sec, i) => {
        sec.style.visibility = i === index ? "visible" : "hidden";
        sec.style.opacity = i === index ? "1" : "0";
      });
      return;
    }

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
        paragraph.style.transition = "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s";
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

  // --- Hide music details when shown (desktop only) ---
  if (!isMobile) {
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
  }

  // --- Scroll Logic (desktop only) ---
  if (!isMobile) {
    function handleScroll(e) {
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
    window.addEventListener("wheel", handleScroll, { passive: true });
  }

  // --- Go To Section (shared logic) ---
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
    document.querySelectorAll(".nav-menu-link").forEach(b => b.classList.remove("active"));
    if (targetIndex === 1) {
      if (whyBtn) whyBtn.classList.add("active");
      if (whyBtnMobile) whyBtnMobile.classList.add("active");
    }
    if (targetIndex === 2) {
      if (whatBtn) whatBtn.classList.add("active");
      if (whatBtnMobile) whatBtnMobile.classList.add("active");
    }
  }

  // --- Attach Events (Desktop + Mobile) ---
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


// hover tooltip logic (optimized)
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 991; // adjust breakpoint if needed
  if (isMobile) return; // 🔇 do nothing on mobile / touch devices

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



// email validation and submission logic (optimized)
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-btn");
  const emailField = document.querySelector(".email-field");
  const form = submitBtn?.closest("form");

  // Early exit if no form on page
  if (!submitBtn || !emailField || !form) return;

  const isMobile =
    window.innerWidth <= 768 ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 0);

  let stage = 0;

  // --- Helper: highlight invalid field ---
  const highlightError = () => {
    emailField.classList.add("field-error");
    setTimeout(() => emailField.classList.remove("field-error"), 1000);
  };

  // --- Click / Tap Submission Logic ---
  submitBtn.addEventListener("click", (e) => {
    const emailVal = (emailField.value || "").trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    // 🟢 Mobile (double-tap confirmation)
    if (isMobile) {
      if (stage === 0) {
        stage = 1;
        return; // first tap = visual animation handled by Webflow
      }

      if (stage === 1) {
        if (!isValidEmail) {
          e.preventDefault();
          highlightError();
          return;
        }

        stage = 2; // let Webflow handle native submit
        return;
      }
    }

    // 💻 Desktop (single-click validation)
    if (!isValidEmail) {
      e.preventDefault();
      highlightError();
      return;
    }
    // valid → Webflow handles submit
  });
});
