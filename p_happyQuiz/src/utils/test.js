import supabase from './storage/supabase.js';

export async function testAIParse() {
  const testText = `Q: JavaScript 中用什么声明常量？
A. var
B. let
C. const
D. static
ANS: C
EXP: const 用于声明常量`;

  try {
    const { data, error } = await supabase.functions.invoke('parse', {
      body: { text: testText }
    });

    if (error) {
      console.error('调用失败:', error);
      return { success: false, error };
    }

    console.log('AI 解析结果:', data);
    return { success: true, data };
  } catch (e) {
    console.error('异常:', e);
    return { success: false, error: e.message };
  }
}