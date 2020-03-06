Page({
  data: {
    multiIndex: [0, 0],
    multiArray: [[], []],
    loading: 1,
    achievementCategories: [],
    achievements: [],
    queryParams: {
      collectionName: 'achievements',
      page: 1,
      limit: 10,
    }
  },
  onReady: function () {
    this.initCategorySelect();
    this.getAchievements();
  },
  initCategorySelect: function () {
    // 获取成就分类
    let achievementCategories = wx.$storage.get('achievement_categories');
    if (achievementCategories) {
      // 初始化下拉框数组
      let menus = ['全部分类'];
      for (let i = 0; i < achievementCategories.length; ++i) {
        menus.push(achievementCategories[i].name);
      }
      this.setData({
        achievementCategories: achievementCategories,
        multiArray: [menus, ['全部子类']],
      });
    } else {
      wx.cloud.callFunction({
        name: "dbGetList",
        data: {
          collectionName: 'achievement_categories',
          limit: 0
        },
        success: res => {
          if (res.result.length) {
            achievementCategories = res.result;
            wx.$storage.put('achievement_categories', achievementCategories, 86400000);
            // 初始化下拉框数组
            let menus = ['全部分类'];
            for (let i = 0; i < achievementCategories.length; ++i) {
              menus.push(achievementCategories[i].name);
            }
            this.setData({
              achievementCategories: achievementCategories,
              multiArray: [menus, ['全部子类']],
            });
          }
        },
        fail: err => {
          console.error(err);
        }
      });
    }
  },

  /**
   * 多列选择选中值
   * @param e
   */
  bindMultiPickerChange: function (e) {
    this.setData({
      achievements: [],
      multiIndex: e.detail.value,
      'queryParams.page': 1
    });
    this.getAchievements();
  },
  /**
   * 多列选择联动
   * @param e
   */
  bindMultiPickerColumnChange: function (e) {
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        if (e.detail.value === 0) {
          data.multiArray[1] = ['全部子类'];
        } else {
          data.multiArray[1] = ['全部子类'].concat(this.data.achievementCategories[e.detail.value - 1].subMenus);
          for (let i = 0; i < data.multiArray[1].length; ++i) {
            if (data.multiArray[1][i] === '') {
              data.multiArray[1][i] = '(无)'
            }
          }
        }
        data.multiIndex[1] = 0;
        break;
    }
    this.setData(data);
  },
  getAchievements: function () {
    console.log(this.data);
    this.setData({
      loading: 1
    });
    let queryParams = this.data.queryParams;
    if (this.data.multiIndex[0] !== 0) {
      queryParams['menu'] = this.data.multiArray[0][this.data.multiIndex[0]];
    }
    if (this.data.multiIndex[1] !== 0) {
      let subMenu = this.data.multiArray[1][this.data.multiIndex[1]];
      if (subMenu === '(无)')
        subMenu = '';
      queryParams['subMenu'] = subMenu;
    }
    console.log(queryParams);
    wx.cloud.callFunction({
      name: "dbGetList",
      data: queryParams
    }).then(res => {
      if (res.result.length) {
        let newAchievements = this.data.achievements.concat(res.result);
        const loading = res.result.length === queryParams['limit']? 0: -1;
        this.setData({
          achievements: newAchievements,
          'queryParams.page': this.data.queryParams.page + 1,
          loading: loading
        });
      } else {
        this.setData({
          loading: -1
        });
      }
    }).catch(console.error);
  }
});