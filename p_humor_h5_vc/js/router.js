// 路由管理
const router = {
  pages: ['index', 'game', 'result', 'quotes', 'wenyan', 'shop'],
  history: ['index'],
  
  navigate: function(pageName) {
    if (!this.pages.includes(pageName)) {
      return;
    }
    
    // 隐藏所有页面
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }
    
    // 显示目标页面
    var targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    this.history.push(pageName);
  },
  
  back: function() {
    if (this.history.length > 1) {
      this.history.pop();
      var prevPage = this.history[this.history.length - 1];
      
      var pages = document.querySelectorAll('.page');
      for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
      }
      
      var targetPage = document.getElementById('page-' + prevPage);
      if (targetPage) {
        targetPage.classList.add('active');
      }
    } else {
      this.navigate('index');
    }
  },
  
  getParam: function(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  var indexPage = document.getElementById('page-index');
  if (indexPage) {
    indexPage.classList.add('active');
  }
});
