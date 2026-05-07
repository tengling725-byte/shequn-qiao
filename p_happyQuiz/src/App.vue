<template>
  <view class="app">
    <view class="header">
      <text class="title">小测</text>
      <text class="subtitle">个人题库管理工具</text>
    </view>
    <view class="content">
      <navigator url="/pages/bank/list" class="nav-item">
        <text>题库管理</text>
      </navigator>
      <navigator url="/pages/quiz/setup" class="nav-item">
        <text>开始测验</text>
      </navigator>
      <navigator url="/pages/review/history" class="nav-item">
        <text>历史记录</text>
      </navigator>
      <navigator url="/pages/user/index" class="nav-item">
        <text>我的</text>
      </navigator>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  onLoad() {
    console.log('小测 APP 加载')
  }
}
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 60rem 40rem 40rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .title {
    display: block;
    font-size: 48rem;
    font-weight: bold;
    color: #fff;
  }
  
  .subtitle {
    display: block;
    font-size: 28rem;
    color: rgba(255,255,255,0.8);
    margin-top: 10rem;
  }
}

.content {
  padding: 40rem;
}

.nav-item {
  display: block;
  background: #fff;
  padding: 30rem;
  margin-bottom: 20rem;
  border-radius: 16rem;
  font-size: 32rem;
  color: #333;
  box-shadow: 0 2rem 8rem rgba(0,0,0,0.05);
}
</style>