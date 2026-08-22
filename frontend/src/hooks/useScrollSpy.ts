import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: string[], isActive: boolean): string {
  const [activeId, setActiveId] = useState('');
  const idsKey = sectionIds.join(',');

  useEffect(() => {
    if (!isActive) {
      setActiveId('');
      return;
    }

    let observer: IntersectionObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 25;

    function trySetupObserver() {
      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      attempts++;

      if (elements.length < sectionIds.length && attempts < maxAttempts) {
        retryTimer = setTimeout(trySetupObserver, 200);
        return;
      }

      if (elements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);

          if (visibleEntries.length > 0) {
            const topMost = visibleEntries.reduce((closest, entry) =>
              entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest,
            );
            setActiveId(topMost.target.id);
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: 0,
        },
      );

      elements.forEach((el) => observer!.observe(el));
    }

    trySetupObserver();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, isActive]);

  return activeId;
}