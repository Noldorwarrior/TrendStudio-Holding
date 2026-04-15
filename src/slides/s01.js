/* S01: Cover — passive content, cinematic entrance */
(function() {
  'use strict';

  var C = window.TS.Components;

  NAV.registerSlide(1, {
    enter: function() {
      var slide = TS.slide(1);
      if (!slide) return;

      // Populate text from data
      var titleEl = document.getElementById('s01-title');
      var subtitleEl = document.getElementById('s01-subtitle');
      var bodyEl = document.getElementById('s01-body');
      var footerEl = document.getElementById('s01-footer');

      if (titleEl) titleEl.textContent = I18N.t('s01.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s01.subtitle');
      if (bodyEl) bodyEl.textContent = I18N.t('s01.body');
      if (footerEl) footerEl.textContent = I18N.t('s01.footer');

      // Render 3 badges
      var badgesContainer = document.getElementById('s01-badges');
      if (badgesContainer) {
        badgesContainer.innerHTML = '';
        var badges = slide.badges || [];
        for (var i = 0; i < badges.length; i++) {
          var b = C.Badge(I18N.t('s01.badges.' + i), 'gold');
          b.style.fontSize = '15px';
          b.style.padding = '10px 24px';
          badgesContainer.appendChild(b);
        }
      }

      // Animate entrance
      var content = document.getElementById('s01-content');
      if (content) {
        ANIM.from(content, {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: 'power3.out'
        });
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
