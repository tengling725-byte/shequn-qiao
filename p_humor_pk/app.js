App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'humor-prod' // 替换为你的云环境ID
      });
    }
    
    const defaultSkin = wx.getStorageSync('skin') || 'dark';
    wx.setStorageSync('skin', defaultSkin);
  }
});

const skins = [
  { id: 'simple', name: '简洁', bg: '#f5f5f5', card: '#fff', primary: '#333', accent: '#2196f3', text: '#666' },
  { id: 'child', name: '童真', bg: '#FFE4E1', card: '#FFF0F5', primary: '#FF6B6B', accent: '#FFD700', text: '#8B4513' },
  { id: 'sketch', name: '素描', bg: '#e8e8e8', card: '#fff', primary: '#333', accent: '#666', text: '#999' },
  { id: 'cartoon', name: '卡通', bg: '#87CEEB', card: '#FFEFD5', primary: '#8B4513', accent: '#FF4500', text: '#D2691E' },
  { id: 'dark', name: '暗黑', bg: '#1a1a2e', card: 'rgba(255,255,255,0.1)', primary: '#fff', accent: '#ff6b6b', text: '#ccc' }
];

module.exports = { skins };