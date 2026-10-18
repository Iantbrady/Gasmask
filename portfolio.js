/* Gasmask / Ian Brady — portfolio interactions */
(() => {
  "use strict";

  const root = document.documentElement;
  const siteHeader = document.querySelector("#site-header");
  /* ---------------------------------------------------------
     GASMASK / IAN BRADY heading
       - mouse: flips to IAN BRADY while hovered (CSS)
       - click / tap: locks it on IAN BRADY (stays after the pointer leaves);
         click / tap again flips it back to GASMASK straight away.
     Works the same on desktop and phones.
  --------------------------------------------------------- */
  (() => {
    const heading = document.querySelector(".hover-wrapperx");
    if (!heading) return;
    const hoverCapable = window.matchMedia("(any-hover: hover)");

    heading.addEventListener("click", () => {
      if (heading.classList.contains("is-flipped")) {
        heading.classList.remove("is-flipped");
        if (hoverCapable.matches) heading.classList.add("no-hover");     // don't re-flip under the cursor
        heading.classList.remove("is-unflipping");
        void heading.offsetWidth;
        heading.classList.add("is-unflipping");
      } else {
        heading.classList.add("is-flipped");
      }
    });
    heading.addEventListener("animationend", (e) => {
      if (e.target === heading) heading.classList.remove("is-unflipping");
    });
    heading.addEventListener("mouseleave", () => heading.classList.remove("no-hover"));
  })();

  /* ---------------------------------------------------------
     Desktop Explore dropdown
  --------------------------------------------------------- */
  const exploreToggle = document.querySelector(".nav-dropdown-toggle");

  const closeExplore = () => {
    siteHeader?.classList.remove("nav-open");
    exploreToggle?.setAttribute("aria-expanded", "false");
    document.querySelector("#explore-menu")?.setAttribute("aria-hidden", "true");
  };

  const toggleExplore = () => {
    if (!siteHeader || !exploreToggle) return;
    const open = !siteHeader.classList.contains("nav-open");
    siteHeader.classList.toggle("nav-open", open);
    exploreToggle.setAttribute("aria-expanded", String(open));
    document.querySelector("#explore-menu")?.setAttribute("aria-hidden", String(!open));
  };

  exploreToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleExplore();
  });

  document.addEventListener("click", (event) => {
    if (siteHeader && !siteHeader.contains(event.target)) closeExplore();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExplore();
  });

  /* ---------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileExploreToggle = document.querySelector(".mobile-explore-toggle");
  const mobileExplore = document.querySelector(".mobile-explore");

  const closeMobile = () => {
    siteHeader?.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.querySelector("#mobile-nav")?.setAttribute("aria-hidden", "true");
  };

  menuToggle?.addEventListener("click", () => {
    const open = !siteHeader.classList.contains("menu-open");
    siteHeader.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.querySelector("#mobile-nav")?.setAttribute("aria-hidden", String(!open));
    if (open) closeExplore();
  });

  mobileExploreToggle?.addEventListener("click", () => {
    const open = !mobileExplore.classList.contains("is-open");
    mobileExplore.classList.toggle("is-open", open);
    mobileExploreToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", closeMobile);
  });

/* ---------------------------------------------------------
     Search
     One visual search experience powers both the compact header
     field and the full-screen search panel.
  --------------------------------------------------------- */
  const searchPanel = document.querySelector("#search-panel");
  const panelInput = document.querySelector(".search-panel-input");
  const panelClose = document.querySelector(".search-panel-close");
  const headerSearchButton = document.querySelector(".search-form__button"); 
  const noResults = document.querySelector("#no-results");
  const searchStatus = document.querySelector("#search-status");

  /* What each item is searched against: its visible text, its class names (merch,
     templates...), and any keywords you add. Add them on the item itself:
       <div class="grid-item merch" data-keywords="clothes apparel tees illustration">
       <a class="row" data-keywords="saas ui design">
     (a <meta name="keywords" content="..."> inside the item also works).
     Built once per item and cached. */
  const poolCache = new WeakMap();
  const searchPool = (item) => {
    let pool = poolCache.get(item);
    if (pool === undefined) {
      const meta = item.querySelector("meta[name='keywords']")?.getAttribute("content") || "";
      pool = `${item.textContent} ${item.className} ${item.dataset.keywords || ""} ${meta}`
        .toLowerCase()
        .replace(/\s+/g, " ");
      poolCache.set(item, pool);
    }
    return pool;
  };

  /* Filter chip: while a search or tag filter is on, every search bar shows it as a pill
     ("Red Bull ×"). The × clears the filter (and any ?tag= in the address). */
  let activeQuery = "";
  const clearFilter = () => {
    filterRows("");
    if (new URLSearchParams(location.search).has("tag")) {
      history.replaceState(null, "", location.pathname + location.hash);
    }
  };
  const renderChips = () => {
    document.querySelectorAll(".search-form").forEach((form) => {
      let chip = form.querySelector(".search-chip");
      form.classList.toggle("has-filter", !!activeQuery);
      if (!activeQuery) { chip?.remove(); return; }
      if (!chip) {
        chip = document.createElement("span");
        chip.className = "search-chip";
        chip.innerHTML = '<span class="search-chip__label"></span>'
          + '<button class="search-chip__x" type="button">&times;</button>';
        chip.querySelector(".search-chip__x").addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          clearFilter();
        });
        (form.querySelector(".search-form__field") || form).prepend(chip);
      }
      chip.querySelector(".search-chip__label").textContent = activeQuery;
      chip.querySelector(".search-chip__x").setAttribute("aria-label", `Clear the "${activeQuery}" filter`);
    });
  };

  // Shows only the items that contain EVERY word typed ("merch beer" needs both).
  const filterRows = (value) => {
    const terms = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    activeQuery = value.trim().replace(/\s+/g, " ");
    renderChips();
    const items = document.querySelectorAll(".grid-item");
    let visible = 0;

    items.forEach((item) => {
      const pool = searchPool(item);
      const match = terms.every((t) => pool.includes(t));
      item.style.display = match ? "" : "none";
      if (match) visible++;
    });

    if (noResults) noResults.hidden = visible !== 0;
    if (searchStatus) {
      searchStatus.textContent = terms.length
        ? `${visible} ${visible === 1 ? "project" : "projects"}`
        : `${String(items.length).padStart(2, "0")} projects`;
    }
  };

  // Opening search always starts fresh: empty box, any earlier filter cleared.
  const openSearchPanel = () => {
    searchPanel?.classList.add("is-open");
    searchPanel?.setAttribute("aria-hidden", "false");
    document.body.classList.add("search-is-open");
    if (panelInput) {
      panelInput.value = "";
      window.setTimeout(() => panelInput.focus(), 20);
    }
    filterRows("");
  };

  const closeSearchPanel = () => {
    searchPanel?.classList.remove("is-open");
    searchPanel?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-is-open");
    panelInput?.blur();
  };

  // Typing filters live behind the panel; Enter keeps that result and closes the panel
  // (with an empty box it just closes).
  panelInput?.addEventListener("input", () => filterRows(panelInput.value));
  panelInput?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing) return;
    e.preventDefault();
    filterRows(panelInput.value);
    closeSearchPanel();
  });

  // Esc, the X, or a click outside cancel: the page goes back to the normal, unfiltered view.
  const cancelSearch = () => { filterRows(""); closeSearchPanel(); };

  headerSearchButton?.addEventListener("click", openSearchPanel);
  panelClose?.addEventListener("click", cancelSearch);
  searchPanel?.addEventListener("click", (event) => {
    if (event.target === searchPanel) cancelSearch();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (searchPanel?.classList.contains("is-open")) cancelSearch();
      closeExplore();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearchPanel();
    }
  });

  /* ---------------------------------------------------------
     Tag links: client links open that client's stack; category links (?tag=merch) just show the
     matching projects. A project matches a word if it's in its text, its classes, or data-keywords:
       <div class="grid-item design" data-keywords="branding packaging">
     A link like <a href="portfolio.html?tag=Red%20Bull">Red Bull</a> (or with
     data-search="Red Bull") shows the same result as searching "Red Bull", then opens the stack
     whose client label (.item-meta .location) matches and scrolls to it. Opening the page with
     ?tag=... in the address does the same, so it works as a shareable link too.
  --------------------------------------------------------- */
  const tagOf = (a) => a.dataset.search || new URL(a.getAttribute("href"), location.href).searchParams.get("tag");

  const showTag = (tag, smooth = true) => {
    if (!tag) return;
    closeExplore();
    if (searchPanel?.classList.contains("is-open")) closeSearchPanel();
    closeMobile();
    filterRows(tag);
    const want = tag.trim().toLowerCase();
    const shown = [...document.querySelectorAll(".photo-grid .grid-item")].filter((i) => i.style.display !== "none");
    const label = (i) => (i.querySelector(".item-meta .location")?.textContent || "").trim().toLowerCase();
    // a tag that is exactly a client's name (Kinco, Red Bull…) opens that stack; anything else
    // (branding, merch…) just filters, like searching that word
    const item = shown.find((i) => label(i) === want);
    const stack = item?.querySelector(".stack-container");
    if (!stack) {
      const grid = document.querySelector("#work") || document.querySelector(".photo-grid");
      window.setTimeout(() => grid?.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" }), 50);
      return;
    }
    requestAnimationFrame(() => {
      if (!stack.classList.contains("active")) stack.click();          // the stack's own open animation
      window.setTimeout(() => {
        const target = item.querySelector(".stack-caption") || stack.querySelector(".card") || stack;
        target.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
      }, 650);
    });
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-search], a[href*='?tag=']");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const tag = tagOf(a);
    if (!tag) return;
    e.preventDefault();
    showTag(tag);
  });

  // <a data-clear-filters> ("All work"): remove every filter (search, tag, category), then follow the link
  document.addEventListener("click", (e) => {
    if (!e.target.closest("a[data-clear-filters]")) return;
    clearFilter();
    document.querySelector('.filter-btn[data-filter="all"]')?.click();
    closeExplore();
    closeMobile();
  });

  const startTag = new URLSearchParams(location.search).get("tag");
  // "pageshow" runs after the page's own reset (it clears filters when you come back to the page)
  if (startTag) window.addEventListener("pageshow", () => setTimeout(() => showTag(startTag, false), 0), { once: true });

  /* ---------------------------------------------------------
     Category filter buttons (All / Merch / Templates)
     A grid item shows when it has the button's data-filter as a class
     (<div class="grid-item merch">). The active button gets .active.
  --------------------------------------------------------- */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const filterItems = document.querySelectorAll(".grid-item, .stack-body");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.filter;
      if (category === "all") filterRows("");          // "All" also clears a search or tag link
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      filterItems.forEach((item) => {
        const show = category === "all" || item.classList.contains(category);
        item.classList.toggle("hidden", !show);
      });
    });
  });

  /* Sticky header: the main header stays at the top; a soft shadow appears once the page scrolls */
  if (siteHeader) {
    const markStuck = () => siteHeader.classList.toggle("is-stuck", window.scrollY > 4);
    window.addEventListener("scroll", markStuck, { passive: true });
    markStuck();
  }

  /* About: only the first paragraph shows until "Read more" is clicked */
  document.querySelectorAll(".about-section").forEach((section) => {
    const more = section.querySelector(".about-more");
    const btn = section.querySelector(".about-toggle");
    if (!more || !btn) return;
    section.classList.add("js-collapse");
    btn.addEventListener("click", () => {
      const open = section.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Read less" : "Read more";
      if (!open) section.scrollIntoView({ block: "start" });
    });
  });

  /* Avoid stale hidden rows when returning from browser history. */
  window.addEventListener("pageshow", () => {
    if (!panelInput?.value) filterRows("");
  });
})();

