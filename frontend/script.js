// --- Ícones SVG (Completos) ---
const eyeOpenSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-1.65 3.37-5.03 5.5-8.82 5.5S4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5zm0 10c2.48 0 4.5-2.02 4.5-4.5S14.48 7.5 12 7.5 7.5 9.52 7.5 12s2.02 4.5 4.5 4.5zm0-7c1.38 0 2.5 1.12 2.5 2.5S13.38 14.5 12 14.5s-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"/>
    </svg>
`;
const eyeClosedSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M12 4.5c-4.72 0-9.17 3.12-11.39 7.5 2.22 4.38 6.67 7.5 11.39 7.5 4.72 0 9.17-3.12 11.39-7.5-2.22-4.38-6.67-7.5-11.39-7.5zm0 13c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7c1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-.05-3.55c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM2 4.27l2.58 2.58C3.71 7.49 2.5 9.63 2.5 12c.03 2.37.89 4.39 2.36 6.19L3.08 20.5l1.42 1.42 2.76-2.76 1.45 1.45L12 21.5l.38-.38 2.3-2.3 2.29 2.29 1.41-1.41-2.76-2.76 1.45-1.45L22 4.27 20.73 3 17.73 6.03 16.28 4.58 12 0l-.38.38-2.3 2.3L6.96 4.27 5.51 2.82 2 4.27z"/>
    </svg>
`;
const deleteIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M16 9v10H8V9h8m-1.5-6h-5L9 3H7.5V1h9v2H15l-1.5-3zm4.5 4H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
    </svg>
`;
const dragIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#888888">
        <path d="M0 0h24v24H0z" fill="none"/><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
`;

// --- Funções de API ---
async function buscarCarteira() {
    try {
        const res = await fetch('/api/carteira');
        if (!res.ok) throw new Error(`Erro API carteira: ${res.statusText} (${res.status})`);
        return await res.json();
    } catch (e) {
        console.error('Falha CRÍTICA ao carregar carteira:', e);
        alert('Falha CRÍTICA ao carregar carteira. Verifique o console.');
        return [];
    }
}

async function buscarCotacao(ticker) {
    try {
        const res = await fetch(`/cotacao/${ticker}`);
        if (!res.ok) {
            console.warn(`Cotação não encontrada ou erro para ${ticker}, status: ${res.status}`);
            return null;
        }
        const data = await res.json();
        if (data && typeof data.valor === 'number' && !isNaN(data.valor)) {
            return data;
        }
        console.warn(`Dados de cotação inválidos para ${ticker}:`, data);
        return null;
    } catch (e) {
        console.error(`Falha CRÍTICA ao buscar cotação para ${ticker}:`, e);
        return null;
    }
}

// --- Ordenação Manual ---
function getSavedOrder() {
    const savedOrder = localStorage.getItem('carteiraOrdem');
    return savedOrder ? JSON.parse(savedOrder) : [];
}

function saveOrder(order) {
    localStorage.setItem('carteiraOrdem', JSON.stringify(order));
}

