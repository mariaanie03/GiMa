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
        const loginLink = document.getElementById('login-nav-link');
        const logoutLink = document.getElementById('logout-nav-link');
        const homeLink = document.getElementById('home-nav-link');
        const aboutLink = document.getElementById('about-nav-link');
        const homeContent = document.getElementById('home-content');
        const loggedInContent = document.getElementById('logged-in-content');
        const loginContent = document.getElementById('login-content');

        if (user) {
            // --- USUÁRIO ESTÁ LOGADO ---
            loginLink.style.display = 'none';
            logoutLink.style.display = 'list-item';
            
            homeContent.classList.remove('active');
            loggedInContent.classList.add('active');
            loginContent.classList.remove('active');

            homeLink.querySelector('span').dataset.target = 'logged-in-content';
            homeLink.querySelector('span').classList.add('active');
            aboutLink.querySelector('span').classList.remove('active');
        } else {
            // --- USUÁRIO NÃO ESTÁ LOGADO ---
            loginLink.style.display = 'list-item';
            logoutLink.style.display = 'none';

            homeContent.classList.add('active');
            loggedInContent.classList.remove('active');
            loginContent.classList.remove('active');

            homeLink.querySelector('span').dataset.target = 'home-content';
            homeLink.querySelector('span').classList.add('active');
            aboutLink.querySelector('span').classList.remove('active');
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
        e.preventDefault(); 

        // A CORREÇÃO ESTÁ AQUI: A variável é definida DENTRO do evento de clique.
        // Isso garante que o elemento HTML já existe quando este código for executado.
        const errorMessage = document.getElementById('registration-error');
        
        // Uma verificação extra para segurança total
        if (!errorMessage) {
            console.error("ERRO CRÍTICO: O elemento com id 'registration-error' não foi encontrado no HTML!");
            return;
        }

        // Esta linha agora é segura e o "x" vermelho vai desaparecer.
        errorMessage.textContent = ''; 

        const nomeCompleto = document.getElementById('nome-completo').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const termos = document.getElementById('termos').checked;

        if (!termos || !nomeCompleto || !email || !senha) { 
            errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            return; 
        }
        if (senha !== confirmarSenha) { 
            errorMessage.textContent = 'As senhas não coincidem!';
            return; 
        }
        if (senha.length < 6) { 
            errorMessage.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            return; 
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: senha,
            });
            if (authError) throw authError;

            if (authData.user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: nomeCompleto,
                        telefone: telefone
                    })
                    .eq('id_profiles', authData.user.id);
                if (updateError) throw updateError;
            }

            alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
            window.location.href = 'index.html?section=login';
        } catch (error) {
            console.error('Erro detalhado do cadastro:', error);
            if (error.message.includes("User already registered")) {
                errorMessage.textContent = "Este e-mail já está cadastrado. Tente fazer o login.";
            } else {
                errorMessage.textContent = 'Falha no cadastro. Verifique os dados e tente novamente.';
            }
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
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (loginError) throw loginError;

            if (loginData.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id_profiles', loginData.user.id)
                    .single();

                if (profileError) throw profileError;
                
                if (profile && profile.role === 'admin') {
                    alert('Bem-vindo, Administrador!');
                    window.location.href = 'admin.html';
                } else {
                    alert('Login bem-sucedido!');
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
            window.location.href = 'index.html'; 
        }
    });
}