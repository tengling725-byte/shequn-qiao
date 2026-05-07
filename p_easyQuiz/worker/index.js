import { handleRegister, handleLogin, handleLogout, handleMe, requireAuth } from './auth.js';
import { handleAIParse } from './ai-proxy.js';
import { getSessionFromCookie, getSession } from './session.js';
import { getUserQuizzes, getQuizById, createQuiz, deleteQuiz, saveHistory, getHistory, saveError, getErrors, removeError } from './db.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim().toLowerCase());
    let isAllowed = allowedOrigins.includes('*');
    
    if (!isAllowed) {
      const originLower = origin.toLowerCase();
      isAllowed = allowedOrigins.some(o => {
        if (o.startsWith('*.')) {
          const suffix = o.slice(1);
          return originLower.endsWith(suffix);
        }
        return o === originLower;
      });
    }
    
    const corsOrigin = isAllowed ? origin : '';
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 给 Response 添加 CORS 头的工具函数
    const withCors = (response) => {
      const corsResponse = new Response(response.body, response);
      Object.entries(corsHeaders).forEach(([k, v]) => corsResponse.headers.set(k, v));
      return corsResponse;
    };

    try {
      if (path === '/api/auth/register' && method === 'POST') {
        return withCors(await handleRegister(request, env));
      }

      if (path === '/api/auth/login' && method === 'POST') {
        return withCors(await handleLogin(request, env));
      }

      if (path === '/api/auth/logout' && method === 'POST') {
        return withCors(await handleLogout(request, env));
      }

      if (path === '/api/auth/me' && method === 'GET') {
        return withCors(await handleMe(request, env));
      }

      if (path === '/api/ai/parse' && method === 'POST') {
        return withCors(await handleAIParse(request, env));
      }

      if (path === '/api/quizzes' && method === 'GET') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const quizzes = await getUserQuizzes(env, session.user_id);
        return new Response(JSON.stringify({ quizzes }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/quizzes' && method === 'POST') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { name, data } = await request.json();
        const quiz = await createQuiz(env, session.user_id, name, data);
        return new Response(JSON.stringify({ success: true, quiz }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/quizzes/') && method === 'DELETE') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const quizId = path.split('/').pop();
        await deleteQuiz(env, quizId, session.user_id);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/quizzes/') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const quizId = url.searchParams.get('id');
        if (!quizId) {
          return new Response(JSON.stringify({ error: '缺少 quiz id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const quiz = await getQuizById(env, quizId, session.user_id);
        if (!quiz) {
          return new Response(JSON.stringify({ error: '题库不存在' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ quiz: { ...quiz, data: JSON.parse(quiz.data) } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/history' && method === 'GET') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const history = await getHistory(env, session.user_id);
        return new Response(JSON.stringify({ history }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/history' && method === 'POST') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const record = await request.json();
        await saveHistory(env, session.user_id, record);
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/errors' && method === 'GET') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const errors = await getErrors(env, session.user_id);
        return new Response(JSON.stringify({ errors }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/errors' && method === 'POST') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const question = await request.json();
        await saveError(env, session.user_id, question);
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/errors' && method === 'DELETE') {
        const session = await requireAuth(request, env);
        if (!session) {
          return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { questionId } = await request.json();
        await removeError(env, session.user_id, questionId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('API Only. Use index.html for frontend.', { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};