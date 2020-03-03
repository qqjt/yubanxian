const app = getApp();

Page({
  data: {
    userInfo: {
      avatarUrl: '../../images/user-unlogin.png',
      nickName: '请点击登录',
    },
  },

  onLoad: function () {
    const cachedUserInfo = wx.$storage.get('userInfo');
    if (cachedUserInfo) {
      this.setData({
        userInfo: cachedUserInfo
      })
    }
  },

  /**
   * 按钮获取用户信息后，保存并显示到界面
   * 调用云函数获取用户openid
   *
   * @param e
   */
  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      let userInfo = e.detail.userInfo;
      this.setData({
        "userInfo.avatarUrl": userInfo.avatarUrl,
        "userInfo.nickName": userInfo.nickName
      });
      wx.cloud.callFunction({
        name: 'login',
        data: {},
      }).then(res => {
        userInfo['openid'] = res.result.openid;
        wx.$storage.put('userInfo', userInfo);
        this.setData({
          userInfo: e.detail.userInfo
        });
      }).catch(console.error);
    }
  },
});