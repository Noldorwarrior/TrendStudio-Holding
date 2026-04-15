/* S03: Investment Thesis — 4 thesis cards with hover effects
   Passive content, no chart */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createThesisCard(container, thesis, index) {
    var card = document.createElement('div');
    card.className = 'metric-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', thesis.id + ': ' + I18N.t('s03.theses.' + index + '.title'));
    card.style.cssText = 'cursor:default;display:flex;flex-direction:column;gap:12px;';

    // Thesis ID badge
    var idBadge = C.Badge(thesis.id, 'gold');
    idBadge.style.alignSelf = 'flex-start';
    card.appendChild(idBadge);

    // Title
    var title = document.createElement('h3');
    title.style.cssText = 'font-size:22px;font-weight:700;color:var(--text-primary);margin:0;';
    title.textContent = I18N.t('s03.theses.' + index + '.title');
    card.appendChild(title);

    // Short description
    var desc = document.createElement('p');
    desc.style.cssText = 'font-size:14px;color:var(--text-secondary);line-height:1.6;margin:0;';
    desc.textContent = I18N.t('s03.theses.' + index + '.short');
    card.appendChild(desc);

    // Hover effect — gold glow
    card.addEventListener('mouseenter', function() {
      card.style.borderColor = 'rgba(201,169,97,0.3)';
      card.style.boxShadow = '0 0 30px rgba(201,169,97,0.15)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.borderColor = '';
      card.style.boxShadow = '';
    });

    if (container) container.appendChild(card);
    return card;
  }

  NAV.registerSlide(3, {
    enter: function() {
      var slide = TS.slide(3);
      if (!slide) return;

      // Title + subtitle
      var titleEl = document.getElementById('s03-title');
      var subtitleEl = document.getElementById('s03-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s03.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s03.subtitle');

      // Render 4 thesis cards
      var grid = document.getElementById('s03-theses');
      if (grid) {
        grid.innerHTML = '';
        var theses = slide.theses || [];
        for (var i = 0; i < theses.length; i++) {
          var card = createThesisCard(grid, theses[i], i);
          // Staggered entrance animation
          ANIM.from(card, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            delay: i * 0.15,
            ease: 'power2.out'
          });
        }
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
