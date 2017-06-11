## 质量大盘
* 用来对指定配置的代码仓库进行质量规范扫描
* 目前功能正在完善中

## 使用说明
## 依赖
* node >= 6.0.0
* chrome 浏览器（因为页面代码全部es6语法写，暂时没有进行编码的打算）

``` node 
* npm install
```
### 添加监控项目
* 打开project.json，根据格式进行添加
``` javascript
{
  "name":"ant-awards",// 项目名称，随便你爱些什么写什么
  "store":"git@gitlab.odc.com:test/ant-awards.git",// 仓库地址，用于定时更新代码
  "url":"store/ant-awards/app"// 扫描路径
}
```

### 启动
``` javascript
gulp s // 启动服务器
gulp // 启动定时扫描
```

### 日志
* 日志默认按日期打印到log目录下，所以暂时不需要关心

### 扫描白名单
* whiteList.json
* 按格式添加，不区分大小写，默认所有*.min.js一定不扫描

## store
* 项目代码存储所在目录

## result
* 扫描结果存储目录
* 项目维度按项目目录存放，所有项目合集为[日期-all.json]来记录存放，全日期维度存放在[all.json]


## update log



