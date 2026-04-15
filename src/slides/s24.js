/* S24: Appendices Overview — 5 appendix cards (A-E) with badges
   Passive content, no charts. */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createAppendixCard(container, app, index) {
    var card = document.createElement('div');
    card.className = 'metric-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', I18N.t('s24.apps.' + index + '.name'));
    card.style.cssText = 'cursor:default;display:flex;flex-direction:column;gap:12px;';

    // Appendix ID badge (e.g. "A", "B", etc.)
    var badge = C.Badge(I18N.t('s24.apps.' + index + '.id') || app.id, 'gold');
    badge.style.alignSelf = 'flex-start';
    card.appendChild(badge);

    // Appendix name
    var name = document.createElement('h3');
    name.style.cssText = 'font-size:18px;font-weight:700;color:var(--text-primary);margin:0;';
    name.textContent = I18N.t('s24.apps.' + index + '.name');
    card.appendChild(name);

    // Description
    var desc = document.createElement('p');
    desc.style.cssText = 'font-size:14px;color:var(--text-secondary);line-height:1.6;margin:0;flex:1;';
    desc.textContent = I18N.t('s24.apps.' + index + '.desc');
    card.appendChild(desc);

    // Hover effect
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

  NAV.registerSlide(24, {
    enter: function() {
      var root = document.getElementById('slide-24');
      var data = TS.slide(24);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s24-title');
      var subtitleEl = document.getElementById('s24-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s24.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s24.subtitle');

      // Appendix cards
      var cardsContainer = document.getElementById('s24-cards');
      if (cardsContainer) {
        cardsContainer.innerHTML = '';
        var apps = data.apps || [];
        for (var i = 0; i < apps.length; i++) {
          var card = createAppendixCard(cardsContainer, apps[i], i);
          ANIM.from(card, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            delay: i * 0.12,
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
