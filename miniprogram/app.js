import "utils/storage";

// 为 Date 添加格式化方法 format
Date.prototype.format = function (fmt) {
  let o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ?
        (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
};

App({
  globalData: {
    servers: [
      {
        zone_id: "z01",
        name: "电信一区",
        servers: [
          {
            server_id: "gate0126",
            name: "蝶恋花"
          },
          {
            server_id: "gate0115",
            name: "龙争虎斗"
          },
          {
            server_id: "gate0101",
            name: "长安城"
          }
        ]
      },
      {
        zone_id: "z05",
        name: "电信五区",
        servers: [
          {
            server_id: "gate0519",
            name: "幽月轮"
          },
          {
            server_id: "gate0515",
            name: "斗转星移"
          },
          {
            server_id: "gate0524",
            name: "剑胆琴心"
          },
          {
            server_id: "gate0514",
            name: "乾坤一掷"
          },
          {
            server_id: "gate0505",
            name: "唯我独尊"
          },
          {
            server_id: "gate0502",
            name: "梦江南"
          }
        ]
      },
      {
        zone_id: "z08",
        name: "电信八区",
        servers: [
          {
            server_id: "gate0807",
            name: "绝代天骄"
          }
        ]
      },
      {
        zone_id: "z21",
        name: "双线一区",
        servers: [
          {
            server_id: "gate2107",
            name: "天鹅坪"
          },
          {
            server_id: "gate2106",
            name: "破阵子"
          }
        ]
      },
      {
        zone_id: "z22",
        name: "双线二区",
        servers: [
          {
            server_id: "gate2204",
            name: "飞龙在天"
          }
        ]
      },
      {
        zone_id: "z24",
        name: "双线四区",
        servers: [
          {
            server_id: "gate2402",
            name: "青梅煮酒"
          },
          {
            server_id: "gate2407",
            name: "凌雪藏锋"
          },
          {
            server_id: "gate2409",
            name: "风月同天"
          }
        ]
      },
      {
        zone_id: "z29",
        name: "双线PVP搞事区",
        servers: [
          {
            server_id: "gate2901",
            name: "止戈为武"
          }
        ]
      },
      {
        zone_id: "z31",
        name: "电信PVP搞事区",
        servers: [
          {
            server_id: "gate3101",
            name: "百无禁忌"
          }
        ]
      }
    ],
    menpai: ['万花', '七秀', '少林', '纯阳', '天策', '藏剑', '五毒', '唐门', '明教', '丐帮', '苍云', '长歌', '霸刀', '蓬莱', '凌雪']
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      });
    }
  }
});