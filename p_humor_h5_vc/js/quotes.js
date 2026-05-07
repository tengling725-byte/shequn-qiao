// 名句棒棒糖逻辑
var quotes = {
  currentIndex: 0,
  
  init: function() {
    this.currentIndex = 0;
    this.showQuote();
  },
  
  showQuote: function() {
    var q = quotesData[this.currentIndex];
    if (!q) return;
    
    document.getElementById('quote-text').textContent = q.text;
    document.getElementById('quote-author').textContent = '— ' + q.author;
    document.getElementById('quote-index').textContent = (this.currentIndex + 1) + '/' + quotesData.length;
  },
  
  prev: function() {
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = quotesData.length - 1;
    this.showQuote();
  },
  
  next: function() {
    this.currentIndex++;
    if (this.currentIndex >= quotesData.length) this.currentIndex = 0;
    this.showQuote();
  }
};

// 简化的名句数据
var quotesData = [
  { text: "人生如逆旅，我亦是行人。", author: "苏轼" },
  { text: "未经审视的人生是不值得过的。", author: "苏格拉底" },
  { text: "别人笑我太疯癫，我笑他人看不穿。", author: "唐伯虎" },
  { text: "世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。", author: "罗曼罗兰" },
  { text: "明天会更好，这是骗子安慰人的话。", author: "鲁迅" },
  { text: "今天很残酷，明天更残酷，后天会很美好。", author: "马云" },
  { text: "我最大的错误是我以为自己还应该更努力。", author: "某网友" },
  { text: "天赋决定了你的起点，但努力决定了你的上限。", author: "鸡汤" },
  { text: "咸鱼翻了身，还是咸鱼。", author: "某网友" },
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
  { text: "非淡泊无以明志，非宁静无以致远。", author: "诸葛亮" },
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
