/* S10: Pipeline Overview
   Split summary cards + stage breakdown bars. Passive content. */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createStageBar(container, stageName, count, maxCount, index) {
    var widthPct = Math.max(10, (count / maxCount) * 100);

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:20px;';

    // Stage label
    var label = document.createElement('div');
    label.style.cssText = 'min-width:160px;font-size:14px;color:var(--text-secondary);text-align:right;';
    label.textContent = stageName;

    // Bar
    var barOuter = document.createElement('div');
    barOuter.style.cssText = 'flex:1;';

    var barBg = document.createElement('div');
    barBg.className = 'bar-h';
    barBg.style.height = '28px';
    barBg.style.borderRadius = 'var(--r-sm)';

    var barFill = document.createElement('div');
    barFill.className = 'bar-h__fill';
    barFill.style.cssText = 'width:0%;background:var(--gold);border-radius:var(--r-sm);height:100%;display:flex;align-items:center;padding-left:12px;';
    barFill.setAttribute('role', 'progressbar');
    barFill.setAttribute('aria-valuenow', count);
    barFill.setAttribute('aria-valuemin', '0');
    barFill.setAttribute('aria-valuemax', maxCount);
    barFill.setAttribute('aria-label', stageName + ': ' + count);

    var countEl = document.createElement('span');
    countEl.style.cssText = 'font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--bg-primary);';
    countEl.textContent = count;
    barFill.appendChild(countEl);

    barBg.appendChild(barFill);
    barOuter.appendChild(barBg);

    row.appendChild(label);
    row.appendChild(barOuter);
    container.appendChild(row);

    // Animate bar fill
    requestAnimationFrame(function() {
      barFill.style.width = widthPct + '%';
    });

    return row;
  }

  NAV.registerSlide(10, {
    enter: function() {
      var root = document.getElementById('slide-10');
      var data = TS.slide(10);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s10-title');
      var subtitleEl = document.getElementById('s10-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s10.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s10.subtitle');

      // Split summary cards
      var splitContainer = document.getElementById('s10-split');
      if (splitContainer) {
        splitContainer.innerHTML = '';
        var split = data.split || {};

        C.MetricCard(splitContainer, {
          value: String(split.films || 0),
          label: I18N.t('s10.split.films'),
          color: 'gold'
        });

        C.MetricCard(splitContainer, {
          value: String(split.series || 0),
          label: I18N.t('s10.split.series'),
          color: 'gold'
        });

        C.MetricCard(splitContainer, {
          value: I18N.formatNumber(split.total_budget || 0) + ' ' + I18N.t('common.currency'),
          label: I18N.t('s10.split.total_budget'),
          color: 'gold'
        });

        // Animate cards
        var cards = splitContainer.querySelectorAll('.metric-card');
        for (var i = 0; i < cards.length; i++) {
          ANIM.from(cards[i], {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: i * 0.12,
            ease: 'power2.out'
          });
        }
      }

      // Stage breakdown bars
      var stagesContainer = document.getElementById('s10-stages');
      if (stagesContainer) {
        stagesContainer.innerHTML = '';
        var stages = data.stages || {};
        var stageNames = Object.keys(stages);
        var maxCount = 0;
        for (var s = 0; s < stageNames.length; s++) {
          if (stages[stageNames[s]] > maxCount) maxCount = stages[stageNames[s]];
        }

        for (var k = 0; k < stageNames.length; k++) {
          var row = createStageBar(
            stagesContainer,
            I18N.t('s10.stages.' + stageNames[k]) || stageNames[k],
            stages[stageNames[k]],
            maxCount,
            k
          );

          ANIM.from(row, {
            opacity: 0,
            x: -20,
            duration: 0.5,
            delay: 0.3 + k * 0.1,
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
