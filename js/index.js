(()=> {
  var editorRequest, editorResponse = null
  var urls = []
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
      // 复制的方法
  function copyText(text, callback){ // text: 要复制的内容， callback: 回调
      if(!navigator.clipboard){
        return
      }
      navigator.clipboard.writeText(text).then(() => {
        showToast('Success')
      }).catch(err => {
        showToast('Please manually select all copies')
      })
    }
  const renderDialog = (requestJSON, responseJSON, show = true) => {
    const dialogEle = document.querySelector('#favDialog')
    if(!dialogEle) {
      const $html = '<dialog id="favDialog">'+ '<div class="header"><input id="apiInput" placeholder="Please enter the full yapi link or interface id that you want to query"/><button value="default" id="get" class="btn-primary">Get</button><button value="default" id="reset" class="btn-primary">Reset</button><button value="default" id="close">Close</button></div>' +
      '<div style="display:flex;"><textarea id="code1"></textarea><textarea id="code2" style="margin-left: 20px;"></textarea></div>'+
      '</textarea><div class="footer"><div class="item"><button id="copyRequest" >Copy Request Ts Interface</button></div><div class="item"><button id="copyResponse">Copy Response Ts Interface</button></div></div></dialog>'
    $('body').append($html)
    document.querySelector('#favDialog').showModal()
    editorRequest = CodeMirror.fromTextArea(document.querySelector('#code1'), {
      mode: 'text/javascript',
      lineNumbers: true,
      lineWrapping: false,
      matchBrackets: true,
      styleActiveLine: true,
      fixedGutter: false,
      theme: 'darcula'
    })


    editorResponse = CodeMirror.fromTextArea(document.querySelector('#code2'), {
      mode: 'text/javascript',
      lineNumbers: true,
      lineWrapping: false,
      matchBrackets: true,
      styleActiveLine: true,
      fixedGutter: false,
      theme: 'darcula'
    })

    editorRequest.setValue(requestJSON)
    editorResponse.setValue(responseJSON)

    editorRequest.setSize('30vw', '50vh')
    editorResponse.setSize('30vw', '50vh')

    document.querySelector('#favDialog').addEventListener('close', () => {
    })

    document.querySelector('#close').addEventListener('click', () => {
      // dialogEle.close()
      $('#favDialog').remove()
    })

    document.querySelector('#reset').addEventListener('click', () => {
      document.body.querySelector('#apiInput').value = ''
      init()
    })

    document.querySelector('#get').addEventListener('click', () => {
      const val = document.body.querySelector('#apiInput').value
      if(!val) {
        showToast('The input field cannot be empty')
        return
      }
      init(val)
    })
    document.querySelector('#copyRequest').addEventListener('click', () => {
      copyText(editorRequest.getValue())
    })

    document.querySelector('#copyResponse').addEventListener('click', () => {
      copyText(editorResponse.getValue())
    })
    } else {
      editorRequest.setValue(requestJSON)
      editorResponse.setValue(responseJSON)
    }
  }

  const renderYapiElem = (request = '', response = '') => {
    const yapiElem = document.querySelector('#YapiHelper')
    if(!yapiElem) {
      const ele = document.createElement('div')
      ele.id = 'YapiHelper'
      ele.style.position = 'fixed'
      ele.style.bottom = '100px'
      ele.style.right = '60px'
      ele.style.width = '80px'
      ele.style.height = '80px'
      ele.style.cursor = 'pointer'
      ele.className = 'yapi-enter'
      ele.onclick = () => {
        renderDialog(request, response)
      }
      document.body.append(ele)
    } else {
      renderDialog(request, response, false)
    }
  }
  const queryToCode = (query) => {
    const content = query.reduce((acc, { required, name, desc }) => {
      const symbol = required === '0' ? ' ?' : ''
      return `${acc}\n  /** ${desc || '注释'} */\n  ${name}${symbol}: string;`
    }, '')
    return `export interface Request {${content}\n}`
  }

  function matchesUrl(url, matchRule) {
    return matchRule.some(reg => new RegExp(reg).test(url))
  }

  const init  = (input) => {
    const pattern = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/project\/\d+\/interface\/api\/(\d+)$/
    const url = input ||  location.origin + location.pathname
    const match = url.match(pattern)
    const isNumber = !isNaN(parseInt(url))
    const isMatchUrls = matchesUrl(url, urls)
    const apiInput = document?.querySelector('#apiInput')
    if(match || isNumber) {
      const id = isNumber ? url : match[1]
      fetch(`${location.origin}/api/interface/get?id=${id}`).then(res => {
        if(res.status !== 200) {
          showToast('Network error')
          return ;
        }
        res.json().then(data => {
          const isGet = data.data.method === 'GET'
          const requestJSON = isGet ? queryToCode(data.data?.req_query) : RawToTs(JSON.parse(data.data.req_body_other),  { rootName: 'Request' }).reduce((a, b) => `${a}\n\n${b}`).replaceAll(' ?', '?')
          const responseJSON = RawToTs(JSON.parse(data.data.res_body || `{}`), {
            rootName: 'Response'
          }).reduce((a,b) => `${a}\n\n${b}`).replaceAll(' ?', '?')
          renderYapiElem(requestJSON,responseJSON)
        })
      }).catch(e=> {
        showToast('Network error')
      })
    } else if (isMatchUrls){
      renderYapiElem()
    } else {
      // 重置
      if(apiInput) {
        apiInput.value = ''
        editorRequest.setValue('')
        editorResponse.setValue('')
        showToast('Invalid link')
      }
    }

  }

  init()

  chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
      if(data.type === 'POPUP') {
        urls = data.value
        init()
      }
  });

  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: "CONTENT_TO_BACKGROUND"
    }, (response) => {
      console.log(response)
      if(response && response.length) {
        urls = response
        const yapiElem = document.querySelector('#YapiHelper')
        console.log(1111111)
        if(!yapiElem) {
          init()
        }
      }
    })
  }, 1000)
})()