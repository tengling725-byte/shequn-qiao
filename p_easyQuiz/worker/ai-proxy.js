export async function handleAIParse(request, env) {
  try {
    const { content, filename } = await request.json();
    
    if (!content) {
      return new Response(JSON.stringify({ error: '内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const prompt = buildPrompt(content, filename);
    const apiKey = env.DOUBAO_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(env.DOUBO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: env.DOUBO_MODEL || 'doubao-seed-1-6-flash-250828',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 8192
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return new Response(JSON.stringify({ error: 'API错误：' + data.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = data.choices?.[0]?.message?.content?.trim();
    if (!result) {
      return new Response(JSON.stringify({ error: 'AI返回为空' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const parsed = parseAIResult(result);
    
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'AI解析失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function buildPrompt(content, filename) {
  return `请将以下题库内容解析为标准JSON格式。必须严格返回以下格式的JSON，不要包含任何其他内容：

{
  "title": "题库名称",
  "description": "题库描述",
  "category": "分类",
  "questions": [
    {
      "content": "题目内容（问句）",
      "type": "single/multiple/true_false",
      "options": [
        {"id": 0, "text": "A选项内容", "isCorrect": false},
        {"id": 1, "text": "B选项内容", "isCorrect": false},
        {"id": 2, "text": "C选项内容", "isCorrect": false},
        {"id": 3, "text": "D选项内容", "isCorrect": false}
      ],
      "correctIndex": [0],
      "explanation": "解析内容（可选）",
      "difficulty": 1,
      "tags": []
    }
  ]
}

注意：
1. options中的isCorrect表示是否为正确答案
2. correctIndex是一个数组，如[0]表示A是正确答案，[0,1]表示AB都是正确答案
3. type的single表示单选，multiple表示多选，true_false表示判断题
4. 返回的必须是合法的JSON格式，可以直接JSON.parse()

题库内容如下：
${content}`;
}

function parseAIResult(result) {
  let jsonStr = result.trim();
  let jsonMatch = jsonStr.match(/\{[\s\S]*\}\s*$/);
  if (!jsonMatch) {
    throw new Error('AI返回格式不规范，无法解析');
  }
  jsonStr = jsonMatch[0];
  
  const data = JSON.parse(jsonStr);
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('解析结果格式不正确');
  }
  
  return {
    title: data.title || 'AI解析题库',
    description: data.description || '',
    category: data.category || '',
    questions: data.questions.map((q, i) => normalizeQuestion(q, i))
  };
}

function normalizeQuestion(q, index) {
  const type = (q.type || 'single').toLowerCase();
  let correctIndex = q.correctIndex || [];
  if (!Array.isArray(correctIndex)) {
    correctIndex = [correctIndex];
  }
  
  let options = q.options || [];
  if (!Array.isArray(options)) {
    options = Object.keys(options).map(key => ({ id: parseInt(key), text: options[key] }));
  }
  
  return {
    id: q.id || `ai-${index + 1}`,
    type: type === 'multiple' || type === 'multiple_choice' ? 'multiple' :
          type === 'true_false' ? 'true_false' : 'single',
    content: q.content || q.question || '',
    options: options.map((opt, i) => ({
      id: opt.id !== undefined ? opt.id : i,
      text: opt.text || opt.content || opt || '',
      isCorrect: Array.isArray(q.correctIndex) ? q.correctIndex.includes(i) : false
    })),
    explanation: q.explanation || q.explain || '',
    difficulty: q.difficulty || 1,
    tags: q.tags || []
  };
}