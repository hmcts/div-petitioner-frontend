const supportedBrowsers = {
  ie11_win7: {
    browserName: 'internet explorer',
    name: 'IE11_Win7',
    platform: 'Windows 7',
    ignoreZoomSetting: true,
    nativeEvents: false,
    ignoreProtectedModeSettings: true,
    version: '11'
  },
  'ie11_win8.1': {
    browserName: 'internet explorer',
    name: 'IE11_Win8.1',
    platform: 'Windows 8.1',
    ignoreZoomSetting: true,
    nativeEvents: false,
    ignoreProtectedModeSettings: true,
    version: '11'
  },
  ie11_win10: {
    browserName: 'internet explorer',
    name: 'IE11_Win10',
    platform: 'Windows 10',
    ignoreZoomSetting: true,
    nativeEvents: false,
    ignoreProtectedModeSettings: true,
    version: '11'
  },
  // edge_latest: {
  //   browserName: 'MicrosoftEdge',
  //   name: 'IEEdge_LATEST',
  //   platform: 'Windows 10',
  //   version: 'latest'
  // },
  // edge_previous: {
  //   browserName: 'MicrosoftEdge',
  //   name: 'IEEdge_PREVIOUS',
  //   platform: 'Windows 10',
  //   version: 'latest-1'
  // },

  chrome_win_latest: {
    browserName: 'chrome',
    name: 'WIN_CHROME_LATEST',
    platform: 'Windows 10',
    version: 'latest'
  },
  chrome_win_previous: {
    browserName: 'chrome',
    name: 'WIN_CHROME_PREVIOUS',
    platform: 'Windows 8.1',
    version: 'latest-1'
  },
  chrome_mac_latest: {
    browserName: 'chrome',
    name: 'MAC_CHROME_LATEST',
    platform: 'OS X 10.12',
    version: 'latest'
  },
  chrome_mac_previous: {
    browserName: 'chrome',
    name: 'MAC_CHROME_PREVIOUS',
    platform: 'OS X 10.11',
    version: 'latest-1'
  },

  firefox_win_latest: {
    browserName: 'firefox',
    name: 'WIN_FIREFOX_LATEST',
    platform: 'Windows 10',
    version: 'latest'
  },
  firefox_win_previous: {
    browserName: 'firefox',
    name: 'WIN_FIREFOX_PREVIOUS',
    platform: 'Windows 8.1',
    version: 'latest-1'
  },
  firefox_mac_latest: {
    browserName: 'firefox',
    name: 'MAC_FIREFOX_LATEST',
    platform: 'OS X 10.12',
    version: 'latest'
  },
  firefox_mac_previous: {
    browserName: 'firefox',
    name: 'MAC_FIREFOX_PREVIOUS',
    platform: 'OS X 10.11',
    version: 'latest-1'
  },
  // safari10: {
  //   browserName: 'safari',
  //   name: 'SAFARI_10',
  //   platform: 'macOS 10.12',
  //   version: '10.1',
  //   avoidProxy: true
  // },
  // safari11: {
  //   browserName: 'safari',
  //   name: 'SAFARI_11',
  //   platform: 'macOS 10.13',
  //   version: '11.1',
  //   avoidProxy: true
  // }
  iPhone6s_iOS10: {
    browserName: 'safari',
    appiumVersion: '1.8.1',
    deviceName: 'iPhone 6s Simulator',
    deviceOrientation: 'portrait',
    name: 'IPHONE6S_IOS10',
    platformVersion: '10.3',
    platformName: 'iOS'
  },
  iPhone8_iOS11: {
    browserName: 'safari',
    appiumVersion: '1.8.1',
    deviceName: 'iPhone 8 Simulator',
    deviceOrientation: 'portrait',
    name: 'IPHONE8_IOS11',
    platformVersion: '11.3',
    platformName: 'iOS'
  },
  samsungS8_android7: {
    browserName: 'Chrome',
    appiumVersion: '1.8.1',
    deviceName: 'Samsung Galaxy S8 GoogleAPI Emulator',
    deviceOrientation: 'portrait',
    name: 'SAMSUNGS8_ANDROID7',
    platformVersion: '7.1',
    platformName: 'Android'
  },
  nexus7C_android4: {
    browserName: 'Browser',
    appiumVersion: '1.8.1',
    deviceName: 'Google Nexus 7C Emulator',
    deviceOrientation: 'portrait',
    name: 'NEXUS7C_ANDROID4',
    platformVersion: '4.4',
    platformName: 'Android'
  }
};


module.exports = supportedBrowsers;