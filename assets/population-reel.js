/* Decorative entrance only; never a live population counter. Updated 2026-11-02. */
(() => {
  const root = document.getElementById('population-reel');
  if (!root) return;
  const host = root.querySelector('.population-digits');
  const value = root.dataset.population;
  if (!host || !/^\d+$/.test(value)) return;
  const formatted = Number(value).toLocaleString('en-US');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !Element.prototype.animate) return;
  let started = false;
  const animations = [];
  const settle = () => {
    animations.forEach(animation => animation.cancel());
    host.textContent = formatted;
    root.classList.add('is-settled');
  };
  const start = () => {
    if (started) return;
    started = true;
    if (reduced.matches) return;
    host.textContent = '';
    let digitIndex = 0;
    const finishes = [];
    for (const char of formatted) {
      if (char === ',') {
        const comma = document.createElement('span');
        comma.className = 'population-comma';
        comma.textContent = ',';
        host.append(comma);
        continue;
      }
      const slot = document.createElement('span');
      slot.className = 'population-slot';
      const strip = document.createElement('span');
      strip.className = 'population-strip';
      const target = 30 + Number(char);
      for (let step = 0; step <= target; step++) {
        const cell = document.createElement('span');
        cell.textContent = String(step % 10);
        strip.append(cell);
      }
      slot.append(strip);
      host.append(slot);
      const end = 'translateY(-' + target * 1.25 + 'em)';
      strip.style.transform = end;
      const animation = strip.animate(
        [{ transform: 'translateY(0)' }, { transform: end }],
        { duration: 1800 + digitIndex * 90, delay: digitIndex * 35,
          easing: 'cubic-bezier(.15,.65,.2,1)', fill: 'none' }
      );
      animations.push(animation);
      finishes.push(animation.finished.catch(() => {}));
      digitIndex++;
    }
    Promise.all(finishes).then(() => root.classList.add('is-settled'));
  };
  reduced.addEventListener('change', event => { if (event.matches) settle(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, { threshold: .25 });
    observer.observe(root);
  } else start();
})();
