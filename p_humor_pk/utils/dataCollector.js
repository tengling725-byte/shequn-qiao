const cloud = require('wx-server-sdk')

function trackEvent(eventType, data = {}) {
  const now = Date.now();
  const event = {
    eventType,
    timestamp: now,
    ...data
  };
  
  // 本地存储（保留本地查看）
  let events = wx.getStorageSync('trackEvents') || [];
  events.push(event);
  
  if (events.length > 1000) {
    events = events.slice(-500);
  }
  
  wx.setStorageSync('trackEvents', events);
  
  // 云端上报
  if (wx.cloud) {
    wx.cloud.callFunction({
      name: 'trackEvent',
      data: {
        eventType: eventType,
        data: data
      }
    }).catch(err => {
      console.log('[云端上报失败]', err);
    });
  }
  
  console.log('[数据追踪]', eventType, data);
}

function getEvents() {
  return wx.getStorageSync('trackEvents') || [];
}

function clearEvents() {
  wx.setStorageSync('trackEvents', []);
}

module.exports = {
  trackEvent,
  getEvents,
  clearEvents
};