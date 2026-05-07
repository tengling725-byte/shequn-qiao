const testText = `Q: JavaScript 中用什么声明常量？
A. var
B. let
C. const
D. static
ANS: C`;

const url = 'https://kzxufzrbqdnhlxcfozkc.supabase.co/functions/v1/parse';
const apikey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function test() {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`
    },
    body: JSON.stringify({ text: testText })
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Result:', JSON.stringify(data, null, 2));
}

test();