import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Question {
  id: string;
  type: string;
  content: string;
  options: { id: number; text: string }[];
  correctIndex: number[];
  explanation: string;
  difficulty: number;
  tags: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "题目文本不能为空" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const aiKey = Deno.env.get("DOUBAO_API_KEY");
    if (!aiKey) {
      return new Response(
        JSON.stringify({ error: "AI 服务未配置" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const prompt = `请解析以下题目文本，转换为 JSON 格式的题目列表。返回 JSON 数组，每个题目包含：type(单选single_choice/判断true_false), content(题干), options(选项数组，id从0开始), correctIndex(正确答案索引数组), explanation(解析), difficulty(难度1-5默认1), tags(标签数组)。

题目文本：
${text}

返回纯 JSON 数组，不要其他内容。`;

    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiKey}`,
        },
        body: JSON.stringify({
          model: "doubao-seed-1-6-flash-250828",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    let content = data.choices?.[0]?.message?.content || "";
    
    // 尝试解析 JSON
    let questions: Question[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("JSON 解析失败", e);
    }

    // 规范化题目
    questions = questions.map((q: any, index: number) => ({
      id: `q_${Date.now()}_${index}`,
      type: q.type || "single_choice",
      content: q.content || "",
      options: q.options || [],
      correctIndex: Array.isArray(q.correctIndex) ? q.correctIndex : [q.correctIndex || 0],
      explanation: q.explanation || "暂无解析",
      difficulty: q.difficulty || 1,
      tags: q.tags || [],
    }));

    return new Response(
      JSON.stringify({
        success: true,
        questions,
        count: questions.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});