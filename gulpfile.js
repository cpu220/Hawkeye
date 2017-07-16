const gulp = require('gulp');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const fs = require('fs');
const common = require('cpwcom');
const connect = require('gulp-connect');
const cfiles = require('cfiles');

const project = require('./project.json'); // 工程目录
const white = require('./whiteList.json'); // 白名单
const app = require('./package.json'); // 包信息

const less = require('gulp-less');
const child_process = require('child_process');

const getFile = require('getfiles');

const cf = new cfiles();
const fileType = ['js', 'jsx', 'vue']
let timer = null;
const date = common.tools.formatDate(new Date());
const time = date.split(' ')[0];
const logurl = `log/${time}-log.text`;

const period = 1000 * 60 * 60;


const store = {
  report: [],
  set: function (json) {
    let _this = this;
    for (var i = 0; i < this.report.length; i++) {
      (function (index, report) {
        if (report[index].name === json.pname && json.errorCount > 0) {
          let codeLine = json.source.split('\n').length;
          report[index].errorCount += json.errorCount;
          report[index].codeLine += codeLine;
          // console.log(`${json.pname}===${report[index].errorCount}`);

          report[index]['child'].push({
            name: json.pname,
            date: time,
            codeLine: codeLine,
            // name2:report[index].name,
            filePath: json.filePath,
            errorCount: json.errorCount
          });
        }
      })(i, _this.report);
    }
  },
  clear: function () {
    this.report = [];
  },
  add: function (item, time) {
    this.report.push({
      name: item.name,
      errorCount: 0,
      codeLine: 0,
      date: time,
      child: []
    });
  }
}


class action {
  constructor() {
    this.reg = new RegExp(white.join('|'));
  }
  init() {
    var _this = this;
    gulp.task('s', (req, res) => {
      console.log(`welcome to use ${app.name}${app.version},please make sure you run 'gulp' before this server run up`);
      connect.server();
    });

    gulp.task('pull', function () {
      _this.doPull();
    });

    gulp.task('default', function () {
      // _this.doPull();
      // var timer = setInterval(function () {
        _this.doPull();
      // }, period);
    });
    gulp.task('delete', function () {
      fs.unlink('store', err => {
        if (err) {
          console.log(err);
        }
        console.log('deleted');
      })
    });
  }
  doPull() {
    const _this = this;
    store.clear(); // 清空report
    // const getfile = new getFile();// 重置getfile

    // 遍历project.json
    Promise.all(project.map(function (item, index) {
      child_process.exec('rm -rf store', (error, stdout, stderr) => {
        let name = item.store.split('/').pop().split('.')[0];
        item.name=name;// 再命名

        child_process.exec(`git clone ${item.store} "store/${name}"`, (error, stdout, stderr) => {
          if(error){
            console.log(stdout);
            console.log(`${name} download error,maybe you have not right to clone this project,please to checkout out,this error will be end of this progress。 `);
            return false;
          }
          console.log(`=== checkout out ${name} ===`);
          common.file.set(logurl, `${date}:${item.name}结束clone\n`);
          item.getfile = new getFile();

          store.add(item, time);

          item.getfile.getResult({
            root: `store/${name}`,
            suffix: fileType,
            callback: function (list) {
              console.log(`${list} \n`);

              _this.eslintList(list);
            }
          });


        });
      });

    })).then();
  }
  eslintList(list) {
    const _this = this;
    Promise.all(list.map(file => {
      if (_this.isWhite(file)) {
        return false;
      } else {
        let filePromise = new Promise((resolve, reject) => {
          gulp.src(file).pipe(eslint()).pipe(eslint.format('json', result => {
            const pname = file.substring(file.indexOf('store')).split('/')[1]; // 当前eslint的项目名称
            const obj = JSON.parse(result)[0];
            obj.pname = pname; // 为了做异步区分，所以对obj进行了重赋值
            clearTimeout(timer);
            let dir = `result/${pname}/${time}/${file.split('/').join('_')}.json`;


            cf.create(dir, JSON.stringify(obj));
            resolve(obj);
          }));
        });

        filePromise.then((json) => {
          _this.createResult(json);
        });

      }

    }));
  }
  createResult(json) {
    store.set(json);
    const allJSON = `result/all.json`;
    timer = setTimeout(function () {
      clearTimeout(timer);

      common.file.set(logurl, `${date}:eslint 结束\n`);
      common.file.set(logurl, `============================\n`);


      console.log('=========eslint end==============');

      cf.create(`result/${time}-all.json`, JSON.stringify(store.report));
      let pArr = [];
      for (let i = 0; i < store.report.length; i++) {
        pArr.push({
          date: time,
          name: store.report[i].name,
          errorCount: store.report[i].errorCount
        });
      }

      common.file.read(allJSON).then(data => {
        let list = JSON.parse(data);
        // 当前时间和最后一个匹配，则覆盖写入
        if (list[list.length - 1][0].date === pArr[0].date) {
          list.pop();
        }
        list.push(pArr);
        common.file.reset(allJSON, JSON.stringify(list), function () {});
      }).catch(err => {
        let list = [];
        list.push(pArr);
        cf.create(allJSON, JSON.stringify(list), function () {});
      });

    }, 1000);
  }

  isWhite(file) {
    let name = file.toLowerCase();
    return this.reg.test(name);
  }

}

const A = new action();
A.init();



/*以下为工程测试代码*/
gulp.task('less', function () {
  gulp.src(['src/index/*.less']).pipe(less()).pipe(gulp.dest('src/dist'));

});