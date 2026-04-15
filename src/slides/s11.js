/* S11: Pipeline Timeline
   Quarterly release timeline with CF markers. Passive content. */
(function() {
  'use strict';

  var C = window.TS.Components;

  function buildTimeline(container, timeline) {
    // Wrapper for horizontal layout
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;';

    // Horizontal track line
    var track = document.createElement('div');
    track.style.cssText = 'position:relative;width:100%;height:4px;background:var(--bg-tertiary);border-radius:2px;margin:60px 0 80px 0;';
    track.setAttribute('role', 'presentation');

    // Gold progress fill
    var trackFill = document.createElement('div');
    trackFill.style.cssText = 'position:absolute;top:0;left:0;height:100%;width:0%;background:var(--gold);border-radius:2px;transition:width var(--t-slow) var(--ease-out-expo);';
    track.appendChild(trackFill);

    wrapper.appendChild(track);

    // Place markers along track
    for (var i = 0; i < timeline.length; i++) {
      var item = timeline[i];
      var pct = (i / (timeline.length - 1)) * 100;

      // Marker node (circle on track)
      var marker = document.createElement('div');
      marker.style.cssText = 'position:absolute;left:' + pct + '%;top:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:var(--gold);border:3px solid var(--bg-primary);box-shadow:0 0 12px rgba(201,169,97,0.4);z-index:2;';
      track.appendChild(marker);

      // Quarter label above
      var qLabel = document.createElement('div');
      qLabel.style.cssText = 'position:absolute;left:' + pct + '%;bottom:calc(100% + 16px);transform:translateX(-50%);font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--gold);white-space:nowrap;text-align:center;';
      qLabel.textContent = item.q || '';
      track.appendChild(qLabel);

      // Releases below
      var releasesEl = document.createElement('div');
      releasesEl.style.cssText = 'position:absolute;left:' + pct + '%;top:calc(100% + 16px);transform:translateX(-50%);text-align:center;white-space:nowrap;';

      var releases = item.releases || [];
      for (var r = 0; r < releases.length; r++) {
        var badge = document.createElement('span');
        badge.className = 'badge badge--gold';
        badge.style.cssText = 'margin:2px 4px;font-size:12px;';
        badge.textContent = releases[r];
        releasesEl.appendChild(badge);
      }

      // CF value
      if (item.cf_in) {
        var cfEl = document.createElement('div');
        cfEl.style.cssText = 'margin-top:8px;font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);';
        cfEl.textContent = I18N.formatCurrency(item.cf_in);
        releasesEl.appendChild(cfEl);
      }

      track.appendChild(releasesEl);

      // Animate marker
      ANIM.from(marker, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        delay: 0.2 + i * 0.15,
        ease: 'back.out(1.7)'
      });

      ANIM.from(qLabel, {
        opacity: 0,
        y: 10,
        duration: 0.4,
        delay: 0.3 + i * 0.15,
        ease: 'power2.out'
      });

      ANIM.from(releasesEl, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        delay: 0.35 + i * 0.15,
        ease: 'power2.out'
      });
    }

    container.appendChild(wrapper);

    // Animate the gold fill
    requestAnimationFrame(function() {
      trackFill.style.width = '100%';
    });
  }

  NAV.registerSlide(11, {
    enter: function() {
      var root = document.getElementById('slide-11');
      var data = TS.slide(11);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s11-title');
      var subtitleEl = document.getElementById('s11-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s11.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s11.subtitle');

      // Timeline
      var timelineContainer = document.getElementById('s11-timeline');
      if (timelineContainer) {
        timelineContainer.innerHTML = '';
        var timeline = data.timeline || [];
        buildTimeline(timelineContainer, timeline);
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
