import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzxufzrbqdnhlxcfozkc.supabase.co';
const supabaseAnonKey = 'sb_publishable_gPIRYemb5od7syP9d4X3Ow_WikofnWq';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

export async function initDatabase() {
  const { error } = await supabase.from('banks').select('id').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('需要初始化数据库表');
    return false;
  }
  
  return true;
}