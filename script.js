/* ============================================================
   Sara & Atharva — Wedding Registry
   Loads gifts.json and renders the gallery.

   WhatsApp links carry no phone number. Tapping one opens WhatsApp with
   the message already written, and the guest picks Atharva or Sara.
   ============================================================ */

/* ============================================================
   SECURITY NOTES
   --------------
   - This is a purely static site. There are NO forms, NO user input
     fields, and NOTHING that writes back to the server.
   - All text from gifts.json is inserted with textContent (never
     innerHTML), so any stray HTML in the data is shown as plain text
     and can never execute. Links are validated to allow only http(s),
     which blocks "javascript:" style URLs.
   - WhatsApp message text is passed through encodeURIComponent.
   - The only person who can change the data is you, by editing
     gifts.json directly on GitHub. See README for instructions.
   ============================================================ */

(function () {
  "use strict";

  var grid = document.getElementById("giftGrid");
  var statusEl = document.getElementById("gridStatus");
  var filterButtons = document.querySelectorAll(".filter");

  var allGifts = [];        // full list loaded from JSON
  var activeFilter = "all"; // "all" | "available" | "gifted"

  /* ---- Only allow safe link protocols (blocks javascript:, data:, etc.) ---- */
  function safeUrl(url) {
    if (typeof url !== "string") return "";
    try {
      var parsed = new URL(url, window.location.href);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
    } catch (e) { /* invalid URL falls through */ }
    return "";
  }

  /* ---- WhatsApp link with no number: guest chooses who to send it to ---- */
  function whatsappUrl(message) {
    return "https://wa.me/?text=" + encodeURIComponent(message || "");
  }

  /* ---- Accept either "giftedBy" (preferred) or "gitedBy" as a fallback ---- */
  function contributors(gift) {
    var list = gift.giftedBy || gift.gitedBy || [];
    if (!Array.isArray(list)) return [];
    return list.filter(function (n) { return typeof n === "string" && n.trim(); });
  }

  /* ---- Screen reader hint for links that open a new tab ---- */
  function newTabHint() {
    var span = document.createElement("span");
    span.className = "visually-hidden";
    span.textContent = " (opens in a new tab)";
    return span;
  }

  /* ---- Build one card entirely via safe DOM APIs ---- */
  function buildCard(gift) {
    var isGifted = gift.status === "gifted";
    var giftTitle = typeof gift.title === "string" && gift.title.trim()
      ? gift.title : "Untitled gift";

    var card = document.createElement("article");
    card.className = "card" + (isGifted ? " is-gifted" : "");

    /* --- media + badge --- */
    var media = document.createElement("div");
    media.className = "card__media";

    var imgUrl = safeUrl(gift.imageUrl);
    if (imgUrl) {
      var img = document.createElement("img");
      img.className = "card__img";
      img.src = imgUrl;
      img.alt = giftTitle;
      img.loading = "lazy";
      // If the image fails to load, swap in a graceful ornament fallback.
      img.addEventListener("error", function () {
        img.replaceWith(makeFallback());
      });
      media.appendChild(img);
    } else {
      media.appendChild(makeFallback());
    }

    var badge = document.createElement("span");
    badge.className = "badge " + (isGifted ? "badge--gifted" : "badge--available");
    badge.textContent = isGifted ? "Gifted" : "Available";
    media.appendChild(badge);

    card.appendChild(media);

    /* --- body --- */
    var body = document.createElement("div");
    body.className = "card__body";

    var title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = giftTitle;
    body.appendChild(title);

    if (gift.description) {
      var desc = document.createElement("p");
      desc.className = "card__desc";
      desc.textContent = gift.description;
      body.appendChild(desc);
    }

    var names = contributors(gift);
    if (isGifted && names.length) {
      var by = document.createElement("p");
      by.className = "card__gifted";
      by.appendChild(document.createTextNode("With thanks to "));
      var strong = document.createElement("strong");
      strong.textContent = names.join(", ");
      by.appendChild(strong);
      body.appendChild(by);
    }

    var actions = document.createElement("div");
    actions.className = "card__actions";

    // Claim first: only for gifts that are still available.
    if (!isGifted) {
      var claim = document.createElement("a");
      claim.className = "card__claim";
      claim.href = whatsappUrl(
        "Hi! I'd like to gift \"" + giftTitle +
        "\" from your registry. My name is "
      );
      claim.target = "_blank";
      claim.rel = "noopener noreferrer";
      claim.textContent = "Claim this gift";
      claim.appendChild(newTabHint());
      actions.appendChild(claim);
    }

    var linkUrl = safeUrl(gift.link);
    if (linkUrl) {
      var link = document.createElement("a");
      link.className = "card__link";
      link.href = linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = isGifted ? "View item" : "View & Buy";
      link.appendChild(newTabHint());
      actions.appendChild(link);
    }

    if (actions.childNodes.length) body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  function makeFallback() {
    var fb = document.createElement("div");
    fb.className = "card__img card__img--fallback";
    fb.textContent = "\u2766"; // floral heart ornament
    fb.setAttribute("aria-hidden", "true");
    return fb;
  }

  /* ---- Show how many gifts sit under each filter ---- */
  function updateCounts() {
    var gifted = allGifts.filter(function (g) { return g.status === "gifted"; }).length;
    var counts = {
      all: allGifts.length,
      available: allGifts.length - gifted,
      gifted: gifted
    };
    filterButtons.forEach(function (btn) {
      var span = btn.querySelector(".filter__count");
      var key = btn.getAttribute("data-filter");
      if (span && key in counts) span.textContent = "(" + counts[key] + ")";
    });
  }

  /* ---- Render according to the active filter ---- */
  function render() {
    grid.textContent = "";

    var visible = allGifts.filter(function (g) {
      if (activeFilter === "available") return g.status !== "gifted";
      if (activeFilter === "gifted") return g.status === "gifted";
      return true;
    });

    if (!visible.length) {
      var empty = document.createElement("p");
      empty.className = "grid__empty";
      empty.textContent = activeFilter === "gifted"
        ? "Nothing has been gifted yet. Be the first!"
        : activeFilter === "available"
          ? "Every gift has been claimed. Thank you all so much!"
          : "No gifts have been added yet. Please check back soon.";
      grid.appendChild(empty);
      return;
    }

    var frag = document.createDocumentFragment();
    visible.forEach(function (g) { frag.appendChild(buildCard(g)); });
    grid.appendChild(frag);
  }

  /* ---- Filter buttons ---- */
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      activeFilter = btn.getAttribute("data-filter") || "all";
      render();
    });
  });

  /* ---- Load the data ---- */
  fetch("gifts.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      var list = Array.isArray(data) ? data : [];
      // Available gifts first, gifted ones at the end (original order kept within each group).
      allGifts = list.filter(function (g) { return g.status !== "gifted"; })
        .concat(list.filter(function (g) { return g.status === "gifted"; }));
      updateCounts();
      render();
    })
    .catch(function (err) {
      if (statusEl) {
        statusEl.textContent =
          "The registry didn't load. Please refresh the page.";
      }
      // Log for the owner's debugging; harmless to viewers.
      console.error("Could not load gifts.json:", err);
    });
})();
