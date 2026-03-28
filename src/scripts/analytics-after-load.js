(function () {
  function initAnalytics() {
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) {
          return;
        }
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=106314779", "ym");

    ym(106314779, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      accurateTrackBounce: true,
      trackLinks: true,
    });

    var _tmr = window._tmr || (window._tmr = []);
    _tmr.push({ id: "3738655", type: "pageView", start: new Date().getTime() });

    (function (d, w, id) {
      if (d.getElementById(id)) return;
      var ts = d.createElement("script");
      ts.type = "text/javascript";
      ts.async = true;
      ts.id = id;
      ts.src = "https://top-fwz1.mail.ru/js/code.js";
      var f = function () {
        var s = d.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ts, s);
      };
      if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
      } else {
        f();
      }
    })(document, window, "tmr-code");
  }

  if (document.readyState === "complete") {
    initAnalytics();
  } else {
    window.addEventListener("load", initAnalytics, { once: true });
  }
})();
