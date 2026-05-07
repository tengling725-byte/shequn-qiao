<template>
  <view class="user-page">
    <view class="header">
      <text class="title">我的</text>
    </view>
    
    <view class="section">
      <view class="menu-item">
        <text class="menu-text">云端同步</text>
        <text class="menu-hint" v-if="!isLoggedIn">未登录</text>
        <text class="menu-hint" v-else>已连接</text>
      </view>
      <view class="menu-item" @click="goToLogin" v-if="!isLoggedIn">
        <text class="menu-text">登录</text>
      </view>
    </view>
    
    <view class="section">
      <view class="menu-item">
        <text class="menu-text">默认模式</text>
        <text class="menu-hint">{{ defaultMode === 'exam' ? '考试' : '游戏' }}</text>
      </view>
      <view class="menu-item" @click="toggleMode">
        <text class="menu-text">切换模式</text>
      </view>
    </view>
    
    <view class="section">
      <view class="menu-item">
        <text class="menu-text">关于小测</text>
        <text class="menu-hint">v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      defaultMode: 'exam'
    };
  },
  methods: {
    goToLogin() {
      uni.showToast({ title: '云端功能开发中', icon: 'none' });
    },
    toggleMode() {
      this.defaultMode = this.defaultMode === 'exam' ? 'game' : 'exam';
    }
  }
}
</script>

<style lang="scss">
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 30rem 40rem;
  background: #fff;
  
  .title {
    font-size: 40rem;
    font-weight: bold;
    color: #333;
  }
}

.section {
  margin-top: 20rem;
  background: #fff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  padding: 30rem 40rem;
  border-bottom: 1rem solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .menu-text {
    font-size: 30rem;
    color: #333;
  }
  
  .menu-hint {
    font-size: 26rem;
    color: #999;
  }
}
</style>