(function () {
  var root = document.documentElement;
  var presenceBtn = document.getElementById("presence");
  var presencePanel = document.getElementById("presence-panel");
  var presenceList = document.getElementById("presence-list");
  var presenceEmpty = document.getElementById("presence-empty");
  var presenceLabel = document.getElementById("presence-label");
  var chatFrame = document.getElementById("chat-frame");
  var videoFrame = document.getElementById("video-frame");
  var users = [];

  function fit() {
    var viewport = window.visualViewport;
    // Pin the shell to the visual viewport. Safari reports offsetTop when the
    // URL bar / keyboard moves; translating with that value shoved the stream
    // off-screen, so we set top/height on a position:fixed .app instead.
    var height = viewport ? viewport.height : window.innerHeight;
    var top = viewport ? viewport.offsetTop : 0;
    root.style.setProperty("--app-height", Math.round(height) + "px");
    root.style.setProperty("--app-top", Math.round(top) + "px");
    var keyboard = viewport && window.innerHeight - viewport.height > 140;
    document.body.classList.toggle("keyboard", !!keyboard);
    // Kill any residual document scroll from chat-iframe focus on iOS.
    if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
  }

  function renderUsers(next) {
    users = Array.isArray(next) ? next : [];
    var count = users.length;
    presenceLabel.textContent =
      count === 0 ? "Chat" : count === 1 ? "1 in chat" : count + " in chat";

    presenceList.innerHTML = "";
    users.forEach(function (user) {
      var li = document.createElement("li");
      if (user.mod) {
        var badge = document.createElement("span");
        badge.className = "mod";
        badge.textContent = "Mod";
        li.appendChild(badge);
      }
      var name = document.createElement("span");
      name.textContent = user.name || "Guest";
      li.appendChild(name);
      presenceList.appendChild(li);
    });
    presenceEmpty.hidden = count > 0;
  }

  function fetchUsers() {
    return fetch("./api/users", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("users " + res.status);
        return res.json();
      })
      .then(function (data) {
        renderUsers(data && data.users);
      })
      .catch(function () {
        // Offline plugin host or empty room: keep last good list.
      });
  }

  function openPresence(open) {
    presencePanel.hidden = !open;
    presenceBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  presenceBtn.addEventListener("click", function () {
    openPresence(presencePanel.hidden);
  });

  document.addEventListener("click", function (event) {
    if (presencePanel.hidden) return;
    if (presencePanel.contains(event.target) || presenceBtn.contains(event.target)) {
      return;
    }
    openPresence(false);
  });

  // Live updates when the Owncast host exposes SSE. Poll as a fallback
  // for local previews and for the 64-connection SSE cap.
  try {
    var events = new EventSource("./_sse/room");
    events.addEventListener("users", function (event) {
      try {
        var data = JSON.parse(event.data);
        renderUsers(data && data.users);
      } catch (err) {
        // Ignore a malformed frame.
      }
    });
    events.onerror = function () {
      // EventSource reconnects on its own; polling covers the gap.
    };
  } catch (err) {
    // EventSource unavailable.
  }
  fetchUsers();
  setInterval(fetchUsers, 30000);

  // Same-origin chat iframe: preview https image links under messages.
  // Adapted from owncast-chat-tools; no third-party API keys, no uploads.
  var IMAGE_RE =
    /^https:\/\/[^\s<>"']+\.(?:gif|png|jpe?g|webp)(?:\?[^\s<>"']*)?$/i;

  function enhanceChatDoc(doc) {
    if (!doc || doc.getElementById("mobichat-preview-style")) return;

    var style = doc.createElement("style");
    style.id = "mobichat-preview-style";
    style.textContent =
      ".mobichat-preview{display:block;max-width:min(100%,280px);max-height:180px;" +
      "margin:4px 0 2px;border-radius:6px;cursor:zoom-in}" +
      ".mobichat-lightbox{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);" +
      "display:flex;align-items:center;justify-content:center;padding:16px}" +
      ".mobichat-lightbox img{max-width:100%;max-height:100%;border-radius:8px}" +
      ".mobichat-lightbox button{position:absolute;top:12px;right:12px;border:0;" +
      "border-radius:999px;padding:8px 12px;background:#fff;color:#111;font:600 13px system-ui}";
    doc.head.appendChild(style);

    function openLightbox(src) {
      var box = doc.createElement("div");
      box.className = "mobichat-lightbox";
      box.setAttribute("role", "dialog");
      var img = doc.createElement("img");
      img.src = src;
      img.alt = "";
      var close = doc.createElement("button");
      close.type = "button";
      close.textContent = "Close";
      function dismiss() {
        box.remove();
        doc.removeEventListener("keydown", onKey);
      }
      function onKey(event) {
        if (event.key === "Escape") dismiss();
      }
      close.addEventListener("click", dismiss);
      box.addEventListener("click", function (event) {
        if (event.target === box) dismiss();
      });
      doc.addEventListener("keydown", onKey);
      box.appendChild(img);
      box.appendChild(close);
      doc.body.appendChild(box);
    }

    function decorate(rootNode) {
      var links = rootNode.querySelectorAll
        ? rootNode.querySelectorAll("a[href]")
        : [];
      links.forEach(function (anchor) {
        if (anchor.dataset.mobichatPreview === "1") return;
        var href = anchor.getAttribute("href") || "";
        if (!IMAGE_RE.test(href)) return;
        anchor.dataset.mobichatPreview = "1";
        var img = doc.createElement("img");
        img.className = "mobichat-preview";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.alt = "";
        img.src = href;
        img.addEventListener("click", function (event) {
          event.preventDefault();
          openLightbox(href);
        });
        img.addEventListener("error", function () {
          img.remove();
        });
        anchor.insertAdjacentElement("afterend", img);
      });
    }

    decorate(doc);
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) decorate(node);
        });
      });
    });
    observer.observe(doc.body, { childList: true, subtree: true });
  }

  function tryEnhanceChat() {
    try {
      var doc = chatFrame.contentDocument;
      if (doc && doc.readyState !== "loading") enhanceChatDoc(doc);
    } catch (err) {
      // Cross-origin in local previews that don't serve real embeds.
    }
  }

  // Same-origin video embed: force the player to fill the stage. Owncast's
  // embed uses 16:9 + max-height and centers the box, which leaves black
  // side bars when the iframe is not an exact match.
  function enhanceVideoDoc(doc) {
    if (!doc || doc.getElementById("mobichat-video-fill")) return;
    var style = doc.createElement("style");
    style.id = "mobichat-video-fill";
    style.textContent =
      "html,body{margin:0;height:100%;background:#000;overflow:hidden}" +
      "body>div,#player,[class*='onlineContainer'],[class*='container']," +
      "[class*='player'],[class*='poster'],.video-js,video{" +
      "width:100%!important;height:100%!important;max-height:none!important;" +
      "aspect-ratio:auto!important;justify-items:stretch!important}" +
      "video,.vjs-tech{object-fit:contain!important}";
    (doc.head || doc.documentElement).appendChild(style);
  }

  function tryEnhanceVideo() {
    try {
      var doc = videoFrame && videoFrame.contentDocument;
      if (doc && doc.readyState !== "loading") enhanceVideoDoc(doc);
    } catch (err) {
      // Cross-origin in local previews that don't serve real embeds.
    }
  }

  chatFrame.addEventListener("load", tryEnhanceChat);
  if (videoFrame) videoFrame.addEventListener("load", tryEnhanceVideo);
  // Owncast embeds hydrate after the load event; retry briefly.
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    tryEnhanceChat();
    tryEnhanceVideo();
    if (tries >= 20) clearInterval(timer);
  }, 500);

  fit();
  window.addEventListener("resize", fit);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", fit);
    visualViewport.addEventListener("scroll", fit);
  }
})();

