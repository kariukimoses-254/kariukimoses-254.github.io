// Emoji reactions for cards, stored in localStorage
(function () {
  const REACTIONS = ['👍', '❤️', '😮', '👎'];
  const storeKey = page => `rx_${location.pathname.replace(/\W/g, '_')}_${page}`;
  let counts = JSON.parse(localStorage.getItem(storeKey('counts')) || '{}');

  function show(el, key) {
    REACTIONS.forEach(r => {
      el.querySelector(`[data-rx="${r}"] b`).textContent = counts[`${key}_${r}`] || 0;
    });
  }

  document.querySelectorAll('.doctor-card, .stat-card').forEach((card, i) => {
    const key = i;
    const bar = document.createElement('div');
    bar.className = 'reactions';
    bar.innerHTML = REACTIONS.map(r =>
      `<button class="rx" data-rx="${r}">${r} <b>0</b></button>`).join('');
    card.appendChild(bar);

    bar.querySelectorAll('.rx').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const r = btn.dataset.rx;
        counts[`${key}_${r}`] = (counts[`${key}_${r}`] || 0) + 1;
        localStorage.setItem(storeKey('counts'), JSON.stringify(counts));
        show(bar, key);
        btn.classList.add('pop');
        setTimeout(() => btn.classList.remove('pop'), 300);
      });
    });
    show(bar, key);
  });
})();
