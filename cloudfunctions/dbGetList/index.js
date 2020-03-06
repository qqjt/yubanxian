// 云函数-成就信息查询
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event', event);
  let query = db.collection(event.collectionName);
  let ordering = ['', ''];
  let page = 1;
  let limit = 100;
  let conditions = {};

  Object.keys(event).forEach((key) => {
    switch (key) {
      case 'collectionName':
        break;
      case 'userInfo':
        break;
      case 'ordering':
        if (event[key][0] === '-') {
          ordering[0] = event[key].substr(1)
          ordering[1] = 'desc';
        } else {
          ordering[0] = event[key];
          ordering[1] = 'asc';
        }
        break;
      case 'page':
        page = parseInt(event[key]);
        break;
      case 'limit':
        limit = parseInt(event[key]);
        break;
      default:
        conditions[key] = event[key];
        break;
    }
  });
  if (!isEmpty(conditions)) {
    query = query.where(conditions);
  }
  if (ordering[0])
    query = query.orderBy(ordering[0], ordering[1]);
  if (page > 1)
    query = query.skip(limit * (page - 1));
  if(limit !==0 )
    query = query.limit(limit);
  const result = await query.get();
  return result.data;
};

/**
 * 判断对象是否非空
 * @param obj
 * @returns {boolean}
 */
function isEmpty(obj) {
  for (let i in obj) {
    return false;
  }
  return true;
}