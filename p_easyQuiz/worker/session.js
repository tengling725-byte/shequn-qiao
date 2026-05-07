import { generateId } from './hash.js';

export async function createSession(env, userId) {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, userId, expiresAt).run();
  
  return { sessionId, expiresAt };
}

export async function getSession(env, sessionId) {
  const result = await env.DB.prepare(
    'SELECT s.*, u.id as user_id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(sessionId).first();
  
  return result || null;
}

export async function deleteSession(env, sessionId) {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}

export function getSessionFromCookie(request) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export function setSessionCookie(sessionId, expiresAt) {
  const maxAge = Math.floor((new Date(expiresAt) - Date.now()) / 1000);
  return `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}