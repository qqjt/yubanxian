import * as echarts from '../../../ec-canvas/echarts';

Page({
  data: {
    ec: {
      lazyLoad: true
    },
  },

  onReady: function () {
    // 获取组件
    this.ecComponent = this.selectComponent('#echart');
    this.initChart();
    this.showAllChart();
  },

  // 点击按钮后初始化图表
  initChart: function () {
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  // 全区全服金价
  showAllChart: function () {
    wx.cloud.callFunction({
      // 云函数名称
      name: 'wanbaolou',
      // 传给云函数的参数
      data: {
        type: 'all',
        ordering: ['serverId', 'desc']
      },
    }).then(res => {
      console.log(res.result);
      let serverNames = [];
      let minPrices = [];
      let avgPrices = [];
      res.result.forEach(function (item) {
        serverNames.push(item.serverName);
        minPrices.push(item.minPrice);
        avgPrices.push(item.maxPrice);
      });

      let option = {
        color: ['#37a2da', '#32c5e9'],
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
      this.chart.setOption(option);
    }).catch(console.error);
  },

  // 某一区服金价
  showServerChart: function (serverId) {
    wx.cloud.callFunction({
      // 云函数名称
      name: 'wanbaolou',
      // 传给云函数的参数
      data: {
        type: 'single',
        serverId: serverId
      },
    }).then(res => {
      console.log(res.result);
      setOption(this.chart);
    }).catch(console.error);
  }
});