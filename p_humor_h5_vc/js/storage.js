// Storage封装
var Storage = {
  get: function(key) {
    return localStorage.getItem(key);
  },
  
  set: function(key, value) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  },
  
  getNumber: function(key) {
    var val = localStorage.getItem(key);
    return val ? Number(val) : 0;
  }
};

// Toast显示
function showToast(message) {
  var toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function() {
      toast.classList.remove('show');
    }, 2000);
  }
}

// 震动
function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
}
