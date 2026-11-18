// Inlined into the Owncast viewer. On a narrow screen, the floating
// Chat button opens /plugins/mobichat/ instead of the modal.
(function () {
  var STACKED = "/plugins/mobichat/";
  var NARROW = 768;

  if (window.top !== window) return;
  if (location.pathname.indexOf("/plugins/mobichat") === 0) return;
  if (location.pathname.indexOf("/admin") === 0) return;

  function narrow() {
    return window.innerWidth <= NARROW;
  }

  function label(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function findButton() {
    var byClass = document.querySelector(
      '[class*="floatingMobileChatModalButton"]',
    );
    if (byClass) return byClass;

    var buttons = document.querySelectorAll("button");
    var fallback = null;
    for (var i = 0; i < buttons.length; i++) {
      var el = buttons[i];
      if (el.getAttribute("data-mobichat") === "skip") continue;
      var style = window.getComputedStyle(el);
      if (style.position !== "fixed") continue;
      var rect = el.getBoundingClientRect();
      var chatSized =
        rect.width >= 72 &&
        rect.width <= 160 &&
        rect.height >= 28 &&
        rect.height <= 64;
      var nearBottom =
        rect.bottom >= window.innerHeight - 90 &&
        rect.top > window.innerHeight * 0.45;
      var nearRight = rect.right >= window.innerWidth - 48;
      if (!chatSized || !nearBottom || !nearRight) continue;
      if (label(el) === "chat") return el;
      fallback = el;
    }
    return fallback;
  }

  function openStacked(event) {
    if (!narrow()) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    location.assign(STACKED);
  }

  function arm(button) {
    if (button.getAttribute("data-mobichat") === "armed") return;
    button.setAttribute("data-mobichat", "armed");
    button.setAttribute("title", "Open chat under the video");
    button.addEventListener("click", openStacked, true);
  }

  var scheduled = false;
  function sync() {
    scheduled = false;
    if (!narrow()) return;
    var button = findButton();
    if (button) arm(button);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  if (document.body) {
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
  window.addEventListener("resize", schedule);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }
})();
