// js/auth.js

// Importa a instância do Supabase que foi criada no supabaseClient.js
import { supabase } from './supabaseClient.js';

console.log('auth.js carregado');

// --- LÓGICA PARA A PÁGINA DE CADASTRO ---
const registrationForm = document.getElementById('registration-form');

if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário

        const nomeCompleto = document.getElementById('nome-completo').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const termos = document.getElementById('termos').checked;

        // Validação dos campos
        if (!termos) { return alert('Você precisa aceitar os Termos e Condições.'); }
        if (senha !== confirmarSenha) { return alert('As senhas não coincidem!'); }
        if (senha.length < 6) { return alert('A senha deve ter no mínimo 6 caracteres.'); }

        try {
            // ETAPA 1: Registrar o usuário (email e senha) no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });

            if (authError) throw authError;

            // Se o cadastro foi bem-sucedido, authData.user conterá os dados do novo usuário
            if (authData.user) {
                // ETAPA 2: Inserir os dados adicionais na tabela 'profiles'
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{
                        id_profiles: authData.user.id,
                        full_name: nomeCompleto,
                        telefone: telefone,
                        email: email,
                        role: 'user' // Garante que todo novo cadastro tenha a função 'user' por padrão
                    }]);

                if (profileError) throw profileError;

                alert('Cadastro realizado com sucesso!');
                window.location.href = 'index.html'; // Redireciona para a home após o cadastro
            }

        } catch (error) {
            console.error('Erro durante o cadastro:', error);
            alert('Falha no cadastro: ' + error.message);
        }
    });
}

// --- LÓGICA PARA A PÁGINA DE LOGIN (index.html) ---
const loginForm = document.getElementById('actual-login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('#email').value;
        const senha = loginForm.querySelector('#senha').value;

        try {
            // 1. Tenta fazer o login do usuário
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (loginError) throw loginError;

            // 2. Se o login for bem-sucedido, busca o perfil para verificar a 'role'
            if (loginData.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id_profiles', loginData.user.id)
                    .single(); // .single() para garantir que retorne apenas um objeto

                if (profileError) throw profileError;

                // 3. Verifica a 'role' e redireciona para a página correta
                if (profile && profile.role === 'admin') {
                    alert('Bem-vindo, Administrador!');
                    window.location.href = 'admin.html'; // Redireciona para a página de admin
                } else {
                    alert('Login bem-sucedido!');
                    window.location.href = 'index.html'; // Mantém o usuário comum na página inicial
                }
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Falha no login: ' + error.message);
        }
    });
}