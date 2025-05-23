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
const dividendIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10.73V17h2V9.27c.59-.65 1.42-1.22 2.34-1.62-.23-.32-.49-.63-.78-.9-.9.38-1.7.89-2.38 1.5L12 8l-.18-.15c-.68-.61-1.48-1.12-2.38-1.5-.29.27-.55.58-.78.9.92.4 1.75.97 2.34 1.62z"/>
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

// --- Função Principal de Renderização para CARTEIRA.HTML ---
async function carregarCarteira() {
    const tabela = document.querySelector('#tabelaCarteira');
    if (!tabela) { 
        // console.log('Elemento #tabelaCarteira não encontrado, não estamos na página da carteira.');
        return; 
    }
    console.log("Iniciando carregarCarteira (Complet_V48)...");
    tabela.innerHTML = `<tr><td colspan="14" style="text-align: center;">Carregando...</td></tr>`;

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
        tabela.innerHTML = `<tr><td colspan="14" style="text-align: center;">Nenhum ativo na carteira.</td></tr>`;
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
        tabela.innerHTML = `<tr><td colspan="14" style="color:red; text-align:center;">Erro crítico ao carregar cotações. Verifique o console.</td></tr>`;
        return;
    }

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
            if (typeof valorAtualAtivo === 'number' && !isNaN(valorAtualAtivo)) {
                 categoryTotals[categoria] += valorAtualAtivo;
                 valorAtualCarteiraGlobal += valorAtualAtivo;
            }
        }
    });

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
                    <td colspan="14"> 
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
            // Colspan da mensagem de erro: 14 colunas totais - 1 (drag) - 1 (ticker) - 1 (divBtn) - 1 (remBtn) = 10
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
        if (totalInvestidoGlobal > 0 && typeof totalInvestidoGlobal === 'number' && !isNaN(totalInvestidoGlobal)) {
            plPorcentagem = (lucroPrejuizoGlobal / totalInvestidoGlobal) * 100;
        } else if (totalInvestidoGlobal === 0 && lucroPrejuizoGlobal === 0) {
             plPorcentagem = 0;
        }
        if(totalInvestidoDisplay) totalInvestidoDisplay.textContent = (typeof totalInvestidoGlobal === 'number' && !isNaN(totalInvestidoGlobal))?`R$ ${totalInvestidoGlobal.toFixed(2)}`:'N/A';
        if(valorAtualCarteiraDisplay) valorAtualCarteiraDisplay.textContent = (typeof valorAtualCarteiraGlobal === 'number' && !isNaN(valorAtualCarteiraGlobal))?`R$ ${valorAtualCarteiraGlobal.toFixed(2)}`:'N/A';
        if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.textContent = (typeof lucroPrejuizoGlobal === 'number' && !isNaN(lucroPrejuizoGlobal))?`R$ ${lucroPrejuizoGlobal.toFixed(2)}`:'N/A';
        if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.textContent = (typeof plPorcentagem === 'number' && !isNaN(plPorcentagem))?`${plPorcentagem.toFixed(2)}%`:'N/A';
        
        if (typeof lucroPrejuizoGlobal === 'number' && !isNaN(lucroPrejuizoGlobal)) {
            const classToAdd = lucroPrejuizoGlobal >= 0 ? 'positivo' : 'negativo';
            if(lucroPrejuizoDisplay) lucroPrejuizoDisplay.classList.add(classToAdd);
            if(lucroPrejuizoPorcentagemDisplay) lucroPrejuizoPorcentagemDisplay.classList.add(classToAdd);
        }
    }

    adicionarListenersInputs();
    adicionarListenersRemover();
    adicionarListenersDividendos(); 
    initializeSortable();
}

// --- Funções da Modal de Dividendos (para carteira.html) ---
const dividendModal = document.getElementById('dividendModal');
const dividendModalTicker = document.getElementById('dividendModalTicker');
const dividendModalListBody = document.getElementById('dividendModalListBody');
const dividendModalNoData = document.getElementById('dividendModalNoData');

