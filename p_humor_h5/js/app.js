// 应用主逻辑
document.addEventListener('DOMContentLoaded', function() {
  console.log('app.js loaded');
  
  // 初始化首页统计数据
  var totalScore = Storage.getNumber('totalScore');
  var highScore = Storage.getNumber('highScore');
  
  document.getElementById('total-score').textContent = totalScore;
  document.getElementById('high-score').textContent = highScore;
  
  // 首次访问记录日期
  if (!Storage.get('firstPlayDate')) {
    Storage.set('firstPlayDate', new Date().toISOString().split('T')[0]);
  }
  
  // 绑定按钮点击事件
  document.getElementById('btn-start').onclick = function() {
    console.log('点击了开始按钮');
    game.init();
  };
  
  document.getElementById('btn-quotes').onclick = function() {
    quotes.init();
    router.navigate('quotes');
  };
  
  document.getElementById('btn-wenyan').onclick = function() {
    wenyan.init();
    router.navigate('wenyan');
  };
  
  document.getElementById('btn-shop').onclick = function() {
    router.navigate('shop');
  };
  
  // 结果页按钮
  var btnRestart = document.querySelector('#page-result .btn-primary');
  if (btnRestart) {
    btnRestart.onclick = function() {
      game.init();
    };
  }
  
  // 触摸滑动支持
  var startX = 0;
  
  document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  });
  
  document.addEventListener('touchend', function(e) {
    var endX = e.changedTouches[0].clientX;
    var diff = startX - endX;
    
    if (Math.abs(diff) > 50) {
      var currentPage = document.querySelector('.page.active');
      if (currentPage) {
        var pageId = currentPage.id.replace('page-', '');
        
        if (pageId === 'quotes') {
          if (diff > 0) quotes.next();
          else quotes.prev();
        } else if (pageId === 'wenyan') {
          if (diff > 0) wenyan.next();
          else wenyan.prev();
        }
      }
    }
  });
  
  console.log('梗王争霸 HTML5版 已加载');
});
