const db = require('../../utils/database.js');

Page({
  data: {
    content: '',
    title: '',
    category: '生活记事',
    categories: [],
    aiStyle: '',
    aiStyles: [],
    images: [],
    videos: [],
    audioPath: '',
    audioText: '',
    isRecording: false,
    isPlaying: false,
    showAIPanel: false,
    showExportPanel: false,
    isPolishing: false,
    noteId: null,
    isEdit: false,
    hasChanges: false,
    canvasWidth: 750,
    canvasHeight: 1200
  },

  onLoad(options) {
    this.loadConfig();
    if (options.id) {
      this.loadNote(options.id);
    }
  },

  onUnload() {
    if (this.data.isRecording) {
      this.stopRecord();
    }
  },

  loadConfig() {
    const categories = db.getCategories();
    const aiStyles = db.getAiStyles();
    this.setData({ categories, aiStyles });
  },

  onRecordToggle() {
    if (this.data.isRecording) {
      this.stopRecord();
    } else {
      this.startRecord();
    }
  },

  loadNote(id) {
    const note = db.getNoteById(id);
    if (note) {
      this.setData({
        noteId: id,
        isEdit: true,
        content: note.content,
        title: note.title,
        category: note.category,
        aiStyle: note.aiStyle,
        images: note.images || [],
        videos: note.videos || [],
        audioPath: note.audioPath || '',
        audioText: note.audioText || '',
        hasChanges: false
      });
    }
  },

  onContentChange(e) {
    this.setData({ content: e.detail.value, hasChanges: true });
  },

  onTitleChange(e) {
    this.setData({ title: e.detail.value, hasChanges: true });
  },

  onCategoryChange(e) {
    this.setData({ category: this.data.categories[e.detail.value], hasChanges: true });
  },

  toggleAIPanel() {
    this.setData({ showAIPanel: !this.data.showAIPanel });
  },

  selectAiStyle(e) {
    this.setData({ aiStyle: e.currentTarget.dataset.style });
  },

  async polishContent() {
    const { content, aiStyle } = this.data;

    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    if (!aiStyle) {
      wx.showToast({ title: '请选择润色风格', icon: 'none' });
      return;
    }

    const styleObj = this.data.aiStyles.find(s => s.id === aiStyle);
    const promptText = styleObj ? styleObj.prompt : '';

    this.setData({ isPolishing: true });
    wx.showLoading({ title: 'AI 润色中…' });

    try {
      const polishedContent = await this.callDoubaoAI(content, promptText);
      const generatedTitle = await this.generateTitle(polishedContent);
      const newCategory = await this.generateCategory(polishedContent);

      this.setData({
        content: polishedContent,
        title: generatedTitle,
        category: newCategory,
        showAIPanel: false,
        isPolishing: false,
        hasChanges: true
      });

      wx.hideLoading();
      wx.showToast({ title: '润色完成', icon: 'success' });

    } catch (err) {
      console.error('AI 润色失败', err);
      this.setData({ isPolishing: false });
      wx.hideLoading();
      wx.showToast({ title: err.msg || '润色失败', icon: 'none' });
    }
  },

  callDoubaoAI(content, promptText) {
    const API_KEY = 'fbe2e6b0-582c-42c8-80a7-b1cbd403500a';
    const prompt = promptText ? `${promptText}：\n${content}` : content;

    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: {
          model: 'doubao-seed-1-6-flash-250828',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.65,
          max_tokens: 2000
        },
        success: (res) => {
          try {
            const data = res.data;
            if (data.error) {
              reject({ msg: 'API错误：' + data.error.message });
              return;
            }
            const result = data.choices?.[0]?.message?.content?.trim();
            if (result) resolve(result);
            else reject({ msg: 'AI返回为空' });
          } catch (e) {
            reject({ msg: '解析失败' });
          }
        },
        fail: () => reject({ msg: '网络请求失败' })
      });
    });
  },

  generateTitle(content) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let title = content.trim().replace(/\n/g, ' ').substring(0, 18);
        if (title.length >= 18) title += '…';
        resolve(title);
      }, 300);
    });
  },

  generateCategory(content) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lower = content.toLowerCase();
        if (lower.includes('工作') || lower.includes('会议') || lower.includes('任务') || lower.includes('项目')) resolve('工作记事');
        else if (lower.includes('点子') || lower.includes('创意') || lower.includes('想法')) resolve('点子');
        else if (lower.includes('待办') || lower.includes('提醒') || lower.includes('要买')) resolve('待办');
        else resolve('生活记事');
      }, 300);
    });
  },

  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ images: this.data.images.concat(res.tempFilePaths), hasChanges: true });
      }
    });
  },

  chooseVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        this.setData({ videos: this.data.videos.concat([res.tempFilePath]), hasChanges: true });
      }
    });
  },

  startRecord() {
    console.log("===== 录音按钮点击 =====");
    const that = this;

    const checkAndStart = () => {
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.record']) {
            wx.authorize({
              scope: 'scope.record',
              success: () => {
                that.startRecordReal();
              },
              fail: () => {
                wx.showModal({
                  title: '提示',
                  content: '需要麦克风权限才能录音',
                  confirmText: '去设置',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting();
                    }
                  }
                });
              }
            });
          } else {
            that.startRecordReal();
          }
        },
        fail: () => {
          that.startRecordReal();
        }
      });
    };

    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: () => {
          checkAndStart();
        },
        fail: () => {
          wx.showToast({ title: '请同意隐私协议', icon: 'none' });
        }
      });
    } else {
      checkAndStart();
    }
  },

  startRecordReal() {
    const that = this;
    const plugin = requirePlugin("WechatSI");
    const manager = plugin.getRecordRecognitionManager();

    manager.onStart = function () {
      that.setData({ isRecording: true });
      wx.showToast({ title: '录音中…', icon: 'none', duration: 10000 });
    };

    manager.onStop = function (res) {
      that.setData({ isRecording: false });
      wx.hideToast();
      if (res.result) {
        that.setData({
          audioText: res.result,
          content: (that.data.content || '') + '\n' + res.result,
          hasChanges: true
        });
        wx.showToast({ title: '转文字完成' });
      } else {
        wx.showToast({ title: '未识别到语音', icon: 'none' });
      }
    };

    manager.onError = function (err) {
      console.error("录音错误", err);
      that.setData({ isRecording: false });
      wx.hideToast();
      wx.showToast({ title: '录音失败', icon: 'none' });
    };

    manager.start({ lang: 'zh_CN' });
  },

  stopRecord() {
    try {
      const plugin = requirePlugin("WechatSI");
      const manager = plugin.getRecordRecognitionManager();
      manager.stop();
    } catch (e) { }
  },

  playAudio() {
    if (!this.data.audioPath) return;
    const ctx = wx.createInnerAudioContext();
    ctx.src = this.data.audioPath;
    ctx.play();
  },

  deleteAudio() {
    this.setData({ audioPath: '', audioText: '', hasChanges: true });
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.index;
    wx.previewImage({ urls: this.data.images, current: this.data.images[idx] });
  },

  deleteImage(e) {
    const idx = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(idx, 1);
    this.setData({ images, hasChanges: true });
  },

  deleteVideo(e) {
    const idx = e.currentTarget.dataset.index;
    const videos = this.data.videos;
    videos.splice(idx, 1);
    this.setData({ videos, hasChanges: true });
  },

  goBack() {
    if (this.data.hasChanges) {
      wx.showModal({
        title: '提示',
        content: '有未保存的内容，确定要返回吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  toggleExportPanel() {
    this.setData({ showExportPanel: !this.data.showExportPanel });
  },

  closeExportPanel() {
    this.setData({ showExportPanel: false });
  },

  async exportAsText() {
    this.setData({ showExportPanel: false });
    wx.showLoading({ title: '生成中…' });

    try {
      const fileName = (this.data.title || '小条记录') + '.txt';
      const content = `【${this.data.title || '无标题'}】\n分类：${this.data.category}\n\n${this.data.content}`;
      
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      fs.writeFileSync(filePath, content, 'utf8');

      wx.hideLoading();
      wx.showModal({
        title: '导出成功',
        content: `文件已保存到：${fileName}`,
        confirmText: '分享',
        success: (res) => {
          if (res.confirm) {
            wx.shareAppMessage({
              title: this.data.title || '小条记录',
              path: filePath
            });
          }
        }
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '导出失败', icon: 'none' });
      console.error(err);
    }
  },

  async exportAsHtml() {
    this.setData({ showExportPanel: false });
    wx.showLoading({ title: '生成中…' });

    try {
      let htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${this.data.title || '小条记录'}</title><style>
body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;padding:20px;background:#f5f5f5}
.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.title{font-size:24px;font-weight:600;margin-bottom:10px}
.meta{color:#999;font-size:14px;margin-bottom:20px}
.content{line-height:1.8;white-space:pre-wrap;word-wrap:break-word}
img{max-width:100%;border-radius:8px;margin:10px 0}
</style></head><body><div class="card">
<div class="title">${this.data.title || '无标题'}</div>
<div class="meta">分类：${this.data.category}</div>
<div class="content">${this.data.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;

      for (let i = 0; i < this.data.images.length; i++) {
        try {
          const base64 = await this.getImageBase64(this.data.images[i]);
          htmlContent += `<img src="data:image/png;base64,${base64}" />`;
        } catch (e) {
          console.error('图片转换失败', e);
        }
      }

      htmlContent += `</div></body></html>`;

      const fileName = (this.data.title || '小条记录') + '.html';
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      fs.writeFileSync(filePath, htmlContent, 'utf8');

      wx.hideLoading();
      wx.showModal({
        title: '导出成功',
        content: `文件已保存到：${fileName}`,
        confirmText: '分享',
        success: (res) => {
          if (res.confirm) {
            wx.shareAppMessage({
              title: this.data.title || '小条记录',
              path: filePath
            });
          }
        }
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '导出失败', icon: 'none' });
      console.error(err);
    }
  },

  getImageBase64(path) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: path,
        encoding: 'base64',
        success: (res) => resolve(res.data),
        fail: reject
      });
    });
  },

  async exportAsImage() {
    this.setData({ showExportPanel: false });
    wx.showLoading({ title: '生成中…' });

    try {
      const ctx = wx.createCanvasContext('noteCanvas');
      const W = this.data.canvasWidth;
      let Y = 40;

      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, W, this.data.canvasHeight);

      ctx.setFillStyle('#333333');
      ctx.setFontSize(32);
      ctx.setFontWeight('bold');
      const title = this.data.title || '无标题';
      ctx.fillText(title.substring(0, 15), 40, Y);
      Y += 60;

      ctx.setFillStyle('#999999');
      ctx.setFontSize(24);
      ctx.fillText(`分类：${this.data.category}`, 40, Y);
      Y += 50;

      ctx.setFillStyle('#333333');
      ctx.setFontSize(28);
      const lines = this.wrapText(this.data.content, W - 80, 28);
      for (let i = 0; i < lines.length; i++) {
        if (Y > this.data.canvasHeight - 100) break;
        ctx.fillText(lines[i], 40, Y);
        Y += 40;
      }

      for (let i = 0; i < Math.min(this.data.images.length, 3); i++) {
        if (Y > this.data.canvasHeight - 150) break;
        try {
          const info = await new Promise((resolve, reject) => {
            wx.getImageInfo({
              src: this.data.images[i],
              success: resolve,
              fail: reject
            });
          });
          const imgW = Math.min(W - 80, 300);
          const imgH = imgW * info.height / info.width;
          ctx.drawImage(this.data.images[i], 40, Y, imgW, Math.min(imgH, 200));
          Y += Math.min(imgH, 200) + 20;
        } catch (e) {
          console.error('绘制图片失败', e);
        }
      }

      ctx.draw(false, () => {
        setTimeout(async () => {
          try {
            const res = await wx.canvasToTempFilePath({
              canvasId: 'noteCanvas',
              success: (res) => res.tempFilePath,
              fail: (err) => { throw err; }
            });

            wx.hideLoading();
            wx.showModal({
              title: '生成成功',
              content: '是否保存到相册？',
              confirmText: '保存',
              success: async (modalRes) => {
                if (modalRes.confirm) {
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: () => wx.showToast({ title: '已保存', icon: 'success' }),
                    fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
                  });
                }
              }
            });
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '生成失败', icon: 'none' });
            console.error(err);
          }
        }, 500);
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
      console.error(err);
    }
  },

  wrapText(text, maxWidth, fontSize) {
    const lines = [];
    const chars = text.split('');
    let line = '';
    for (let i = 0; i < chars.length; i++) {
      line += chars[i];
      if (line.length * fontSize > maxWidth) {
        if (line.trim()) lines.push(line.trim());
        line = '';
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines.slice(0, 30);
  },

  saveNote() {
    const { content, images, videos } = this.data;
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    const noteData = {
      content: this.data.content,
      title: this.data.title,
      category: this.data.category,
      images: this.data.images,
      videos: this.data.videos,
      audioPath: this.data.audioPath,
      audioText: this.data.audioText,
      aiStyle: this.data.aiStyle,
      createdAt: new Date().toISOString()
    };

    if (this.data.isEdit) {
      db.updateNote(this.data.noteId, noteData);
      wx.showToast({ title: '更新成功' });
    } else {
      db.addNote(noteData);
      wx.showToast({ title: '保存成功' });
    }

    this.setData({ hasChanges: false });
    setTimeout(() => wx.navigateBack(), 1000);
  }
});