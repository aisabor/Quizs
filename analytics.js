(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-86W18DDM3E';
  var hostname = window.location.hostname;
  var isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname.endsWith('.local');

  window.PatternDeskAnalytics = {
    enabled: !isLocal,
    track: function (eventName, params) {
      if (isLocal || typeof window.gtag !== 'function' || !eventName) return;
      var safeParams = Object.assign({
        page_path: window.location.pathname,
        page_title: document.title
      }, params || {});
      window.gtag('event', eventName, safeParams);
    }
  };

  window.pdTrack = window.PatternDeskAnalytics.track;

  if (isLocal) {
    console.info('PatternDesk Analytics disabled on local development.');
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(script);

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href === 'quiz.html' && window.location.pathname.endsWith('/index.html') || href === 'quiz.html' && window.location.pathname === '/') {
      window.pdTrack('homepage_quiz_click', { link_url: link.href });
    }
    if (href === 'game.html' && (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/')) {
      window.pdTrack('homepage_game_click', { link_url: link.href });
    }
  });
})();