/* ---------------------------------------------------------
   Variable Grid-Stack Engine
   Closed: the cards pile up inside one grid cell.
   Open:   CSS turns the wrappers into display: contents, so each
           card becomes its own cell of .photo-grid. FLIP below
           animates every moved element from old spot to new spot.
   Opening a stack closes any other open stack in the same move.
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const DURATION = 600;   // ms (keep close to the opacity transition in the CSS)
  const STAGGER = 40;     // ms between cards in the same stack
  const EASE = "cubic-bezier(0.25, 1, 0.5, 1)";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isDesktop = () => window.innerWidth > 768;
  const hasBox = (el) => el.getClientRects().length > 0;

  /* Photos are laid out "contain" in CSS. Closed decks scale each one up by --cover
     (= its longer side / shorter side) so it fills the square; opening eases it to 1. */
  const fitImage = (el) => {
    const isVideo = el.tagName === "VIDEO";
    const apply = () => {
      const w = isVideo ? el.videoWidth : el.naturalWidth;
      const h = isVideo ? el.videoHeight : el.naturalHeight;
      if (!w || !h) return;
      el.style.setProperty("--cover", Math.max(w / h, h / w).toFixed(4));
      void el.offsetWidth;                  // commit the value before transitions switch on
      el.classList.add("is-fitted");
    };
    if (isVideo) {
      el.readyState >= 1 ? apply() : el.addEventListener("loadedmetadata", apply, { once: true });
    } else {
      el.complete ? apply() : el.addEventListener("load", apply, { once: true });
    }
  };

  /* Optional brand logo: <div class="stack-container" data-logo="art/brand-logo.png">.
     It lives in a layer on the front card; CSS fades it in while a closed deck is hovered. */
  const addLogo = (stack, frontCard) => {
    const src = stack.dataset.logo;
    if (!src || !frontCard) return;
    const layer = document.createElement("div");
    layer.className = "stack-hover";
    layer.setAttribute("aria-hidden", "true");
    const img = document.createElement("img");
    img.className = "stack-logo";
    img.alt = "";
    img.src = src;
    layer.appendChild(img);
    frontCard.appendChild(layer);
  };

  /* Every working stack registers itself so stacks can see each other */
  const registry = [];

  /* FLIP: measure -> change layout -> animate from old rect to new rect.
     Returns the animations it started. */
  const flip = (elements, change) => {
    const first = new Map();
    elements.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) first.set(el, r);
    });

    // drop any FLIP still in flight (we already measured where it visually was)
    elements.forEach((el) =>
      el.getAnimations().filter((a) => a.id === "flip").forEach((a) => a.cancel())
    );

    change();
    if (reduceMotion.matches) return [];

    const started = [];
    first.forEach((a, el) => {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      const sx = a.width / b.width;
      const sy = a.height / b.height;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.005 && Math.abs(sy - 1) < 0.005) return;

      const isCard = el.classList.contains("card");
      const i = parseFloat(el.style.getPropertyValue("--i")) || 0;
      const anim = el.animate(
        [
          { transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transformOrigin: "0 0", transform: "none" },
        ],
        { duration: DURATION, easing: EASE, delay: isCard ? i * STAGGER : 0, fill: "backwards" }
      );
      anim.id = "flip";
      started.push(anim);
    });
    return started;
  };

  /* Everything that can move: other grid items + the cards of any open/involved stack */
  const flipTargets = (involved) => {
    const involvedGrids = new Set(involved.map((e) => e.grid));
    const items = [...document.querySelectorAll(".photo-grid .grid-item")].filter(
      (el) => !involvedGrids.has(el) && !el.classList.contains("stack-is-open") && hasBox(el)
    );
    const cards = registry
      .filter((e) => involved.includes(e) || e.isOpen())
      .flatMap((e) => e.cards)
      .filter(hasBox);
    return [...items, ...cards];
  };

  /* ---------------------------------------------------------
     Hover cycling on a CLOSED stack: while the pointer is over it, the front card
     cross-fades through the stack's other pictures (same idea as the old work list).
     Hover devices only; stops when the stack opens or the pointer leaves.
  --------------------------------------------------------- */
  const CYCLE_MS = 900;                                   // time each picture stays up
  const canHover = window.matchMedia("(any-hover: hover)");

  const addCycle = (entry) => {
    const { stack, cards } = entry;
    const sources = cards
      .map((c) => c.querySelector("img.stack-contained-img"))
      .map((img) => (img ? img.currentSrc || img.src : null));
    const pics = sources.filter(Boolean);
    if (cards.length < 2 || pics.length < 2) return;

    const front = cards[0];
    let timer = null;
    let index = 0;

    const clear = () => {
      front.querySelectorAll(".stack-cycle").forEach((el) => {
        el.classList.remove("is-in");
        window.setTimeout(() => el.remove(), 400);
      });
    };

    const stop = () => {
      window.clearInterval(timer);
      timer = null;
      index = 0;
      clear();
    };

    const show = (src) => {
      const img = document.createElement("img");
      img.className = "stack-cycle";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.src = src;
      front.appendChild(img);
      void img.offsetWidth;                               // so the fade-in actually runs
      img.classList.add("is-in");
      // drop older layers once the new one is fully in
      window.setTimeout(() => {
        front.querySelectorAll(".stack-cycle").forEach((el) => { if (el !== img && !el.classList.contains("is-in")) el.remove(); });
        const all = [...front.querySelectorAll(".stack-cycle")];
        all.slice(0, -1).forEach((el) => el.remove());
      }, 450);
    };

    const tick = () => {
      if (entry.isOpen()) return stop();
      index = (index + 1) % pics.length;
      if (index === 0) clear();                           // back to the real front picture
      else show(pics[index]);
    };

    const start = () => {
      if (timer || entry.isOpen() || reduceMotion.matches || !canHover.matches) return;
      pics.forEach((p) => { const pre = new Image(); pre.src = p; });   // warm the lazy-loaded ones
      index = 0;
      timer = window.setInterval(tick, CYCLE_MS);
    };

    stack.addEventListener("mouseenter", start);
    stack.addEventListener("mouseleave", stop);
    stack.addEventListener("focusin", () => { if (entry.isOpen()) stop(); });
    entry.stopCycle = stop;
  };

  document.querySelectorAll(".stack-container").forEach((stack) => {
    const grid = stack.closest(".grid-item");
    const cards = [...stack.querySelectorAll(".card")];

    cards.forEach((card, i) => card.style.setProperty("--i", i));
    stack.querySelectorAll("img.stack-contained-img, video.stack-contained-img").forEach(fitImage);
    addLogo(stack, cards[0]);

    /* The teaser caption is moved so it sits among the cards of the open stack.
       CAPTION_POSITION: 0 = first cell, 1 = second cell (after the first card), 2 = third... */
    const CAPTION_POSITION = 0;
    const caption = grid?.querySelector(":scope > .stack-caption");
    if (caption && cards.length > 1) {
      const at = Math.min(CAPTION_POSITION, cards.length);
      at === 0 ? cards[0].before(caption) : cards[at - 1].after(caption);
    }

    if (cards.length < 2) {            // single image: nothing to spread
      if (stack.dataset.href) {        // ...but on phones it can still go to its page
        stack.addEventListener("click", () => { if (!isDesktop()) window.location.href = stack.dataset.href; });
      } else {
        stack.style.cursor = "default";
        cards.forEach((card) => (card.style.cursor = "default"));
      }
      return;
    }

    stack.setAttribute("role", "button");
    stack.setAttribute("tabindex", "0");
    stack.setAttribute("aria-expanded", "false");

    /* DOM changes only (no animation), so several can run inside ONE flip */
    const applyOpen = () => {
      entry.stopCycle?.();
      grid?.classList.add("stack-is-open");
      stack.classList.add("active");
      stack.setAttribute("aria-expanded", "true");
      // the wrapper has no box while open: the text tile closes the stack, each card opens the viewer
      if (caption) {
        caption.setAttribute("role", "button");
        caption.setAttribute("tabindex", "0");
        caption.setAttribute("aria-label", "Close this stack");
      }
      cards.forEach((card) => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", "View larger");
      });
      stack.querySelectorAll("video").forEach((v) => v.play().catch(() => {}));   // videos play only while spread out
    };

    const applyClose = () => {
      grid?.classList.remove("stack-is-open");
      stack.classList.remove("active");
      stack.setAttribute("aria-expanded", "false");
      [caption, ...cards].forEach((el) => el && ["role", "tabindex", "aria-label"].forEach((a) => el.removeAttribute(a)));
      stack.querySelectorAll("video").forEach((v) => v.pause());
    };

    const entry = {
      stack,
      grid,
      cards,
      busy: 0,
      isOpen: () => stack.classList.contains("active"),
      applyOpen,
      applyClose,
    };
    registry.push(entry);
    addCycle(entry);

    const toggle = () => {
      const opening = !entry.isOpen();
      const others = opening ? registry.filter((e) => e !== entry && e.isOpen()) : [];
      const involved = [entry, ...others];
      const hadFocus = stack === document.activeElement || cards.includes(document.activeElement)
        || (caption && caption === document.activeElement);

      // keep the tapped project where it was on screen (otherwise other stacks closing above it,
      // or the browser's scroll anchoring, can throw the view far past it - very visible on phones)
      const anchorEl = () => (entry.isOpen() ? caption || cards[0] : grid || stack);
      const header = document.querySelector("#site-header");
      const headerH = header ? Math.max(header.getBoundingClientRect().bottom, 0) : 0;
      const beforeTop = Math.max(anchorEl().getBoundingClientRect().top, headerH);

      // ONE combined animation: close the others while opening/closing this one
      const anims = flip(flipTargets(involved), () => {
        others.forEach((e) => e.applyClose());
        opening ? applyOpen() : applyClose();
        const shift = anchorEl().getBoundingClientRect().top - beforeTop;
        if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
      });

      if (hadFocus) (opening ? caption || cards[0] : stack).focus({ preventScroll: true });

      // keep the moving stacks above their neighbours until the motion ends
      if (anims.length) {
        involved.forEach((e) => {
          e.busy++;
          e.stack.classList.add("is-animating");
        });
        Promise.allSettled(anims.map((a) => a.finished)).then(() =>
          involved.forEach((e) => {
            if (--e.busy === 0) e.stack.classList.remove("is-animating");
          })
        );
      }
    };

    /* On phones a stack with data-href goes straight to that page; without it, it opens in place */
    const goesToPage = () => !isDesktop() && stack.dataset.href && !entry.isOpen();

    const openViewer = (card) => window.gmViewer?.open(cards, cards.indexOf(card), card);

    stack.addEventListener("click", (e) => {
      if (e.target.closest(".stack-caption a")) return;     // the link just navigates; the rest of the tile closes the stack
      if (goesToPage()) { window.location.href = stack.dataset.href; return; }
      if (entry.isOpen()) {
        const card = e.target.closest(".card");
        if (card) { openViewer(card); return; }             // open stack: a picture opens the viewer
        if (!e.target.closest(".stack-caption")) return;    // only the text tile closes it
      }
      toggle();
    });

    stack.addEventListener("keydown", (e) => {
      if (e.target.closest(".stack-caption a")) return;
      if (e.key === "Escape" && entry.isOpen()) { toggle(); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (goesToPage()) { window.location.href = stack.dataset.href; return; }
        const card = entry.isOpen() && e.target.closest(".card");
        if (card) { openViewer(card); return; }
        toggle();
      }
    });
  });
});


