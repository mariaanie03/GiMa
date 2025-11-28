
import { supabase } from './supabaseClient.js';

console.log('auth.js carregado');


function updateUserUI(user) {
   
    if (document.getElementById('home-content')) {
        const loginLink = document.getElementById('login-nav-link');
        const logoutLink = document.getElementById('logout-nav-link');

        if (user) {
          
            loginLink.style.display = 'none';
            logoutLink.style.display = 'list-item';

            const loginContent = document.getElementById('login-content');
            if (loginContent && loginContent.classList.contains('active')) {
                loginContent.classList.remove('active');
                document.getElementById('home-content').classList.add('active');
              
                document.querySelector('#home-nav-link .nav-link').classList.add('active');
                document.querySelector('#login-nav-link .nav-link').classList.remove('active');
            }
        } else {
            loginLink.style.display = 'list-item';
            logoutLink.style.display = 'none';
        }
    }
}


supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    updateUserUI(user);
});





const registrationForm = document.getElementById('registration-form');
if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const errorMessage = document.getElementById('registration-error');
        if (!errorMessage) {
            console.error("ERRO CRÍTICO: O elemento com id 'registration-error' não foi encontrado no HTML!");
            return;
        }
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


const loginForm = document.getElementById('actual-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
            if (error) throw error;
            if (data.user) {
                const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id_profiles', data.user.id).single();
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


const logoutButton = document.getElementById('logout-nav-link');
if(logoutButton) {
    logoutButton.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erro ao sair:', error);
            alert('Erro ao sair da conta.');
        } else {
        
            window.location.href = 'index.html';
        }
    });
}