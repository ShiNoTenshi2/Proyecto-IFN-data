// PROYECTO-IFN-DATA/brigadas-service/config/authSupabase.js 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ⭐ Cliente para VALIDAR TOKENS del proyecto AUTH
const authSupabase = createClient(
  'https://vrndcvpzukblhjkpqpdo.supabase.co', // URL del proyecto AUTH
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybmRjdnB6dWtibGhqa3BxcGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjE5NDMsImV4cCI6MjA3NTUzNzk0M30.tmv-LcCG8Wdoyg1pjRd-GUBT-4R8yH2tb8W8HBUFW_Q', // ⭐ KEY del proyecto AUTH
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

console.log('✅ Cliente AUTH configurado para validar tokens');

export default authSupabase;