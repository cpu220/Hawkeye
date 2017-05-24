/**
 * Created by cpw on 2017/5/18.
 */





class page {
  constructor(){
    this.state={
      chart:{
        count:echarts.init(document.getElementById('count')),
        simply:echarts.init(document.getElementById('simply'))
      },
      request:{
        allJSON:'../result/all.json'
      }
    }
  }
  getJSON(url,callback){
    fetch(url,{
      method:'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origi'
    }).then(function(response){

      response.text().then(function(responseText) {

        const json = JSON.parse(responseText);
        callback(json);
      });
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
        value:json[i].errorCount
      });
      result.simply.data.push(json[i].name);
      result.simply.series.push(json[i].errorCount)
      // result.xAxis.push(json[i].name)
    }
    callback(result);
  }
  init(){
    const _this=this;
    const allJSON = this.state.request.allJSON;
    this.getJSON(allJSON,function(json){
      _this.formatData(json,function(result){
        _this.initChart(result);
      });

    });
  }

  initChart(result){
    this.initAllChart(result);
    this.initEvery(result);
  }
  initAllChart (result){
    var option = {

      title: {
        text: '质量大盘',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ccc'
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 50000,
        inRange: {
          colorLightness: [1, 0]
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
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
        // subtext: '数据来自网络'
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
}


const A = new page();
A.init();

