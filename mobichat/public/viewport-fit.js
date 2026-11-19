/* Shared viewport / keyboard layout math for the stacked watch page.
 * Loaded by public/watch.js in the browser and by __tests__/keyboard-layout.test.js
 * under Node (CommonJS). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MobichatViewport = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  // Owncast chat composer + a few message rows need roughly this much pane.
  var MIN_CHAT_WITH_KEYBOARD = 160;
  var KEYBOARD_THRESHOLD = 140;

  function computeViewportFit(innerHeight, visualViewport) {
    var height = visualViewport ? visualViewport.height : innerHeight;
    var offset = visualViewport ? visualViewport.offsetTop : 0;
    var keyboard = !!(
      visualViewport &&
      innerHeight - visualViewport.height > KEYBOARD_THRESHOLD
    );
    return {
      appHeight: height,
      appOffset: offset,
      keyboard: keyboard,
    };
  }

  function stageHeight(opts) {
    var width = opts.width;
    var appHeight = opts.appHeight;
    var keyboard = !!opts.keyboard;
    if (!keyboard) {
      return Math.min((width * 9) / 16, appHeight * 0.52);
    }
    // Shrink the stream, but never starve the chat pane (landscape + keyboard).
    var preferred = Math.min(appHeight * 0.2, 120);
    var maxStage = Math.max(0, appHeight - MIN_CHAT_WITH_KEYBOARD);
    return Math.min(preferred, maxStage);
  }

  function chatPaneHeight(opts) {
    return Math.max(0, opts.appHeight - stageHeight(opts));
  }

  return {
    KEYBOARD_THRESHOLD: KEYBOARD_THRESHOLD,
    MIN_CHAT_WITH_KEYBOARD: MIN_CHAT_WITH_KEYBOARD,
    computeViewportFit: computeViewportFit,
    stageHeight: stageHeight,
    chatPaneHeight: chatPaneHeight,
  };
});
