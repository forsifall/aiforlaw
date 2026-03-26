const header = document.querySelector("#header");
if (!header) {
} else {
  const COLLAPSED_HEIGHT = 0;
  const SCROLL_THRESHOLD_PX = 8;
  const MIN_SCROLL_TO_HIDE_PX = 60;
  const RESIZE_DEBOUNCE_MS = 120;
  const MOTION_REDUCED = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  let expandedHeight = 0;
  let expandedPaddingTop = 0;
  let expandedPaddingBottom = 0;

  function measureExpandedPadding() {
    const cs = window.getComputedStyle(header);
    expandedPaddingTop = parseFloat(cs.paddingTop) || 0;
    expandedPaddingBottom = parseFloat(cs.paddingBottom) || 0;
  }

  function setHeaderHeight(px) {
    const n = typeof px === "number" ? px : Number(px);
    const h = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
    header.style.height = `${h}px`;
    document.documentElement.style.setProperty("--header-current-height", `${h}px`);
  }

  /**
   * Высота контента шапки при «развёрнутом» состоянии.
   * Если шапка свернута (height: 0), временно разворачиваем — иначе scrollHeight на мобилках даёт заниженное значение.
   */
  function measureExpandedHeight() {
    const wasCollapsed = header.classList.contains("main-header--collapsed");

    header.classList.remove("main-header--collapsed");
    header.style.height = "auto";
    header.style.paddingTop = "";
    header.style.paddingBottom = "";
    measureExpandedPadding();
    header.style.paddingTop = `${expandedPaddingTop}px`;
    header.style.paddingBottom = `${expandedPaddingBottom}px`;

    const h = Math.max(0, Math.round(header.scrollHeight));

    if (wasCollapsed) {
      header.classList.add("main-header--collapsed");
      header.style.paddingTop = "0px";
      header.style.paddingBottom = "0px";
      header.style.height = `${COLLAPSED_HEIGHT}px`;
    } else {
      header.style.paddingTop = `${expandedPaddingTop}px`;
      header.style.paddingBottom = `${expandedPaddingBottom}px`;
      header.style.height = `${h}px`;
    }

    return h;
  }

  function applyExpandedLayout() {
    header.classList.remove("main-header--collapsed");
    header.style.paddingTop = `${expandedPaddingTop}px`;
    header.style.paddingBottom = `${expandedPaddingBottom}px`;
    setHeaderHeight(expandedHeight);
  }

  function applyCollapsedLayout() {
    header.classList.add("main-header--collapsed");
    header.style.paddingTop = "0px";
    header.style.paddingBottom = "0px";
    setHeaderHeight(COLLAPSED_HEIGHT);
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
      applyCollapsedLayout();
    } else {
      applyExpandedLayout();
    }

    let lastY = window.scrollY || 0;
    let ticking = false;

    function show() {
      if (!hidden) return;
      hidden = false;
      applyExpandedLayout();
    }

    function hide() {
      if (hidden) return;
      if (window.scrollY < MIN_SCROLL_TO_HIDE_PX) return;
      hidden = true;
      applyCollapsedLayout();
    }

    let resizeTimer = null;
    window.addEventListener(
      "resize",
      () => {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
          expandedHeight = measureExpandedHeight();
          measureExpandedPadding();
          document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);
          if (hidden) {
            applyCollapsedLayout();
          } else {
            applyExpandedLayout();
          }
        }, RESIZE_DEBOUNCE_MS);
      },
      { passive: true },
    );

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
            applyExpandedLayout();
          }
          observer.disconnect();
        }
      });
      observer.observe(header, { childList: true, subtree: true });
    }
  }

  init();
}
