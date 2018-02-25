(() => {
  class DarkMode {
    constructor(ui) {
      this.darkmodeId = 'darkmode-3eb4-450a-8499-7f77cf2f62aa';
      this.ui = ui;
      ui.enable.addEventListener('click', this.enable.bind(this));
      ui.disable.addEventListener('click', this.disable.bind(this));
      ui.enableDomain.addEventListener('click', this.enableDomain.bind(this));
      ui.disableDomain.addEventListener('click', this.disableDomain.bind(this));

      chrome.storage.sync.get(this.darkmodeId, (store) => {
        const options = store[this.darkmodeId] || {};
        this.render(options);
      });

      chrome.storage.onChanged.addListener((changes, area) => {
        if (!changes[this.darkmodeId] || !changes[this.darkmodeId].newValue) {
          return;
        }
        this.render(changes[this.darkmodeId].newValue);
      });
    }

    updateOptions(updateFn) {
      chrome.storage.sync.get(this.darkmodeId, (store) => {
        const options = updateFn(store[this.darkmodeId]);
        chrome.storage.sync.set({[this.darkmodeId]: options});
      });
    }

    _enableStyle() {
      chrome.tabs.executeScript(null, { code: `document.body.classList.add('${this.darkmodeId}')` });
    }

    _disableStyle() {
      chrome.tabs.executeScript(null, { code: `document.body.classList.remove('${this.darkmodeId}')` });
    }

    _getDomain() {
      return new Promise((resolve, reject) => {
        chrome.tabs.getSelected(null, (tab) => {
          resolve(tab.url.replace(/^[^/]+\/\/([^/]+)\/?.*$/, '$1') || 'unknown');
        });
      });
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
      this._getDomain().then((domain) => {
        this.updateOptions((options) => ({
          ...options,
          site: { ...options.site, [domain]: 'enabled' }
        }));
      });
    }

    disableDomain() {
      this._disableStyle();
      this._getDomain().then((domain) => {
        this.updateOptions((options) => ({
          ...options,
          site: { ...options.site, [domain]: 'disabled' }
        }));
      });
    }

    _updateEnableDisable(domEnable, domDisable, enable) {
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
    }

    render(options) {
      this._getDomain().then((domain) => {
        const dom = this.ui;
        const isEnabled = options.global !== 'disabled';
        const isSiteEnabled = isEnabled && options.site[domain] !== 'disabled';
        this._updateEnableDisable(dom.enable, dom.disable, isEnabled);
        this._updateEnableDisable(dom.enableDomain, dom.disableDomain, isSiteEnabled);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', (tab) => {
    const ui = {};
    ui.enable = document.getElementById('enable');
    ui.disable = document.getElementById('disable');
    ui.enableDomain = document.getElementById('enable_domain');
    ui.disableDomain = document.getElementById('disable_domain');

    new DarkMode(ui); // eslint-disable-line no-new
  });
})();
