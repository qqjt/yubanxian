/* 抓取万宝楼（jx3.seasunwbl.com）数据，计算各游戏服务器金价
info: "6,150金"
consignment_id: "542695001766117376"
single_unit_size: 6150      每笔金数
remain_unit_count: 2        笔数
single_unit_price: 1000     每笔人民币售价（几毛钱）
single_count_price: 615     金币/元
seller_role_name: "慕***"    卖家
remaining_time: 258925      剩余挂单时间（秒）
 */

const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const _ = db.command;

const request = require('request');
const baseUrl = 'https://api-wanbaolou.xoyo.com/api/buyer/goods/list';
const servers = [
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
];

/**
 * 拼接请求参数
 * @param data
 * @returns {string}
 */
function encodeQueryParams(data) {
  let queryParams = [];
  if (typeof data === "string") {
    queryParams = data;
  } else if (typeof data === "object") {
    for (let key in data) {
      queryParams.push(key + "=" + encodeURIComponent(data[key]));
    }
  }
  return queryParams.join('&');
}

/**
 * 获取某一页的挂单
 * @param zone_id
 * @param server_id
 * @param page
 * @param count
 * @returns {Promise<Array>}
 */
function getList(zone_id, server_id, page, count) {
  const params = {
    zone_id: zone_id,
    server_id: server_id,
    'sort[single_count_price]': 0,
    game: 'jx3',
    page: page,
    size: 10,
    __ts__: (new Date()).getTime(),
    callback: '__xfe' + count
  };
  const url = baseUrl + '?' + encodeQueryParams(params);
  let list = [];

  return new Promise((resolve, reject) => {
    request({url: url, jar: true},
      (err, res) => {
        if (err) {
          reject('network error');
        }
        const body = res.body.slice(params.callback.length + 1, -2);
        const jsonRes = JSON.parse(body);
        jsonRes.data.list.forEach(function (item) {
          list.push(item);
        });
        return resolve(list);
      })
  })
}

/**
 * 获取某一服务器的所有挂单
 * @param zone_id
 * @param server_id
 * @returns {Promise<[]>}
 */
async function wblSpider(zone_id, server_id) {
  let page = 1;
  const count = 10;
  let res = [];

  let list = await getList(zone_id, server_id, page, count);
  list.forEach(function (item) {
    res.push(item);
  });
  while (list.length === 10) {
    page += 1;
    list = await getList(zone_id, server_id, page, count);
    list.forEach(function (item) {
      res.push(item);
    });
  }
  return res;
}

exports.main = async (event, context) => {
  const ts = new Date().getTime();
  let allServersSummary = {
    serverName: '全服',
    serverId: 'all',
    minPrice: null,
    avgPrice: null,
    maxPrice: null,
    totalCoins: 0,        // 总待售金币数
    totalRMB: 0,          // 待售总金额（人民币）
    totalUnits: 0,        // 总笔数
    totalConsignments: 0, // 总挂单数,
    timestamp: ts
  };
  for (let i = 0; i < servers.length; ++i) {
    for (let j = 0; j < servers[i].servers.length; ++j) {
      // 爬取所有服务器数据
      const consignments = await wblSpider(servers[i].zone_id, (servers[i].servers)[j].server_id);
      let serverSummary = {
        serverName: (servers[i].servers)[j].name,
        serverId: (servers[i].servers)[j].server_id,
        minPrice: null,
        avgPrice: null,
        maxPrice: null,
        totalCoins: 0,
        totalRMB: 0,
        totalUnits: 0,
        totalConsignments: 0,
        timestamp: ts
      };
      for (let k = 0; k < consignments.length; ++k) {
        let item = consignments[k];
        serverSummary.totalUnits += item.remain_unit_count;
        allServersSummary.totalUnits += item.remain_unit_count;

        serverSummary.totalConsignments += 1;
        allServersSummary.totalConsignments += 1;

        serverSummary.totalCoins += item.remain_unit_count * item.single_unit_size;
        allServersSummary.totalCoins += item.remain_unit_count * item.single_unit_size;

        serverSummary.totalRMB += item.remain_unit_count * item.single_unit_price;
        allServersSummary.totalRMB += item.remain_unit_count * item.single_unit_price;

        if (serverSummary.minPrice === null || serverSummary.minPrice > item.single_count_price) {
          serverSummary.minPrice = item.single_count_price;
        }
        if (allServersSummary.minPrice === null || allServersSummary.minPrice > item.single_count_price) {
          allServersSummary.minPrice = item.single_count_price;
        }

        if (serverSummary.maxPrice === null || serverSummary.maxPrice < item.single_count_price) {
          serverSummary.maxPrice = item.single_count_price;
        }
        if (allServersSummary.maxPrice === null || allServersSummary.maxPrice < item.single_count_price) {
          allServersSummary.maxPrice = item.single_count_price;
        }
      }
      if (serverSummary.totalRMB) {
        serverSummary.avgPrice = serverSummary.totalCoins * 100 / serverSummary.totalRMB;
      }
      // 数据入库
      db.collection('wbl_coin_prices').add({
        data: serverSummary
      }).then((res) => {
        console.log(res);
      })
    }
  }
  if (allServersSummary.totalRMB) {
    allServersSummary.avgPrice = allServersSummary.totalCoins * 100 / allServersSummary.totalRMB;
  }
  db.collection('wbl_coin_prices').add({
    data: allServersSummary
  }).then((res) => {
    console.log(res);
  });
  return allServersSummary;
};