Page({
  data: {
    tools: [
      {
        name: 'accelerate',
        text: '加速宝典',
        icon: '/images/tools/accelerate.png',
        url: '../tools/accelerate/accelerate'
      },
      {
        name: 'coin',
        text: '金价助手',
        icon: '/images/tools/coin.png',
        url: '../tools/coin/coin'
      },
      {
        name: 'achievement',
        text: '成就百科',
        icon: '/images/tools/achievement.png',
        url: '../tools/achievement/achievement'
      }
    ],
  },
  onShareAppMessage: function () {
  }
});