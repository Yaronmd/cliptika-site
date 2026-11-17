/* Load the configured Umami tracker once; no navigation is intercepted. */
(() => {
  const config = window.CLIPTIKA_ANALYTICS || {};
  if (!config.websiteId || !config.scriptUrl) return;
  if (!['cliptika.app', 'www.cliptika.app'].includes(location.hostname)) return;
  if (!/^https:\/\//.test(config.scriptUrl)) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = config.scriptUrl;
  script.setAttribute('data-website-id', config.websiteId);
  script.setAttribute('data-domains', 'cliptika.app,www.cliptika.app');
  script.setAttribute('data-do-not-track', 'true');
  script.setAttribute('data-exclude-hash', 'true');
  document.head.appendChild(script);
})();
