/**
 * Keyboard open must leave a scrollable chat pane in portrait and landscape.
 * The composer lives inside the chat iframe; we only size the outer pane.
 */
const assert = require("assert");
const {
  KEYBOARD_THRESHOLD,
  MIN_CHAT_WITH_KEYBOARD,
  computeViewportFit,
  stageHeight,
  chatPaneHeight,
} = require("../public/viewport-fit.js");

function scenario(name, run) {
  try {
    run();
    console.log("ok - " + name);
  } catch (err) {
    console.error("not ok - " + name);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

function assertChatScrollable(label, opts) {
  const chat = chatPaneHeight(opts);
  const stage = stageHeight(opts);
  assert.ok(
    chat >= MIN_CHAT_WITH_KEYBOARD,
    `${label}: chat pane ${chat.toFixed(1)}px < min ${MIN_CHAT_WITH_KEYBOARD}px (stage ${stage.toFixed(1)}px, app ${opts.appHeight}px)`
  );
  assert.ok(stage >= 0, `${label}: stage height must be non-negative`);
  assert.ok(
    stage + chat <= opts.appHeight + 0.01,
    `${label}: stage+chat must fit app height`
  );
}

// iPhone-class CSS pixels
const PORTRAIT = { width: 390, innerHeight: 844 };
const LANDSCAPE = { width: 844, innerHeight: 390 };

scenario("detects keyboard from visualViewport shrink", () => {
  const closed = computeViewportFit(PORTRAIT.innerHeight, {
    height: PORTRAIT.innerHeight,
    offsetTop: 0,
  });
  assert.strictEqual(closed.keyboard, false);

  const open = computeViewportFit(PORTRAIT.innerHeight, {
    height: PORTRAIT.innerHeight - KEYBOARD_THRESHOLD - 20,
    offsetTop: 0,
  });
  assert.strictEqual(open.keyboard, true);
  assert.strictEqual(open.appHeight, PORTRAIT.innerHeight - KEYBOARD_THRESHOLD - 20);
});

scenario("portrait + keyboard keeps a scrollable chat pane", () => {
  // Typical software keyboard leaves ~500–560px of visual viewport.
  const fit = computeViewportFit(PORTRAIT.innerHeight, {
    height: 520,
    offsetTop: 0,
  });
  assert.strictEqual(fit.keyboard, true);
  assertChatScrollable("portrait keyboard", {
    width: PORTRAIT.width,
    appHeight: fit.appHeight,
    keyboard: true,
  });
});

scenario("landscape + keyboard keeps a scrollable chat pane", () => {
  // Landscape is the tight case: short visual viewport + wide stage temptation.
  const fit = computeViewportFit(LANDSCAPE.innerHeight, {
    height: 220,
    offsetTop: 0,
  });
  assert.strictEqual(fit.keyboard, true);
  assertChatScrollable("landscape keyboard", {
    width: LANDSCAPE.width,
    appHeight: fit.appHeight,
    keyboard: true,
  });
});

scenario("landscape + large keyboard still prefers chat over stage", () => {
  // Aggressive keyboard / browser chrome leaving only ~180px.
  const fit = computeViewportFit(LANDSCAPE.innerHeight, {
    height: 180,
    offsetTop: 0,
  });
  assert.strictEqual(fit.keyboard, true);
  const stage = stageHeight({
    width: LANDSCAPE.width,
    appHeight: fit.appHeight,
    keyboard: true,
  });
  const chat = chatPaneHeight({
    width: LANDSCAPE.width,
    appHeight: fit.appHeight,
    keyboard: true,
  });
  assert.ok(
    chat >= stage,
    `landscape tight: chat (${chat}) should get at least as much as stage (${stage})`
  );
  assertChatScrollable("landscape large keyboard", {
    width: LANDSCAPE.width,
    appHeight: fit.appHeight,
    keyboard: true,
  });
});

scenario("without keyboard, portrait stage stays near 16:9 cap", () => {
  const fit = computeViewportFit(PORTRAIT.innerHeight, {
    height: PORTRAIT.innerHeight,
    offsetTop: 0,
  });
  assert.strictEqual(fit.keyboard, false);
  const stage = stageHeight({
    width: PORTRAIT.width,
    appHeight: fit.appHeight,
    keyboard: false,
  });
  const expected = Math.min((PORTRAIT.width * 9) / 16, PORTRAIT.innerHeight * 0.52);
  assert.ok(Math.abs(stage - expected) < 0.01);
  assert.ok(chatPaneHeight({
    width: PORTRAIT.width,
    appHeight: fit.appHeight,
    keyboard: false,
  }) > MIN_CHAT_WITH_KEYBOARD);
});

if (!process.exitCode) {
  console.log("keyboard-layout: all scenarios passed");
}
