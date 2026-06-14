import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://sazuncuyunuusfvnhekl.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vE4ODP1xkOhf5ALFWW2ySw_dZJ92pPL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
