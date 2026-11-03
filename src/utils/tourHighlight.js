/**
 * LABWISE - Guided Tour Highlighting & Navigation Engine
 * Highlights specific interactive interface components during the 5-Minute Competition Walkthrough.
 */

let highlightTimer = null;

/**
 * Remove any active demo target highlights across the document
 */
export function clearDemoHighlight() {
  if (highlightTimer) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
  const elements = document.querySelectorAll('.demo-highlight-target');
  elements.forEach((el) => {
    el.classList.remove('demo-highlight-target');
  });
}

/**
 * Highlight a specific component by its data-demo-target attribute and smooth scroll into view
 * @param {string} targetId
 * @param {number} retries
 */
export function highlightDemoTarget(targetId, retries = 6) {
  clearDemoHighlight();
  if (!targetId) return;

  const attemptHighlight = (currentAttempt) => {
    const el = document.querySelector(`[data-demo-target="${targetId}"]`);
    if (el) {
      el.classList.add('demo-highlight-target');
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        // Fallback if browser doesn't support options
        el.scrollIntoView();
      }
    } else if (currentAttempt < retries) {
      highlightTimer = setTimeout(() => {
        attemptHighlight(currentAttempt + 1);
      }, 120);
    }
  };

  attemptHighlight(0);
}

