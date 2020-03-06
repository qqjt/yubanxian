Page({
  data: {
    icon20: '/images/tools/coin.png',
    icon60: '/images/tools/coin.png',
    achievements: [],
    conditions: {
      collectionName: 'achievements',
      page: 1,
      menu: '杂闻',
      length: 10,
      ordering: '-_id'
    }
  },
  onReady: function () {
    this.getAchievements(this.data.conditions.page);
  },
  getAchievements: function (page) {
    wx.cloud.callFunction({
      name: "dbGetList",
      data: this.data.conditions
    }).then(res => {
      console.log(res.result);
      let newAchievements = this.data.achievements.concat(res.result);
      this.setData({
        'achievements': newAchievements,
        'conditions.page': this.data.conditions.page + 1
      });
    }).catch(console.error);
  }
});