// --- Função Principal de Renderização ---
async function carregarCarteira() {
    console.log("Iniciando carregarCarteira (V28 - Reintroduzindo Cabeçalhos de Categoria)...");
    const tabela = document.querySelector('#tabelaCarteira');
    if (!tabela) { console.error('Elemento #tabelaCarteira não encontrado!'); return; }
    tabela.innerHTML = `<tr><td colspan="13" style="text-align: center;">Carregando...</td></tr>`;

    const isDetailsHidden = document.body.classList.contains('hide-details');

    const totalInvestidoDisplay = document.getElementById('totalInvestidoDisplay');
    const valorAtualCarteiraDisplay = document.getElementById('valorAtualCarteiraDisplay');
    const lucroPrejuizoDisplay = document.getElementById('lucroPrejuizoDisplay');
    const lucroPrejuizoPorcentagemDisplay = document.getElementById('lucroPrejuizoPorcentagemDisplay');
    
    if (!totalInvestidoDisplay || !valorAtualCarteiraDisplay || !lucroPrejuizoDisplay || !lucroPrejuizoPorcentagemDisplay) {
        console.error('Um ou mais elementos de totais não foram encontrados no HTML.');
    }

    let totalInvestidoGlobal = 0;
    let valorAtualCarteiraGlobal = 0;
    let carteira = await buscarCarteira();

    if (!carteira || carteira.length === 0) {
        tabela.innerHTML = `<tr><td colspan="13" style="text-align: center;">Nenhum ativo na carteira.</td></tr>`;
        if(totalInvestidoDisplay) totalInvestidoDisplay.textContent = 'R$ 0,00';
        if(valorAtualCarteiraDisplay) valorAtualCarteiraDisplay.textContent = 'R$ 0,00';
        if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.textContent = 'R$ 0,00';
        if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.textContent = '0.00%';
        if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.classList.remove('positivo', 'negativo');
        if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.classList.remove('positivo', 'negativo');
        return;
    }
    
    const savedOrder = getSavedOrder();
    if (savedOrder.length > 0) {
        carteira.sort((a, b) => {
            const indexA = savedOrder.indexOf(a.ticker);
            const indexB = savedOrder.indexOf(b.ticker);
            if (indexA > -1 && indexB > -1) return indexA - indexB;
            if (indexA > -1) return -1;
            if (indexB > -1) return 1;
            return a.ticker.localeCompare(b.ticker);
        });
    }

    const promessas = carteira.map(ativo =>
        buscarCotacao(ativo.ticker).then(cotacao => ({ ...ativo, cotacao }))
    );

    let resultadosCompletos;
    try {
        resultadosCompletos = await Promise.all(promessas);
    } catch (error) {
        console.error("Erro CRÍTICO no Promise.all ao buscar cotações:", error);
        tabela.innerHTML = `<tr><td colspan="13" style="color:red; text-align:center;">Erro crítico ao carregar cotações. Verifique o console.</td></tr>`;
        return;
    }

    // Passo 1: Calcular todos os totais por categoria e globais
    const categoryTotals = {}; 
    resultadosCompletos.forEach(item => {
        const categoria = item.type || 'DESCONHECIDO';
        if (!categoryTotals[categoria]) {
            categoryTotals[categoria] = 0;
        }

        const qtd = (item && typeof item.quantidade === 'number' && !isNaN(item.quantidade)) ? item.quantidade : 0;
        const pm = (item && typeof item.precoMedio === 'number' && !isNaN(item.precoMedio)) ? item.precoMedio : 0;
        
        totalInvestidoGlobal += qtd * pm;

        if (item.cotacao && typeof item.cotacao.valor === 'number' && !isNaN(item.cotacao.valor)) {
            const valorAtualAtivo = qtd * item.cotacao.valor;
            if (typeof valorAtualAtivo === 'number' && !isNaN(valorAtualAtivo)) { // Checagem extra
                 categoryTotals[categoria] += valorAtualAtivo;
                 valorAtualCarteiraGlobal += valorAtualAtivo;
            }
        }
    });

    // Passo 2: Construir o HTML da tabela
    let tableBodyHtml = '';
    let renderedHeaders = new Set();

    resultadosCompletos.forEach(item => {
        const { type, ticker, quantidade, precoMedio, cotacao } = item;
        const categoria = type || 'DESCONHECIDO';

        if (!renderedHeaders.has(categoria)) {
            const subtotalCalculado = categoryTotals[categoria] || 0;
            const subtotalFormatado = (typeof subtotalCalculado === 'number' && !isNaN(subtotalCalculado))
                ? subtotalCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'N/A';
            const subtotalCell = isDetailsHidden ? '****' : subtotalFormatado;

            tableBodyHtml += `
                <tr class="categoria-header">
                    <td colspan="13">
                        <div class="categoria-header-content">
                            <h2>${categoria}</h2>
                            <span class="categoria-total-valor">${subtotalCell}</span>
                        </div>
                    </td>
                </tr>`;
            renderedHeaders.add(categoria);
        }

        const qtdNum = (typeof quantidade === 'number' && !isNaN(quantidade)) ? quantidade : 0;
        const pmNum = (typeof precoMedio === 'number' && !isNaN(precoMedio)) ? precoMedio : 0;

        if (!cotacao || typeof cotacao.valor !== 'number' || isNaN(cotacao.valor)) {
            tableBodyHtml += `
                <tr data-ticker="${ticker}">
                    <td class="drag-handle">${dragIconSvg}</td>
                    <td>${ticker || 'N/A'}</td>
                    <td colspan="10" style="color: red; text-align: center;">Erro ou dados de cotação inválidos</td>
                    <td><button class="removerBtn" data-ticker="${ticker}" aria-label="Remover ${ticker}">${deleteIconSvg}</button></td>
                </tr>`;
        } else {
            const totalInvestidoAtivo = qtdNum * pmNum;
            const valorAtualAtivo = qtdNum * cotacao.valor;
            const diferenca = valorAtualAtivo - totalInvestidoAtivo;

            const changePercentVal = (cotacao && typeof cotacao.changePercent === 'number' && !isNaN(cotacao.changePercent)) ? cotacao.changePercent : null;
            const changePercentFormatted = changePercentVal !== null ? `${(changePercentVal * 100).toFixed(2)}%` : 'N/A';
            const changePercentColor = changePercentVal !== null ? (changePercentVal >= 0 ? 'green' : 'red') : 'inherit';
            
            const diferencaCell = isDetailsHidden 
                ? `<td>****</td>` 
                : `<td style="color: ${diferenca >= 0 ? 'green' : 'red'};">R$ ${diferenca.toFixed(2)}</td>`;

            tableBodyHtml += `
                <tr data-ticker="${ticker}">
                    <td class="drag-handle">${dragIconSvg}</td>
                    <td>${ticker}</td>
                    <td>R$ ${cotacao.valor.toFixed(2)}</td>
                    <td>R$ ${typeof cotacao.precoMaximo === 'number' && !isNaN(cotacao.precoMaximo) ? cotacao.precoMaximo.toFixed(2) : 'N/A'}</td>
                    <td>R$ ${typeof cotacao.precoMinimo === 'number' && !isNaN(cotacao.precoMinimo) ? cotacao.precoMinimo.toFixed(2) : 'N/A'}</td>
                    <td style="color: ${changePercentColor};">${changePercentFormatted}</td>
                    <td>${cotacao.data || 'N/A'}</td>
                    <td><input type="number" min="0" step="any" class="quantidadeInput" data-ticker="${ticker}" value="${qtdNum}" /></td>
                    <td><input type="number" min="0" step="any" class="precoMedioInput" data-ticker="${ticker}" value="${pmNum}" /></td>
                    <td>R$ ${totalInvestidoAtivo.toFixed(2)}</td>
                    <td>R$ ${valorAtualAtivo.toFixed(2)}</td>
                    ${diferencaCell}
                    <td><button class="removerBtn" data-ticker="${ticker}" aria-label="Remover ${ticker}">${deleteIconSvg}</button></td>
                </tr>`;
        }
    });
    
    tabela.innerHTML = tableBodyHtml;

    // Atualiza os totais globais no display
    if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.classList.remove('positivo', 'negativo');
    if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.classList.remove('positivo', 'negativo');

    if (isDetailsHidden) {
        if(totalInvestidoDisplay) totalInvestidoDisplay.textContent = '****';
        if(valorAtualCarteiraDisplay) valorAtualCarteiraDisplay.textContent = '****';
        if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.textContent = '****';
        if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.textContent = '****';
    } else {
        const lucroPrejuizoGlobal = valorAtualCarteiraGlobal - totalInvestidoGlobal;
        let plPorcentagem = 0;
        // Garante que totalInvestidoGlobal é um número e maior que zero para evitar NaN ou Infinity
        if (typeof totalInvestidoGlobal === 'number' && !isNaN(totalInvestidoGlobal) && totalInvestidoGlobal > 0) {
            plPorcentagem = (lucroPrejuizoGlobal / totalInvestidoGlobal) * 100;
        } else if (totalInvestidoGlobal === 0 && lucroPrejuizoGlobal === 0) {
             plPorcentagem = 0; // Se não há investimento e não há lucro/perda, a % é 0.
        }


        if(totalInvestidoDisplay) totalInvestidoDisplay.textContent = (typeof totalInvestidoGlobal === 'number' && !isNaN(totalInvestidoGlobal)) 
            ? `R$ ${totalInvestidoGlobal.toFixed(2)}` : 'N/A';
        if(valorAtualCarteiraDisplay) valorAtualCarteiraDisplay.textContent = (typeof valorAtualCarteiraGlobal === 'number' && !isNaN(valorAtualCarteiraGlobal)) 
            ? `R$ ${valorAtualCarteiraGlobal.toFixed(2)}` : 'N/A';
        if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.textContent = (typeof lucroPrejuizoGlobal === 'number' && !isNaN(lucroPrejuizoGlobal)) 
            ? `R$ ${lucroPrejuizoGlobal.toFixed(2)}` : 'N/A';
        if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.textContent = (typeof plPorcentagem === 'number' && !isNaN(plPorcentagem)) 
            ? `${plPorcentagem.toFixed(2)}%` : 'N/A';

        if (typeof lucroPrejuizoGlobal === 'number' && !isNaN(lucroPrejuizoGlobal)) {
            if (lucroPrejuizoGlobal >= 0) {
                if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.classList.add('positivo');
                if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.classList.add('positivo');
            } else {
                if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.classList.add('negativo');
                if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.classList.add('negativo');
            }
        }
    }

    // As chamadas abaixo ainda estão desativadas nesta etapa de depuração
    // adicionarListenersInputs();
    // adicionarListenersRemover();
    // initializeSortable();
}

