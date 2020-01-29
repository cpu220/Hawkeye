/**
 * Created by cpw on 2017/5/18.
 */





class page {
  constructor(){
    this.state={
      chart:{
        count:echarts.init(document.getElementById('count')),
        simply:echarts.init(document.getElementById('simply')),
        line:echarts.init(document.getElementById('line'))
      },
      request:{
        dateJSON:`../result/${this.getDate(new Date()).d}-all.json`,
        allJSON:`../result/all.json`
      }
    }
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
  getJSON(url,callback){
    fetch(url,{
      method:'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // credentials: 'same-origi'
    }).then(function(response){

      response.text().then(function(responseText) {

        const json = JSON.parse(responseText);
        callback(json);
      });
    }).catch((err)=>{
      console.error(err)
    });
  }

  formatData (json,callback){
    var result ={
       AllChart:[],
       simply:{
         data:[],
         series:[]

       }
    };
    for(var i=0;i<json.length;i++){
      result.AllChart.push({
        name:json[i].name,
        value: (json[i].errorCount/(json[i].codeLine/1000)).toFixed(2)
      });
      result.simply.data.push(json[i].name);
      result.simply.series.push(json[i].errorCount)
      // result.xAxis.push(json[i].name)
    }
    callback(result);
  }
  formatAllData(json,callback){
    var _this=this;
    var result={
      xAxis:[],
      series:[],
      legend:[]
    };
    for(var x =0;x<json.length;x++){
      result.xAxis.push(json[x][0].date);
      for(var y=0;y<json[x].length;y++){
        // 判断当前项目是否已添加进result，如果没有则按格式添加
        const judge = _this.hasObj(result.series,json[x][y]);
        if(judge.status){
          // 说明类目已录入
          result.series[judge.index].data.push(json[x][y].errorCount);
        }else{
          // 类目未录入
          result.legend.push(json[x][y].name);
          result.series.push({
            name:json[x][y].name,
            type:'line',
            data:[json[x][y].errorCount],
            markPoint: {
              data: [
                {type: 'max', name: '最大值'},
                {type: 'min', name: '最小值'}
              ]
            },markLine: {
              data: [
                {type: 'average', name: '平均值'}
              ]
            }
          });
        }

      }
    }
    callback(result);
  }
  hasObj(oldItem,newItem){
    var status = false,index=0;
    for(var x=0;x<oldItem.length;x++){
      if(oldItem[x].name === newItem.name){
        status = true;
        index=x;
      }
    }
    return {
      status:status,
      index:index
    };
  }
  init(){
    const _this=this;
    const dateJSON = this.state.request.dateJSON;
    const allJSON = this.state.request.allJSON;
    this.getJSON(dateJSON,function(json){
      _this.formatData(json,function(result){
        _this.initChart(result);
      });
    });
    this.getJSON(allJSON,function(json){
      _this.formatAllData(json,function(result){
        _this.initLine(result);
      });
    });
  }

  initChart(result){
    this.initAllChart(result);
    this.initEvery(result);

    // this.initLine(result);
  }
  initAllChart (result){
    var option = {

      title: {
        text: '千行代码bug率总表',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ccc'
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 3000,
        inRange: {
          colorLightness: [1, 0]
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: "{b} <br/>{c} ({d}‰)"
      },
      legend: {
        orient: 'vertical',
        x: 'left'
      },
      series :  [
        {
          type:'pie',
          radius: '55%',
          data:result.AllChart
        }
      ]
    };
    const chart = this.state.chart.count;
    chart.setOption(option);
    chart.on('click', function (params) {
      // 控制台打印数据的名称
      location.href=`project.html?name=${params.name}`;
    });

  }
  initEvery(result){
    var option = {
      title: {
        text: '质量大盘',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0,1]
      },
      yAxis: {
        type: 'category',
        data: result.simply.data
      },
      series: [
        {

          type: 'bar',
          data: result.simply.series
        }
      ]
    };
    const chart = this.state.chart.simply;
    chart.setOption(option);
    chart.on('click', function (params) {
      // 控制台打印数据的名称
      location.href=`project.html?name=${params.name}`;
    });
  }
  initLine(result){

    const option = {
      title: {
        text: '趋势表'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data:result.legend
      },
      xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: result.xAxis
      },
      yAxis: {
        type: 'value'

      },
      series: result.series
    };

    const chart = this.state.chart.line;
    chart.setOption(option);

  }
}


const A = new page();
A.init();

