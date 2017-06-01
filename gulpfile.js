const gulp = require('gulp');
const eslint = require('gulp-eslint');
const common = require('cpwcom');
const connect = require('gulp-connect');
const cfiles = require('cfiles');
const project = require('./project.json');
const less = require('gulp-less');
const process = require('child_process');
const shell = require('gulp-shell');

const getFile = require('getfiles');

const cf = new cfiles();

const getfile = new getFile();

let report = [];
let timer = null;

const time = common.tools.formatDate(new Date()).split(' ')[0];

// gulp.task('default', ['eslint', 's'], function () {});

// 启动服务
gulp.task('s', (req, res) => {
  connect.server();
});
// eslint扫描
// gulp.task('default',['pull','eslint','s'], function () {});

gulp.task('pull',function(){
  Promise.all(project.map(function(item,index){
    process.exec(`git clone ${item.store} "store/${item.name}"`, (error, stdout, stderr)=>{
      // console.log(`${item.name}结束clone`);
      report.push({
        name: item.name,
        errorCount: 0,
        date: time,
        child: []
      });

      getfile.getResult({
        root: item.url,
        suffix: ['js', 'jsx'],
        callback: function (list) {
          eslintList(list, report);
        }
      });

    });
  })).then();
});

gulp.task('default',function(){
  doEslint();
});

function doEslint(){

  var promiseAll = project.map(item => {

    report.push({
      name: item.name,
      errorCount: 0,
      date: time,
      child: []
    });

    getfile.getResult({
      root: item.url,
      suffix: ['js', 'jsx'],
      callback: function (list) {
        eslintList(list, report);
      }
    });
  });
  Promise.all(promiseAll).then();
}



function eslintList(list, arr) {

  Promise.all(list.map(file => {

    var filePromise = new Promise((resolve, reject) => {
      gulp.src(file).pipe(eslint()).pipe(eslint.format('json', result => {
        const pname = file.substring(file.indexOf('store')).split('/')[1]; // 项目名称
        const obj = JSON.parse(result)[0];
        obj.pname = pname; // 为了做异步区分，所以对obj进行了重赋值
        clearTimeout(timer);
        let dir = `result/${pname}/${time}/${file.split('/').join('_')}.json`;


        cf.create(dir, JSON.stringify(obj));
        resolve(obj);
      }));
    });

    filePromise.then((json) => {
      // 哨兵变量
      setStore(json);
      timer = setTimeout(function () {
        clearTimeout(timer);
        console.log('=========end==============');
        cf.create(`result/${time}-all.json`, JSON.stringify(arr));
        var pArr=[];
        for(var i =0;i<arr.length;i++){
          pArr.push({
            date:time,
            name:arr[i].name,
            errorCount:arr[i].errorCount
          })
        }

        common.file.read(`result/all.json`,data=>{
          var list = JSON.parse(data);
          if(list[list.length-1][0].date !== pArr[0].date){
            list.push(pArr);
            common.file.reset(`result/all.json`,JSON.stringify(list),function(){});
          }
        });

      }, 1000);
    });

  }));
}


function setStore(json) {
  for (var i = 0; i < report.length; i++) {
    (function (index) {
      if (report[index].name === json.pname && json.errorCount >0) {
        report[index].errorCount = report[index].errorCount + json.errorCount;
        report[index]['child'].push({
          name: json.pname,
          date: time,
          // name2:report[index].name,
          filePath: json.filePath,
          errorCount: json.errorCount
        });
      }
    })(i);
  }

}




/*以下为工程测试代码*/
gulp.task('less', function () {
  gulp.src(['src/index/*.less']).pipe(less()).pipe(gulp.dest('src/dist'));

});