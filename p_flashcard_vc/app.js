App({
  globalData: {
    userInfo: null,
    isLogin: false,
    isLocked: false,
    lockPassword: ''
  },
  onLaunch() {
    this.checkLockStatus();
  },
  checkLockStatus() {
    const lockPassword = wx.getStorageSync('lockPassword');
    if (lockPassword) {
      this.globalData.lockPassword = lockPassword;
      this.globalData.isLocked = true;
    }
  }
})