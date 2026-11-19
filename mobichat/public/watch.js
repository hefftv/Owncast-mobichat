(function () {
  var root = document.documentElement;
  var chatFrame = document.getElementById("chat-frame");
  var videoFrame = document.getElementById("video-frame");
  var muteBtn = document.getElementById("mute");
  var fullscreenBtn = document.getElementById("fullscreen");
  var muted = true;

  function fit() {
    var viewport = window.visualViewport;
    var height = viewport ? viewport.height : window.innerHeight;
    var top = viewport ? viewport.offsetTop : 0;
    var appHeight = Math.round(height);
    root.style.setProperty("--app-height", appHeight + "px");
    root.style.setProperty("--app-top", Math.round(top) + "px");

    // Pixel stage height so Owncast's live embed (100vh-based) has a real box.
    // Prefer ~16:9 from width, but leave room for chat above the dock.
    var stageWidth = Math.round(window.innerWidth || 0);
    var ideal = Math.round((stageWidth * 9) / 16);
    var chromeH = 44;
    var maxStage = Math.round(appHeight * 0.48);
    var stageHeight = Math.max(140, Math.min(ideal, maxStage || ideal));
    // Keep chat usable when the keyboard is up.
    var keyboardH = Math.max(96, Math.min(140, Math.round(appHeight * 0.22)));
    root.style.setProperty("--stage-height", stageHeight + "px");
    root.style.setProperty("--stage-height-keyboard", keyboardH + "px");
    root.style.setProperty("--chrome-height", chromeH + "px");

    var keyboard = viewport && window.innerHeight - viewport.height > 140;
    document.body.classList.toggle("keyboard", !!keyboard);
    if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
  }

  function videoDoc() {
    try {
      return videoFrame && videoFrame.contentDocument;
    } catch (err) {
      return null;
    }
  }

  function videoEl() {
    var doc = videoDoc();
    if (!doc) return null;
    return doc.querySelector("video") || doc.querySelector(".vjs-tech");
  }

  function setMuteLabel() {
    if (!muteBtn) return;
    muteBtn.textContent = muted ? "Unmute" : "Mute";
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  }

  function applyMute() {
    var el = videoEl();
    if (el) {
      el.muted = muted;
      try {
        if (!muted) {
          var play = el.play();
          if (play && play.catch) play.catch(function () {});
        }
      } catch (err) {
        // Autoplay policies can still block; label stays accurate.
      }
    }
    setMuteLabel();
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", function () {
      muted = !muted;
      applyMute();
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function () {
      var stage = document.querySelector(".stage");
      var el = videoEl() || stage;
      if (!el) return;
      var req =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.webkitEnterFullscreen;
      if (req) {
        try {
          req.call(el);
        } catch (err) {
          // Some iOS builds only fullscreen the <video> itself.
          var v = videoEl();
          if (v && v.webkitEnterFullscreen) {
            try {
              v.webkitEnterFullscreen();
            } catch (e2) {}
          }
        }
      }
    });
  }

  // Same-origin chat iframe: preview https image links under messages.
  var IMAGE_RE =
    /^https:\/\/[^\s<>"']+\.(?:gif|png|jpe?g|webp)(?:\?[^\s<>"']*)?$/i;

  function enhanceChatDoc(doc) {
    if (!doc || doc.getElementById("mobichat-preview-style")) return;

    var style = doc.createElement("style");
    style.id = "mobichat-preview-style";
    style.textContent =
      "html,body{height:100%;margin:0;overflow:hidden;background:transparent}" +
      /* Owncast chat embed: keep composer reachable inside our bounded pane. */
      "body,#__next,main,[class*='chat'],[class*='Chat']{" +
      "height:100%!important;max-height:100%!important;min-height:0!important}" +
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

  // Live /embed/video uses 100vh; remap to the iframe box and hide Owncast's
  // own status strip so our control-bar is the hard-mounted control surface.
  function enhanceVideoDoc(doc) {
    if (!doc || !doc.body) return;

    // Owncast puts <meta viewport> in the embed <head>. Move it into <body>
    // so Safari sizes the player against the iframe body box, not a head-only
    // viewport that collapses the live stream to a thin top strip.
    var headViewport = doc.head && doc.head.querySelector('meta[name="viewport"]');
    if (headViewport) {
      doc.body.insertBefore(headViewport, doc.body.firstChild);
    }

    var style = doc.getElementById("mobichat-video-fill");
    if (!style) {
      style = doc.createElement("style");
      style.id = "mobichat-video-fill";
      doc.body.appendChild(style);
    }
    style.textContent =
      "html,body{margin:0!important;height:100%!important;max-height:100%!important;" +
      "overflow:hidden!important;background:#000}" +
      "[class*='onlineContainer']{height:100%!important;max-height:100%!important;" +
      "min-height:0!important;display:flex!important;flex-direction:column!important;" +
      "box-sizing:border-box!important}" +
      "[class*='onlineContainer']>[class*='status']," +
      "[class*='onlineContainer']>[class*='Status']," +
      "[class*='statusbar'],[class*='Statusbar'],[class*='status-bar']{" +
      "display:none!important;height:0!important;min-height:0!important;" +
      "padding:0!important;margin:0!important;overflow:hidden!important}" +
      "#player{flex:1 1 auto!important;width:100%!important;height:100%!important;" +
      "min-height:0!important;max-height:none!important}" +
      "#player .video-js,#player .video-js .vjs-tech,#player video{" +
      "width:100%!important;height:100%!important;max-height:none!important;" +
      "object-fit:contain!important}";
    applyMute();
  }

  function tryEnhanceVideo() {
    try {
      var doc = videoDoc();
      if (doc && doc.readyState !== "loading") enhanceVideoDoc(doc);
    } catch (err) {
      // Cross-origin in local previews that don't serve real embeds.
    }
  }

  chatFrame.addEventListener("load", tryEnhanceChat);
  if (videoFrame) videoFrame.addEventListener("load", tryEnhanceVideo);
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    tryEnhanceChat();
    tryEnhanceVideo();
    if (tries >= 24) clearInterval(timer);
  }, 500);

  setMuteLabel();
  fit();
  window.addEventListener("resize", fit);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", fit);
    visualViewport.addEventListener("scroll", fit);
  }
})();
