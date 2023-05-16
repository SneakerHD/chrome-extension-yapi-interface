(() => {

  function showToast(message) {
    const oldElem = document.querySelector('.yapi-toast')
    if(oldElem) {
      document.body.removeChild(oldElem)
    }
    // 创建一个toast元素
    var toastElement = document.createElement("div");
    toastElement.className = "yapi-toast";
    toastElement.innerHTML = message;
    // 将toast元素添加到文档中
    document.body.appendChild(toastElement);
    // 2秒后删除toast元素
    setTimeout(function() {
      document.body.removeChild(toastElement);
    }, 2000);
  }
  //向background 发送消息 查询最新的配置
  chrome.runtime.sendMessage({
    type: "POPUP_TO_BACKGROUND_GETURLS"
  }, (response) => {
    console.log(response)
    if(response && response.length) {
      urls = response
      const urlStr = urls.reduce((str, url) => {
        str += url.replace('/*', '') + ';'
        return str
      }, '')
      document.querySelector('textarea').value = urlStr
    }
  })

  function isValidURL(url) {
    try {
      const parsedURL = new URL(url);
      return parsedURL.protocol === 'http:' || parsedURL.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
  
  function extractOrigin(url) {
    try {
      const parsedURL = new URL(url);
      return parsedURL.origin;
    } catch (error) {
      return null;
    }
  }
  const btn = document.querySelector('button')
  btn.addEventListener('click', async () => {
    const regex = /^((https?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?)+$/
    // const input = document.querySelector('input')
    const textarea = document.querySelector('textarea')
    const value = textarea.value
    const urls = value.split(';').filter(url => !!url)
    if(!urls.length || !urls.every(url => isValidURL(url))) {
      //不符合
      showToast('输入的业务域名有误')
    } else {
      const data = urls.map(url=> extractOrigin(url))
      console.log(data)
      await Storage.setItem('Origin', data)
      chrome.runtime.sendMessage({
        type: "POPUP_TO_BACKGROUND",
        value: data
      })
      chrome.tabs.query({url: data}, function(tabs) {
        tabs.forEach(function(tab) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'POPUP',
            value: data
          });
        });
      });
      showToast('保存成功')
    }
  })
})()