console.log('rigster')
class Storage {
  static setItem(key, value) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ [key]: value }, function () {
        console.log("本次存储数据为：", key, value)
        resolve()
      })
    })
  }


  static getItem(key) {
    return new Promise((resolve, reject) => {
      if(key) {
        chrome.storage.sync.get(key , function (res) {
          resolve(res)
        })
      } else {
        reject()
      }
    })
  }

  static removeItem(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(key, function () {
        console.log("清空key", key)
        resolve()
      })
    })
  }

  static clear(key) {
    chrome.storage.sync.clear(key,function () {
      console.log("清空key", key)
    })
  }
}

export default Storage