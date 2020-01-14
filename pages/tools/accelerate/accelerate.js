// pages/tools/accelerate/accelerate.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        skillCD: 0.0,
        thresholds: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    onCDInput: function (e) {
        this.setData({
            skillCD: e.detail.value
        });
    },
    /**
     * 加速计算， z 为奇穴带来的加速值
     */
    calulateThreshold: function () {
        let z = 0;
        let res = [];
        const k = 188.3264393;  // 100级版本的加速系数
        const frames = Math.ceil(this.data.skillCD * 16); // 技能帧数
        console.log('技能帧数:', frames);
        for (let i = 1; i < frames; ++i) {
            let minInt = 0;
            if ((1024 * frames) % (frames - i + 1) === 0) {
                minInt = ((1024 * frames) / (frames - i + 1)) + 1 - 1024 - z;
            } else {
                minInt = Math.ceil((1024 * frames) / (frames - i + 1) - 1024 - z);
            }
            let threshold = Math.ceil(minInt * k / 10.24);
            res.push({index: i, time: (frames - i) * 0.0625, value: threshold})
        }
        this.setData({
            thresholds: res
        });
    }
});