// js/auth.js

// Importa a instância do Supabase que foi criada no supabaseClient.js
import { supabase } from './supabaseClient.js';

console.log('auth.js carregado');

// ===================================================================
// --- CONTROLE DE UI BASEADO NA AUTENTICAÇÃO ---
// ===================================================================

// Função para atualizar a interface com base no status do usuário (logado ou não)
function updateUserUI(user) {
    // Só executa esta lógica se estiver na página inicial (onde os elementos existem)
    if (document.getElementById('home-content')) {
        // Elementos da navegação
        const loginLink = document.getElementById('login-nav-link');
        const logoutLink = document.getElementById('logout-nav-link');
        const homeLink = document.getElementById('home-nav-link');
        const aboutLink = document.getElementById('about-nav-link');

        // Seções de conteúdo na index.html
        const homeContent = document.getElementById('home-content');
        const loggedInContent = document.getElementById('logged-in-content');
        const loginContent = document.getElementById('login-content');

        if (user) {
            // --- USUÁRIO ESTÁ LOGADO ---
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'list-item'; // 'list-item' para manter o estilo de <li>
            
            // Mostra o conteúdo para usuários logados
            homeContent.classList.remove('active');
            loggedInContent.classList.add('active');
            loginContent.classList.remove('active');

            // Ajusta o link "Home" para mostrar a seção correta e o marca como ativo
            if (homeLink) {
                 homeLink.querySelector('span').dataset.target = 'logged-in-content';
                 homeLink.querySelector('span').classList.add('active');
            }
             if (aboutLink) aboutLink.querySelector('span').classList.remove('active');


        } else {
            // --- USUÁRIO NÃO ESTÁ LOGADO ---
            if (loginLink) loginLink.style.display = 'list-item';
            if (logoutLink) logoutLink.style.display = 'none';

            // Mostra o conteúdo padrão para visitantes
            homeContent.classList.add('active');
            loggedInContent.classList.remove('active');
            loginContent.classList.remove('active');


            // Ajusta o link "Home" para mostrar a seção correta e o marca como ativo
            if (homeLink) {
                homeLink.querySelector('span').dataset.target = 'home-content';
                homeLink.querySelector('span').classList.add('active');
            }
             if (aboutLink) aboutLink.querySelector('span').classList.remove('active');
        }
    }
}

// "Ouve" em tempo real se o usuário faz login, logout ou recarrega a página
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Estado de autenticação mudou:', event);
    const user = session?.user;
    updateUserUI(user);
});


// ===================================================================
// --- LÓGICA DOS FORMULÁRIOS ---
// ===================================================================

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

                alert('Cadastro realizado com sucesso! Você será redirecionado.');
                window.location.href = 'index.html'; // Redireciona para a home após o cadastro
            }

        } catch (error) {
            console.error('Erro durante o cadastro:', error);
            alert('Falha no cadastro: ' + error.message);
        }
    });
}

// --- LÓGICA PARA O FORMULÁRIO DE LOGIN ---
const loginForm = document.getElementById('actual-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

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

                // 3. Verifica a 'role' e redireciona se for admin
                if (profile && profile.role === 'admin') {
                    alert('Bem-vindo, Administrador!');
                    window.location.href = 'admin.html'; // Redireciona para a página de admin
                } else {
                    alert('Login bem-sucedido!');
                    // Para usuários comuns, o onAuthStateChange já cuidará de atualizar a UI,
                    // então não precisamos de um redirecionamento aqui.
                }
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Falha no login: ' + error.message);
        }
    });
}

// --- LÓGICA PARA O BOTÃO DE SAIR ---
const logoutButton = document.getElementById('logout-nav-link');
if(logoutButton) {
    logoutButton.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('Erro ao sair: ' + error.message);
        } else {
            alert('Você saiu da sua conta.');
            // Garante que a página seja recarregada para o estado de "deslogado"
            window.location.href = 'index.html'; 
        }
    });
}