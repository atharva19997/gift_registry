/* ============================================================
   Sara & Atharva — Wedding Registry
   Loads gifts.json and renders the gallery.

   SECURITY NOTES
   --------------
   - This is a purely static site. There are NO forms, NO user input
     fields, and NOTHING that writes back to the server.
   - All text from gifts.json is inserted with textContent (never
     innerHTML), so any stray HTML in the data is shown as plain text
     and can never execute. Links are validated to allow only http(s),
     which blocks "javascript:" style URLs.
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

  /* ---- Accept either "giftedBy" (preferred) or "gitedBy" as a fallback ---- */
  function contributors(gift) {
    var list = gift.giftedBy || gift.gitedBy || [];
    if (!Array.isArray(list)) return [];
    return list.filter(function (n) { return typeof n === "string" && n.trim(); });
  }

  /* ---- Build one card entirely via safe DOM APIs ---- */
  function buildCard(gift) {
    var isGifted = gift.status === "gifted";

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
      img.alt = typeof gift.title === "string" ? gift.title : "Gift image";
      img.loading = "lazy";
      // If the image fails to load, swap in a graceful monogram fallback.
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
    title.textContent = gift.title || "Untitled gift";
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

    var linkUrl = safeUrl(gift.link);
    if (linkUrl) {
      var link = document.createElement("a");
      link.className = "card__link";
      link.href = linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = isGifted ? "View item" : "View & Buy";
      body.appendChild(link);
    }

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
      empty.textContent = "Nothing to show here yet — try another filter.";
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
      filterButtons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
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
      allGifts = Array.isArray(data) ? data : [];
      render();
    })
    .catch(function (err) {
      if (statusEl) {
        statusEl.textContent =
          "We couldn't load the registry just now. Please refresh the page.";
      }
      // Log for the owner's debugging; harmless to viewers.
      console.error("Could not load gifts.json:", err);
    });
})();
