import { useCallback } from "react";

export function useSliderDrag(onChange) {
  return useCallback(
    (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const bar = e.currentTarget;
      const update = (ev) => {
        const rect = bar.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        onChange(Math.min(1, Math.max(0, x / rect.width)));
      };
      update(e);
      const end = () => {
        bar.removeEventListener("pointermove", update);
        bar.removeEventListener("pointerup", end);
        bar.removeEventListener("pointercancel", end);
      };
      bar.addEventListener("pointermove", update);
      bar.addEventListener("pointerup", end);
      bar.addEventListener("pointercancel", end);
      bar.setPointerCapture(e.pointerId);
    },
    [onChange]
  );
}
