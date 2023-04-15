import Storage from './storage_module.js';
(() => {

  var marchUrls = []
  const jsFiles = ["js/jquery.min.js","js/clipboard.min.js","js/codemirror.min.js","js/javascript.min.js","js/foldgutter.min.js","js/clike.min.js","js/ace.min.js","js/aceHighlight.min.js","js/aceThemeTwilight.min.js","js/aceJavascript.min.js","js/toJson.js","js/rawtots.js","js/index.js"]
  const cssFiles = ["css/codemirror.css", "css/seti.min.css", "css/darcula.min.css","css/foldgutter.min.css","css/ui.css"]

  chrome.runtime.onInstalled.addListener(function () {
    const updateContentScript = async () => {
      const res = await Storage.getItem('Origin')
      const configs = res?.Origin || []
      const matches = configs.length ? configs : ['*://*/*']
      const scripts = await chrome.scripting.getRegisteredContentScripts()
      if(scripts.length) {
        chrome.scripting.updateContentScripts([{
          // target: { tabId: tab.id},
          id: 'contentId',
          matches: matches,
          js: jsFiles,
          css: cssFiles
        }]);
      } else {
        chrome.scripting.registerContentScripts([{
          // target: { tabId: tab.id},
          id: 'contentId',
          matches: matches,
          js: jsFiles,
          css: cssFiles
        }]);
      }
      
    }

    const  registerContentScripts = async  (matchRule) => {
      const scripts = await chrome.scripting.getRegisteredContentScripts()
      if(scripts.length) {
        chrome.scripting.updateContentScripts([{
          // target: { tabId: tab.id},
          id: 'contentId',
          matches: matches,
          js: jsFiles,
          css: cssFiles
        }]);
      } else {
        chrome.scripting.registerContentScripts([{
          // target: { tabId: tab.id},
          id: 'contentId',
          matches: matches,
          js: jsFiles,
          css: cssFiles
        }]);
      }
    }
    const init = async () => {
      const res = await Storage.getItem('Origin')
      const configs = res?.Origin || []
      if(configs.length) {
        return configs
      }
      return [] 
    }

    init()
    function matchesUrl(url, matchRule) {
      return matchRule.some(reg => new RegExp(reg).test(url))
    }

    /**
     * @description: 
     * @param {*} function
     * @param {*} sender
     * @param {*} sendResponse
     * @return {*}
     */    
    chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
      console.log(data)
      // 接收来自Popup的数据
      if(data.type === 'POPUP_TO_BACKGROUND') {
        console.log(data)
        marchUrls = data.value
      } else if (data.type === 'CONTENT_TO_BACKGROUND'){
        sendResponse(marchUrls)
      } else if(data.type === 'POPUP_TO_BACKGROUND_GETURLS') {
        console.log(marchUrls)
        sendResponse(marchUrls)
      }
  });
  })

})()