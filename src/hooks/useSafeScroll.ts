'use client';

/**
 * useSafeScroll — Safe wrapper around Framer Motion's useScroll.
 *
 * PROBLEM: Framer Motion throws "Target ref is defined but not hydrated"
 * when useScroll receives a ref whose .current is null or whose DOM node
 * does not yet exist. This happens when:
 *   1. The component renders null conditionally (ref never attaches).
 *   2. useScroll is called before the component is mounted/hydrated.
 *   3. A ref is passed to useScroll immediately, before React commits it.
 *
 * SOLUTION:
 *   - Accept a RefObject<HTMLElement>.
 *   - Track whether the ref's node is actually attached (isMounted state).
 *   - Only pass the ref to useScroll when isMounted is true.
 *   - Return safe no-op MotionValues while mounting.
 *
 * USAGE:
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { scrollYProgress } = useSafeScroll({
 *     target: containerRef,
 *     offset: ['start end', 'end start'],
 *   });
 *   // Always attach ref to the element you want to track:
 *   return <div ref={containerRef}>...</div>;
 */

import { useRef, useState, useEffect, RefObject } from 'react';
import { useScroll, useMotionValue, MotionValue, type UseScrollOptions } from 'framer-motion';

export interface SafeScrollOptions {
  target: RefObject<HTMLElement | null>;
  /** Same offset definition as Framer Motion's useScroll offset. */
  offset?: UseScrollOptions['offset'];
  container?: RefObject<HTMLElement | null>;
}

export interface SafeScrollResult {
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
  scrollY: MotionValue<number>;
  scrollX: MotionValue<number>;
  /** True once the target DOM node is mounted and Motion is subscribed. */
  isReady: boolean;
}

/**
 * Internal component that actually calls useScroll once the target is ready.
 * We separate this so the hook can conditionally call useScroll only after mount.
 */
function useScrollWhenReady(
  target: RefObject<HTMLElement | null>,
  offset: UseScrollOptions['offset'],
  enabled: boolean
) {
  // Always call useScroll — pass undefined target when not ready so Motion
  // tracks the window instead of throwing. We override the values below.
  const result = useScroll({
    target: enabled ? target : undefined,
    offset,
  });
  return result;
}

export function useSafeScroll({
  target,
  offset = ['start end', 'end start'] as UseScrollOptions['offset'],
}: SafeScrollOptions): SafeScrollResult {
  const [isReady, setIsReady] = useState(false);

  // Fallback no-op MotionValues returned before ready
  const fallbackScrollY = useMotionValue(0);
  const fallbackScrollX = useMotionValue(0);
  const fallbackScrollYProgress = useMotionValue(0);
  const fallbackScrollXProgress = useMotionValue(0);

  useEffect(() => {
    // After mount: verify the ref's DOM node actually exists
    if (!target.current) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[useSafeScroll] Ref is null after mount. Make sure the ref is ' +
          'attached to an HTMLElement that is always rendered (not behind ' +
          'a conditional return null).'
        );
      }
      return;
    }
    setIsReady(true);
  }, [target]);

  // Observe ref node attachment/detachment via ResizeObserver as a guard
  useEffect(() => {
    if (!target.current) return;

    const node = target.current;
    const observer = new ResizeObserver(() => {
      // If the node is still in the document, keep ready
      if (!document.contains(node)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useSafeScroll] Target node was detached from the DOM. Resetting scroll observer.');
        }
        setIsReady(false);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, isReady]);

  const { scrollY, scrollX, scrollYProgress, scrollXProgress } = useScrollWhenReady(
    target,
    offset,
    isReady
  );

  return {
    scrollY: isReady ? scrollY : fallbackScrollY,
    scrollX: isReady ? scrollX : fallbackScrollX,
    scrollYProgress: isReady ? scrollYProgress : fallbackScrollYProgress,
    scrollXProgress: isReady ? scrollXProgress : fallbackScrollXProgress,
    isReady,
  };
}
