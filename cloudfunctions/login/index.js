const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

function saveOrUpdate(openid, userInfo) {
  return new Promise((resolve, reject) => {
    db.collection('users').where({'_id': openid}).get().then(
      (res) => {
        if (res.data.length) {
          const existedUserInfo = res.data[0];
          console.log(existedUserInfo);
          //用户已存在，检测用户信息是否改变
          let userInfoChanged = false;
          for (let key in userInfo) {
            if (!(key in existedUserInfo) || existedUserInfo[key] !== userInfo[key]) {
              userInfoChanged = true;
              break;
            }
          }
          // 更新用户信息
          if (userInfoChanged) {
            userInfo['updated_at'] = (new Date()).getTime();
            db.collection('users').doc(openid).update({
              data: userInfo,
            }).then((res) => {
              userInfo['_id'] = openid;
              resolve(userInfo)
            }).catch((e) => {
              console.log(e);
              reject(e);
            });
          } else {
            resolve(existedUserInfo);
          }
        } else {
          //用户未注册
          userInfo['_id'] = openid;
          userInfo['created_at'] = (new Date()).getTime();
          userInfo['updated_at'] = null;
          db.collection('users').add({
            data: userInfo
          }).then((res) => {
            resolve(userInfo)
          }).catch((e) => {
            console.log(e);
            reject(e);
          });
        }
      }
    ).catch((e) => {
      reject(e);
    });
  });
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let userInfo = {};
  // 过滤掉 event 内的 userInfo 字段
  Object.keys(event).forEach((key) => {
    switch (key) {
      case 'userInfo':
        break;
      default:
        userInfo[key] = event[key];
        break;
    }
  });
  return await saveOrUpdate(wxContext.OPENID, userInfo);
};

