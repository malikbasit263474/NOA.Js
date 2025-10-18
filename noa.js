// is-music player_dots + audio player + music details logic
document.addEventListener("DOMContentLoaded", () => {
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
  audio.volume = 0.5;
  audio.muted = false;
  soundOnIcons.forEach(i => (i.style.display = "block"));
  soundOffIcons.forEach(i => (i.style.display = "none"));
  details.style.display = "none";

  // --- PLAY / PAUSE SONG ---
  function playOrPauseSong(dot, forcePlay = false) {
    // If clicking active dot again → stop
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
        // fallback if autoplay blocked
        document.addEventListener("click", () => audio.play(), { once: true });
      });
    }

    // Only show details after user click
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

  // Instantly hide all hero sections
  mainSections.forEach(sec => {
    // If it's the first hero section → instantly hide (no fade)
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
  hideTimer = setTimeout(() => hideMusicDetails(false), 5000);
}

  // --- HIDE MUSIC DETAILS ---
  function hideMusicDetails(instant = false) {
    if (!isShowingDetails && instant) {
      details.style.display = "none";
      return;
    }

    isShowingDetails = false;
    details.style.transition = "none";
    details.style.opacity = "0";
    details.style.display = "none";
    restoreCurrentSection();
  }

  // --- Restore current section ---
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

  // --- DOT CLICK → TOGGLE SONG ---
  dots.forEach(dot => dot.addEventListener("click", () => playOrPauseSong(dot)));

  // --- AUTO-PLAY FIRST SONG ON LOAD ---
  const firstDot = dots[0];
  if (firstDot) {
    const firstSrc = firstDot.getAttribute("data-song");
    if (firstSrc) {
      audio.src = firstSrc;
      firstDot.classList.add("active");
      currentDot = firstDot;

      // Try autoplay, fallback on click if blocked
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



// scroll + nav section logic
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

  // --- Mobile Swipe Logic ---
  let touchStartY = 0;
  let touchEndY = 0;

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchMove(e) {
    touchEndY = e.touches[0].clientY;
  }

  function handleTouchEnd() {
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50; // Minimum swipe distance to trigger section change
    if (Math.abs(swipeDistance) < minSwipeDistance || isScrolling) return;

    isScrolling = true;

    // Hide music details instantly
    if (musicDetails && musicDetails.style.display === "block") {
      musicDetails.style.display = "none";
      musicDetails.style.opacity = "0";
      if (window.hideMusicDetails) window.hideMusicDetails(true);
    }

    if (swipeDistance > 0 && current < sections.length - 1) {
      // swipe up → next section
      current++;
      showSection(current);
    } else if (swipeDistance < 0 && current > 0) {
      // swipe down → previous section
      current--;
      showSection(current);
    }

    setTimeout(() => (isScrolling = false), 800);
  }

  // Attach mobile swipe listeners
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  // --- Go To Section ---
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




// hover tooltip logic
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



// email validation and submission logic
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-btn");
  const emailField = document.querySelector(".email-field");
  const form = submitBtn?.closest("form");

  if (!submitBtn || !emailField || !form) return;

  let stage = 0;
  const isMobile = () => window.innerWidth <= 768;

  const highlightError = () => {
    emailField.style.outline = "2px solid rgba(255, 0, 0, 0.6)";
    setTimeout(() => (emailField.style.outline = ""), 1000);
  };

  submitBtn.addEventListener("click", (e) => {
    const emailVal = (emailField.value || "").trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    if (isMobile()) {
      if (stage === 0) {
        stage = 1;
        return; // first tap = show animation
      }

      if (stage === 1) {
        if (!isValidEmail) {
          e.preventDefault();
          highlightError();
          return;
        }

        // ✅ allow natural Webflow submission
        stage = 2;
        // do NOT call requestSubmit()
        // Webflow will handle submission when button triggers native submit
        return;
      }
    } else {
      if (!isValidEmail) {
        e.preventDefault();
        highlightError();
        return;
      }

      // ✅ allow Webflow to handle the real submit
      return;
    }
  });
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
