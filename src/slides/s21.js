/* S21: Governance — Committee cards (2x2 grid) + Reporting list
   Passive content, no charts. */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createCommitteeCard(container, committee, index) {
    var card = document.createElement('div');
    card.className = 'metric-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', I18N.t('s21.committees.' + index + '.name'));
    card.style.cssText = 'cursor:default;display:flex;flex-direction:column;gap:10px;';

    // Committee name
    var name = document.createElement('h3');
    name.style.cssText = 'font-size:18px;font-weight:700;color:var(--gold);margin:0;';
    name.textContent = I18N.t('s21.committees.' + index + '.name');
    card.appendChild(name);

    // Composition
    var comp = document.createElement('p');
    comp.style.cssText = 'font-size:13px;color:var(--text-secondary);line-height:1.5;margin:0;';
    comp.textContent = I18N.t('s21.committees.' + index + '.composition');
    card.appendChild(comp);

    // Meeting frequency
    var meets = document.createElement('p');
    meets.style.cssText = 'font-size:13px;color:var(--text-secondary);line-height:1.5;margin:0;';
    meets.textContent = I18N.t('s21.committees.' + index + '.meets');
    card.appendChild(meets);

    // Scope
    var scope = document.createElement('p');
    scope.style.cssText = 'font-size:14px;color:var(--text-primary);line-height:1.6;margin:0;flex:1;';
    scope.textContent = I18N.t('s21.committees.' + index + '.scope');
    card.appendChild(scope);

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

  NAV.registerSlide(21, {
    enter: function() {
      var root = document.getElementById('slide-21');
      var data = TS.slide(21);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s21-title');
      var subtitleEl = document.getElementById('s21-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s21.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s21.subtitle');

      // Committee cards
      var grid = document.getElementById('s21-committees');
      if (grid) {
        grid.innerHTML = '';
        var committees = data.committees || [];
        for (var i = 0; i < committees.length; i++) {
          var card = createCommitteeCard(grid, committees[i], i);
          ANIM.from(card, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            delay: i * 0.12,
            ease: 'power2.out'
          });
        }
      }

      // Reporting list
      var reportingContainer = document.getElementById('s21-reporting');
      if (reportingContainer) {
        reportingContainer.innerHTML = '';
        var reporting = data.reporting || [];
        var localizedReporting = [];
        for (var r = 0; r < reporting.length; r++) {
          localizedReporting.push(I18N.t('s21.reporting.' + r));
        }
        var list = C.PointsList(reportingContainer, localizedReporting);

        // Animate list items
        var items = list.querySelectorAll('li');
        for (var j = 0; j < items.length; j++) {
          ANIM.from(items[j], {
            opacity: 0,
            x: -20,
            duration: 0.5,
            delay: 0.5 + j * 0.08,
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
