class page {
  constructor() {

  }

  init() {
    this.state = {
      fileJSON: ''
    };

     const A = this._getRequest();
     this.state.fileJSON=`../result/${A.name}/${A.date}/${A.file}.json`;
     this.initTable(A);
  }

  _getRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
      var str = url.substr(1),
        strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
      }
    }
    return theRequest;
  }

  getJSON(url, callback) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origi'
    }).then(function (response) {

      response.text().then(function (responseText) {

        const json = JSON.parse(responseText);
        callback(json);
      });
    });
  }

  initTable(obj) {
    const _this=this;
    new Vue({
      el: '#title-content',
      data: {
        title: `${obj.name}/${obj.file}`
      }
    });

    const url = this.state.fileJSON;
    const list = this.getList(url, name);
    list.then(data=>{
      new Vue({
        el: '#app',
        data: data,
        methods: {
          infoFile:function(item){
            // const file = item.filePath;

            // location.href=`file.html?name=${name}&date=${item.date}&file=${file.split('/').join('_')}`;
            // _this.getJSON(`../result/${item.name}/${item.date}/${file.split('/').join('_')}.json`,data=>{
            //   console.log(data);
            // });

          }
        }
      });
    })

  }

  getList(url, name) {
    return new Promise((resolve, reject) => {
      this.getJSON(url, function (data) {

        resolve(data);
        // for (var item of data) {
        //   if (item.name === name) {
        //     resolve(item.child)
        //     break;
        //   }
        // }
      });
    })
  }


}

const a = new page();
a.init();