function abrirModalDividendos(ticker) {
    if (!dividendModal || !dividendModalTicker || !dividendModalListBody || !dividendModalNoData) {
        return;
    }
    dividendModalTicker.textContent = `Dividendos para ${ticker}`;
    dividendModalListBody.innerHTML = '<tr><td colspan="2">Carregando dividendos...</td></tr>';
    dividendModalNoData.style.display = 'none';
    dividendModal.style.display = 'block';

    fetch(`/api/dividends/${ticker}`)
        .then(res => {
            if (!res.ok) throw new Error(`Erro ao buscar dividendos: ${res.status} ${res.statusText}`);
            return res.json();
        })
        .then(dividendos => {
            dividendModalListBody.innerHTML = '';
            if (dividendos && dividendos.length > 0) {
                dividendos.forEach(div => {
                    const row = dividendModalListBody.insertRow();
                    row.insertCell().textContent = new Date(div.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                    row.insertCell().textContent = `R$ ${ (typeof div.amount === 'number' && !isNaN(div.amount)) ? div.amount.toFixed(2) : 'N/A'}`;
                });
            } else {
                dividendModalNoData.style.display = 'block';
            }
        })
        .catch(err => {
            console.error("Erro ao popular modal de dividendos:", err);
            dividendModalListBody.innerHTML = `<tr><td colspan="2" style="color:red;">Falha ao carregar dividendos. ${err.message}</td></tr>`;
        });
}
function fecharModalDividendos() {
    if (dividendModal) dividendModal.style.display = 'none';
}
// Adiciona listener global apenas se estiver na página da carteira, onde a modal existe
if (document.getElementById('dividendModal')) { 
    window.addEventListener('click', function(event) {
        if (event.target == dividendModal) {
            fecharModalDividendos();
        }
    });
    // Também fechar com a tecla Esc
     window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && dividendModal.style.display === 'block') {
            fecharModalDividendos();
        }
    });
}

function adicionarListenersDividendos() {
    document.querySelectorAll('#tabelaCarteira .dividendBtn').forEach(btn => {
        btn.onclick = (e) => {
            const ticker = e.currentTarget.dataset.ticker;
            abrirModalDividendos(ticker);
        };
    });
}

// --- Funções para a PÁGINA DE DIVIDENDOS (dividendos.html) ---
async function fetchAndDisplayDividendsOnPage(ticker) {
    const resultsArea = document.getElementById('dividendResultsArea');
    const tableBody = document.getElementById('dividendsTableBody');
    const noDataMsg = document.getElementById('dividendResultNoData');
    const displayTickerName = document.getElementById('dividendResultTickerName');

    if (!resultsArea || !tableBody || !noDataMsg || !displayTickerName) {
        console.error("Elementos da página de dividendos (histórico individual) não encontrados.");
        return;
    }
    displayTickerName.textContent = `Histórico de Dividendos para ${ticker}`;
    tableBody.innerHTML = '<tr><td colspan="2">Carregando...</td></tr>';
    noDataMsg.style.display = 'none';
    resultsArea.style.display = 'block';

    try {
        const res = await fetch(`/api/dividends/${ticker}`);
        if (!res.ok) throw new Error(`Erro ao buscar dividendos: ${res.status} ${res.statusText}`);
        const dividendos = await res.json();
        tableBody.innerHTML = '';
        if (dividendos && dividendos.length > 0) {
            dividendos.forEach(div => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = new Date(div.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                row.insertCell().textContent = `R$ ${ (typeof div.amount === 'number' && !isNaN(div.amount)) ? div.amount.toFixed(2) : 'N/A'}`;
            });
        } else {
            noDataMsg.style.display = 'block';
        }
    } catch (err) {
        console.error("Erro ao buscar/exibir dividendos na página:", err);
        tableBody.innerHTML = `<tr><td colspan="2" style="color:red;">Falha ao carregar dividendos. ${err.message}</td></tr>`;
    }
}

async function carregarProjecaoDividendosCarteira2025() {
    const conteudoProjecao = document.getElementById('projecaoMensalConteudo');
    const totalAnualDisplay = document.getElementById('totalAnualProjetado2025');

    if (!conteudoProjecao || !totalAnualDisplay) {
        console.error("Elementos para projeção de dividendos da carteira não encontrados.");
        return;
    }
    conteudoProjecao.innerHTML = '<p style="text-align:center;">Calculando projeção de dividendos para 2025...</p>';
    totalAnualDisplay.textContent = 'Calculando...';

    try {
        const res = await fetch('/api/dividendos-projetados-carteira');
        if (!res.ok) {
            const errData = await res.json(); // Tenta pegar o erro do JSON se falhar
            throw new Error(errData.erro || `Erro HTTP ${res.status} ao buscar projeção.`);
        }
        const projecao = await res.json();

        if (projecao.erro) {
            conteudoProjecao.innerHTML = `<p style="color:orange; text-align:center;">${projecao.erro}</p>`;
            totalAnualDisplay.textContent = 'N/A';
            return;
        }

        let htmlProjecao = '<ul style="list-style-type: none; padding-left: 0; columns: 2; -webkit-columns: 2; -moz-columns: 2; column-gap: 20px;">';
        const mesesOrdenados = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        mesesOrdenados.forEach(mes => {
            if (projecao.hasOwnProperty(mes)) {
                const valorMes = (typeof projecao[mes] === 'number' && !isNaN(projecao[mes]))
                                 ? projecao[mes].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                 : 'R$ 0,00';
                htmlProjecao += `<li style="padding: 5px 0; border-bottom: 1px dashed var(--cor-borda); display:flex; justify-content: space-between;"><span>${mes}:</span> <strong>${valorMes}</strong></li>`;
            }
        });
        htmlProjecao += '</ul>';
        conteudoProjecao.innerHTML = htmlProjecao;

        totalAnualDisplay.textContent = (typeof projecao.TotalAnual === 'number' && !isNaN(projecao.TotalAnual))
                                        ? projecao.TotalAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        : 'N/A';
    } catch (err) {
        console.error("Erro ao carregar projeção de dividendos da carteira:", err);
        if(conteudoProjecao) conteudoProjecao.innerHTML = `<p style="color:red; text-align:center;">Falha ao carregar projeção. ${err.message}</p>`;
        if(totalAnualDisplay) totalAnualDisplay.textContent = 'Erro';
    }
}

