<template>
  <view class="import-page">
    <view class="header">
      <text class="title">导入题库</text>
    </view>
    
    <view class="tips">
      <text class="tips-title">支持格式：</text>
      <text class="tips-text">粘贴 TXT 或 MD 格式的题目文本，系统会自动解析</text>
    </view>
    
    <view class="input-area">
      <textarea
        class="text-input"
        :value="inputText"
        @input="inputText = $event.detail.value"
        placeholder="请粘贴题目文本..."

示例：
Q: JavaScript 中声明常量用哪个关键字？
A. var
B. let
C. const
D. static
ANS: C
EXP: const 用于声明常量，不可重新赋值"
        :maxlength="-1"
      ></textarea>
    </view>
    
    <view class="actions">
      <button class="parse-btn" @click="parseText" :loading="parsing">
        {{ parsing ? '解析中...' : '预览解析结果' }}
      </button>
    </view>
    
    <view class="preview" v-if="previewQuestions.length > 0">
      <view class="preview-header">
        <text class="preview-title">解析预览</text>
        <text class="preview-count">{{ previewQuestions.length }} 题</text>
      </view>
      
      <scroll-view class="preview-list" scroll-y>
        <view 
          class="preview-item"
          v-for="(q, index) in previewQuestions"
          :key="q.id"
        >
          <text class="q-index">{{ index + 1 }}.</text>
          <text class="q-content">{{ q.content }}</text>
          <view class="q-options">
            <text 
              v-for="(opt, i) in q.options" 
              :key="opt.id"
              class="q-option"
              :class="{ correct: i === q.correctIndex }"
            >
              {{ String.fromCharCode(65 + i) }}. {{ opt.text }}
            </text>
          </view>
        </view>
      </scroll-view>
      
      <view class="save-actions">
        <button class="save-btn" @click="saveBank">保存题库</button>
      </view>
    </view>
  </view>
</template>

<script>
import parser from '@/services/parser.js';
import db from '@/storage/indexedDB.js';

export default {
  data() {
    return {
      inputText: '',
      parsing: false,
      previewQuestions: [],
      bankTitle: '导入题库'
    };
  },
  methods: {
    async parseText() {
      if (!this.inputText.trim()) {
        uni.showToast({ title: '请输入题目文本', icon: 'none' });
        return;
      }

      this.parsing = true;
      
      try {
        const questions = await parser.parse(this.inputText);
        
        if (questions.length === 0) {
          uni.showModal({
            title: '解析失败',
            content: '未能自动解析，是否尝试 AI 解析？（需要云端支持）',
            success: (res) => {
              if (res.confirm) {
                this.parseWithAI();
              }
            }
          });
          return;
        }
        
        this.previewQuestions = questions;
        this.bankTitle = parser.getBankTitle();
        uni.showToast({ title: '解析成功', icon: 'success' });
      } catch (e) {
        console.error('解析失败', e);
        uni.showToast({ title: '解析失败: ' + e.message, icon: 'none' });
      } finally {
        this.parsing = false;
      }
    },
    
    async parseWithAI() {
      uni.showToast({ title: 'AI 解析功能开发中', icon: 'none' });
    },
    
    async saveBank() {
      if (this.previewQuestions.length === 0) {
        return;
      }

      try {
        const bankId = db.generateId();
        
        const bank = {
          id: bankId,
          title: this.bankTitle,
          description: `共 ${this.previewQuestions.length} 题`,
          category: '',
          questionCount: this.previewQuestions.length,
          isLocal: true,
          isSynced: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await db.put('banks', bank);

        for (const q of this.previewQuestions) {
          q.bankId = bankId;
          await db.put('questions', q);
        }

        uni.showToast({ title: '保存成功', icon: 'success' });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1000);
      } catch (e) {
        console.error('保存失败', e);
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    }
  }
}
</script>

<style lang="scss">
.import-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rem;
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

.tips {
  padding: 20rem 40rem;
  background: #f0f7ff;
  
  .tips-title {
    font-size: 26rem;
    color: #667eea;
    font-weight: 600;
  }
  
  .tips-text {
    font-size: 24rem;
    color: #666;
  }
}

.input-area {
  padding: 30rem;
  background: #fff;
  
  .text-input {
    width: 100%;
    height: 400rem;
    padding: 20rem;
    border: 2rem solid #eee;
    border-radius: 16rem;
    font-size: 28rem;
    line-height: 1.6;
  }
}

.actions {
  padding: 30rem 40rem;
  
  .parse-btn {
    background: #667eea;
    color: #fff;
    border-radius: 50rem;
    font-size: 32rem;
  }
}

.preview {
  padding: 30rem;
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rem;
    
    .preview-title {
      font-size: 32rem;
      font-weight: bold;
      color: #333;
    }
    
    .preview-count {
      font-size: 26rem;
      color: #667eea;
    }
  }
  
  .preview-list {
    max-height: 600rem;
  }
  
  .preview-item {
    background: #fff;
    padding: 24rem;
    margin-bottom: 20rem;
    border-radius: 16rem;
    
    .q-index {
      font-size: 28rem;
      font-weight: bold;
      color: #667eea;
      margin-right: 10rem;
    }
    
    .q-content {
      font-size: 28rem;
      color: #333;
      line-height: 1.5;
    }
    
    .q-options {
      margin-top: 16rem;
    }
    
    .q-option {
      display: block;
      font-size: 26rem;
      color: #666;
      line-height: 1.8;
      
      &.correct {
        color: #52c41a;
        font-weight: 600;
      }
    }
  }
  
  .save-actions {
    padding: 30rem 0;
    
    .save-btn {
      background: #52c41a;
      color: #fff;
      border-radius: 50rem;
      font-size: 32rem;
    }
  }
}
</style>