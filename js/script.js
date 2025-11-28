import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', function() {

    
    if (document.getElementById('home-content')) {
        console.log("Lógica da PÁGINA INICIAL sendo executada.");

        function showSection(targetId) {
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            document.querySelectorAll('.main-nav .nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.target === targetId) {
                    link.classList.add('active');
                }
            });

            if (targetId !== 'home-content') {
                 document.querySelector('#home-nav-link .nav-link').classList.remove('active');
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');
        if (sectionParam) {
            showSection(sectionParam + '-content');
        }

   
        document.querySelectorAll('.main-nav span.nav-link[data-target]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showSection(this.dataset.target);
            });
        });
    }
    
 
    window.verDetalhes = function(idProduto) {
        window.location.href = `produtos.html?id=${idProduto}`;
    }

    if (document.getElementById('registration-form')) {
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

    if (document.getElementById('resultados-grid')) {
        async function buscarProdutos() {
            const resultsGrid = document.getElementById('resultados-grid');
            const resultsTitle = document.getElementById('search-results-title');
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('q');

            if (!searchTerm) {
                resultsTitle.textContent = "Faça uma busca para ver os resultados.";
                return;
            }
            resultsTitle.textContent = `Buscando por: "${searchTerm}"...`;
            
            const { data: resultados, error } = await supabase.from('produtos').select('*').ilike('nome', `%${searchTerm}%`);

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
        buscarProdutos();
    }
    
    if (document.getElementById('detalhe-produto-container')) {
        async function carregarDetalhesDoProduto() {
            const urlParams = new URLSearchParams(window.location.search);
            const produtoId = urlParams.get('id');

            if (!produtoId) {
                document.getElementById('detalhe-produto-container').innerHTML = '<h1>Erro!</h1><p>Nenhum ID de produto foi especificado.</p>';
                return;
            }

            const { data: produto, error } = await supabase.from('produtos').select('*').eq('id_produtos', produtoId).single();

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
            document.getElementById('btn-personalizar').href = `metodos-personalizacao.html?id=${produto.id_produtos}`;
        }
        carregarDetalhesDoProduto();
    }
    
    if (document.getElementById('produtos-grid') && document.getElementById('categoria-titulo')) {
        async function carregarProdutosDaCategoria() {
            const urlParams = new URLSearchParams(window.location.search);
            const categoria = urlParams.get('categoria');
            const titulo = document.getElementById('categoria-titulo');
            const grid = document.getElementById('produtos-grid');
            
            if (!categoria) {
                titulo.textContent = 'Nenhuma categoria selecionada';
                return;
            }
            titulo.textContent = `Carregando produtos de ${categoria}...`;

            const { data: produtos, error } = await supabase.from('produtos').select('*').eq('categoria', categoria);
            
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
        carregarProdutosDaCategoria();
    }

    if (document.querySelector('.metodos-container')) {
        async function carregarInfoPersonalizacao() {
            const urlParams = new URLSearchParams(window.location.search);
            const produtoId = urlParams.get('id');
            const tituloEl = document.getElementById('titulo-personalizacao');
            
            if (produtoId) {
                const { data: produto, error } = await supabase.from('produtos').select('nome').eq('id_produtos', produtoId).single();
                if (produto && tituloEl) {
                    tituloEl.textContent = `Personalize sua: ${produto.nome}`;
                }
            }
        }
        carregarInfoPersonalizacao();
    }

    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantity, 0);
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = totalItens;
        contador.style.display = totalItens > 0 ? 'inline-block' : 'none';
    }
});