# JS 核心语法题库（C 基础 + AI 编程适配）



![{"type":"load\_by\_key","key":"banner\_image\_0","image\_type":"search"}]()

> 适用场景：有 C 语言基础，想快速掌握 JS 核心语法，适配 AI 辅助编程

题型：单选（10 题）+ 判断（5 题）

导入格式：直接复制为 TXT/MD 文件，可无缝导入「小测」APP



***

## 单选题

### 1. JS 中声明「不可修改的变量」，最优选择是？

A. var x = 10;

B. let x = 10;

C. const x = 10;

D. int x = 10;

【答案】C

【解析】C 语言中用`const`声明常量，JS 中`const`语义一致（声明后不可修改），且是块级作用域（比`var`更安全）；`let`是可变变量，`var`是老语法（函数级作用域，不推荐）；JS 无`int`类型声明。AI 编程时，优先用`const`声明固定值，可减少意外修改。



***

### 2. 下列 JS 代码中，字符串拼接最简洁高效的是？

A. let name = "张三"; let msg = "Hello" + name;

B. let name = "张三"; let msg = `Hello ${name}`;

C. let name = "张三"; let msg = "Hello".concat (name);

D. let name = "张三"; let msg = "Hello % s".replace ("% s", name);

【答案】B

【解析】JS 的模板字符串（反引号`` ` ``+`${变量}`）是 AI 编程首选，支持换行、多变量拼接，比 C 语言的`printf("%s", str)`更简洁；A 选项`+`拼接在多变量时易出错，C/D 选项语法冗余。



***

### 3. JS 中遍历数组`let arr = [1,2,3]`，最符合 AI 编程习惯的是？

A. for (let i=0; i\<arr.length; i++) { console.log (arr \[i]); }

B. arr.forEach (item => { console.log (item); })

C. for (let i in arr) { console.log (arr \[i]); }

D. while (arr.length > 0) { console.log (arr.shift ()); }

【答案】B

【解析】`forEach`是数组遍历的语义化方法，AI 生成代码时高频使用，比 C 语言风格的`for`循环（A 选项）更简洁；C 选项`for...in`会遍历原型链属性（不推荐）；D 选项会修改原数组（破坏性遍历）。



***

### 4. 下列关于 JS 对象的描述，错误的是？

A. JS 对象类似 C 语言的结构体，用于存储结构化数据

B. 访问对象属性可以用`obj.name`或`obj["name"]`

C. JS 对象的属性可以动态添加 / 修改

D. JS 对象必须先定义结构体再创建实例

【答案】D

【解析】JS 是弱类型语言，对象无需预定义结构（区别于 C 语言的`struct`），可直接动态添加属性（如`let obj = {}; obj.age = 20;`）；A/B/C 均为正确特性，AI 编程时常用对象存储接口参数、返回数据。



***

### 5. JS 中处理「网络请求」这类异步操作，最常用的语法是？

A. callback 回调函数

B. async/await

C. Promise.then ()

D. setTimeout ()

【答案】B

【解析】`async/await`是 ES6 + 异步编程的语法糖，代码结构类似 C 语言的同步逻辑（线性执行），AI 生成异步代码时优先使用；A 选项回调函数易造成「回调地狱」，C 选项`then`链比`async/await`冗余，D 选项仅用于延时执行。



***

### 6. 下列代码的运行结果是？



```
let a = 10;

let b = "10";

