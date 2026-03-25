const header = document.querySelector("#header");
if (!header) {
} else {
  const COLLAPSED_HEIGHT = 0;
  const SCROLL_THRESHOLD_PX = 8;
  const MIN_SCROLL_TO_HIDE_PX = 60;
  const MOTION_REDUCED = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  let expandedHeight = measureExpandedHeight();
  let expandedPaddingTop = 0;
  let expandedPaddingBottom = 0;

  function measureExpandedPadding() {
    const cs = window.getComputedStyle(header);
    expandedPaddingTop = parseFloat(cs.paddingTop) || 0;
    expandedPaddingBottom = parseFloat(cs.paddingBottom) || 0;
  }

  function setHeaderHeight(px) {
    const h = Math.max(0, Math.round(px));
    header.style.height = `${h}px`;
    document.documentElement.style.setProperty("--header-current-height", `${h}px`);
  }

  function measureExpandedHeight() {
    return Math.max(0, Math.round(header.scrollHeight));
  }

  function init() {
    expandedHeight = measureExpandedHeight();
    measureExpandedPadding();
    document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);

    if (MOTION_REDUCED) {
      header.style.transition = "none";
      document.body.style.transition = "none";
    }

    let hidden = (window.scrollY || 0) >= MIN_SCROLL_TO_HIDE_PX;
    if (hidden) {
      header.classList.add("main-header--collapsed");
      header.style.paddingTop = "0px";
      header.style.paddingBottom = "0px";
      setHeaderHeight(COLLAPSED_HEIGHT);
    } else {
      header.classList.remove("main-header--collapsed");
      header.style.paddingTop = `${expandedPaddingTop}px`;
      header.style.paddingBottom = `${expandedPaddingBottom}px`;
      setHeaderHeight(expandedHeight);
    }

    let lastY = window.scrollY || 0;
    let ticking = false;

    function show() {
      if (!hidden) return;
      hidden = false;
      header.classList.remove("main-header--collapsed");
      header.style.paddingTop = `${expandedPaddingTop}px`;
      header.style.paddingBottom = `${expandedPaddingBottom}px`;
      setHeaderHeight(expandedHeight);
    }

    function hide() {
      if (hidden) return;
      if (window.scrollY < MIN_SCROLL_TO_HIDE_PX) return;
      hidden = true;
      header.classList.add("main-header--collapsed");
      header.style.paddingTop = "0px";
      header.style.paddingBottom = "0px";
      setHeaderHeight(COLLAPSED_HEIGHT);
    }

    window.addEventListener("resize", () => {
      expandedHeight = measureExpandedHeight();
      measureExpandedPadding();
      document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);
      if (!hidden) {
        header.style.paddingTop = `30px`;
        header.style.paddingBottom = `30px`;
        setHeaderHeight('max-content');
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;

        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0;
          const delta = y - lastY;

          if (y <= 5) {
            show();
          } else if (delta > SCROLL_THRESHOLD_PX) {
            hide();
          } else if (delta < -SCROLL_THRESHOLD_PX) {
            show();
          }

          lastY = y;
          ticking = false;
        });
      },
      { passive: true },
    );

    if (header.childElementCount === 0) {
      const observer = new MutationObserver(() => {
        if (header.childElementCount > 0) {
          expandedHeight = measureExpandedHeight();
          measureExpandedPadding();
          document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);
          if (!hidden) {
            header.style.paddingTop = `${expandedPaddingTop}px`;
            header.style.paddingBottom = `${expandedPaddingBottom}px`;
            setHeaderHeight(expandedHeight);
          }
          observer.disconnect();
        }
      });
      observer.observe(header, { childList: true, subtree: true });
    }
  }

  init();
}

