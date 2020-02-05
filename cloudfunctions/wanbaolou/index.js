// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();
const _ = db.command;

const request = require('request');
const baseUrl = 'https://api-wanbaolou.xoyo.com/api/buyer/goods/list';
const servers = [
  {
    zone_id: "z29",
    name: "双线PVP搞事区",
    servers: [
      {
        server_id: "gate2901",
        name: "止戈为武"
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
 * @returns {Promise<unknown>}
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
          reject('net error');
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
  let count = 10;
  let res = [];
  let times = 1;

  let list = await getList('z05', 'gate0515', page, count);
  list.forEach(function (item) {
    res.push(item);
  });
  while (list.length === 10) {
    page += 1;
    list = await getList('z05', 'gate0515', page, count);
    list.forEach(function (item) {
      res.push(item);
    });
  }
  return res;
}

exports.main = async (event, context) => {
  for (let i = 0; i < servers.length; ++i) {
    for (let j = 0; j < servers[i].servers.length; ++j) {
      let consignments = await wblSpider(servers[i].zone_id, servers[i].servers[j].server_id);
      console.log(consignments);
    }
  }
};