// Pull-to-refresh controller for the Daily Feed.
//
// The pill slides down from under the appbar while the finger pulls at the
// very top of the feed; releasing past the threshold fires onRefresh.
// Pure DOM + injected callbacks, so it runs in the browser and under node --test.
export function createPullRefresh({
  scroller,
  box,
  pill,
  icon,
  label,
  threshold = 70,
  maxPull = 140,
  doneDelay = 600,
  canPull = () => true,
  onRefresh = () => {},
} = {}) {
  let startY = null;
  let tracking = false;
  let ready = false;
  let busy = false;
  let cycle = 0;

  function paint(pull) {
    const progress = Math.min(Math.max(pull, 0) / threshold, 1);
    pill.style.transform = `translateY(${(-56 * (1 - progress)).toFixed(1)}px)`;
    pill.style.opacity = String(0.35 + 0.65 * progress);
    box.classList.toggle("armed", ready);
    icon.textContent = ready ? "↑" : "↓";
    label.textContent = ready ? "Release to refresh" : "Pull to refresh";
  }

  function reset() {
    startY = null;
    tracking = false;
    ready = false;
    box.classList.remove("armed", "loading", "done");
    pill.style.transform = "";
    pill.style.opacity = "0";
    icon.textContent = "↓";
    label.textContent = "Pull to refresh";
  }

  function finish() {
    busy = false;
    box.classList.remove("loading");
    box.classList.add("done");
    icon.textContent = "✓";
    label.textContent = "Fresh verses ✦";
    pill.style.transform = "translateY(0px)";
    pill.style.opacity = "1";
    const my = cycle;
    setTimeout(() => { if (my === cycle) reset(); }, doneDelay);
  }

  function onStart(e) {
    if (busy || !e.touches || e.touches.length !== 1) return;
    if (!canPull() || scroller.scrollTop > 0) return;
    cycle++;
    startY = e.touches[0].clientY;
    tracking = false;
    ready = false;
  }

  function onMove(e) {
    if (startY === null || busy) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0 || scroller.scrollTop > 0) {
      if (tracking) paint(0);
      tracking = dy > 0;
      ready = false;
      return;
    }
    tracking = true;
    if (e.cancelable !== false && typeof e.preventDefault === "function") e.preventDefault();
    const pull = Math.min(dy * 0.5, maxPull);
    ready = pull >= threshold;
    paint(pull);
  }

  function onEnd() {
    if (startY === null || busy) {
      startY = null;
      return;
    }
    const go = tracking && ready;
    startY = null;
    tracking = false;
    ready = false;
    if (!go) {
      reset();
      return;
    }
    busy = true;
    cycle++;
    box.classList.add("loading");
    box.classList.remove("armed");
    icon.textContent = "↻";
    label.textContent = "Refreshing…";
    pill.style.transform = "translateY(0px)";
    pill.style.opacity = "1";
    try {
      const out = onRefresh();
      if (out && typeof out.then === "function") out.then(finish, finish);
      else finish();
    } catch {
      finish();
    }
  }

  scroller.addEventListener("touchstart", onStart, { passive: true });
  scroller.addEventListener("touchmove", onMove, { passive: false });
  scroller.addEventListener("touchend", onEnd);
  scroller.addEventListener("touchcancel", reset);

  return { reset, get busy() { return busy; } };
}
