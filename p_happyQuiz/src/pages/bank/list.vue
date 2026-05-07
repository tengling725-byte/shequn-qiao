<template>
  <view class="bank-list-page">
    <view class="header">
      <text class="title">题库管理</text>
      <view class="add-btn" @click="goToImport">
        <text>+ 导入</text>
      </view>
    </view>
    
    <view class="empty" v-if="banks.length === 0">
      <text class="empty-icon">📚</text>
      <text class="empty-text">暂无题库</text>
      <text class="empty-hint">点击"导入"添加第一个题库</text>
    </view>
    
    <view class="list" v-else>
      <view 
        class="bank-item" 
        v-for="bank in banks" 
        :key="bank.id"
        @click="goToDetail(bank)"
      >
        <view class="bank-info">
          <text class="bank-title">{{ bank.title || '未命名' }}</text>
          <text class="bank-desc">{{ bank.description || '暂无描述' }}</text>
          <text class="bank-count">{{ bank.questionCount || 0 }} 题</text>
        </view>
        <view class="bank-actions" @click.stop="deleteBank(bank.id)">
          <text class="delete-icon">🗑️</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import db from '@/storage/indexedDB.js';

export default {
  data() {
    return {
      banks: []
    };
  },
  onShow() {
    this.loadBanks();
  },
  methods: {
    async loadBanks() {
      try {
        const banks = await db.getAll('banks');
        this.banks = banks.sort((a, b) => {
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });
      } catch (e) {
        console.error('加载题库失败', e);
      }
    },
    goToImport() {
      uni.navigateTo({ url: '/pages/bank/import' });
    },
    goToDetail(bank) {
      uni.navigateTo({ 
        url: '/pages/bank/detail?id=' + bank.id 
      });
    },
    async deleteBank(id) {
      uni.showModal({
        title: '确认删除',
        content: '删除后无法恢复',
        success: async (res) => {
          if (res.confirm) {
            try {
              await db.delete('banks', id);
              const allQuestions = await db.getAll('questions');
              const bankQuestions = allQuestions.filter(q => q.bankId === id);
              for (const q of bankQuestions) {
                await db.delete('questions', q.id);
              }
              this.loadBanks();
              uni.showToast({ title: '删除成功', icon: 'success' });
            } catch (e) {
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
}
</script>

<style lang="scss">
.bank-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rem 40rem;
  background: #fff;
  
  .title {
    font-size: 40rem;
    font-weight: bold;
    color: #333;
  }
  
  .add-btn {
    background: #667eea;
    color: #fff;
    padding: 16rem 30rem;
    border-radius: 30rem;
    font-size: 28rem;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rem 0;
  
  .empty-icon {
    font-size: 120rem;
    margin-bottom: 30rem;
  }
  
  .empty-text {
    font-size: 36rem;
    color: #666;
    margin-bottom: 16rem;
  }
  
  .empty-hint {
    font-size: 28rem;
    color: #999;
  }
}

.list {
  padding: 20rem 30rem;
}

.bank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rem;
  margin-bottom: 20rem;
  border-radius: 16rem;
  
  .bank-info {
    flex: 1;
  }
  
  .bank-title {
    display: block;
    font-size: 32rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rem;
  }
  
  .bank-desc {
    display: block;
    font-size: 26rem;
    color: #999;
    margin-bottom: 10rem;
  }
  
  .bank-count {
    display: block;
    font-size: 24rem;
    color: #667eea;
  }
  
  .bank-actions {
    padding: 20rem;
  }
  
  .delete-icon {
    font-size: 36rem;
  }
}
</style>