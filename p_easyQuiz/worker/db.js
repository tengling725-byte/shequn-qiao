export async function createUser(env, username, email, passwordHash) {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, username, email, passwordHash).run();
  return { id, username, email };
}

export async function getUserByEmail(env, email) {
  return await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
}

export async function getUserById(env, userId) {
  return await env.DB.prepare(
    'SELECT id, email, created_at FROM users WHERE id = ?'
  ).bind(userId).first();
}

function computeHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(16);
}

export async function getUserQuizzes(env, userId) {
  const results = await env.DB.prepare(
    'SELECT id, name, data, created_at FROM quizzes WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return results.results.map(q => {
    let questionCount = 0;
    let contentHash = '';
    try {
      const parsed = JSON.parse(q.data);
      questionCount = parsed.questions ? parsed.questions.length : 0;
      contentHash = computeHash(JSON.stringify(parsed.questions));
    } catch (e) {}
    return {
      id: q.id,
      name: q.name,
      question_count: questionCount,
      content_hash: contentHash,
      created_at: q.created_at
    };
  });
}

export async function getQuizById(env, quizId, userId) {
  return await env.DB.prepare(
    'SELECT * FROM quizzes WHERE id = ? AND user_id = ?'
  ).bind(quizId, userId).first();
}

export async function createQuiz(env, userId, name, data) {
  const result = await env.DB.prepare(
    'INSERT INTO quizzes (user_id, name, data) VALUES (?, ?, ?)'
  ).bind(userId, name, data).run();
  return { id: result.meta.last_row_id, name, data };
}

export async function deleteQuiz(env, quizId, userId) {
  await env.DB.prepare(
    'DELETE FROM quizzes WHERE id = ? AND user_id = ?'
  ).bind(quizId, userId).run();
}

export async function saveHistory(env, userId, record) {
  const result = await env.DB.prepare(
    'INSERT INTO history (user_id, quiz_title, mode, total, correct, score, time_spent) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(userId, record.quizTitle, record.mode, record.total, record.correct, record.score, record.time).run();
  return result.meta.last_row_id;
}

export async function getHistory(env, userId, limit = 100) {
  const results = await env.DB.prepare(
    'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(userId, limit).all();
  return results.results;
}

export async function saveError(env, userId, question) {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO errors (user_id, question_id, content, options, explanation, wrong_count, last_wrong) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    userId,
    question.id,
    question.content,
    JSON.stringify(question.options),
    question.explanation || '',
    1,
    new Date().toISOString()
  ).run();
}

export async function getErrors(env, userId) {
  const results = await env.DB.prepare(
    'SELECT * FROM errors WHERE user_id = ? ORDER BY last_wrong DESC LIMIT 200'
  ).bind(userId).all();
  return results.results.map(e => ({
    ...e,
    options: JSON.parse(e.options || '[]')
  }));
}

export async function removeError(env, userId, questionId) {
  await env.DB.prepare(
    'DELETE FROM errors WHERE user_id = ? AND question_id = ?'
  ).bind(userId, questionId).run();
}