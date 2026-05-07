// 题库数据 - 梗王争霸HTML5版
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
      { id: "D", text: "比皇宫还大", correct: false, humorScore: 2 },
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
    tip: "��恋式幽默：迷之自信产生笑点，如'谁能想到貌不惊人的我，竟然是龙的传人'",
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
      { id: "A", text: "穷与丑却能同时拥有", correct: true, humorScore: 5 },
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
      { id: "B", text: "我就吓得��死", correct: false, humorScore: 1 },
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
    tip: "经典篡改：改编名言，如'你无法叫醒一个不回你消息的人但是红包能'",
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
      { id: "C", text: "决定明天去���外���", correct: false, humorScore: 2 },
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
      { id: "C", text: "夸父追日", correct: false, humorScore: 1 },
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
  }
];

// 名句棒棒糖数据
const quotes = [
  { text: "人生如逆旅，我亦是行人。", author: "苏轼" },
  { text: "未经审视的人生是不值得过的。", author: "苏格拉底" },
  { text: "别人笑我太疯癫，我笑他人看不穿。", author: "唐伯虎" },
  { text: "世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。", author: "罗曼罗兰" },
  { text: "明天会更好，这是骗子安慰人的话。", author: "鲁迅" },
  { text: "今天很残酷，明天更残酷，后天会很美好。", author: "马云" },
  { text: "我最大的错误是我以为自己还应该更努力。", author: "某网友" },
  { text: "天赋决定了你的起点，但努力决定了你的上限。", author: "鸡汤" },
  { text: "咸鱼翻了身，还是咸鱼。", author: "某网���" },
  { text: "努力不一定成功，但不努力一定很舒服。", author: "某网友" },
  { text: "多行不义必自毙。", author: "《左传》" },
  { text: "辅车相依，唇亡齿寒。", author: "《左传》" },
  { text: "夫战，勇气也。一鼓作气，再而衰，三而竭。", author: "《曹刿论战》" },
  { text: "肉食者鄙，不能远谋。", author: "《曹刿论战》" },
  { text: "居安思危，思则有备，有备无患。", author: "《左传》" },
  { text: "防民之口，甚于防川。", author: "《左传》" },
  { text: "众怒难犯，专欲难成。", author: "《左传》" },
  { text: "言之无文，行而不远。", author: "《左传》" },
  { text: "人谁无过？过而能改，善莫大焉。", author: "《左传》" },
  { text: "前事不忘，后事之师。", author: "《战国策》" },
  { text: "士为知己者死，女为悦己者容。", author: "《战国策》" },
  { text: "宁为鸡口，无为牛后。", author: "《战国策》" },
  { text: "鹬蚌相争，渔翁得利。", author: "《战国策》" },
  { text: "日中则移，月满则亏。", author: "《战国策》" },
  { text: "夫仁者，己欲立而立人，己欲达而达人。", author: "《论语》" },
  { text: "君子坦荡荡，小人长戚戚。", author: "《论语》" },
  { text: "士不可以不弘毅，任重而道远。", author: "《论语》" },
  { text: "三军可夺帅也，匹夫不可夺志也。", author: "《论语》" },
  { text: "富贵不能淫，贫贱不能移，威武不能屈。", author: "《孟子》" },
  { text: "穷则独善其身，达则兼济天下。", author: "《孟子》" },
  { text: "民为贵，社稷次之，君为轻。", author: "《孟子》" },
  { text: "天时不如地利，地利不如人和。", author: "《孟子》" },
  { text: "得道者多助，失道者寡助。", author: "《孟子》" },
  { text: "生于忧患而死于安乐。", author: "《孟子》" },
  { text: "锲而不舍，金石可镂。", author: "《荀子》" },
  { text: "青，取之于蓝，而青于蓝。", author: "《荀子》" },
  { text: "不积跬步，无以至千里。", author: "《荀子》" },
  { text: "合抱之木，生于毫末。", author: "《老子》" },
  { text: "上善若水。", author: "《老子》" },
  { text: "祸兮福之所倚，福兮祸之所伏。", author: "《老子》" },
  { text: "知人者智，自知者明。", author: "《老子》" },
  { text: "鹏之徙于南冥也，水击三千里。", author: "《庄子》" },
  { text: "至人无己，神人无功，圣人无名。", author: "《庄子》" },
  { text: "吾生也有涯，而知也无涯。", author: "《庄子》" },
  { text: "运筹策帷帐之中，决胜于千里之外。", author: "《史记》" },
  { text: "燕雀安知鸿鹄之志哉！", author: "《史记》" },
  { text: "王侯将相宁有种乎！", author: "《史记》" },
  { text: "项庄舞剑，意在沛公。", author: "《史记》" },
  { text: "桃李不言，下自成蹊。", author: "《史记》" },
  { text: "天下熙熙，皆为利来；天下攘攘，皆为利往。", author: "《史记》" },
  { text: "人固有一死，或重于泰山，或轻于鸿毛。", author: "《史记》" },
  { text: "苟全性命于乱世，不求闻达于诸侯。", author: "诸葛亮" },
  { text: "亲贤臣，远小人，此先汉所以兴隆也。", author: "诸葛亮" },
  { text: "非��泊无以明志，非宁静无以致远。", author: "诸葛亮" },
  { text: "老骥伏枥，志在千里。", author: "曹操" },
  { text: "师者，所以传道受业解惑也。", author: "韩愈" },
  { text: "业精于勤，荒于嬉；行成于思，毁于随。", author: "韩愈" },
  { text: "醉翁之意不在酒，在乎山水之间也。", author: "欧阳修" },
  { text: "先天下之忧而忧，后天下之乐而乐。", author: "范仲淹" },
  { text: "不以物喜，不以己悲。", author: "范仲淹" },
  { text: "出淤泥而不染，濯清涟而不妖。", author: "周敦颐" },
  { text: "山不在高，有仙则名；水不在深，有龙则灵。", author: "刘禹锡" },
  { text: "斯是陋室，惟吾德馨。", author: "刘禹锡" },
  { text: "粉身碎骨浑不怕，要留清白在人间。", author: "于谦" },
  { text: "千磨万击还坚劲，任尔东西南北风。", author: "郑燮" },
  { text: "天下兴亡，匹夫有责。", author: "顾炎武" }
];

