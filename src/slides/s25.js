/* S25: Contact & CTA — Contact cards, next steps list, disclaimer
   Passive content, no charts. */
(function() {
  'use strict';

  var C = window.TS.Components;

  function createContactCard(container, contact, index) {
    var card = document.createElement('div');
    card.className = 'metric-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', I18N.t('s25.contacts.' + index + '.name'));
    card.style.cssText = 'cursor:default;display:flex;flex-direction:column;gap:10px;text-align:center;align-items:center;';

    // Role badge
    var badge = C.Badge(I18N.t('s25.contacts.' + index + '.role'), 'gold');
    card.appendChild(badge);

    // Name
    var name = document.createElement('h3');
    name.style.cssText = 'font-size:20px;font-weight:700;color:var(--text-primary);margin:0;';
    name.textContent = I18N.t('s25.contacts.' + index + '.name');
    card.appendChild(name);

    // Email
    var email = document.createElement('a');
    email.style.cssText = 'font-size:14px;color:var(--gold);text-decoration:none;';
    email.href = 'mailto:' + (contact.email || '');
    email.textContent = contact.email || '';
    card.appendChild(email);

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

  NAV.registerSlide(25, {
    enter: function() {
      var root = document.getElementById('slide-25');
      var data = TS.slide(25);
      if (!root || !data) return;

      // Title + subtitle
      var titleEl = document.getElementById('s25-title');
      var subtitleEl = document.getElementById('s25-subtitle');
      if (titleEl) titleEl.textContent = I18N.t('s25.title');
      if (subtitleEl) subtitleEl.textContent = I18N.t('s25.subtitle');

      // Contact cards
      var contactsContainer = document.getElementById('s25-contacts');
      if (contactsContainer) {
        contactsContainer.innerHTML = '';
        var contacts = data.contacts || [];
        for (var i = 0; i < contacts.length; i++) {
          var card = createContactCard(contactsContainer, contacts[i], i);
          ANIM.from(card, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            delay: i * 0.12,
            ease: 'power2.out'
          });
        }
      }

      // Next steps list
      var nextStepsContainer = document.getElementById('s25-next-steps');
      if (nextStepsContainer) {
        nextStepsContainer.innerHTML = '';
        var nextSteps = data.next_steps || [];
        var localizedSteps = [];
        for (var n = 0; n < nextSteps.length; n++) {
          localizedSteps.push(I18N.t('s25.next_steps.' + n));
        }
        var list = C.PointsList(nextStepsContainer, localizedSteps);

        // Animate list items
        var items = list.querySelectorAll('li');
        for (var j = 0; j < items.length; j++) {
          ANIM.from(items[j], {
            opacity: 0,
            x: -20,
            duration: 0.5,
            delay: 0.4 + j * 0.08,
            ease: 'power2.out'
          });
        }
      }

      // Disclaimer
      var disclaimerContainer = document.getElementById('s25-disclaimer');
      if (disclaimerContainer) {
        disclaimerContainer.textContent = I18N.t('s25.disclaimer');
        ANIM.from(disclaimerContainer, {
          opacity: 0,
          y: 12,
          duration: 0.6,
          delay: 0.8,
          ease: 'power2.out'
        });
      }
    },

    exit: function() {
      ANIM.killAll();
    }
  });
})();