console.log(a === b);
```

A. true

B. false

C. 1010

D. 20

【答案】B

【解析】JS 中`===`是严格相等（值 + 类型均一致），`a`是`number`类型，`b`是`string`类型，故返回`false`；C 语言中无严格相等运算符，需手动转换类型；`==`会自动类型转换（此处返回`true`），但 AI 编程推荐用`===`避免隐式错误。



***

### 7. JS 中实现「函数参数默认值」，正确的写法是？

A. function add (x, y=0) { return x + y; }

B. function add (x, y) { y = y || 0; return x + y; }

C. function add (x, y) { if (!y) y=0; return x + y; }

D. function add (x=0, y) { return x + y; }

【答案】A

【解析】ES6 + 支持直接在参数列表定义默认值（A 选项），是 AI 编程的标准写法；B/C 选项是老语法（存在`y=0`时被误判为`false`的问题）；D 选项默认值参数不能在非默认值参数前（语法错误）。



***

### 8. 下列关于 JSON 的描述，正确的是？

A. JSON 是 JS 的内置对象，可直接调用方法

B. JSON 字符串转 JS 对象用`JSON.parse()`

C. JS 对象转 JSON 字符串用`JSON.stringify()`

D. JSON 格式支持注释和函数

【答案】C

【解析】JSON 是纯文本数据格式（非对象），核心用途是前后端数据传输；B 选项语法正确但题目问「正确描述」，C 选项是 JS 对象转 JSON 的标准方法（AI 编程接口交互高频使用）；A 选项错误（JSON 不是对象）；D 选项错误（JSON 不支持注释和函数）。



***

### 9. JS 中本地存储「复杂数据（如对象）」，正确的方式是？

A. localStorage.setItem ("user", {name: "张三"});

B. localStorage.setItem ("user", JSON.stringify ({name: "张三"}));

C. localStorage.setItem ("user", JSON.parse ({name: "张三"}));

D. localStorage.setItem ("user", {name: "张三"}.toString ());

【答案】B

【解析】浏览器本地存储（`localStorage`）仅支持字符串类型，存储对象需用`JSON.stringify()`转为字符串（AI 编程本地缓存高频操作）；A 选项直接存对象会转为`"[object Object]"`（无效）；C 选项`JSON.parse()`是字符串转对象（参数错误）；D 选项`toString()`结果同上。



***

### 10. 下列 JS 代码中，符合 AI 编程「模块化」思想的是？

A. 所有代码写在一个`script`标签中

B. 用`class`封装相关方法和属性

C. 用全局变量传递数据

D. 所有函数直接定义在全局作用域

【答案】B

【解析】AI 编程注重代码结构化，`class`是 JS 模块化的核心方式（类似 C 语言的结构体 + 函数封装），可实现逻辑复用和隔离；A/C/D 均为全局污染的写法（不推荐），模块化代码更易维护、调试。



***

## 判断题

### 11. JS 是弱类型语言，变量声明时无需指定数据类型。（ ）

【答案】正确

【解析】区别于 C 语言的`int`/`char`/`float`，JS 变量声明用`let`/`const`，自动推导类型（如`let x = 10`是`number`，`let y = "a"`是`string`），AI 编程时无需关注类型定义，专注逻辑实现。



***

### 12. JS 中的`null`和`undefined`含义完全相同，可互换使用。（ ）

【答案】错误

【解析】`null`是「主动赋值的空」（类似 C 语言的`NULL`指针），`undefined`是「未定义」（变量声明未赋值、函数无返回值等）；AI 编程时，主动清空变量用`null`，避免用`undefined`（易造成逻辑混淆）。



***

### 13. JS 数组的长度是固定的，不能动态添加 / 删除元素。（ ）

【答案】错误

【解析】JS 数组是动态扩容的（区别于 C 语言的静态数组），可通过`push()`（添加）、`pop()`（删除）等方法修改长度，AI 编程时无需提前定义数组大小，灵活操作。



***

### 14. 用`async`声明的函数，返回值一定是 Promise 对象。（ ）

【答案】正确

【解析】`async`函数的返回值会自动包装为 Promise（成功状态），即使返回普通值（如`async function fn() { return 1; }`）；AI 编程时，异步函数必加`async`，配合`await`处理异步逻辑。



***

### 15. JS 中的`for...of`循环可以遍历数组和对象。（ ）

【答案】错误

【解析】`for...of`是数组专用遍历（支持`break`/`continue`），不能直接遍历对象（需用`Object.keys(obj)`转换）；AI 编程时，数组用`for...of`或`forEach`，对象用`for...in`或`Object.entries(obj)`。



***

> （注：文档部分内容可能由 AI 生成）