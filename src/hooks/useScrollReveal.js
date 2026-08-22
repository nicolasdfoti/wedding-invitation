import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible };
}

export function useScrollRevealMultiple(count, options = {}) {
  const refs = useRef(new Array(count).fill(null));
  const [visibleIndices, setVisibleIndices] = useState(new Set());

  useEffect(() => {
    const observers = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleIndices(prev => new Set([...prev, index]));
            if (options.triggerOnce !== false) {
              observer.unobserve(element);
            }
          } else if (options.triggerOnce === false) {
            setVisibleIndices(prev => {
              const next = new Set(prev);
              next.delete(index);
              return next;
            });
          }
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '0px 0px -50px 0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [count, options.threshold, options.rootMargin, options.triggerOnce]);

  return { refs, visibleIndices };
}