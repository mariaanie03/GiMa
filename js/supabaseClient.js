// js/supabaseClient.js

// 1. Importa a função 'createClient' diretamente do CDN oficial do Supabase.
//    Esta é a forma correta de fazer isso em um projeto web com HTML e JS puros.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 2. Suas credenciais PÚBLICAS do Supabase.
//    Estas são as informações corretas retiradas da sua seção "APP FRAMEWORK".
const supabaseUrl = 'https://crlcdyiuyqgkyeuiahgb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybGNkeWl1eXFna3lldWlhaGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzgyNzUsImV4cCI6MjA2NTc1NDI3NX0.y_rIdqY6ducucO0lTX4KjbxdJsD10V4BImKTKizk6O4';

// 3. Cria a instância do cliente Supabase e a EXPORTA.
//    A palavra 'export' permite que outros arquivos (como auth.js) a importem e utilizem.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Cliente Supabase inicializado e confirmado com as credenciais corretas.');


// --- NOTA DE SEGURANÇA IMPORTANTE ---
//
// A string de conexão "postgresql://..." que você forneceu contém sua senha do banco de dados.
// ELA NUNCA DEVE SER USADA NO CÓDIGO DO LADO DO CLIENTE (HTML, JS que rodam no navegador).
// Ela é destinada apenas para aplicações de back-end (servidor).
//
// A configuração acima, usando a URL e a Chave Anônima (Anon Key), é a maneira CORRETA e SEGURA
// de se conectar ao Supabase a partir de um site.