/* ---------------------------------------------------------
   Picture viewer: click a picture in an OPEN stack to see it big.
   ← / → (or swipe) step through that stack, Esc / × / the dark
   background close it. Click the picture to see it at full size
   (when it's bigger than the screen) and scroll around.
   For extra-sharp versions add data-full="art/big/file.webp" to an <img>.
   For a caption under the enlarged picture add data-caption="..." to the <img> or <video>.
--------------------------------------------------------- */
(() => {
  "use strict";
  const box = document.createElement("div");
  box.className = "viewer";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Picture viewer");
  box.innerHTML =
    '<button class="viewer__btn viewer__close" type="button" aria-label="Close">&times;</button>' +
    '<button class="viewer__btn viewer__prev" type="button" aria-label="Previous picture">&lsaquo;</button>' +
    '<div class="viewer__stage"></div>' +
    '<button class="viewer__btn viewer__next" type="button" aria-label="Next picture">&rsaquo;</button>' +
    '<p class="viewer__info"><span class="viewer__caption"></span><span class="viewer__count"></span></p>';
  const stage = box.querySelector(".viewer__stage");
  const captionEl = box.querySelector(".viewer__caption");
  const countEl = box.querySelector(".viewer__count");
  let list = [], index = 0, returnTo = null;

  const mediaOf = (card) => card.querySelector(".stack-contained-img");

  /* Captions may use <strong>/<b> (bold), <em>/<i> (italic) and <br> or &#10; (new line), e.g.
       data-caption="<strong>Kinco mailers:</strong>&#10;Photo-editing, print design"
     Built as real elements (never innerHTML), so nothing else in a caption can run as code. */
  const setCaption = (text) => {
    const out = [];
    const stack = [];                                   // open <strong>/<em> wrappers
    const add = (node) => { if (stack.length) stack[stack.length - 1].append(node); else out.push(node); };
    text.split(/(<\/?(?:strong|b|em|i)\s*>|<br\s*\/?>)/i).forEach((part) => {
      const tag = part.match(/^<(\/?)(strong|b|em|i|br)\b/i);
      if (!tag) { if (part) add(document.createTextNode(part)); return; }
      const name = tag[2].toLowerCase();
      if (name === "br") return add(document.createElement("br"));
      const el = name === "b" || name === "strong" ? "strong" : "em";
      if (!tag[1]) { const w = document.createElement(el); add(w); stack.push(w); }
      else if (stack.length) stack.pop();
    });
    captionEl.replaceChildren(...out);
  };

  /* Videos: Safari only autoplays a script-made video if muted/playsinline are set as
     attributes BEFORE the file is attached, and it can stall when the same file is still
     playing in the grid behind, so the grid copies pause while the viewer is open. */
  let pausedBehind = [];
  const makeVideo = (from) => {
    const v = document.createElement("video");
    ["muted", "playsinline", "loop", "controls", "autoplay"].forEach((a) => v.setAttribute(a, ""));
    v.muted = true;
    v.preload = "auto";
    if (from.videoWidth) {                       // right shape straight away, no 300x150 box first
      v.width = from.videoWidth;
      v.height = from.videoHeight;
    }
    const file = from.currentSrc || from.getAttribute("src") || from.querySelector("source")?.src || "";
    v.src = file;
    v.addEventListener("error", () => {
      const note = document.createElement("p");
      note.className = "viewer__note";
      note.innerHTML = 'This video can\'t play here. <a target="_blank" rel="noopener">Open the video file</a>';
      note.querySelector("a").href = file;
      v.replaceWith(note);
    }, { once: true });
    v.load();
    const tryPlay = () => v.play().catch(() => {});   // if autoplay is refused, the controls still work
    v.readyState >= 2 ? tryPlay() : v.addEventListener("canplay", tryPlay, { once: true });
    return v;
  };
  const pauseBehind = () => {
    pausedBehind = [...document.querySelectorAll(".photo-grid video")].filter((v) => !v.paused);
    pausedBehind.forEach((v) => v.pause());
  };
  const resumeBehind = () => {
    pausedBehind.forEach((v) => { if (v.closest(".stack-container.active")) v.play().catch(() => {}); });
    pausedBehind = [];
  };

  const show = (i) => {
    index = (i + list.length) % list.length;
    const card = list[index];
    const src = mediaOf(card);
    box.classList.remove("is-zoomed", "can-zoom");
    stage.scrollTo(0, 0);
    const old = stage.querySelector("video");
    if (old) { old.pause(); old.removeAttribute("src"); old.load(); }
    stage.replaceChildren();
    if (!src) return;
    let el;
    if (src.tagName === "VIDEO") {
      el = makeVideo(src);
    } else {
      el = document.createElement("img");
      el.src = src.dataset.full || src.currentSrc || src.src;
      el.alt = src.alt || "";
      el.decoding = "async";
      const checkZoom = () => {
        const bigger = el.naturalWidth > el.clientWidth + 2 || el.naturalHeight > el.clientHeight + 2;
        box.classList.toggle("can-zoom", bigger);
      };
      el.complete ? requestAnimationFrame(checkZoom) : el.addEventListener("load", checkZoom, { once: true });
    }
    el.className = "viewer__media";
    stage.append(el);
    // captions only show here, in the viewer: data-caption="..." on the <img> or <video>
    setCaption((src.dataset.caption || card.querySelector(".card-caption")?.textContent || "").trim());
    box.classList.toggle("has-caption", !!captionEl.textContent.trim());
    countEl.textContent = list.length > 1 ? `${index + 1} / ${list.length}` : "";
    box.classList.toggle("is-single", list.length < 2);
  };

  const close = () => {
    if (box.hidden) return;
    box.classList.remove("is-open");
    document.documentElement.classList.remove("viewer-lock");
    const v = stage.querySelector("video");
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }   // stop downloading it
    resumeBehind();
    setTimeout(() => { box.hidden = true; stage.replaceChildren(); }, 200);
    returnTo?.focus({ preventScroll: true });
  };

  window.gmViewer = {
    open(cards, i, from) {
      list = cards.filter((c) => mediaOf(c));
      if (!list.length) return;
      returnTo = from || document.activeElement;
      pauseBehind();
      box.hidden = false;
      document.documentElement.classList.add("viewer-lock");
      show(Math.max(0, list.indexOf(cards[i])));
      requestAnimationFrame(() => box.classList.add("is-open"));
      box.querySelector(".viewer__close").focus({ preventScroll: true });
    },
    close,
  };

  box.querySelector(".viewer__close").addEventListener("click", close);
  box.querySelector(".viewer__prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".viewer__next").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => {
    if (e.target === box || e.target === stage) return close();          // the dark background
    if (e.target.matches("img.viewer__media") && box.classList.contains("can-zoom")) {
      const r = e.target.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      box.classList.toggle("is-zoomed");
      if (box.classList.contains("is-zoomed")) {                          // zoom in where you clicked
        stage.scrollTo(fx * stage.scrollWidth - stage.clientWidth / 2, fy * stage.scrollHeight - stage.clientHeight / 2);
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") {                                           // keep focus inside the viewer
      const btns = [...box.querySelectorAll("button")].filter((b) => b.offsetParent);
      const at = btns.indexOf(document.activeElement);
      e.preventDefault();
      btns[(at + (e.shiftKey ? -1 : 1) + btns.length) % btns.length]?.focus();
    }
  });
  let touchX = null;
  box.addEventListener("touchstart", (e) => { touchX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (touchX === null || box.classList.contains("is-zoomed")) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  const mount = () => document.body.append(box);
  document.body ? mount() : document.addEventListener("DOMContentLoaded", mount);
})();


/* ---------------------------------------------------------
   Document viewer (the Resume link): shows the pages as images,
   with Download PDF / Open PDF buttons. Works the same on phones.
   Any link can use it:
     <a href="file.pdf" data-doc-pages="p1.webp p2.webp"
        data-doc-title="Title" data-doc-download="name.pdf">
   Without JavaScript the link still just opens the PDF.
--------------------------------------------------------- */
(() => {
  "use strict";
  const box = document.createElement("div");
  box.className = "doc-viewer";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML =
    '<div class="doc-viewer__bar">' +
    '<span class="doc-viewer__title"></span>' +
    '<a class="doc-viewer__btn doc-viewer__download" download>Download PDF</a>' +
    '<a class="doc-viewer__btn doc-viewer__open" target="_blank" rel="noopener">Open PDF</a>' +
    '<button class="doc-viewer__close" type="button" aria-label="Close">&times;</button>' +
    "</div>" +
    '<div class="doc-viewer__scroll"></div>';
  const scroller = box.querySelector(".doc-viewer__scroll");
  const titleEl = box.querySelector(".doc-viewer__title");
  const dl = box.querySelector(".doc-viewer__download");
  const openPdf = box.querySelector(".doc-viewer__open");
  let returnTo = null;

  const open = (link) => {
    const pages = (link.dataset.docPages || "").split(/\s+/).filter(Boolean);
    const title = link.dataset.docTitle || "Document";
    const pdf = link.getAttribute("href");
    titleEl.textContent = title;
    box.setAttribute("aria-label", title);
    dl.href = openPdf.href = pdf;
    dl.setAttribute("download", link.dataset.docDownload || pdf.split("/").pop());
    scroller.replaceChildren(...pages.map((src, i) => {
      const img = document.createElement("img");
      img.className = "doc-viewer__page";
      img.src = src;
      img.alt = `${title}, page ${i + 1} of ${pages.length}`;
      img.decoding = "async";
      img.width = 1700;
      img.height = 2200;
      return img;
    }));
    returnTo = link;
    box.hidden = false;
    scroller.scrollTop = 0;
    document.documentElement.classList.add("viewer-lock");
    requestAnimationFrame(() => box.classList.add("is-open"));
    box.querySelector(".doc-viewer__close").focus({ preventScroll: true });
  };

  const close = () => {
    if (box.hidden) return;
    box.classList.remove("is-open");
    document.documentElement.classList.remove("viewer-lock");
    setTimeout(() => { box.hidden = true; }, 200);
    returnTo?.focus({ preventScroll: true });
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-doc-pages]");
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;   // cmd-click still opens the PDF
    e.preventDefault();
    open(link);
  });
  box.querySelector(".doc-viewer__close").addEventListener("click", close);
  scroller.addEventListener("click", (e) => { if (e.target === scroller) close(); });   // the dark area
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") {                                           // keep focus inside
      const els = [...box.querySelectorAll("a, button")];
      const at = els.indexOf(document.activeElement);
      e.preventDefault();
      els[(at + (e.shiftKey ? -1 : 1) + els.length) % els.length].focus();
    }
  });

  const mount = () => document.body.append(box);
  document.body ? mount() : document.addEventListener("DOMContentLoaded", mount);
})();
