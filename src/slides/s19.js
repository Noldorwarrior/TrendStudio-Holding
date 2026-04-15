/* S19: Risk Heatmap — Passive Content
   Summary badges (critical/high/medium/low counts) + 5 category cards. */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(19, {
    enter: function() {
      var root = document.getElementById('slide-19');
      var data = TS.slide(19);
      var chartData = TS.chartData('s20_top_risks');
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s19-title');
      var subtitleEl = document.getElementById('s19-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s19.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s19.subtitle');

      // Summary badges
      var badgesContainer = document.getElementById('s19-badges');
      if (badgesContainer && chartData && chartData.heatmap_summary) {
        badgesContainer.innerHTML = '';
        var summary = chartData.heatmap_summary;

        var levels = [
          { key: 'critical', level: 'CRITICAL' },
          { key: 'high', level: 'HIGH' },
          { key: 'medium', level: 'MEDIUM' },
          { key: 'low', level: 'LOW' }
        ];

        for (var i = 0; i < levels.length; i++) {
          var lvl = levels[i];
          var count = summary[lvl.key] || 0;

          var wrapper = document.createElement('div');
          wrapper.style.cssText = 'display:flex;align-items:center;gap:10px;';

          var countEl = document.createElement('span');
          countEl.style.cssText = "font-family:var(--font-mono);font-size:28px;font-weight:700;color:var(--text-primary);";
          countEl.textContent = count;

          var badge = C.Badge(I18N.t('s19.level_' + lvl.key) || lvl.level, lvl.level);

          wrapper.appendChild(countEl);
          wrapper.appendChild(badge);
          badgesContainer.appendChild(wrapper);

          ANIM.from(wrapper, {
            opacity: 0,
            y: 16,
            duration: 0.5,
            delay: 0.1 + i * 0.1,
            ease: 'power2.out'
          });
        }
      }

      // Category cards
      var categoriesContainer = document.getElementById('s19-categories');
      if (categoriesContainer && chartData && chartData.categories) {
        categoriesContainer.innerHTML = '';
        var categories = chartData.categories;

        for (var c = 0; c < categories.length; c++) {
          var card = document.createElement('div');
          card.style.cssText = 'display:flex;align-items:center;gap:16px;background:var(--bg-secondary);border:var(--border-subtle);border-radius:var(--r-md);padding:16px 24px;';

          var numEl = document.createElement('span');
          numEl.style.cssText = "font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--gold);min-width:32px;text-align:center;";
          numEl.textContent = (c + 1);

          var nameEl = document.createElement('span');
          nameEl.style.cssText = 'font-size:16px;color:var(--text-primary);';
          nameEl.textContent = categories[c];

          card.appendChild(numEl);
          card.appendChild(nameEl);
          categoriesContainer.appendChild(card);

          ANIM.from(card, {
            opacity: 0,
            x: -20,
            duration: 0.4,
            delay: 0.4 + c * 0.08,
            ease: 'power2.out'
          });
        }
      }

      // Note
      var noteEl = document.getElementById('s19-note');
      if (noteEl) {
        noteEl.textContent = I18N.t('s19.note');
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