// 文言豆腐干数据
const wenyanItems = [
  { title: "郑伯克段于鄢", original: "既而大叔命西鄙(边邑)、北鄙贰(两属)于己。公子吕曰：'国不堪贰，君将若之何？欲与大叔，臣请事之；若弗与，则请除之，无生民心(使百姓生二心)。'公曰：'无庸(用)，将自及。'大叔又收贰以为己邑，至于廪延(地名)。子封曰：'可矣，厚(势力雄厚)将得众。'公曰：'不义不暱(亲近)，厚将崩。'", note: "庄公之弟共叔段在母亲武姜支持下不断扩张势力，庄公采取纵容态度，最终以'克段于鄢'告终，揭示了贪婪与政治阴谋的危害。" },
  { title: "曹刿论战", original: "问：'何以战？'公曰：'衣食所安，弗敢专也，必以分人。'对曰：'小惠未遍，百姓弗从。'公曰：'牺牲(祭祀用牛羊)玉帛，弗敢加(虚报)也，必以信。'对曰：'小信未孚(使人信服)，神弗福(赐福)也。'公曰：'小大之狱(案件)，虽不能察，必以情。'对曰：'忠之属也，可以一战。战则请从。'", note: "曹刿问鲁庄公凭借什么作战，庄公说分享衣物食物。曹刿认为小恩小惠不能得到百姓支持，无法作战。体现'民本'思想。" },
  { title: "宫之奇谏假道", original: "晋侯复假(借)道于虞以伐虢。宫之奇谏曰：'虢，虞之表(屏障)也。虢亡，虞必从之。晋不可启(纵容野心)，寇不可玩(轻视)。一之谓甚，其可再乎？谚所谓辅(面颊)车(牙床)相依，唇亡齿寒者，其虞、虢之谓也。'", note: "宫之奇用'辅车相依，唇亡齿寒'比喻虞虢两国关系，劝谏虞公不要借道给晋国。但虞公不听，最终两国都被晋国所灭。" },
  { title: "烛之武退秦师", original: "若亡郑而有益于君，敢以烦执事(对对方敬称)。越国以鄙远(以远地为边邑)，君知其难也。焉用亡郑以陪(增加)邻？邻之厚，君之薄也。若舍郑以为东道主(东方道路主人)，行李(使者)之往来，共(供)其乏困，君亦无所害。", note: "烛之武以'舍郑以为东道主'说服秦穆公退兵，指出灭郑对秦无利，反而有害。体现高超的外交辞令艺术。" },
  { title: "蹇叔哭师", original: "穆公访(咨询)诸蹇叔。蹇叔曰：'劳师以袭远，非所闻也。师劳力竭，远主备之，无乃不可乎？师之所为，郑必知之；勤而无所，必有悖心(叛离之心)。且行千里，其谁不知？'", note: "蹇叔预见秦军必败，'哭师'表达对将士的同情。后秦军果然在崤山被晋军大败。" },
  { title: "子产论政宽猛", original: "郑子产有疾，谓子太叔曰：'我死，子必为政。唯有德者能以宽服民，其次莫如猛。夫火烈，民望而畏之���故���(少)死焉；水懦弱，民狎(轻慢)而玩之，则多死焉。故宽难。'", note: "子产认为'宽政'难以实施，'猛政'虽残酷但有效。体现法家'以刑止刑'思想。" },
  { title: "召公谏厉王止谤", original: "厉王虐，国人谤(公开指责)王。召公谏曰：'民不堪命矣！'王怒，得卫巫，使监谤者。以告，则杀之。国人莫敢言，道路以目(用眼色示意)。", note: "召公以'防民之口甚于防川'比喻，劝谏周厉王不要压制百姓言论。厉王不听，最终被流放。" },
  { title: "苏秦以连横说秦", original: "说秦王书十上而说不行，黑貂之裘弊，黄金百斤尽，资用乏绝，去秦而归。羸縢(绑腿)履蹻(草鞋)，负书担橐(背书箱行李)，形容枯槁，面目犁黑，状有归色。归至家，妻不下纴(织布机)，嫂不为炊，父母不与言。", note: "描写苏秦游说失败后的狼狈相：貂皮衣破、黄金用尽、形容枯槁、回家后遭家人冷遇。激励人们坚持梦想。" },
  { title: "邹忌讽齐王纳谏", original: "于是入朝见威王，曰：'臣诚知不如徐公美。臣之妻私臣，臣之妾畏臣，臣之客欲有求于臣，皆以美于徐公。今齐地方千里，百二十城，宫妇左右莫不私王，朝廷之臣莫不畏王，四境之内莫不有求于王。由此观之，王之蔽(受蒙蔽)甚矣。'", note: "邹忌以己喻国，劝齐威王广开言路。承诺'受上赏'、'受中赏'、'受下赏'，终使齐国大治。" },
  { title: "触龙说赵太后", original: "左师公曰：'父母之爱子，则为之计深远(做长远打算)。媪(对老妇敬称)之送燕后也，持其踵(脚后跟)为之泣，念悲其远也，亦哀之矣。已行，非弗思也，祭祀必祝之，祝曰：'必勿使反(返回，指被休弃)。'岂非计久长，有子孙相继为王也哉？'", note: "触龙以'父母之爱子，则为之计深远'说服赵太后送长安君到齐国为质，换取救兵。体现深远目光的重要性。" }
];

