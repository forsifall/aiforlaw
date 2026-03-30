const header = document.querySelector("#header");
if (!header) {
} else {
  const COLLAPSED_HEIGHT = 0;
  const SCROLL_THRESHOLD_PX = 8;
  const MIN_SCROLL_TO_HIDE_PX = 60;
  const RESIZE_DEBOUNCE_MS = 120;
  const MOTION_REDUCED = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  let expandedHeight = 0;

  function isMobileHeader() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function clearInlinePadding() {
    header.style.paddingTop = "";
    header.style.paddingBottom = "";
  }

  function syncHeroFold(headerHeightPx) {
    const hero = document.querySelector("#hero-section");
    if (!hero) {
      document.documentElement.style.removeProperty("--hero-fold-min-height");
      return;
    }
    const vv = window.visualViewport;
    const viewportH = Math.round(vv ? vv.height : window.innerHeight);
    const headerH =
      typeof headerHeightPx === "number"
        ? Math.max(0, Math.round(headerHeightPx))
        : Math.max(0, Math.round(header.getBoundingClientRect().height));

    let foldPx = null;
    if (window.matchMedia("(max-width: 1199.98px)").matches) {
      foldPx = Math.max(0, viewportH - headerH);
    } else if (window.matchMedia("(min-width: 1200px)").matches) {
      foldPx = Math.max(0, viewportH - headerH);
    }

    if (foldPx === null) {
      document.documentElement.style.removeProperty("--hero-fold-min-height");
    } else {
      /* 0px ломает min-height в CSS (валидное значение, без fallback) — не записываем */
      if (foldPx > 0) {
        document.documentElement.style.setProperty("--hero-fold-min-height", `${foldPx}px`);
      } else {
        document.documentElement.style.removeProperty("--hero-fold-min-height");
      }
    }
  }

  function syncBodyPaddingFromHeader() {
    const h = Math.max(0, Math.round(header.getBoundingClientRect().height));
    document.documentElement.style.setProperty("--header-current-height", `${h}px`);
    syncHeroFold(h);
  }

  function setHeaderHeight(px) {
    const n = typeof px === "number" ? px : Number(px);
    const h = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
    header.style.height = `${h}px`;
    syncBodyPaddingFromHeader();
  }

  function measureExpandedHeight() {
    const wasCollapsed = header.classList.contains("main-header--collapsed");

    header.classList.remove("main-header--collapsed");
    clearInlinePadding();
    header.style.height = "auto";
    if (isMobileHeader()) {
      header.style.removeProperty("height");
    }

    const h = Math.max(0, Math.round(header.offsetHeight));

    if (wasCollapsed) {
      applyCollapsedLayout();
    } else {
      if (isMobileHeader()) {
        header.style.removeProperty("height");
      } else {
        header.style.height = `${h}px`;
      }
      syncBodyPaddingFromHeader();
    }

    return h;
  }

  function applyExpandedLayout() {
    header.classList.remove("main-header--collapsed");
    clearInlinePadding();
    if (isMobileHeader()) {
      header.style.removeProperty("height");
      requestAnimationFrame(() => {
        expandedHeight = header.offsetHeight;
        document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);
        syncBodyPaddingFromHeader();
      });
    } else {
      header.style.height = `${expandedHeight}px`;
      syncBodyPaddingFromHeader();
    }
  }

  function applyCollapsedLayout() {
    header.classList.add("main-header--collapsed");
    header.style.paddingTop = "0px";
    header.style.paddingBottom = "0px";
    setHeaderHeight(COLLAPSED_HEIGHT);
  }

  function init() {
    expandedHeight = measureExpandedHeight();
    document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);

    if (MOTION_REDUCED) {
      header.style.transition = "none";
      document.body.style.transition = "none";
    }

    let hidden = (window.scrollY || 0) >= MIN_SCROLL_TO_HIDE_PX;
    if (hidden) {
      applyCollapsedLayout();
    }

    let lastY = window.scrollY || 0;
    let ticking = false;

    function show() {
      if (!hidden) return;
      hidden = false;
      applyExpandedLayout();
      requestAnimationFrame(() => {
        if ((window.scrollY || 0) <= 8) {
          window.scrollTo(0, 0);
        }
        syncBodyPaddingFromHeader();
      });
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

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", syncBodyPaddingFromHeader, { passive: true });
      vv.addEventListener("scroll", syncBodyPaddingFromHeader, { passive: true });
    }

    let headerRoTick = false;
    const headerResizeObserver = new ResizeObserver(() => {
      if (headerRoTick) return;
      headerRoTick = true;
      requestAnimationFrame(() => {
        headerRoTick = false;
        syncBodyPaddingFromHeader();
      });
    });
    headerResizeObserver.observe(header);

    header.addEventListener(
      "transitionend",
      (e) => {
        if (e.target !== header) return;
        if (
          e.propertyName === "height" ||
          e.propertyName === "padding-top" ||
          e.propertyName === "padding-bottom"
        ) {
          syncBodyPaddingFromHeader();
        }
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
          document.documentElement.style.setProperty("--header-expanded-height", `${expandedHeight}px`);
          if (!hidden) {
            applyExpandedLayout();
          }
          observer.disconnect();
        }
      });
      observer.observe(header, { childList: true, subtree: true });
    }

    requestAnimationFrame(() => {
      syncBodyPaddingFromHeader();
    });
  }

  init();
}
