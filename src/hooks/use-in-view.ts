import { useEffect, useRef, useState } from "react";

/**
 * Reports whether the referenced element has entered the viewport. Once seen it
 * stays `true` and stops observing — handy for gating expensive lazy work (data
 * fetches, heavy renders) to elements the user actually scrolls to.
 *
 * Pass a stable (module-level or memoized) `options` object to avoid
 * re-subscribing on every render.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setInView(true);
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, options]);

  return { ref, inView };
}
