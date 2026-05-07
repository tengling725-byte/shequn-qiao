import re

md_content = open('C:/Workspace/opencode/p_humor_pk/题库.md', 'r', encoding='utf-8').read()

pattern = r'## 第(\d+)题.*?\n\*\*([^\*]+)\*\*.*?\n(.*?)(?=## |$)'
matches = re.findall(pattern, md_content, re.DOTALL)

questions = []
for match in matches:
    q_id = int(match[0])
    question_text = match[1].strip().replace('__________', '________')
    options_block = match[2]
    
    type_match = re.search(r'## 第\d+题 - ([^\n]+)', f"## 第{q_id}题 - XXX\n{options_block}")
    q_type = type_match.group(1).split('✓')[0].strip() if type_match else "幽默类"
    
    options = []
    for line in options_block.split('\n'):
        line = line.strip()
        if '- A.' in line or 'A. ' in line:
            text = re.sub(r'.*?A\.\s*', '', line).replace('✓', '').strip()
            options.append({'id': 'A', 'text': text, 'correct': True})
        elif '- B.' in line or 'B. ' in line:
            text = re.sub(r'.*?B\.\s*', '', line).replace('✓', '').strip()
            options.append({'id': 'B', 'text': text, 'correct': False})
        elif '- C.' in line or 'C. ' in line:
            text = re.sub(r'.*?C\.\s*', '', line).replace('✓', '').strip()
            options.append({'id': 'C', 'text': text, 'correct': False})
        elif '- D.' in line or 'D. ' in line:
            text = re.sub(r'.*?D\.\s*', '', line).replace('✓', '').strip()
            options.append({'id': 'D', 'text': text, 'correct': False})
    
    if options:
        questions.append({
            'id': q_id,
            'type': q_type,
            'question': question_text,
            'options': options
        })

js_content = "const questions = [\n"
for q in questions:
    js_content += f"  {{\n    id: {q['id']},\n    type: \"{q['type']}\",\n    question: \"{q['question']}\",\n    options: [\n"
    for opt in q['options']:
        js_content += f"      {{ id: \"{opt['id']}\", text: \"{opt['text']}\", correct: {'true' if opt['correct'] else 'false'} }},\n"
    js_content += "    ]\n  },\n"
js_content += "];\n\n"

js_content += """function getRandomQuestions(count = 10) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => {
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
"""

open('C:/Workspace/opencode/p_humor_pk/utils/questions.js', 'w', encoding='utf-8').write(js_content)
print(f"已生成 {len(questions)} 道题目到 questions.js")