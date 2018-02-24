(() => {
  class DarkMode {
    constructor() {
      this.darkmodeId = 'darkmode-3eb4-450a-8499-7f77cf2f62aa';
    }

    updateOptions(updateFn) {
      chrome.storage.sync.get(this.darkmodeId, (store) => {
        const options = updateFn(store[this.darkmodeId]);
        chrome.storage.sync.set({[this.darkmodeId]: options});
      });
    }

    _enableStyle() {
      document.body.classList.add(this.darkmodeId);
    }

    _disableStyle() {
      document.body.classList.remove(this.darkmodeId);
    }

    _getDomain() {
      return document.location.href.replace(/^[^/]+\/\/([^/]+)\/?.*$/, '$1');
    }

    enable() {
      this._enableStyle();
      this.updateOptions((options) => ({ ...options, global: 'enabled' }));
    }

    disable() {
      this._disableStyle();
      this.updateOptions((options) => ({ ...options, global: 'disabled' }));
    }

    enableDomain() {
      this._enableStyle();
      const domain = this._getDomain();
      this.updateOptions((options) => ({
        ...options,
        site: { ...options.site, [domain]: 'enabled' }
      }));
    }

    disableDomain() {
      this._disableStyle();
      const domain = this._getDomain();
      this.updateOptions((options) => ({
        ...options,
        site: { ...options.site, [domain]: 'disabled' }
      }));
    }
  }

  const darkmodeId = 'darkmode-3eb4-450a-8499-7f77cf2f62aa';
  const dom = {};

  const updateEnableDisable = (domEnable, domDisable, enable) => {
    if (enable) {
      domEnable.innerText = 'Enabled';
      domEnable.classList.add('selected');
      domDisable.innerText = 'Disable';
      domDisable.classList.remove('selected');
    } else {
      domEnable.innerText = 'Enable';
      domEnable.classList.remove('selected');
      domDisable.innerText = 'Disabled';
      domDisable.classList.add('selected');
    }
  };

  const render = (options) => {
    chrome.tabs.getSelected(null, function(tab) {
      const domain = tab.url.replace(/^[^/]+\/\/([^/]+)\/?.*$/, '$1') || 'unknown';
      const isEnabled = options.global !== 'disabled';
      const isSiteEnabled = isEnabled && options.site[domain] !== 'disabled';
      updateEnableDisable(dom.enable, dom.disable, isEnabled);
      updateEnableDisable(dom.enableDomain, dom.disableDomain, isSiteEnabled);
    });
  };

  const executeAction = (action) => () => {
    chrome.tabs.executeScript(null, { code: `(()=>{\n${DarkMode}\nnew DarkMode().${action}\n})()` }, function() {
      // window.close();
    });
  };

  document.addEventListener('DOMContentLoaded', (tab) => {
    dom.enable = document.getElementById('enable');
    dom.disable = document.getElementById('disable');
    dom.enableDomain = document.getElementById('enable_domain');
    dom.disableDomain = document.getElementById('disable_domain');

    dom.enable.addEventListener('click', executeAction('enable()'));
    dom.disable.addEventListener('click', executeAction('disable()'));
    dom.enableDomain.addEventListener('click', executeAction('enableDomain()'));
    dom.disableDomain.addEventListener('click', executeAction('disableDomain()'));

    chrome.storage.sync.get(darkmodeId, function(store) {
      const options = store[darkmodeId] || {};
      render(options);
    });

    chrome.storage.onChanged.addListener(function(changes, area) {
      if (!changes[darkmodeId] || !changes[darkmodeId].newValue) {
        return;
      }
      render(changes[darkmodeId].newValue);
    });
  });
})();
