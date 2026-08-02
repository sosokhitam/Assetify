import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('SUPABASE_URL_EXISTS', !!process.env.SUPABASE_URL);
console.log('SERVICE_KEY_EXISTS', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('JWT_SECRET_EXISTS', !!process.env.JWT_SECRET);

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

try {
  const { data: profiles, error: profilesError } = await client.from('profiles').select('id, nip, email, nama_lengkap, role').limit(10);
  console.log('profilesError', profilesError);
  console.log('profiles', JSON.stringify(profiles, null, 2));
} catch (err) {
  console.error('profiles exception', err);
}

try {
  const { data: authUsers, error: authUsersError } = await client.auth.admin.listUsers({ perPage: 10 });
  console.log('authUsersError', authUsersError);
  console.log('authUsers', JSON.stringify(authUsers, null, 2));
} catch (err) {
  console.error('authUsers exception', err);
}
