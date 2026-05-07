Page({
  data: {
    report: '',
  },

  onLoad(options) {
    const report = decodeURIComponent(options.report || wx.getStorageSync('lastReport') || '');
    this.setData({ report });
  },

  copyReport() {
    wx.setClipboardData({
      data: this.data.report,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  shareReport() {
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        wx.showToast({ title: '分享成功', icon: 'success' });
      }
    });
  },

  goBack() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
});