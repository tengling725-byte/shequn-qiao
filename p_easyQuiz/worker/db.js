export async function createUser(env, email, passwordHash) {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
  ).bind(id, email, passwordHash).run();
  return { id, email };
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

export async function getUserQuizzes(env, userId) {
  const results = await env.DB.prepare(
    'SELECT id, name, created_at FROM quizzes WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return results.results;
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