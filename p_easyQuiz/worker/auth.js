import { hashPassword, verifyPassword } from './hash.js';
import { createSession, getSession, deleteSession, getSessionFromCookie, setSessionCookie, clearSessionCookie } from './session.js';
import { createUser, getUserByEmail, getUserById } from './db.js';

export async function handleRegister(request, env) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: '邮箱和密码不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: '请输入有效的邮箱地址' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: '密码至少6位' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const existing = await getUserByEmail(env, email);
    if (existing) {
      return new Response(JSON.stringify({ error: '该邮箱已被注册' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const passwordHash = await hashPassword(password);
    const user = await createUser(env, email, passwordHash);
    const session = await createSession(env, user.id);
    
    return new Response(JSON.stringify({ 
      success: true,
      user: { id: user.id, email: user.email }
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': setSessionCookie(session.sessionId, session.expiresAt)
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '注册失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function handleLogin(request, env) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: '邮箱和密码不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = await getUserByEmail(env, email);
    if (!user) {
      return new Response(JSON.stringify({ error: '邮箱或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return new Response(JSON.stringify({ error: '邮箱或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const session = await createSession(env, user.id);
    
    return new Response(JSON.stringify({
      success: true,
      user: { id: user.id, email: user.email }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setSessionCookie(session.sessionId, session.expiresAt)
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '登录失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function handleLogout(request, env) {
  const sessionId = getSessionFromCookie(request);
  if (sessionId) {
    await deleteSession(env, sessionId);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie()
    }
  });
}

export async function handleMe(request, env) {
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const session = await getSession(env, sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: '会话已过期' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    user: { id: session.user_id, email: session.email }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function requireAuth(request, env) {
  const sessionId = getSessionFromCookie(request);
  if (!sessionId) return null;
  
  const session = await getSession(env, sessionId);
  return session;
}