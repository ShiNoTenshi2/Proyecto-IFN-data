// PROYECTO-IFN-DATA/brigadas-service/config/database.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validar variables de entorno
if (!process.env.SUPABASE_URL) {
  throw new Error('❌ SUPABASE_URL no está definida en .env');
}

if (!process.env.SUPABASE_KEY) {
  throw new Error('❌ SUPABASE_KEY no está definida en .env');
}

// Crear cliente de Supabase (INSTANCIA ÚNICA)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

console.log('✅ Conexión con Supabase configurada correctamente');
console.log('📍 URL:', process.env.SUPABASE_URL);
console.log('📍 KEY:', process.env.SUPABASE_KEY ? "✓" : "✗ FALTANTE");

// Exportar como default
export default supabase;