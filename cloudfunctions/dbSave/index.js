const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

function save(collectionName, data) {
  return new Promise((resolve, reject) => {
    db.collection(collectionName).add({
      data: data
    }).then((res) => {
      data['_id'] = res._id;
      resolve(data)
    }).catch((e) => {
      console.log(e);
      reject(e);
    });
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  let query = db.collection(event.collectionName);
  let data = {
    'created_at': (new Date()).getTime(),
    'updated_at': null
  };
  Object.keys(event).forEach((key) => {
    switch (key) {
      case 'collectionName':
        break;
      case 'userInfo':
        break;
      case 'openid':
        if (event.openid) {
          const wxContext = cloud.getWXContext();
          data['created_by'] = wxContext.OPENID;
        }
        break;
      default:
        data[key] = event[key];
        break;
    }
  });
  return await save(event.collectionName, data);
};