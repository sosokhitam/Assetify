import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws'; // Gunakan nama alias WebSocket
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Kredensial Supabase (URL / SERVICE ROLE KEY) belum diatur di file .env');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    transport: WebSocket // Daftarkan transport ws di sini
  }
});