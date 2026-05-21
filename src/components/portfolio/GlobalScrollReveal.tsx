import React, { useEffect, useRef } from 'react';
import { useCMSData } from '@/context/CMSContext';

/**
 * GlobalScrollReveal
 * 
 * Automatically detects text elements and applies a scroll-in animation
 * using Intersection Observer. Elements enter from different directions
 * (left, right, bottom) for a dynamic feel.
 */
const GlobalScrollReveal = () => {
  const data = useCMSData(d => d); // Re-run when CMS data changes
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 1. Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 2. Define the animation logic
    const setupAnimations = () => {
      // Find all text-heavy elements, excluding those marked with 'no-reveal' or 'gradient-text'
      // Optimized: Excluded 'p' and 'li' to prevent observing thousands of elements which causes massive scroll lag
      const elements = document.querySelectorAll('h1:not(.no-reveal), h2:not(.no-reveal), h3:not(.no-reveal), h4:not(.no-reveal), h5:not(.no-reveal), h6:not(.no-reveal), .reveal-block');
      
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.dataset.revealInitialized) return;

        // Unified bottom-to-top direction for a cleaner aesthetic
        htmlEl.style.opacity = '0';
        htmlEl.style.transition = 'none';
        htmlEl.style.transform = 'translateY(15px)';
        htmlEl.dataset.revealInitialized = 'true';
      });

      // 3. Create Intersection Observer
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            requestAnimationFrame(() => {
              target.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
              target.style.opacity = '1';
              target.style.transform = 'translateY(0)';
            });

            observerRef.current?.unobserve(target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      });

      // 4. Start observing
      elements.forEach(el => observerRef.current?.observe(el));
    };

    // Run setup after a short timeout to ensure DOM is ready
    const timer = setTimeout(setupAnimations, 100);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [data]); // Re-run when content changes (important for CMS)

  return null; // Side-effect only component
};

export default React.memo(GlobalScrollReveal);
