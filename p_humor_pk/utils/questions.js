const questions = [
  {
    id: 1,
    type: "预期反转",
    question: "跌倒了，________",
    tip: "预期反转：打破惯性思维，本该A却选择B，如'跌倒了，爬起来再哭'",
    options: [
      { id: "A", text: "爬起来再哭", correct: true, humorScore: 5 },
      { id: "B", text: "一溜烟儿爬起来", correct: false, humorScore: 0 },
      { id: "C", text: "不就是摔一跤吗", correct: false, humorScore: 0 },
      { id: "D", text: "正好躺平休息", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 2,
    type: "逻辑反转",
    question: "今天想骂人，所以________",
    tip: "逻辑反转：不按常理出牌，如'今天想骂人，所以不骂你'",
    options: [
      { id: "A", text: "不骂你", correct: true, humorScore: 5 },
      { id: "B", text: "去街上随便骂人", correct: false, humorScore: 0 },
      { id: "C", text: "只对你一个人温柔", correct: false, humorScore: 1 },
      { id: "D", text: "骂完领导再骂老板", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 3,
    type: "自我认知反差",
    question: "你虽然长的丑，但你________",
    tip: "自我认知反差：承认短板却巧妙自夸，如'你虽然长的丑，但你很想得美啊'",
    options: [
      { id: "A", text: "想得美啊", correct: true, humorScore: 5 },
      { id: "B", text: "人好啊", correct: false, humorScore: 0 },
      { id: "C", text: "对我很温柔", correct: false, humorScore: 1 },
      { id: "D", text: "眼光真好", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 4,
    type: "文字双关",
    question: "避孕的效果：不成功，便________",
    tip: "文字双关：一语双关产生笑点，如'避孕的效果：不成功，便成人'",
    options: [
      { id: "A", text: "成人", correct: true, humorScore: 5 },
      { id: "B", text: "出人命", correct: false, humorScore: 1 },
      { id: "C", text: "奉子成婚", correct: false, humorScore: 1 },
      { id: "D", text: "喜当爹", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 5,
    type: "预期反转",
    question: "什么是离婚的主要原因？________",
    tip: "预期反转：打破惯性思维，如'什么是离婚的主要原因？结婚'",
    options: [
      { id: "A", text: "结婚", correct: true, humorScore: 5 },
      { id: "B", text: "穷", correct: false, humorScore: 0 },
      { id: "C", text: "出轨", correct: false, humorScore: 0 },
      { id: "D", text: "孩子", correct: false, humorScore: 0 },
    ]
  },
  {
    id: 6,
    type: "预期反转",
    question: "明知山有虎，那就________",
    tip: "预期反转：打破惯性思维，如'明知山有虎，那就不要去明知山'",
    options: [
      { id: "A", text: "不要去明知山", correct: true, humorScore: 5 },
      { id: "B", text: "绕个大圈子走", correct: false, humorScore: 0 },
      { id: "C", text: "给老虎喂胡萝卜感化它", correct: false, humorScore: 2 },
      { id: "D", text: "骑到老虎背上把它暴打一顿", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 7,
    type: "讽刺",
    question: "________是最温柔的劫富济贫方式",
    tip: "讽刺：阴阳怪气，如'傍大款是最温柔的劫富济贫方式'",
    options: [
      { id: "A", text: "傍大款", correct: true, humorScore: 5 },
      { id: "B", text: "劝富人做慈善", correct: false, humorScore: 0 },
      { id: "C", text: "骗富人的感情", correct: false, humorScore: 2 },
      { id: "D", text: "收保护费", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 8,
    type: "篡改成语",
    question: "鱼和熊掌不可兼得，________",
    tip: "篡改成语：改变成语含义，如'鱼和熊掌不可兼得，穷与丑却能同时拥有'",
    options: [
      { id: "A", text: "穷与丑却能同时拥有", correct: true, humorScore: 5 },
      { id: "B", text: "舍鱼而取熊掌者也", correct: false, humorScore: 0 },
      { id: "C", text: "爱情与面包不可兼得", correct: false, humorScore: 1 },
      { id: "D", text: "熊掌与鱼我全要", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 9,
    type: "文字游戏",
    question: "拜拜，这两个像不像________",
    tip: "文字游戏：利用字形字义，如'拜拜，这两个像不像四个烤串'",
    options: [
      { id: "A", text: "四个烤串", correct: true, humorScore: 5 },
      { id: "B", text: "说再见", correct: false, humorScore: 0 },
      { id: "C", text: "一场秋风", correct: false, humorScore: 2 },
      { id: "D", text: "永不再见", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 10,
    type: "重复强调",
    question: "有钱了不起啊？有钱，________",
    tip: "重复强调：强调到荒谬，如'有钱了不起啊？有钱，真的了不起'",
    options: [
      { id: "A", text: "真的了不起", correct: true, humorScore: 5 },
      { id: "B", text: "真的没什么了不起", correct: false, humorScore: 1 },
      { id: "C", text: "真的不能买到真爱", correct: false, humorScore: 1 },
      { id: "D", text: "真的算个屁", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 11,
    type: "荒谬延伸",
    question: "她笑里藏刀，然后________",
    tip: "荒谬延伸：顺着荒谬逻辑往下想，如'她笑里藏刀，然后割伤了自己的嘴'",
    options: [
      { id: "A", text: "割伤了自己的嘴", correct: true, humorScore: 5 },
      { id: "B", text: "露出真面目", correct: false, humorScore: 0 },
      { id: "C", text: "笑不动了", correct: false, humorScore: 2 },
      { id: "D", text: "刀刀致命", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 12,
    type: "讽刺",
    question: "比智商税更可怕的是________",
    tip: "讽刺：阴阳怪气，如'比智商税更可怕的是交不起智商税'",
    options: [
      { id: "A", text: "交不起智商税", correct: true, humorScore: 5 },
      { id: "B", text: "没有智商", correct: false, humorScore: 0 },
      { id: "C", text: "智商为零", correct: false, humorScore: 0 },
      { id: "D", text: "拒绝交税", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 14,
    type: "对比反差",
    question: "说好一起白头，________",
    tip: "对比反差：制造强烈反差，如'说好一起白头，你秃了顶我染了头'",
    options: [
      { id: "A", text: "你秃了顶我染了头", correct: true, humorScore: 5 },
      { id: "B", text: "却又分了手", correct: false, humorScore: 0 },
      { id: "C", text: "一起慢慢变老", correct: false, humorScore: 0 },
      { id: "D", text: "你先绿了我", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 15,
    type: "逻辑荒谬",
    question: "我知道你喜欢我，但是我________",
    tip: "逻辑荒谬：荒谬但符合逻辑，如'我知道你喜欢我，但是我我找不到证据'",
    options: [
      { id: "A", text: "我找不到证据", correct: true, humorScore: 5 },
      { id: "B", text: "我不喜欢你", correct: false, humorScore: 0 },
      { id: "C", text: "我还在等那个他", correct: false, humorScore: 1 },
      { id: "D", text: "喜欢我的人站满了未名湖", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 17,
    type: "矛盾修辞",
    question: "道理我都懂，可我就是________",
    tip: "矛盾修辞：看似矛盾却有道理，如'道理我都懂，可我就是不爱讲道理呀'",
    options: [
      { id: "A", text: "不爱讲道理呀", correct: true, humorScore: 5 },
      { id: "B", text: "不爱听道理", correct: false, humorScore: 0 },
      { id: "C", text: "不想懂", correct: false, humorScore: 0 },
      { id: "D", text: "懂了也装不懂", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 18,
    type: "文字游戏",
    question: "你是我________里面最爱的一个",
    tip: "文字游戏：利用字形字义，如'你是我见一个爱一个里面最爱的一个'",
    options: [
      { id: "A", text: "见一个爱一个", correct: true, humorScore: 5 },
      { id: "B", text: "撩过的人", correct: false, humorScore: 0 },
      { id: "C", text: "爱过的人", correct: false, humorScore: 0 },
      { id: "D", text: "气过的人", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 19,
    type: "成语篡改",
    question: "即使你已名花有主，我也要________",
    tip: "成语篡改：改变成语，如'即使你已名花有主，我也要移花接木'",
    options: [
      { id: "A", text: "移花接木", correct: true, humorScore: 5 },
      { id: "B", text: "拈花惹草", correct: false, humorScore: 1 },
      { id: "C", text: "暗度陈仓", correct: false, humorScore: 1 },
      { id: "D", text: "挖墙脚", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 20,
    type: "隐喻反转",
    question: "本想住进先生的心里，没想到________",
    tip: "隐喻反转：打破隐喻，如'本想住进先生的心里，没想到挺多邻居'",
    options: [
      { id: "A", text: "挺多邻居", correct: true, humorScore: 5 },
      { id: "B", text: "是个牢笼", correct: false, humorScore: 1 },
      { id: "C", text: "进不去", correct: false, humorScore: 0 },
      { id: "D", text: "比��宫还大", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 22,
    type: "预期反转",
    question: "你好，我现在有事，待会________",
    tip: "预期反转：打破惯性思维，如'你好，我现在有事，待会也不会联系你'",
    options: [
      { id: "A", text: "也不会联系你", correct: true, humorScore: 5 },
      { id: "B", text: "再联系你", correct: false, humorScore: 0 },
      { id: "C", text: "好好陪你", correct: false, humorScore: 1 },
      { id: "D", text: "把你删掉", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 24,
    type: "预期反转",
    question: "拍脑袋决策，拍胸脯保证，________",
    tip: "预期反转：打破惯性思维，如'拍脑袋决策，拍胸脯保证，拍屁股走人'",
    options: [
      { id: "A", text: "拍屁股走人", correct: true, humorScore: 5 },
      { id: "B", text: "拍桌子翻脸", correct: false, humorScore: 1 },
      { id: "C", text: "拍肩膀安慰", correct: false, humorScore: 1 },
      { id: "D", text: "拍照片发圈", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 26,
    type: "预期反转",
    question: "想和女生成为好朋友，跟她________",
    tip: "预期反转：打破惯性思维，如'想和女生成为好朋友，跟她告白就行了'",
    options: [
      { id: "A", text: "告白就行了", correct: true, humorScore: 5 },
      { id: "B", text: "吃饭就行", correct: false, humorScore: 0 },
      { id: "C", text: "聊天就行", correct: false, humorScore: 0 },
      { id: "D", text: "送礼就行", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 27,
    type: "两难对比",
    question: "住外面有经济压力，住家里________",
    tip: "两难对比：哪个都搞笑，如'住外面有经济压力，住家里有精神压力'",
    options: [
      { id: "A", text: "有精神压力", correct: true, humorScore: 5 },
      { id: "B", text: "没自由", correct: false, humorScore: 0 },
      { id: "C", text: "没隐私", correct: false, humorScore: 0 },
      { id: "D", text: "有大把钱花", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 28,
    type: "隐喻反转",
    question: "你们之所以喝鸡汤，是因为________",
    tip: "隐喻反转：打破隐喻，如'你们之所以喝鸡汤，是因为肉被别人吃了'",
    options: [
      { id: "A", text: "肉被别人吃了", correct: true, humorScore: 5 },
      { id: "B", text: "想要努力", correct: false, humorScore: 0 },
      { id: "C", text: "鸡汤太美味", correct: false, humorScore: 0 },
      { id: "D", text: "闻鸡起舞", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 30,
    type: "自恋式幽默",
    question: "谁能想到貌不惊人的我，竟然是________",
    tip: "自恋式幽默：迷之自信产生笑点，如'谁能想到貌不惊人的我，竟然是龙的传人'",
    options: [
      { id: "A", text: "龙的传人", correct: true, humorScore: 5 },
      { id: "B", text: "不平凡的人", correct: false, humorScore: 0 },
      { id: "C", text: "绝顶聪明的人", correct: false, humorScore: 2 },
      { id: "D", text: "天选之人", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 31,
    type: "篡改成语",
    question: "鱼和熊掌不可兼得，________",
    tip: "篡改成语：改变成语含义，如'鱼和熊掌不可兼得，穷与丑却能同时拥有'",
    options: [
      { id: "A", text: "穷与丑却能同��拥��", correct: true, humorScore: 5 },
      { id: "B", text: "舍鱼而取熊掌者也", correct: false, humorScore: 0 },
      { id: "C", text: "爱情与面包却能同时拥有", correct: false, humorScore: 1 },
      { id: "D", text: "但鱼和熊掌我都要", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 32,
    type: "反讽",
    question: "你喜欢她她不喜欢你，说明________",
    tip: "反讽：正话反说，如'你喜欢她她不喜欢你，说明你多有眼光呀'",
    options: [
      { id: "A", text: "你多有眼光呀", correct: true, humorScore: 5 },
      { id: "B", text: "你眼光有问题", correct: false, humorScore: 1 },
      { id: "C", text: "你有眼光", correct: false, humorScore: 0 },
      { id: "D", text: "你眼光不行", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 33,
    type: "文字双关",
    question: "我年轻，需要你指点，但不需要你________",
    tip: "文字双关：一语双关产生笑点，如'我年轻，需要你指点，但不需要你指指点点'",
    options: [
      { id: "A", text: "指指点点", correct: true, humorScore: 5 },
      { id: "B", text: "指手画脚", correct: false, humorScore: 1 },
      { id: "C", text: "唠唠叨叨", correct: false, humorScore: 1 },
      { id: "D", text: "骂骂咧咧", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 34,
    type: "预期反转",
    question: "别人都去撞南墙了，________",
    tip: "预期反转：打破惯性思维，如'别人都去撞南墙了，我去修南墙一定很赚钱'",
    options: [
      { id: "A", text: "我去修南墙一定很赚钱", correct: true, humorScore: 5 },
      { id: "B", text: "我也去撞", correct: false, humorScore: 0 },
      { id: "C", text: "我在墙上画彩虹", correct: false, humorScore: 2 },
      { id: "D", text: "我把墙推倒", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 35,
    type: "预期反差",
    question: "跟我混吧，有我一口饭吃，________",
    tip: "预期反差：超出预期，如'跟我混吧，有我一口饭吃，就有你一个碗刷'",
    options: [
      { id: "A", text: "就有你一个碗刷", correct: true, humorScore: 5 },
      { id: "B", text: "就有你一口汤喝", correct: false, humorScore: 1 },
      { id: "C", text: "就有你的甜丝丝", correct: false, humorScore: 2 },
      { id: "D", text: "就有你一锅饭吃", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 36,
    type: "荒谬逻辑",
    question: "一想大家终归都要死，________",
    tip: "荒谬逻辑：按荒谬逻辑推导，如'一想大家终归都要死，我就原谅了所有人'",
    options: [
      { id: "A", text: "我就原谅了所有人", correct: true, humorScore: 5 },
      { id: "B", text: "我就吓得半死", correct: false, humorScore: 1 },
      { id: "C", text: "我就笑看人生", correct: false, humorScore: 2 },
      { id: "D", text: "我就不想活了", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 37,
    type: "对比讽刺",
    question: "有趣的灵魂精神出轨，好看的皮囊________",
    tip: "对比讽刺：用对比产生讽刺效果，如'有趣的灵魂精神出轨，好看的皮囊现实劈腿'",
    options: [
      { id: "A", text: "现实劈腿", correct: true, humorScore: 5 },
      { id: "B", text: "肉体出轨", correct: false, humorScore: 0 },
      { id: "C", text: "百看不厌", correct: false, humorScore: 1 },
      { id: "D", text: "千篇一律", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 38,
    type: "荒谬自嘲",
    question: "我可真是个败家子，上亿的家产，我________",
    tip: "荒谬自嘲：承认荒谬但有理，如'我可真是个败家子，上亿的家产，我一醒来就没了'",
    options: [
      { id: "A", text: "一醒来就没了", correct: true, humorScore: 5 },
      { id: "B", text: "五年就花光了", correct: false, humorScore: 0 },
      { id: "C", text: "挥一挥衣袖就没了", correct: false, humorScore: 2 },
      { id: "D", text: "请你吃顿饭就没了", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 39,
    type: "荒谬逻辑",
    question: "梦想还是要有的，________",
    tip: "荒谬逻辑：按荒谬逻辑推导，如'梦想还是要有的，不然哪天喝多了你跟人聊啥'",
    options: [
      { id: "A", text: "不然哪天喝多了你跟人聊啥", correct: true, humorScore: 5 },
      { id: "B", text: "不然怎么有动力", correct: false, humorScore: 0 },
      { id: "C", text: "不然怎么面对明天", correct: false, humorScore: 0 },
      { id: "D", text: "不然怎么跟马云比", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 40,
    type: "经典篡改",
    question: "你无法叫醒一个不回你消息的人，但是________",
    tip: "经典篡改：改编名言，如'你无法叫醒一个不回你消息的人，但是红包能'",
    options: [
      { id: "A", text: "红包能", correct: true, humorScore: 5 },
      { id: "B", text: "打电话能", correct: false, humorScore: 0 },
      { id: "C", text: "发语音能", correct: false, humorScore: 0 },
      { id: "D", text: "直接上门能", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 41,
    type: "荒谬延伸",
    question: "常说一口吃不成胖子，但是________",
    tip: "荒谬延伸：顺着荒谬逻辑往下想，如'常说一口吃不成胖子，但是一口一口接一口却可以'",
    options: [
      { id: "A", text: "一口一口接一口却可以", correct: true, humorScore: 5 },
      { id: "B", text: "慢慢吃就成了", correct: false, humorScore: 0 },
      { id: "C", text: "日积月累就胖了", correct: false, humorScore: 0 },
      { id: "D", text: "一口吃成大胖子", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 42,
    type: "自嘲式幽默",
    question: "大晚上看到外卖小哥奔波送餐，我感到很励志，于是________",
    tip: "自嘲式幽默：自黑式幽默，如'大晚上看到外卖小哥奔波送餐，我感到很励志，于是又点了一份夜宵'",
    options: [
      { id: "A", text: "又点了一份夜宵", correct: true, humorScore: 5 },
      { id: "B", text: "决定好好努力", correct: false, humorScore: 0 },
      { id: "C", text: "决定明天去送外卖", correct: false, humorScore: 2 },
      { id: "D", text: "决定立刻开始创业", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 43,
    type: "反讽",
    question: "往往是街边不起眼的店铺才能做出真正的美味，而那些富丽堂皇的大饭店________",
    tip: "反讽：正话反说，如'往往是街边不起眼的店铺才能做出真正的美味，而那些富丽堂皇的大饭店我没吃过'",
    options: [
      { id: "A", text: "我没吃过", correct: true, humorScore: 5 },
      { id: "B", text: "没有烟火气", correct: false, humorScore: 0 },
      { id: "C", text: "菜不好吃", correct: false, humorScore: 0 },
      { id: "D", text: "没有领会", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 44,
    type: "自我认知反差",
    question: "妈妈说找对象不能只看人家的外表，也要看看________",
    tip: "自我认知反差：承认短板却巧妙自夸，如'妈妈说找对象不能只看人家的外表，也要看看自己的外表'",
    options: [
      { id: "A", text: "自己的外表", correct: true, humorScore: 5 },
      { id: "B", text: "人家的收入", correct: false, humorScore: 0 },
      { id: "C", text: "人家的人品", correct: false, humorScore: 0 },
      { id: "D", text: "自己的需求", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 45,
    type: "自恋式幽默",
    question: "我是西虹市小有名气的美女，小到________",
    tip: "自恋式幽默：迷之自信产生笑点，如'我是西虹市小有名气的美女，小到只有我自己知道'",
    options: [
      { id: "A", text: "只有我自己知道", correct: true, humorScore: 5 },
      { id: "B", text: "没人知道", correct: false, humorScore: 0 },
      { id: "C", text: "只有小区知道", correct: false, humorScore: 1 },
      { id: "D", text: "全市都知道", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 46,
    type: "荒谬自嘲",
    question: "我知道岁月会磨平我的棱角，但没想到它磨平我的方式是，________",
    tip: "荒谬自嘲：承认荒谬但有理，如'我知道岁月会磨平我的棱角，但没想到它磨平我的方式是，把我摁在地上摩擦'",
    options: [
      { id: "A", text: "把我摁在地上摩擦", correct: true, humorScore: 5 },
      { id: "B", text: "把我磨成鹅卵石", correct: false, humorScore: 2 },
      { id: "C", text: "让我慢慢成长", correct: false, humorScore: 0 },
      { id: "D", text: "把我变成另外一个人", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 47,
    type: "文字游戏",
    question: "我每天都坚持做仰卧起坐，________",
    tip: "文字游戏：利用字形字义，如'我每天都坚持做仰卧起坐，晚上一个仰卧，早上一个起坐'",
    options: [
      { id: "A", text: "晚上一个仰卧，早上一个起坐", correct: true, humorScore: 5 },
      { id: "B", text: "晚上五十个，早上五十个", correct: false, humorScore: 0 },
      { id: "C", text: "做完都会夸自己", correct: false, humorScore: 1 },
      { id: "D", text: "每次起来都能飞", correct: false, humorScore: 3 },
    ]
  },
  {
    id: 48,
    type: "反讽",
    question: "成功的聪明人太多了，我必须________",
    tip: "反讽：正话反说，如'成功的聪明人太多了，我必须为笨蛋争口气'",
    options: [
      { id: "A", text: "为笨蛋争口气", correct: true, humorScore: 5 },
      { id: "B", text: "变得更聪明", correct: false, humorScore: 0 },
      { id: "C", text: "避其锋芒", correct: false, humorScore: 0 },
      { id: "D", text: "和他们当朋友", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 51,
    type: "对比反差",
    question: "有的人复习起来像孔子温故而知新，像女娲补天，而我复习起来像________",
    tip: "对比反差：制造强烈反差，如'有的人复习起来像孔子温故而知新，像女娲补天，而我复习起来像哥伦布发现新大陆'",
    options: [
      { id: "A", text: "哥伦布发现新大陆", correct: true, humorScore: 5 },
      { id: "B", text: "精卫填海", correct: false, humorScore: 1 },
      { id: "C", text: "夸父��日", correct: false, humorScore: 1 },
      { id: "D", text: "后羿射日", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 52,
    type: "荒谬延伸",
    question: "被一道数学题难住了，于是我把题目对着天空讲了一遍，因为________",
    tip: "荒谬延伸：顺着荒谬逻辑往下想，如'被一道数学题难住了，于是我把题目对着天空讲了一遍，因为人算不如天算'",
    options: [
      { id: "A", text: "人算不如天算", correct: true, humorScore: 5 },
      { id: "B", text: "求解于天", correct: false, humorScore: 1 },
      { id: "C", text: "请求神助攻", correct: false, humorScore: 2 },
      { id: "D", text: "老天爷也得算", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 53,
    type: "预期反转",
    question: "过了我这个村，________",
    tip: "预期反转：打破惯性思维，如'过了我这个村，依然有我这个店，因为我是连锁店'",
    options: [
      { id: "A", text: "依然有我这个店，因为我是连锁店", correct: true, humorScore: 5 },
      { id: "B", text: "就没我这个店", correct: false, humorScore: 0 },
      { id: "C", text: "你就错过了一个亿", correct: false, humorScore: 2 },
      { id: "D", text: "你再也找不到村了", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 54,
    type: "矛盾修辞",
    question: "如果你惹到别人不开心，一定要从自己身上找原因确保________",
    tip: "矛盾修辞：看似矛盾却有道理，如'如果你惹到别人不开心，一定要从自己身上找原因确保下一回还能惹到他'",
    options: [
      { id: "A", text: "下一回还能惹到他", correct: true, humorScore: 5 },
      { id: "B", text: "下次不再惹他", correct: false, humorScore: 0 },
      { id: "C", text: "能找到更好的理由", correct: false, humorScore: 1 },
      { id: "D", text: "能让自己脸皮更厚", correct: false, humorScore: 2 },
    ]
  },
  {
    id: 55,
    type: "预期反转",
    question: "作为一个过来人，我给年轻人的建议是：________",
    tip: "预期反转：打破惯性思维，如'作为一个过来人，我给年轻人的建议是：别过来'",
    options: [
      { id: "A", text: "别过来", correct: true, humorScore: 5 },
      { id: "B", text: "要努力", correct: false, humorScore: 0 },
      { id: "C", text: "加油干", correct: false, humorScore: 0 },
      { id: "D", text: "别放弃", correct: false, humorScore: 0 },
    ]
  },
  {
    id: 57,
    type: "文字游戏",
    question: "近年来获得的成功主要分为三类：________成功",
    tip: "文字游戏：利用字形字义，如'近年来获得的成功主要分为三类：登录、下载、付款成功'",
    options: [
      { id: "A", text: "登录、下载、付款", correct: true, humorScore: 5 },
      { id: "B", text: "考试、升学、恋爱", correct: false, humorScore: 0 },
      { id: "C", text: "赚钱、花钱、省钱", correct: false, humorScore: 1 },
      { id: "D", text: "吃饭、睡觉、打游戏", correct: false, humorScore: 1 },
    ]
  },
  {
    id: 58,
    type: "幽默反转",
    question: "你有什么不开心的事？说出来________",
    tip: "幽默反转：神转折，如'你有什么不开心的事？说出来让我开心一下'",
    options: [
      { id: "A", text: "让我开心一下", correct: true, humorScore: 5 },
      { id: "B", text: "让我也听听", correct: false, humorScore: 0 },
      { id: "C", text: "让我安慰安慰你", correct: false, humorScore: 2 },
      { id: "D", text: "让我替你两肋插刀", correct: false, humorScore: 3 },
    ]
  },
];

function getRandomQuestions(count = 10) {
  let usedIds = wx.getStorageSync('usedQuestionIds') || [];
  const availableQuestions = questions.filter(q => !usedIds.includes(q.id));
  
  let pool = availableQuestions.length >= count 
    ? availableQuestions 
    : questions;
  
  if (pool.length < count) {
    pool = questions;
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  const newUsedIds = [...usedIds, ...selected.map(q => q.id)];
  const uniqueUsedIds = [...new Set(newUsedIds)];
  wx.setStorageSync('usedQuestionIds', uniqueUsedIds);
  
  return selected.map(q => {
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    return { ...q, options: shuffledOptions };
  });
}

function calculateScore(questionIndex, isCorrect, timeSpent, totalTime = 15000) {
  if (!isCorrect) return 0;
  const baseScore = 50 + questionIndex * 10;
  const timeRatio = 1 - (timeSpent / totalTime);
  const speedBonus = Math.floor(baseScore * 0.2 * timeRatio);
  return baseScore + Math.max(0, speedBonus);
}

function getRating(correctCount, totalQuestions, totalTime) {
  const accuracy = correctCount / totalQuestions;
  if (accuracy >= 0.9 && totalTime < 60000) return "S";
  if (accuracy >= 0.8) return "A";
  if (accuracy >= 0.6) return "B";
  if (accuracy >= 0.4) return "C";
  return "D";
}

module.exports = {
  questions,
  getRandomQuestions,
  calculateScore,
  getRating
};