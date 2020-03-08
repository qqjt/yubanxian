const app = getApp();
// 获取区服名称等信息
const servers = app.globalData.servers;
let zoneNames = ['选择服务器'];
let serverNames = [[]];
servers.forEach(function (zone) {
  zoneNames.push(zone.name);
  let names = [];
  zone.servers.forEach(function (server) {
    names.push(server.name);
  });
  serverNames.push(names);
});

Page({
  data: {
    showDialog: false,
    characters: [],
    character: {
      id: ''
    },
    servers: servers,
    multiIndex: [0, 0],
    multiArray: [zoneNames, []],
    menpaiIndex: 0,
    menpaiList: ['选择门派'].concat(app.globalData.menpai),
  },
  onReady: function(){
    // 加载用户的游戏角色
    const characters = wx.$storage.get('characters');
    if (characters) {
      this.setData({
        characters: characters
      })
    } else {
      this.refreshCharacters();
    }
  },
  openDialog: function () {
    this.setData({
      showDialog: true
    })
  },
  closeDialog: function () {
    this.setData({
      showDialog: false
    })
  },
  stopEvent: function () {
  },
  // 门派选择
  bindMenpaiChange: function (e) {
    this.setData({
      menpaiIndex: e.detail.value
    })
  },
  /**
   * 区服选择
   * @param e
   */
  bindMultiPickerChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      multiIndex: e.detail.value
    });
    if (e.detail.value[0] === 0) {
    } else {
      let serverId = this.data.servers[e.detail.value[0] - 1].servers[e.detail.value[1]].server_id;
    }
  },
  /**
   * 多列选择联动
   * @param e
   */
  bindMultiPickerColumnChange: function (e) {
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    if (e.detail.column === 0) {
      data.multiArray[1] = serverNames[e.detail.value];
      data.multiIndex[1] = 0;
    }
    this.setData(data);
  },
  bindIdInput: function (e) {
    this.setData({
      'character.id': e.detail.value
    })
  },
  // 添加游戏角色
  confirmDialog: function () {
    const characterId = this.data.character.id.trim();
    if (!characterId) {
      console.log('characterId');
      return;
    }
    if (this.data.menpaiIndex === 0) {
      console.log('menpai');
      return;
    }
    if (this.data.multiIndex[0] === 0) {
      console.log('server');
      return;
    }
    const newCharacterData = {
      collectionName: 'characters',
      openid: 'created_by',
      id: this.data.character.id,
      menpai: this.data.menpaiList[this.data.menpaiIndex],
      zoneName: this.data.multiArray[0][this.data.multiIndex[0]],
      serverName: this.data.multiArray[1][this.data.multiIndex[1]]
    };
    wx.cloud.callFunction({
      name: 'dbSave',
      data: newCharacterData,
    }).then(res => {
      this.refreshCharacters();
      this.setData({
        showDialog: false
      })
    }).catch(console.error);
  },
  refreshCharacters: function () {
    wx.cloud.callFunction({
      name: 'dbGetList',
      data: {
        collectionName: 'characters',
        openid: "created_by",
        limit: 0
      },
    }).then(res => {
      wx.$storage.put('characters', res.result, 604800);
      this.setData({
        characters: res.result
      })
    }).catch(console.error);
  }
});