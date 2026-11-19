(function () {
  var root = document.documentElement;
  var chatFrame = document.getElementById("chat-frame");
  var videoFrame = document.getElementById("video-frame");

  function fit() {
    var api = window.MobichatViewport;
    if (!api) return;
    var viewport = window.visualViewport;
    var next = api.computeViewportFit(window.innerHeight, viewport);
    var stage = api.stageHeight({
      width: window.innerWidth,
      appHeight: next.appHeight,
      keyboard: next.keyboard,
    });
    root.style.setProperty("--app-height", next.appHeight + "px");
    root.style.setProperty("--app-offset", next.appOffset + "px");
    root.style.setProperty("--stage-height", stage + "px");
    document.body.classList.toggle("keyboard", !!next.keyboard);
  }

  // Same-origin chat iframe: preview https image links under messages.
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
    (doc.head || doc.documentElement).appendChild(style);

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
    if (doc.body) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) decorate(node);
          });
        });
      });
      observer.observe(doc.body, { childList: true, subtree: true });
    }
  }

  function tryEnhanceChat() {
    try {
      var doc = chatFrame.contentDocument;
      if (doc && doc.readyState !== "loading") enhanceChatDoc(doc);
    } catch (err) {
      // Cross-origin in local previews that don't serve real embeds.
    }
  }

  // Owncast swaps /embed/video between OfflineEmbed and onlineContainer when
  // the stream starts/stops. Those trees are different — online needs flex
  // + height:0 player tricks; offline must NOT get those or it collapses.
  // Re-apply whenever the mode changes (don't leave live rules on offline).
  var videoFillMode = "";
  var videoObserver = null;

  var SHELL_CSS =
    "html,body,#__next,.video-embed{margin:0!important;height:100%!important;" +
    "max-height:100%!important;min-height:0!important;" +
    "overflow:hidden!important;background:#000;box-sizing:border-box!important}";

  var ONLINE_CSS =
    SHELL_CSS +
    "[class*='onlineContainer']{height:100%!important;max-height:100%!important;" +
    "min-height:0!important;display:flex!important;flex-direction:column!important;" +
    "box-sizing:border-box!important;overflow:hidden!important}" +
    "[class*='onlineContainer']>#player,#player{" +
    "flex:1 1 0!important;width:100%!important;height:0!important;" +
    "min-height:0!important;max-height:none!important;aspect-ratio:auto!important;" +
    "position:relative!important;overflow:hidden!important}" +
    "[class*='onlineContainer']>[class*='statusbar']," +
    "[class*='onlineContainer']>[class*='Statusbar']{" +
    "flex:0 0 auto!important;flex-shrink:0!important;height:auto!important;" +
    "max-height:none!important}" +
    "#player [class*='OwncastPlayer'],#player [class*='container']," +
    "#player .video-js,#player .video-js .vjs-tech,#player video{" +
    "position:absolute!important;inset:0!important;width:100%!important;" +
    "height:100%!important;max-height:none!important;min-height:0!important;" +
    "aspect-ratio:auto!important;max-width:none!important}" +
    "#player video,#player .vjs-tech{object-fit:contain!important}";

  var OFFLINE_CSS =
    SHELL_CSS +
    "[class*='offlineContainer']{height:100%!important;max-height:100%!important;" +
    "width:100%!important;max-width:100%!important;min-height:0!important;" +
    "padding:12px!important;box-sizing:border-box!important}";

  function enhanceVideoDoc(doc) {
    if (!doc) return;
    var online = !!doc.querySelector("[class*='onlineContainer']");
    var offline = !!doc.querySelector("[class*='offlineContainer']");
    var mode = online ? "online" : offline ? "offline" : "shell";
    if (mode === videoFillMode && doc.getElementById("mobichat-video-fill")) {
      return;
    }
    videoFillMode = mode;

    var style = doc.getElementById("mobichat-video-fill");
    if (!style) {
      style = doc.createElement("style");
      style.id = "mobichat-video-fill";
      (doc.head || doc.documentElement).appendChild(style);
    }
    style.textContent =
      mode === "online" ? ONLINE_CSS : mode === "offline" ? OFFLINE_CSS : SHELL_CSS;

    if (!videoObserver && doc.body) {
      videoObserver = new MutationObserver(function () {
        // Only re-run when online/offline/shell mode actually flips.
        // Clearing mode on every childList mutation rewrote CSS constantly
        // (status/timer React updates) without changing layout.
        var nextOnline = !!doc.querySelector("[class*='onlineContainer']");
        var nextOffline = !!doc.querySelector("[class*='offlineContainer']");
        var nextMode = nextOnline ? "online" : nextOffline ? "offline" : "shell";
        if (nextMode === videoFillMode && doc.getElementById("mobichat-video-fill")) {
          return;
        }
        enhanceVideoDoc(doc);
      });
      videoObserver.observe(doc.body, { childList: true, subtree: true });
    }
  }

  function disconnectVideoObserver() {
    if (videoObserver) {
      try {
        videoObserver.disconnect();
      } catch (err) {
        // Document may already be gone on iframe teardown.
      }
      videoObserver = null;
    }
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
  if (videoFrame) {
    videoFrame.addEventListener("load", function () {
      // Drop the prior document's observer before attaching to the new one.
      disconnectVideoObserver();
      videoFillMode = "";
      tryEnhanceVideo();
    });
  }
  // Keep watching — stream online/offline can flip after first paint.
  setInterval(function () {
    tryEnhanceChat();
    tryEnhanceVideo();
  }, 1000);

  fit();
  window.addEventListener("resize", fit);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", fit);
    visualViewport.addEventListener("scroll", fit);
  }
})();
