// A short buzz on touch devices that support it (Android); a no-op elsewhere
export function haptic(ms = 8) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  try { navigator.vibrate(ms); } catch {}
}
