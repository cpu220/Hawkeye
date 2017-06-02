const gulp = require('gulp');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');

const common = require('cpwcom');
const connect = require('gulp-connect');
const cfiles = require('cfiles');

const project = require('./project.json');// 工程目录
const white = require('./whiteList.json');// 白名单
const app = require('./package.json');// 包信息

const less = require('gulp-less');
const process = require('child_process');

const getFile = require('getfiles');

const cf = new cfiles();

let timer = null;

const time = common.tools.formatDate(new Date()).split(' ')[0];




const store={
  report:[],
  set:function(json){
    let _this = this ;
    for (var i = 0; i < this.report.length; i++) {
      (function (index,report) {
        if (report[index].name === json.pname && json.errorCount >0) {
          report[index].errorCount = report[index].errorCount + json.errorCount;

          // console.log(`${json.pname}===${report[index].errorCount}`);

          report[index]['child'].push({
            name: json.pname,
            date: time,
            // name2:report[index].name,
            filePath: json.filePath,
            errorCount: json.errorCount
          });
        }
      })(i,_this.report);
    }
  },
  clear:function(){
    this.report=[];
  },
  add:function(item,time){
    this.report.push({
      name: item.name,
      errorCount: 0,
      date: time,
      child: []
    });
  }
}


class action {
  constructor(){
    this.reg =  new RegExp(white.join('|'));
  }
  init(){
    var _this = this;
    gulp.task('s', (req, res) => {
      console.log(`welcome to use ${app.name}${app.version}`);
      connect.server();
    });

    gulp.task('pull',function(){
      _this.doPull();
    });

    gulp.task('default',function(){
      _this.doPull();
      var timer = setInterval(function(){
        _this.doPull();
      },1000*30);
    });
  }
  doPull(){
    const _this = this;
    store.clear();// 清空report
    // const getfile = new getFile();// 重置getfile

    Promise.all(project.map(function(item,index){
      process.exec(`git clone ${item.store} "store/${item.name}"`, (error, stdout, stderr)=>{
        console.log(`${item.name}结束clone`);

        item.getfile =  new getFile();

        store.add(item,time);

        item.getfile.getResult({
          root: item.url,
          suffix: ['js', 'jsx'],
          callback: function (list) {
            _this.eslintList(list);
          }
        });


      });
    })).then();
  }
  eslintList(list) {
    const _this = this;
    Promise.all(list.map(file => {
      if(_this.isWhite(file)){
        return false;
      }else{
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
  createResult(json){
    store.set(json);

    timer = setTimeout(function () {
      clearTimeout(timer);

      console.log('=========eslint end==============');

      cf.create(`result/${time}-all.json`, JSON.stringify(store.report));
      let pArr=[];
      for(let i =0;i<store.report.length;i++){
        pArr.push({
          date:time,
          name:store.report[i].name,
          errorCount:store.report[i].errorCount
        })
      }

      common.file.read(`result/all.json`,data=>{
        let list = JSON.parse(data);
        // 当前时间和最后一个匹配，则覆盖写入
        if(list[list.length-1][0].date === pArr[0].date){
          list.pop();
        }
        list.push(pArr);
        common.file.reset('result/all.json',JSON.stringify(list),function(){});
      });

    }, 1000);
  }

  isWhite(file){
    let name = file.toLowerCase();
    return this.reg.test(name);
  }

}

const A = new action();
A.init();