// 评分计算
function getRating(correctCount, totalQuestions, totalTime) {
  var accuracy = correctCount / totalQuestions;
  if (accuracy >= 0.9 && totalTime < 60000) return "S";
  if (accuracy >= 0.8) return "A";
  if (accuracy >= 0.6) return "B";
  if (accuracy >= 0.4) return "C";
  return "D";
}

// 随机获取题目
function getRandomQuestions(count) {
  count = count || 10;
  var usedIds = Storage.get('usedQuestionIds') || [];
  if (typeof usedIds === 'string') {
    try {
      usedIds = JSON.parse(usedIds);
    } catch (e) {
      usedIds = [];
    }
  }
  
  var availableQuestions = [];
  for (var i = 0; i < questions.length; i++) {
    if (usedIds.indexOf(questions[i].id) === -1) {
      availableQuestions.push(questions[i]);
    }
  }
  
  var pool = availableQuestions.length >= count ? availableQuestions : questions;
  
  if (pool.length < count) {
    pool = questions;
  }
  
  var shuffled = pool.slice(0).sort(function() { return Math.random() - 0.5; });
  var selected = shuffled.slice(0, count);
  
  var newUsedIds = usedIds.slice(0).concat(selected.map(function(q) { return q.id; }));
  var uniqueUsedIds = [];
  var seen = {};
  for (var j = 0; j < newUsedIds.length; j++) {
    if (!seen[newUsedIds[j]]) {
      seen[newUsedIds[j]] = true;
      uniqueUsedIds.push(newUsedIds[j]);
    }
  }
  Storage.set('usedQuestionIds', uniqueUsedIds);
  
  return selected.map(function(q) {
    var shuffledOptions = q.options.slice(0).sort(function() { return Math.random() - 0.5; });
    var result = {};
    for (var key in q) {
      result[key] = q[key];
    }
    result.options = shuffledOptions;
    return result;
  });
}