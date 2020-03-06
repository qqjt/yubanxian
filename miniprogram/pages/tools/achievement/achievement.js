Page({
  data: {
    loading: 1,
    achievements: [],
    conditions: {
      collectionName: 'achievements',
      page: 1,
      menu: '杂闻',
      limit: 10,
      ordering: '-_id'
    }
  },
  onReady: function () {
    this.getAchievements(this.data.conditions.page);
  },
  getAchievements: function (page) {
    this.setData({
      loading: 1
    });
    wx.cloud.callFunction({
      name: "dbGetList",
      data: this.data.conditions
    }).then(res => {
      console.log(res.result);
      if (res.result.length) {
        let newAchievements = this.data.achievements.concat(res.result);
        this.setData({
          'achievements': newAchievements,
          'conditions.page': this.data.conditions.page + 1,
          'loading': 0
        });
      } else {
        this.setData({
          loading: -1
        });
      }
    }).catch(console.error);
  }
});