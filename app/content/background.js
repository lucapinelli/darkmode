(() => {
  const darkmodeId = 'darkmode-3eb4-450a-8499-7f77cf2f62aa';
  const scope = { darkmodeEnabled: true };
  const enable = () => {
    if (!document.body) {
      return;
    }
    document.body.classList.add(darkmodeId);
    Array.from(document.getElementsByTagName('iframe'))
      .forEach(node => node.getRootNode().body.classList.add(darkmodeId));
  };
  const disable = () => {
    if (!document.body) {
      return;
    }
    document.body.classList.remove(darkmodeId);
    Array.from(document.getElementsByTagName('iframe'))
      .forEach(node => node.getRootNode().body.classList.remove(darkmodeId));
  };

  const enableDisable = (options) => {
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
  };

  chrome.storage.sync.get(darkmodeId, (store) => {
    enableDisable((store && store[darkmodeId]) || {});
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (!changes[darkmodeId] || !changes[darkmodeId].newValue) {
      return;
    }
    enableDisable(changes[darkmodeId].newValue);
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
