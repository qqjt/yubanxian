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

let consignments = {};

/**
 * 拼接请求参数
 * @param data
 * @returns {string}
 */
function encodeQueryParams(data) {
    let res = [];
    if (typeof data === "string") {
        res = data;
    } else if (typeof data === "object") {
        for (let key in data) {
            res.push(key + "=" + encodeURIComponent(data[key]));
        }
    }
    return res.join('&');
}

/**
 * 获取寄售单，递归调用
 * @param zone_id
 * @param server_id
 * @param page
 * @param count
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
    request({url: url, jar: true}, function (error, response, body) {
        body = body.slice(params.callback.length + 1, -2);
        const res = JSON.parse(body);
        if (res.data) {
            if (!(server_id in consignments)){
                consignments[server_id] = [];
            }
            // 存入云数据库
            res.data.list.forEach(function (item) {
                item['server_id'] = server_id;
                item['_id'] = item['consignment_id'];
                db.collection('goods').add({
                    data: item,
                    success: function (res) {
                    }
                });
                consignments[server_id].push(item);
            });
            if (res.data.list.length === 10) {
                getList(zone_id, server_id, page + 1, count + 1);
            } else {
                console.log(consignments[server_id]);
            }
        }
    });
}

exports.main = async (event, context) => {
    // 先清空数据库
    db.collection('goods').where({_id: _.neq(0)}).remove()
        .then(res=> {
            console.log(res)
        });
    servers.forEach(function (zone) {
        zone.servers.forEach(function (server) {
            // db.collection('goods').where({server_id: server.server_id}).remove({
            //     success: function (res) {
            //     }
            // });
            getList(zone.zone_id, server.server_id, 1, 4);
        })
    });
};