// Wait for DOM to be ready
function initCarousel() {
  // Uhr – Status-Badge
  const hourEl = document.getElementById('hour');
  const fmt = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2,'0');
    const m = String(d.getMinutes()).padStart(2,'0');
    return `${h}:${m}`;
  };
  if (hourEl) { hourEl.textContent = fmt(); setInterval(()=>hourEl.textContent = fmt(), 30000); }

  // ===== 3D Deck-Logik =====
  const deck = document.getElementById('deck');
  if (!deck) {
    console.error('Deck not found! Carousel will not work.');
    return;
  }
  const cards = Array.from(deck.querySelectorAll('.product-card'));

  // Deck-Höhe an höchste Karte anpassen
  function setDeckHeight(){
    const h = Math.max(...cards.map(c => c.offsetHeight));
    deck.style.height = h + 'px';
  }
  setDeckHeight();
  window.addEventListener('resize', setDeckHeight);

  // Reihenfolge der Karten (Indexliste); 0 = vorn
  let order = cards.map((_, i) => i);

  function applyPositions(){
    // Positions-/Anim-Klassen entfernen
    cards.forEach(c => {
      c.classList.forEach(k => {
        if (/^card-pos-/.test(k) || k === 'deal-in') c.classList.remove(k);
      });
    });

    // neue Positionen zuweisen
    order.forEach((cardIndex, posIndex) => {
      const card = cards[cardIndex];
      const pos = Math.min(posIndex, 5); // 6 sichtbare Zustände
      card.classList.add(`card-pos-${pos}`);
      card.setAttribute('aria-label', `Produktkarte ${cardIndex+1}${pos===0?' (vorn)':''}`);
    });

    // Controls auf vorderer Karte aktiv halten
    bindControlsToFront();
  }

  // Nach rechts: vordere Karte nach hinten
  function next(){
    const first = order.shift();
    order.push(first);
    const front = cards[order[0]];
    front.classList.add('deal-in');
    applyPositions();
    setTimeout(()=>front.classList.remove('deal-in'), 420);
  }

  // Nach links: hinterste nach vorn
  function prev(){
    const last = order.pop();
    order.unshift(last);
    const front = cards[order[0]];
    front.classList.add('deal-in');
    applyPositions();
    setTimeout(()=>front.classList.remove('deal-in'), 420);
  }

  // Mengen-/Preis-Binding für die vorderste Karte
  const UNIT_FALLBACK = 24;
  function bindControlsToFront(){
    const front = cards[order[0]];
    if (!front) return;

    const minus = front.querySelector('.qtty .minus');
    const plus  = front.querySelector('.qtty .plus');
    const qttyEl  = front.querySelector('.qtty-val, #qtty');      // unterstützt dein ursprüngliches ID-Feld
    const priceEl = front.querySelector('.price-val, #price');    // unterstützt dein ursprüngliches ID-Feld

    const unit = Number(priceEl?.textContent || UNIT_FALLBACK);

    function update(delta){
      const curr = Number(qttyEl.textContent || 1);
      const next = Math.max(1, curr + delta);
      qttyEl.textContent = String(next);
      priceEl.textContent = (unit * next).toFixed(0);
    }

    // Eventlistener sicher erneuern
    const minusClone = minus?.cloneNode(true);
    const plusClone  = plus?.cloneNode(true);
    if (minus && minusClone) minus.replaceWith(minusClone);
    if (plus && plusClone)   plus.replaceWith(plusClone);

    minusClone?.addEventListener('click', ()=> update(-1));
    plusClone?.addEventListener('click',  ()=> update(+1));
  }

  applyPositions();

  // Buttons
  document.querySelector('.nav.next')?.addEventListener('click', next);
  document.querySelector('.nav.prev')?.addEventListener('click', prev);

  // Keyboard
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // Pointer/Swipe
  let startX = 0, dragging = false;
  deck.addEventListener('pointerdown', (e)=>{
    dragging = true;
    startX = e.clientX;
    deck.setPointerCapture(e.pointerId);
  });
  deck.addEventListener('pointerup', (e)=>{
    if(!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    const TH = 40;
    if (dx > TH) prev();
    else if (dx < -TH) next();
  });
  deck.addEventListener('pointercancel', ()=> dragging = false);
}

// Call initCarousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}