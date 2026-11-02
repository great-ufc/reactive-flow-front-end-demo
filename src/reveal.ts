import { prefersReducedMotion } from './dom';

// Fades each .reveal element in the first time it scrolls into view.
export function revealOnScroll(): void {
  const elements = document.querySelectorAll<HTMLElement>('.reveal');

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    return;
  }

  document.documentElement.classList.add('animate-reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );

  for (const element of elements) {
    observer.observe(element);
  }
}
