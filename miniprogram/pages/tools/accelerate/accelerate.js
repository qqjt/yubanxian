// pages/tools/accelerate/accelerate.js
Page({
  data: {
    skillCD: null,
    thresholds: [],
    qixue: [
      {
        "name": "无",
        "value": 0
      },
      {
        "name": "枕上",
        "value": 50
      },
      {
        "name": "梦歌",
        "value": 60
      },
      {
        "name": "毒手",
        "value": 102
      },
      {
        "name": "聚精会神",
        "value": 204
      },
      {
        "name": "月破",
        "value": 52
      },
      {
        "name": "太极无极",
        "value": 60
      },
      {
        "name": "沁心",
        "value": 51
      },
      {
        "name": "如风",
        "value": 82
      },
      {
        "name": "碎冰",
        "value": 51
      },
      {
        "name": "余寒",
        "value": 204
      },
      {
        "name": "法镜",
        "value": 105
      }
    ],
    qixueIndex: 0
  },
  bindCDInput: function (e) {
    this.setData({
      skillCD: e.detail.value
    });
  },
  bindQixueChange: function (e) {
    this.setData({qixueIndex: e.detail.value});
  },
  /**
   * 加速计算， z 为奇穴带来的加速值
   */
  calulateThreshold: function () {
    let z = this.data.qixue[this.data.qixueIndex].value;
    console.log(z);
    let res = [];
    const k = 188.3264393;  // 100级版本的加速系数
    const frames = Math.ceil(this.data.skillCD * 16); // 技能帧数
    console.log(frames);
    for (let i = 1; i < frames && i <= 6; ++i) {
      let minInt = 0;
      if ((1024 * frames) % (frames - i + 1) === 0) {
        minInt = ((1024 * frames) / (frames - i + 1)) + 1 - 1024 - z;
      } else {
        minInt = Math.ceil((1024 * frames) / (frames - i + 1) - 1024 - z);
      }
      let threshold = 0;
      if (minInt > 0) {
        threshold = Math.ceil(minInt * k / 10.24)
      }
      res.push({index: i, time: (frames - i) * 0.0625, value: threshold})
    }
    this.setData({
      thresholds: res
    });
  }
});