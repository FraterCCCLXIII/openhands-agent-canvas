import { useEffect, useRef, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
  /**
   * When `true` (default), `inView` latches to `true` the first time the
   * element is seen and the observer disconnects — ideal for one-shot lazy
   * work. When `false`, `inView` tracks visibility continuously (true on
   * enter, false on leave) — use this to start/stop ongoing work like a
   * websocket subscription as the element scrolls in and out.
   */
  once?: boolean;
}

/**
 * Reports whether the referenced element is in the viewport. Gates expensive
 * lazy work (data fetches, live subscriptions, heavy renders) to elements the
 * user actually scrolls to.
 *
 * Pass a stable (module-level or memoized) `options` object so the observer
 * isn't re-subscribed on every render.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options?: UseInViewOptions,
) {
  const once = options?.once ?? true;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      const isIntersecting = entries.some((entry) => entry.isIntersecting);
      if (once) {
        if (isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      } else {
        setInView(isIntersecting);
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, options]);

  return { ref, inView };
}
