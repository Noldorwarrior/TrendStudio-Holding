/* S08: Market — TAM/SAM/SOM
   Horizontal funnel bars. Passive (real chart Phase 2). */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createFunnelBar(container, level, value, label, unit, maxValue, index) {
    var widthPct = Math.max(8, (value / maxValue) * 100);
    var colors = [
      'rgba(59,130,246,0.85)',   // TAM — blue
      'rgba(139,92,246,0.85)',   // SAM — purple
      'rgba(201,169,97,0.85)'    // SOM — gold
    ];

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:24px;';

    // Level label
    var levelEl = document.createElement('div');
    levelEl.style.cssText = 'min-width:60px;font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--gold);text-align:right;';
    levelEl.textContent = level;

    // Bar container
    var barOuter = document.createElement('div');
    barOuter.style.cssText = 'flex:1;';

    var barBg = document.createElement('div');
    barBg.className = 'bar-h';
    barBg.style.height = '40px';
    barBg.style.borderRadius = 'var(--r-sm)';

    var barFill = document.createElement('div');
    barFill.className = 'bar-h__fill';
    barFill.style.cssText = 'width:0%;background:' + colors[index] + ';border-radius:var(--r-sm);height:100%;';
    barFill.setAttribute('role', 'progressbar');
    barFill.setAttribute('aria-valuenow', value);
    barFill.setAttribute('aria-valuemin', '0');
    barFill.setAttribute('aria-valuemax', maxValue);
    barFill.setAttribute('aria-label', level + ': ' + value + ' ' + unit);

    barBg.appendChild(barFill);
    barOuter.appendChild(barBg);

    // Description label
    var descEl = document.createElement('div');
    descEl.style.cssText = 'margin-top:6px;font-size:13px;color:var(--text-secondary);';
    descEl.textContent = label;
    barOuter.appendChild(descEl);

    // Value label
    var valEl = document.createElement('div');
    valEl.style.cssText = 'min-width:120px;font-family:var(--font-mono);font-size:22px;font-weight:700;color:var(--text-primary);';
    valEl.textContent = value + ' ' + unit;

    row.appendChild(levelEl);
    row.appendChild(barOuter);
    row.appendChild(valEl);

    container.appendChild(row);

    // Animate bar fill after append
    requestAnimationFrame(function() {
      barFill.style.width = widthPct + '%';
    });

    return row;
  }

  NAV.registerSlide(8, {
    enter: function() {
      var root = document.getElementById('slide-8');
      var data = TS.slide(8);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s08-title');
      var subtitleEl = document.getElementById('s08-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s08.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s08.subtitle');

      // Funnel bars
      var funnelContainer = document.getElementById('s08-funnel');
      if (funnelContainer) {
        funnelContainer.innerHTML = '';
        var funnel = data.funnel || [];
        var unit = data.unit || '';
        var maxValue = funnel.length > 0 ? funnel[0].value : 1;

        for (var i = 0; i < funnel.length; i++) {
          var row = createFunnelBar(
            funnelContainer,
            funnel[i].level,
            funnel[i].value,
            I18N.t('s08.funnel.' + i + '.label'),
            unit,
            maxValue,
            i
          );
          ANIM.from(row, {
            opacity: 0,
            x: -30,
            duration: 0.6,
            delay: i * 0.2,
            ease: 'power2.out'
          });
        }
      }

      // Source note
      var noteEl = document.getElementById('s08-note');
      if (noteEl) {
        noteEl.textContent = I18N.t('s08.note');
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
