const gulp = require('gulp');
const eslint = require('gulp-eslint');
const common = require('cpwcom');
const connect = require('gulp-connect');
const cfiles = require('cfiles');
const project = require('./project.json');

const getFile = require('getFiles');

const cf = new cfiles();
const getfile = new getFile(project[0].url, ['jsx','js']);

let report= [];
const time=common.tools.formatDate(new Date()).split(' ')[0];

gulp.task('s',  (req, res) =>{
  connect.server();
});


// let flg=true;// 进程初始化 true=>完毕 false=> 进程中

let timer = null;

gulp.task('default',['eslint','s'],function(){});
gulp.task('eslint',function(){

  var promiseAll = project.map(item=>{



    report.push({
      name:item.name,
      errorCount:0,
      date:time,
      child:[]
    });

    getfile.getResult({
      root:item.url,
      suffix:['js','jsx'],
      callback: function (list) {


        Promise.all(list.map(file=>{

          new Promise((resolve,reject)=>{
            gulp.src(file).pipe(eslint()).pipe(eslint.format('json',result=>{
              const pname = file.substring(file.indexOf('store')).split('/')[1]
              const obj = JSON.parse(result)[0];
              obj.pname=pname;
              clearTimeout(timer);
              let dir = `result/${pname}/${time}/${file.split('/').join('_')}.json`;


              cf.create(dir,JSON.stringify(obj));
              resolve(obj);
            }));
          }).then((json)=>{



            setStore(json);

            timer = setTimeout(function(){
              clearTimeout(timer);
              console.log('=========end==============');
              console.log(report);
              cf.create(`result/all.json`,JSON.stringify(report));// todo 还需要扩展
            },2000);

          });


        }))

      }

    });



  });

  Promise.all(promiseAll).then();

});

function setStore(json){
  for(var i=0;i< report.length;i++){
    (function(index){
      if(report[index].name === json.pname){
        console.log(json.filePath)
        report[index].errorCount =   report[index].errorCount+json.errorCount;
        report[index]['child'].push({
          name:json.pname,
          date:time,
          // name2:report[index].name,
          filePath:json.filePath,
          errorCount:json.errorCount
        });
      }
    })(i);
  }

}


