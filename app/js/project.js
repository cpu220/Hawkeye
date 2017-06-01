class page {
  constructor() {

  }

  init() {
    this.state = {
      allJSON: `../result/${this.getDate(new Date()).d}-all.json`
    };

    const A = this._getRequest();
    console.log(`this page is ${A.name}'s Data`);
    this.initTable(A.name);
  }
  getDate(date){
    const arr = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
    const D = date.getDate(),
      M = date.getMonth() + 1,
      Y = date.getFullYear(),
      h = date.getHours(),
      m = date.getMinutes(),
      s = date.getSeconds();
    return {
      d:`${Y}-${arr[M] || M}-${arr[D] || D}`,
      dt:`${Y}-${arr[M] || M}-${arr[D] || D} ${arr[h] || h}:${arr[m] || m}:${arr[s] || s}`,
      t:`${arr[h] || h}:${arr[m] || m}:${arr[s] || s}`
    };
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

  initTable(name) {
    const _this=this;
    new Vue({
      el: '#title-content',
      data: {
        title: name
      }
    });

    const url = this.state.allJSON;
    const list = this.getList(url, name);
    list.then(a => {
      new Vue({
        el: '#app',
        data: {
          data: a
        },
        methods: {
          infoFile:function(item){
            const file = item.filePath;

            location.href=`file.html?name=${name}&date=${item.date}&file=${file.split('/').join('_')}`;
            // _this.getJSON(`../result/${item.name}/${item.date}/${file.split('/').join('_')}.json`,data=>{
            //   console.log(data);
            // });

          }
        }
      });


    });
  }

  getList(url, name) {
    return new Promise((resolve, reject) => {
      this.getJSON(url, function (data) {

        for (var item of data) {
          if (item.name === name) {
            resolve(item.child)
            break;
          }
        }
      });
    })
  }


}

const a = new page();
a.init();