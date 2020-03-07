const app = getApp();

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
  },

  onLoad: function () {
    const cachedUserInfo = wx.$storage.get('cachedUserInfo');
    if (cachedUserInfo) {
      this.setData({
        userInfo: cachedUserInfo
      })
    } else {
      // 未从缓存拿到，尝试去云函数获取
      wx.cloud.callFunction({
        name: 'login',
        data: {},
      }).then(res => {
        const userInfo = res.result;
        // 从云数据库获取到了用户信息
        if ('avatarUrl' in userInfo && 'nickName' in userInfo) {
          wx.$storage.put('cachedUserInfo', userInfo, 86400000);
          this.setData({
            userInfo: userInfo
          });
        }
      }).catch(console.error);
    }
  },

  /**
   * 按钮获取用户信息后，显示到界面，保存用户信息到数据库
   * @param e
   */
  onGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      let userInfo = e.detail.userInfo;
      this.setData({
        "userInfo.avatarUrl": userInfo.avatarUrl,
        "userInfo.nickName": userInfo.nickName
      });
      // 将用户信息更新到数据库
      wx.cloud.callFunction({
        name: 'login',
        data: userInfo,
      }).then(res => {
        // 用户信息缓存一天（86400000 毫秒）
        wx.$storage.put('cachedUserInfo', res.result, 86400000);
        this.setData({
          userInfo: res.result
        });
      }).catch(console.error);
    }
  },
});