import * as echarts from '../../../ec-canvas/echarts';

// 获取区服名称等信息
const app = getApp();
const servers = app.globalData.servers;
let zoneNames = ['全区全服'];
let serverNames = [[]];
servers.forEach(function (zone) {
  zoneNames.push(zone.name);
  let names = [];
  zone.servers.forEach(function (server) {
    names.push(server.name);
  });
  serverNames.push(names);
});

Page({
  data: {
    servers: servers,
    multiIndex: [0, 0],
    multiArray: [zoneNames, []],
    ec: {
      lazyLoad: true
    },
  },
  /**
   * 区服选择
   * @param e
   */
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    });
    if (e.detail.value[0] === 0) {
      this.showAllServersChart();
    } else {
      let serverId = this.data.servers[e.detail.value[0] - 1].servers[e.detail.value[1]].server_id;
      this.showSingleServerChart(serverId);
    }
  },
  /**
   * 多列选择联动
   * @param e
   */
  bindMultiPickerColumnChange: function (e) {
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    if (e.detail.column === 0) {
      data.multiArray[1] = serverNames[e.detail.value];
      data.multiIndex[1] = 0;
    }
    this.setData(data);
  },

  onReady: function () {
    // 获取组件
    this.ecComponent = this.selectComponent('#echart');
    this.initChart();
    let wanbaolouAll = wx.getStorageSync('wanbaolou_all');
    let wanbaolouAllExpire = wx.getStorageSync('wanbaolou_all__expire__');
    if (!(wanbaolouAll && wanbaolouAllExpire > (new Date()).getTime())) {
      this.refreshAllServersChart();
    }
  },
  onShareAppMessage: function () {
  },
  // 初始化图表
  initChart: function () {
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      let wanbaolouAll = wx.$storage.get('wanbaolou_all');
      if (wanbaolouAll) {
        let option = this.genAllServersChartOption(wanbaolouAll);
        chart.setOption(option);
      }
      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  // 根据数值生成全服图表的 option
  genAllServersChartOption: function (arr) {
    let serverNames = [];
    let minPrices = [];
    let avgPrices = [];
    arr.forEach(function (item) {
      serverNames.push(item.serverName);
      minPrices.push(item.minPrice);
      avgPrices.push(item.maxPrice);
    });
    return {
      color: ['#07c160', '#32c5e9'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['最低价', '平均价'],
        show: true
      },
      grid: {
        left: 20,
        right: 20,
        bottom: 15,
        top: 40,
        containLabel: true
      },
      xAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {}
          },
          axisLabel: {
            fontSize: '13'
          }
        }
      ],
      yAxis: [
        {
          type: 'category',
          axisTick: {show: false},
          data: serverNames,
          axisLine: {
            lineStyle: {}
          },
          axisLabel: {
            fontSize: '13'
          }
        }
      ],
      series: [
        {
          name: '最低价',
          type: 'bar',
          barGap: 0,
          label: {
            normal: {
              show: true,
              position: 'right',
              rich: {}
            }
          },
          data: minPrices,
          itemStyle: {}
        },
        {
          name: '平均价',
          type: 'bar',
          label: {
            normal: {
              show: true,
              position: 'right',
              rich: {}
            }
          },
          data: avgPrices,
          itemStyle: {}
        }
      ]
    };
  },

  // 根据数值生成全服图表的 option
  genSingleServersChartOption: function (arr) {
    let timestamps = [];
    let minPrices = [];
    let avgPrices = [];
    let xMin = 500, temp = 500, datetime = null;
    arr.forEach(function (item) {
      datetime = new Date(item.timestamp);
      timestamps.push(datetime.format("hh:mm"));
      minPrices.push(item.minPrice);
      avgPrices.push(item.maxPrice);
      temp = Math.floor(item.maxPrice / 100) * 100;
      if (temp < xMin) {
        xMin = temp;
      }
    });
    return {
      color: ['#07c160', '#32c5e9'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['最低价', '平均价'],
        show: true
      },
      grid: {
        left: 20,
        right: 20,
        bottom: 15,
        top: 40,
        containLabel: true
      },
      xAxis: [
        {
          type: 'value',
          min: xMin,
          axisLine: {
            lineStyle: {}
          },
          axisLabel: {
            fontSize: '13'
          }
        }
      ],
      yAxis: [
        {
          type: 'category',
          axisTick: {show: false},
          data: timestamps,
          axisLine: {
            lineStyle: {}
          },
          axisLabel: {
            fontSize: '13'
          }
        }
      ],
      series: [
        {
          name: '最低价',
          type: 'line',
          barGap: 0,
          label: {
            normal: {
              show: true,
              position: 'right',
              rich: {}
            }
          },
          data: minPrices,
          itemStyle: {}
        },
        {
          name: '平均价',
          type: 'line',
          label: {
            normal: {
              show: true,
              position: 'left',
              rich: {}
            }
          },
          data: avgPrices,
          itemStyle: {}
        }
      ]
    };
  },
  // 刷新全区全服金价
  refreshAllServersChart: function () {
    wx.cloud.callFunction({
      // 云函数名称
      name: 'wanbaolou',
      // 传给云函数的参数
      data: {
        type: 'all',
        ordering: ['serverId', 'desc']
      },
    }).then(res => {
      wx.$storage.put('wanbaolou_all', res.result, res.result[0]['timestamp'] + 3600000 - (new Date()).getTime());
      let option = this.genAllServersChartOption(res.result);
      this.chart.setOption(option);
    }).catch(console.error);
  },

  //显示全区全服金价，数据过期则刷新
  showAllServersChart: function () {
    let wanbaolouAll = wx.$storage.get('wanbaolou_all');
    if (!wanbaolouAll) {
      this.refreshAllServersChart();
    } else {
      let option = this.genAllServersChartOption(wanbaolouAll);
      this.chart.setOption(option);
    }
  },

  // 显示某一区服金价
  showSingleServerChart: function (serverId) {
    let singleKey = 'wanbaolou_' + serverId;
    let wanbaolouSingle = wx.$storage.get(singleKey);
    if (wanbaolouSingle) {
      let option = this.genSingleServersChartOption(wanbaolouSingle);
      this.chart.setOption(option);
    } else {
      wx.cloud.callFunction({
        // 云函数名称
        name: 'wanbaolou',
        // 传给云函数的参数
        data: {
          type: 'single',
          serverId: serverId
        },
      }).then(res => {
        wx.$storage.put('wanbaolou_' + serverId, res.result, res.result[res.result.length-1]['timestamp'] + 3600000 - (new Date()).getTime());
        let option = this.genSingleServersChartOption(res.result);
        this.chart.setOption(option);
      }).catch(console.error);
    }
  }
});