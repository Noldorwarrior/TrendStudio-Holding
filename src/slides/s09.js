/* S09: Market Drivers — 5 KPIs
   Progress bars showing from→to growth. Passive content. */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createKpiRow(container, kpiLabel, from, to, unit, index) {
    var pct = Math.min(100, (to / (to * 1.15)) * 100);
    var fromPct = Math.min(100, (from / (to * 1.15)) * 100);

    var card = document.createElement('div');
    card.className = 'metric-card';
    card.style.cssText = 'padding:20px 24px;';

    // Top row: label + values
    var topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;';

    var label = document.createElement('div');
    label.style.cssText = 'font-size:15px;color:var(--text-primary);font-weight:500;';
    label.textContent = kpiLabel;

    var values = document.createElement('div');
    values.style.cssText = 'font-family:var(--font-mono);font-size:14px;color:var(--text-secondary);display:flex;align-items:center;gap:8px;';

    var fromSpan = document.createElement('span');
    fromSpan.textContent = from + ' ' + unit;
    fromSpan.style.color = 'var(--text-muted)';

    var arrow = document.createElement('span');
    arrow.innerHTML = '&rarr;';
    arrow.style.color = 'var(--gold)';

    var toSpan = document.createElement('span');
    toSpan.textContent = to + ' ' + unit;
    toSpan.style.cssText = 'color:var(--gold);font-weight:700;';

    values.appendChild(fromSpan);
    values.appendChild(arrow);
    values.appendChild(toSpan);

    topRow.appendChild(label);
    topRow.appendChild(values);

    // Progress bar
    var barBg = document.createElement('div');
    barBg.className = 'bar-h';
    barBg.style.height = '10px';
    barBg.style.position = 'relative';

    // "From" marker (dimmer)
    var barFrom = document.createElement('div');
    barFrom.style.cssText = 'position:absolute;top:0;left:0;height:100%;border-radius:4px;background:rgba(201,169,97,0.25);width:' + fromPct + '%;transition:width var(--t-slow) var(--ease-out-expo);';

    // "To" fill (bright)
    var barTo = document.createElement('div');
    barTo.className = 'bar-h__fill';
    barTo.style.cssText = 'width:0%;background:var(--gold);position:absolute;top:0;left:0;height:100%;border-radius:4px;';
    barTo.setAttribute('role', 'progressbar');
    barTo.setAttribute('aria-valuenow', to);
    barTo.setAttribute('aria-valuemin', from);
    barTo.setAttribute('aria-valuemax', to);
    barTo.setAttribute('aria-label', kpiLabel + ': ' + from + ' ' + unit + ' → ' + to + ' ' + unit);

    barBg.appendChild(barFrom);
    barBg.appendChild(barTo);

    card.appendChild(topRow);
    card.appendChild(barBg);
    container.appendChild(card);

    // Animate bar fill
    requestAnimationFrame(function() {
      barTo.style.width = pct + '%';
    });

    return card;
  }

  NAV.registerSlide(9, {
    enter: function() {
      var root = document.getElementById('slide-9');
      var data = TS.slide(9);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s09-title');
      var subtitleEl = document.getElementById('s09-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s09.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s09.subtitle');

      // KPI grid
      var kpiGrid = document.getElementById('s09-kpi-grid');
      if (kpiGrid) {
        kpiGrid.innerHTML = '';
        var kpis = data.kpi_grid || [];

        for (var i = 0; i < kpis.length; i++) {
          var card = createKpiRow(
            kpiGrid,
            I18N.t('s09.kpi_grid.' + i + '.kpi'),
            kpis[i].from,
            kpis[i].to,
            kpis[i].unit,
            i
          );

          ANIM.from(card, {
            opacity: 0,
            y: 16,
            duration: 0.5,
            delay: i * 0.1,
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
