const LATEST_MAC = 'macOS 10.15';
const LATEST_WINDOWS = 'Windows 10';

const supportedBrowsers = {
  microsoftIE11: {
    ie11: {
      browserName: 'internet explorer',
      name: 'IE11',
      platform: LATEST_WINDOWS,
      version: 'latest'
    }
  },
  microsoftEdge: {
    edge: {
      browserName: 'MicrosoftEdge',
      name: 'Edge_Win10',
      platform: LATEST_WINDOWS,
      version: 'latest'
    }
  },
  chrome: {
    chrome_win_latest: {
      browserName: 'chrome',
      name: 'DIV_WIN_CHROME_LATEST',
      platform: LATEST_WINDOWS,
      version: 'latest'
    },
    chrome_mac_latest: {
      browserName: 'chrome',
      name: 'MAC_CHROME_LATEST',
      platform: LATEST_MAC,
      version: 'latest'
    }
  },
  firefox: {
    firefox_win_latest: {
      browserName: 'firefox',
      name: 'WIN_FIREFOX_LATEST',
      platform: LATEST_WINDOWS,
      version: 'latest'
    },
    firefox_mac_latest: {
      browserName: 'firefox',
      name: 'MAC_FIREFOX_LATEST',
      platform: LATEST_MAC,
      version: 'latest'
    }
  }
};

module.exports = supportedBrowsers;
