import { handleRegister, handleLogin, handleLogout, handleMe, requireAuth } from './auth.js';
import { handleAIParse } from './ai-proxy.js';
import { getSessionFromCookie, getSession } from './session.js';
import { getUserQuizzes, getQuizById, createQuiz, deleteQuiz, saveHistory, getHistory, saveError, getErrors, removeError } from './db.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/auth/register' && method === 'POST') {
        const response = await handleRegister(request, env);
        const corsResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([k, v]) => corsResponse.headers.set(k, v));
        return corsResponse;
      }

      if (path === '/api/auth/login' && method === 'POST') {
        const response = await handleLogin(request, env);
        const corsResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([k, v]) => corsResponse.headers.set(k, v));
        return corsResponse;
      }

      if (path === '/api/auth/logout' && method === 'POST') {
        const response = await handleLogout(request, env);
        const corsResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([k, v]) => corsResponse.headers.set(k, v));
        return corsResponse;
      }

      if (path === '/api/auth/me' && method === 'GET') {
        const response = await handleMe(request, env);
        const corsResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([k, v]) => corsResponse.headers.set(k, v));
        return corsResponse;
      }

      if (path === '/api/ai/parse' && method === 'POST') {
        const response = await handleAIParse(request, env);
        const corsResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([k, v]) => corsResponse.headers.set(k, v));
        return corsResponse;
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

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};