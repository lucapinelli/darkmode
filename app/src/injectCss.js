(() => {
  const darkmodeId = 'darkmode-3eb4-450a-8499-7f77cf2f62aa';
  const scope = { darkmodeEnabled: true };
  const enable = () => {
    document.body && document.body.classList.add(darkmodeId);
  };
  const disable = () => {
    document.body && document.body.classList.remove(darkmodeId);
  };
  chrome.storage.sync.get(darkmodeId, (store) => {
    const options = store[darkmodeId] || {};
    if (options.global === 'disabled') {
      scope.darkmodeEnabled = false;
    } else {
      const loc = document.location.href;
      const domain = loc.replace(/^[^/]+\/\/([^/]+).*$/, '$1');
      scope.darkmodeEnabled = !options.site || options.site[domain] !== 'disabled';
    }
    if (scope.darkmodeEnabled) {
      enable();
    } else {
      disable();
    }
  });

  const onDOMSubtreeModified = () => {
    if (document.body) {
      document.removeEventListener('DOMSubtreeModified', onDOMSubtreeModified, false);
      if (scope.darkmodeEnabled) {
        enable();
      }
    }
  };
  document.addEventListener('DOMSubtreeModified', onDOMSubtreeModified, false);
})();
