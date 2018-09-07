const supportedBrowsers = {
  microsoft: {
    ie11_win10: {
      browserName: 'internet explorer',
      name: 'IE11_Win10',
      platform: 'Windows 10',
      ignoreZoomSetting: true,
      nativeEvents: false,
      ignoreProtectedModeSettings: true,
      version: '11'
    },
    edge_win10: {
      browserName: 'MicrosoftEdge',
      name: 'Edge_Win10',
      platform: 'Windows 10',
      ignoreZoomSetting: true,
      nativeEvents: false,
      ignoreProtectedModeSettings: true,
      version: '17.17134'
    }
  },
  chrome: {
    chrome_win_latest: {
      browserName: 'chrome',
      name: 'DIV_WIN_CHROME_LATEST',
      platform: 'Windows 10',
      version: 'latest'
    },
    chrome_mac_latest: {
      browserName: 'chrome',
      name: 'MAC_CHROME_LATEST',
      platform: 'macOS 10.13',
      version: 'latest'
    }
  },
  firefox: {
    firefox_win_latest: {
      browserName: 'firefox',
      name: 'WIN_FIREFOX_LATEST',
      platform: 'Windows 10',
      version: 'latest'
    },
    firefox_mac_latest: {
      browserName: 'firefox',
      name: 'MAC_FIREFOX_LATEST',
      platform: 'macOS 10.13',
      version: 'latest'
    }
  },
  safari: {
    safari11: {
      browserName: 'safari',
      name: 'DIV_SAFARI_11',
      platform: 'macOS 10.13',
      version: '11.1',
      avoidProxy: true
    }
  },
  ios: {
    iPhone8_iOS11: {
      browserName: 'safari',
      appiumVersion: '1.8.1',
      deviceName: 'iPhone 8 Simulator',
      deviceOrientation: 'portrait',
      name: 'DIV_IPHONE8_IOS11',
      platformVersion: '11.3',
      platformName: 'iOS'
    }
  },
  android: {
    samsungS8_android7: {
      browserName: 'Chrome',
      appiumVersion: '1.8.1',
      deviceName: 'Samsung Galaxy S8 GoogleAPI Emulator',
      deviceOrientation: 'portrait',
      name: 'DIV_SAMSUNGS8_ANDROID7',
      platformVersion: '7.1',
      platformName: 'Android'
    }
  }
};

module.exports = supportedBrowsers;