// --- Funções Auxiliares (Definições completas) ---
function initializeSortable() {
    const tabelaBody = document.getElementById('tabelaCarteira');
    if (tabelaBody) {
        new Sortable(tabelaBody, {
            animation: 150, handle: '.drag-handle', ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                const rows = evt.target.querySelectorAll('tr[data-ticker]');
                saveOrder(Array.from(rows).map(row => row.dataset.ticker));
            }
        });
    }
}

function adicionarListenersInputs() {
    document.querySelectorAll('.quantidadeInput, .precoMedioInput').forEach(input => {
        input.onchange = async (e) => {
            const ticker = e.target.dataset.ticker;
            const linha = e.target.closest('tr');
            const quantidade = parseFloat(linha.querySelector('.quantidadeInput').value);
            const precoMedio = parseFloat(linha.querySelector('.precoMedioInput').value);
            if (isNaN(quantidade) || quantidade < 0 || isNaN(precoMedio) || precoMedio < 0) {
                alert('Quantidade e preço médio devem ser números não negativos.');
                return carregarCarteira();
            }
            try {
                const res = await fetch(`/api/carteira/${ticker}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantidade, precoMedio }),
                });
                if (!res.ok) throw new Error('Falha ao atualizar no servidor.');
                carregarCarteira();
            } catch (err) {
                console.error('Erro ao atualizar ativo:', err);
                alert('Erro ao atualizar ativo.');
            }
        };
    });
}

function adicionarListenersRemover() {
    document.querySelectorAll('.removerBtn').forEach(btn => {
        btn.onclick = async (e) => {
            const ticker = e.target.closest('.removerBtn').dataset.ticker;
            if (!confirm(`Tem certeza que deseja remover ${ticker}?`)) return;
            try {
                const res = await fetch(`/api/carteira/${ticker}`, { method: 'DELETE' });
                 if (!res.ok) {
                     console.error("Erro ao remover ativo no servidor:", await res.text());
                    alert('Erro ao remover ativo no servidor.');
                    return;
                }
                saveOrder(getSavedOrder().filter(t => t !== ticker));
                carregarCarteira();
            } catch (err) { 
                console.error('Erro na requisição ao remover ativo:', err);
                alert('Erro de conexão ao remover ativo.');
            }
        };
    });
}

async function adicionarAtivo() {
    const tickerInput = document.getElementById('novoTicker'), qtdInput = document.getElementById('novaQuantidade'), precoMedioInput = document.getElementById('novoPrecoMedio'), tipoAtivoSelect = document.getElementById('novoTipoAtivo');
    const ticker = tickerInput.value.trim().toUpperCase(), quantidade = parseFloat(qtdInput.value), precoMedio = parseFloat(precoMedioInput.value), type = tipoAtivoSelect.value;
    if (!ticker || isNaN(quantidade) || isNaN(precoMedio) || !type) return alert('Todos os campos são obrigatórios.');
    if (quantidade <= 0 || precoMedio <= 0) return alert('Quantidade e preço médio devem ser números positivos.');
    try {
        const res = await fetch('/api/carteira', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker, quantidade, precoMedio, type }) });
        if (!res.ok) {
            const errData = await res.json();
            return alert(errData.erro || 'Erro desconhecido ao adicionar ativo.');
        }
        const order = getSavedOrder();
        if (!order.includes(ticker)) order.push(ticker);
        saveOrder(order);
        tickerInput.value = ''; qtdInput.value = ''; precoMedioInput.value = ''; tipoAtivoSelect.value = 'AÇÃO';
        carregarCarteira();
        alert('Ativo adicionado com sucesso!');
    } catch (e) { 
        console.error('Erro na requisição ao adicionar ativo:', e);
        alert('Erro de conexão ao adicionar ativo.');
    }
}

function updateToggleButtonIcon(isHidden) {
    const btn = document.getElementById('toggleViewModeBtn');
    if (btn) {
        btn.innerHTML = isHidden ? eyeClosedSvg : eyeOpenSvg;
        btn.setAttribute('aria-label', isHidden ? 'Mostrar detalhes' : 'Ocultar detalhes');
    }
}

// --- Inicialização da Página ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addTickerBtn')?.addEventListener('click', adicionarAtivo);
    const btn = document.getElementById('toggleViewModeBtn');
    if (btn) {
        const body = document.body;
        let isHidden = localStorage.getItem('carteiraViewMode') === 'hide-details';
        body.classList.toggle('hide-details', isHidden);
        updateToggleButtonIcon(isHidden);
        
        btn.addEventListener('click', () => {
            body.classList.toggle('hide-details'); 
            isHidden = body.classList.contains('hide-details'); 
            localStorage.setItem('carteiraViewMode', isHidden ? 'hide-details' : 'show-details');
            updateToggleButtonIcon(isHidden);
            carregarCarteira(); 
        });
    }
    carregarCarteira(); 
});

// setInterval(carregarCarteira, 60000); // Ainda desativado