// --- Funções Auxiliares (Completas) ---
function initializeSortable() {
    const tabelaBody = document.getElementById('tabelaCarteira');
    if (tabelaBody) {
        new Sortable(tabelaBody, {
            animation: 150, handle: '.drag-handle', ghostClass: 'sortable-ghost',
            filter: '.categoria-header', preventOnFilter: true,
            onEnd: (evt) => {
                const rows = evt.target.querySelectorAll('tr[data-ticker]');
                saveOrder(Array.from(rows).map(row => row.dataset.ticker));
                carregarCarteira(); 
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
                if (!res.ok) {
                     const err = await res.json();
                     throw new Error(err.erro || 'Falha ao atualizar no servidor.');
                }
                carregarCarteira();
            } catch (err) {
                console.error('Erro ao atualizar ativo:', err);
                alert(`Erro ao atualizar ativo: ${err.message}`);
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
                    const err = await res.json();
                    throw new Error(err.erro || 'Falha ao remover no servidor.');
                }
                saveOrder(getSavedOrder().filter(t => t !== ticker));
                carregarCarteira();
            } catch (err) { 
                console.error('Erro ao remover ativo:', err);
                alert(`Erro ao remover ativo: ${err.message}`);
            }
        };
    });
}

async function adicionarAtivo() {
    const tickerInput = document.getElementById('novoTicker'), qtdInput = document.getElementById('novaQuantidade'), precoMedioInput = document.getElementById('novoPrecoMedio'), tipoAtivoSelect = document.getElementById('novoTipoAtivo');
    if (!tickerInput || !qtdInput || !precoMedioInput || !tipoAtivoSelect) {
        console.error("Elementos do formulário de adicionar ativo não encontrados.");
        return;
    }
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
    console.log("DOM Carregado. Verificando página...");

    // Lógica para carteira.html
    const tabelaCarteiraEl = document.getElementById('tabelaCarteira');
    if (tabelaCarteiraEl) {
        console.log("Executando lógica para carteira.html");
        document.getElementById('addTickerBtn')?.addEventListener('click', adicionarAtivo);
        const toggleBtn = document.getElementById('toggleViewModeBtn');
        if (toggleBtn) {
            const body = document.body;
            let isHidden = localStorage.getItem('carteiraViewMode') === 'hide-details';
            body.classList.toggle('hide-details', isHidden);
            updateToggleButtonIcon(isHidden);
            
            toggleBtn.addEventListener('click', () => {
                body.classList.toggle('hide-details'); 
                isHidden = body.classList.contains('hide-details'); 
                localStorage.setItem('carteiraViewMode', isHidden ? 'hide-details' : 'show-details');
                updateToggleButtonIcon(isHidden);
                carregarCarteira(); 
            });
        }
        carregarCarteira(); 
        setInterval(carregarCarteira, 60000); // Reativado
    }

    // Lógica para dividendos.html
    const dividendSearchForm = document.getElementById('dividendSearchForm');
    if (dividendSearchForm) {
        console.log("Executando lógica para dividendos.html");
        dividendSearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const tickerInput = document.getElementById('tickerInputDividendos');
            if (!tickerInput) {
                console.error("Input de ticker para dividendos não encontrado!");
                return;
            }
            const ticker = tickerInput.value.trim().toUpperCase();
            if (ticker) {
                await fetchAndDisplayDividendsOnPage(ticker);
            }
        });
        
        carregarProjecaoDividendosCarteira2025();

        const params = new URLSearchParams(window.location.search);
        const tickerFromUrl = params.get('ticker');
        if (tickerFromUrl) {
            const tickerInput = document.getElementById('tickerInputDividendos');
            if(tickerInput) tickerInput.value = tickerFromUrl.toUpperCase();
            fetchAndDisplayDividendsOnPage(tickerFromUrl.toUpperCase());
        }
    }
});