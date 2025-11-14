import { supabase } from './supabaseClient.js';
document.addEventListener('DOMContentLoaded', function() {
   
    // NOTA: O array 'todosOsProdutos' foi REMOVIDO. Os dados agora vêm do banco de dados.

    // ===================================================================
    // --- LÓGICA GLOBAL (FUNCIONA EM TODAS AS PÁGINAS) ---
    // ===================================================================
    const cartIconButton = document.getElementById('cart-icon-btn');
    if (cartIconButton) {
        cartIconButton.addEventListener('click', () => {
            if (document.getElementById('home-content')) {
                const contentSections = document.querySelectorAll('.content-section');
                const loginSection = document.getElementById('login-content');
                contentSections.forEach(section => section.classList.remove('active'));
                if (loginSection) {
                    loginSection.classList.add('active');
                }
            } else {
                window.location.href = 'index.html?section=login';
            }
        });
    }

    // Função para navegar para os detalhes do produto (usada em várias páginas)
    window.verDetalhes = function(idProduto) {
        window.location.href = `produtos.html?id=${idProduto}`;
    }

    // ===================================================================
    // --- LÓGICA ESPECÍFICA DE CADA PÁGINA ---
    // ===================================================================

    // --- LÓGICA DA PÁGINA INICIAL (index.html) ---
    if (document.getElementById('home-content')) {
        console.log("Lógica da PÁGINA INICIAL sendo executada.");

        function showSection(targetId) {
            const contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');

        if (sectionParam === 'login') {
            showSection('login-content');
        } else if (sectionParam === 'about') {
            showSection('about-content');
        } else {
            showSection('home-content'); // Comportamento padrão
        }

        const navLinks = document.querySelectorAll('.main-nav .nav-link');
        navLinks.forEach(link => {
            if (link.tagName === 'SPAN') {
                link.addEventListener('click', function(e) { 
                    e.preventDefault(); 
                    showSection(this.dataset.target); 
                });
            }
        });
    }
    
    // --- LÓGICA DA PÁGINA DE CADASTRO (cadastro.html) ---
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        console.log("Lógica da PÁGINA DE CADASTRO (CEP Helper) sendo executada.");

        const cepInput = document.getElementById('cep');
        if (cepInput) {
            cepInput.addEventListener('blur', function() {
                const cep = this.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    fetch(`https://viacep.com.br/ws/${cep}/json/`)
                        .then(response => response.json())
                        .then(data => {
                            if (!data.erro) {
                                document.getElementById('logradouro').value = data.logradouro;
                                document.getElementById('bairro').value = data.bairro;
                                document.getElementById('cidade').value = data.localidade;
                                document.getElementById('estado').value = data.uf;
                                document.getElementById('numero').focus();
                            } else { alert('CEP não encontrado.'); }
                        }).catch(error => console.error('Erro ao buscar CEP:', error));
                }
            });
        }
    }

    // --- LÓGICA DA PÁGINA DE RESULTADOS (resultados.html) ---
    if (document.getElementById('resultados-grid')) {
        console.log("Lógica da PÁGINA DE RESULTADOS (com Supabase) sendo executada.");

        async function buscarProdutos() {
            if (!supabase) return;
            const resultsGrid = document.getElementById('resultados-grid');
            const resultsTitle = document.getElementById('search-results-title');
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('q');

            if (!searchTerm) {
                resultsTitle.textContent = "Faça uma busca para ver os resultados.";
                return;
            }
            
            resultsTitle.textContent = `Buscando por: "${searchTerm}"...`;
            
            const { data: resultados, error } = await supabase
                .from('produtos')
                .select('*')
                .ilike('nome', `%${searchTerm}%`);

            if (error) {
                resultsTitle.textContent = 'Erro ao realizar a busca.';
                console.error(error);
                return;
            }

            resultsTitle.textContent = `${resultados.length} resultado(s) para: "${searchTerm}"`;
            if (resultados.length > 0) {
                resultsGrid.innerHTML = resultados.map(produto => `
                    <div class="quadro">
                        <img src="${produto.imagem_url}" alt="${produto.nome}">
                        <h3>${produto.nome}</h3>
                        <p class="preco">R$ ${produto.preco}</p>
                        <a href="#" onclick="verDetalhes('${produto.id_produtos}'); return false;" class="btn-ver-produto">Ver Produto</a>
                    </div>
                `).join('');
            } else {
                resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Nenhum produto encontrado.</p>';
            }
        }
        setTimeout(buscarProdutos, 100);
    }

    // --- LÓGICA DA PÁGINA DE DETALHES DO PRODUTO (produto.html) ---
    if (document.getElementById('detalhe-produto-container')) {
        console.log("Lógica da PÁGINA DE PRODUTO (com Supabase) sendo executada.");

        async function carregarDetalhesDoProduto() {
            if (!supabase) return;

            const urlParams = new URLSearchParams(window.location.search);
            const produtoId = urlParams.get('id');

            if (!produtoId) {
                document.getElementById('detalhe-produto-container').innerHTML = '<h1>Erro!</h1><p>Nenhum ID de produto foi especificado na URL.</p>';
                return;
            }

            const { data: produto, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id_produtos', produtoId)
                .single();

            if (error || !produto) {
                console.error('Erro ao buscar produto:', error);
                document.getElementById('detalhe-produto-container').innerHTML = '<h1>Produto não encontrado!</h1>';
                return;
            }
            
            document.title = produto.nome;
            document.getElementById('produto-imagem').src = produto.imagem_url;
            document.getElementById('produto-imagem').alt = produto.nome;
            document.getElementById('produto-nome').textContent = produto.nome;
            document.getElementById('produto-preco').textContent = `R$ ${produto.preco}`;
            document.getElementById('produto-descricao').textContent = produto.descricao;

            const linkPersonalizar = document.getElementById('btn-personalizar');
            if (linkPersonalizar) {
                linkPersonalizar.href = `metodos-personalizacao.html?id=${produto.id_produtos}`;
            }
        }
        setTimeout(carregarDetalhesDoProduto, 100);
    }

    // --- LÓGICA DA PÁGINA metodos-personalizacao.html ---
    if (document.querySelector('.metodos-container')) {
        console.log("Lógica da PÁGINA DE MÉTODOS DE PERSONALIZAÇÃO (com Supabase) sendo executada.");

        async function carregarInfoPersonalizacao() {
            if (!supabase) return;
            const urlParams = new URLSearchParams(window.location.search);
            const produtoId = urlParams.get('id');
            const tituloEl = document.getElementById('titulo-personalizacao');
            
            if (produtoId) {
                const { data: produto, error } = await supabase
                    .from('produtos')
                    .select('nome')
                    .eq('id_produtos', produtoId)
                    .single();
                
                if (produto && tituloEl) {
                    tituloEl.textContent = `Personalize sua: ${produto.nome}`;
                }
            }
        }
        setTimeout(carregarInfoPersonalizacao, 100);
    }

    // --- LÓGICA DA PÁGINA DE CATEGORIA DE PRODUTOS (produtos-categoria.html) ---
    if (document.getElementById('produtos-grid') && document.getElementById('categoria-titulo')) {
        console.log("Lógica da PÁGINA DE CATEGORIA DE PRODUTOS (com Supabase) sendo executada.");

        async function carregarProdutosDaCategoria() {
            if (!supabase) {
                console.error("Supabase client não está disponível.");
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const categoria = urlParams.get('categoria');
            const titulo = document.getElementById('categoria-titulo');
            const grid = document.getElementById('produtos-grid');
            
            if (!categoria) {
                titulo.textContent = 'Nenhuma categoria selecionada';
                return;
            }

            titulo.textContent = `Carregando produtos de ${categoria}...`;

            const { data: produtos, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('categoria', categoria);
            
            if (error) {
                titulo.textContent = 'Erro ao carregar produtos';
                console.error(error);
                return;
            }

            if (produtos && produtos.length > 0) {
                titulo.textContent = `Produtos de ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
                grid.innerHTML = produtos.map(produto => `
                    <div class="produto-card">
                        <img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.src='https://via.placeholder.com/250x200?text=Imagem+Indisponível'">
                        <h3>${produto.nome}</h3>
                        <p class="preco">R$ ${produto.preco}</p>
                        <button class="btn-ver-detalhes" onclick="verDetalhes('${produto.id_produtos}')">Ver Detalhes</button>
                    </div>
                `).join('');
            } else {
                titulo.textContent = `Categoria: ${categoria}`;
                grid.innerHTML = '<p>Nenhum produto encontrado para esta categoria.</p>';
            }
        }
        
        setTimeout(carregarProdutosDaCategoria, 100);
    }

    // --- ATUALIZAÇÃO DO CONTADOR DO CARRINHO ---
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantity, 0);
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = totalItens;
        contador.style.display = totalItens > 0 ? 'inline-block' : 'none';
    }
});