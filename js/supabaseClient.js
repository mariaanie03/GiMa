
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';


const supabaseUrl = 'https://crlcdyiuyqgkyeuiahgb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybGNkeWl1eXFna3lldWlhaGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzgyNzUsImV4cCI6MjA2NTc1NDI3NX0.y_rIdqY6ducucO0lTX4KjbxdJsD10V4BImKTKizk6O4';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Cliente Supabase inicializado e confirmado com as credenciais corretas.');


