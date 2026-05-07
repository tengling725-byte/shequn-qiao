Page({
  data: {
    goods: [
      {
        id: 1,
        icon: "📚",
        name: "幽默口才教程",
        desc: "从入门到精通，全面提升你的幽默感",
        price: 99
      },
      {
        id: 2,
        icon: "📖",
        name: "笑话大全",
        desc: "精选万条经典笑话，笑点满满",
        price: 39
      },
      {
        id: 3,
        icon: "🎬",
        name: "脱口秀表演课",
        desc: "专业脱口秀演员带你玩转舞台",
        price: 199
      },
      {
        id: 4,
        icon: "🎤",
        name: "演讲与幽默",
        desc: "让演讲更有趣，让沟通更轻松",
        price: 129
      },
      {
        id: 5,
        icon: "🍭",
        name: "名句棒棒糖",
        desc: "读名言感悟人生",
        page: "quotes"
      },
      {
        id: 6,
        icon: "🧇",
        name: "文言豆腐干",
        desc: "文言文原文+注释",
        page: "wenyan"
      }
    ]
  },

  onLoad() {
    
  },

  buyGoods(e) {
    const id = e.currentTarget.dataset.id;
    const goods = this.data.goods.find(g => g.id === id);
    
    if (goods.page) {
      wx.navigateTo({
        url: `/pages/${goods.page}/${goods.page}`
      });
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '该商品暂未开通，敬请期待！',
        showCancel: false
      });
    }
  },

  goBack() {
    wx.navigateBack();
  }
})