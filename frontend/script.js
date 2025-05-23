// --- Definição dos SVGs (sem alterações) ---
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

// --- Funções de API (sem alterações) ---
async function buscarCarteira() {
    try {
        const res = await fetch('/api/carteira');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Erro ao buscar carteira: ${res.status} ${res.statusText} - ${errorText}`);
        }
        return await res.json();
    } catch (e) {
        console.error('Falha ao carregar carteira:', e);
        alert('Falha ao carregar carteira. Verifique o console para mais detalhes.');
        return [];
    }
}

async function buscarCotacao(ticker) {
    try {
        const res = await fetch(`/cotacao/${ticker}`);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Erro na cotação para ${ticker}: ${res.status} ${res.statusText} - ${errorData.erro || 'Erro desconhecido'}`);
        }
        return await res.json();
    } catch (e) {
        console.error(`Erro ao buscar cotação para ${ticker}:`, e);
        return null;
    }
}

// --- Funções de Renderização (com a nova ordem) ---
async function carregarCarteira() {
    const tabela = document.querySelector('#tabelaCarteira tbody');
    tabela.innerHTML = `<tr><td colspan="12" style="text-align: center;">Carregando...</td></tr>`;

    const totalInvestidoDisplay = document.getElementById('totalInvestidoDisplay');
    const valorAtualCarteiraDisplay = document.getElementById('valorAtualCarteiraDisplay');
    const lucroPrejuizoDisplay = document.getElementById('lucroPrejuizoDisplay');

    let totalInvestidoGlobal = 0;
    let valorAtualCarteiraGlobal = 0;

    const carteira = await buscarCarteira();

    if (carteira.length === 0) {
        tabela.innerHTML = `<tr><td colspan="12" style="text-align: center;">Nenhum ativo na carteira.</td></tr>`;
        totalInvestidoDisplay.textContent = 'R$ 0,00';
        valorAtualCarteiraDisplay.textContent = 'R$ 0,00';
        lucroPrejuizoDisplay.textContent = 'R$ 0,00';
        lucroPrejuizoDisplay.classList.remove('positivo', 'negativo');
        return;
    }

    const promessas = carteira.map(ativo => buscarCotacao(ativo.ticker).then(cotacao => ({ ativo, cotacao })));
    const resultados = await Promise.all(promessas);

    tabela.innerHTML = '';
    const ativosAgrupados = {};

    resultados.forEach(({ ativo, cotacao }) => {
        const categoria = ativo.type || 'DESCONHECIDO';
        if (!ativosAgrupados[categoria]) {
            ativosAgrupados[categoria] = [];
        }

        let rowHtml;
        if (!cotacao) {
            rowHtml = `
                <tr>
                    <td>${ativo.ticker}</td>
                    <td colspan="10" style="color: red; text-align: center;">Erro ao buscar cotação</td>
                    <td>
                        <button class="removerBtn" data-ticker="${ativo.ticker}" aria-label="Remover ${ativo.ticker}">
                            ${deleteIconSvg}
                        </button>
                    </td>
                </tr>`;
        } else {
            const totalInvestidoAtivo = ativo.quantidade * ativo.precoMedio;
            const valorAtualAtivo = ativo.quantidade * cotacao.valor;
            const diferenca = valorAtualAtivo - totalInvestidoAtivo;

            totalInvestidoGlobal += totalInvestidoAtivo;
            valorAtualCarteiraGlobal += valorAtualAtivo;

            const changePercent = cotacao.changePercent;
            const changePercentFormatted = typeof changePercent === 'number'
                ? `${(changePercent * 100).toFixed(2)}%`
                : 'N/A';
            const changePercentColor = typeof changePercent === 'number'
                ? (changePercent >= 0 ? 'green' : 'red')
                : 'inherit';

            // ATUALIZAÇÃO PRINCIPAL: A ordem das células <td> foi alterada aqui
            rowHtml = `
                <tr>
                    <td>${ativo.ticker}</td>
                    <td>R$ ${cotacao.valor.toFixed(2)}</td>
                    <td>R$ ${typeof cotacao.precoMaximo === 'number' ? cotacao.precoMaximo.toFixed(2) : 'N/A'}</td>
                    <td>R$ ${typeof cotacao.precoMinimo === 'number' ? cotacao.precoMinimo.toFixed(2) : 'N/A'}</td>
                    <td style="color: ${changePercentColor};">${changePercentFormatted}</td>
                    <td>${cotacao.data}</td>
                    <td><input type="number" min="0" step="any" class="quantidadeInput" data-ticker="${ativo.ticker}" value="${ativo.quantidade}" /></td>
                    <td><input type="number" min="0" step="any" class="precoMedioInput" data-ticker="${ativo.ticker}" value="${ativo.precoMedio}" /></td>
                    <td>R$ ${totalInvestidoAtivo.toFixed(2)}</td>
                    <td>R$ ${valorAtualAtivo.toFixed(2)}</td>
                    <td style="color: ${diferenca >= 0 ? 'green' : 'red'};">R$ ${diferenca.toFixed(2)}</td>
                    <td>
                        <button class="removerBtn" data-ticker="${ativo.ticker}" aria-label="Remover ${ativo.ticker}">
                            ${deleteIconSvg}
                        </button>
                    </td>
                </tr>`;
        }
        ativosAgrupados[categoria].push(rowHtml);
    });

    Object.keys(ativosAgrupados).sort().forEach(categoria => {
        if (ativosAgrupados.hasOwnProperty(categoria)) {
            tabela.innerHTML += `
                <tr class="categoria-header">
                    <td colspan="12"><h2>${categoria}</h2></td>
                </tr>
            `;
            ativosAgrupados[categoria].forEach(rowHtml => {
                tabela.innerHTML += rowHtml;
            });
        }
    });

    totalInvestidoDisplay.textContent = `R$ ${totalInvestidoGlobal.toFixed(2)}`;
    valorAtualCarteiraDisplay.textContent = `R$ ${valorAtualCarteiraGlobal.toFixed(2)}`;
    const lucroPrejuizoGlobal = valorAtualCarteiraGlobal - totalInvestidoGlobal;
    lucroPrejuizoDisplay.textContent = `R$ ${lucroPrejuizoGlobal.toFixed(2)}`;
    lucroPrejuizoDisplay.classList.remove('positivo', 'negativo');
    if (lucroPrejuizoGlobal > 0) {
        lucroPrejuizoDisplay.classList.add('positivo');
    } else if (lucroPrejuizoGlobal < 0) {
        lucroPrejuizoDisplay.classList.add('negativo');
    }

    adicionarListenersInputs();
    adicionarListenersRemover();
}

// --- O restante do arquivo (Listeners, Adicionar Ativo, etc.) permanece o mesmo ---

function adicionarListenersInputs() {
    document.querySelectorAll('.quantidadeInput, .precoMedioInput').forEach(input => {
        input.onchange = async (e) => {
            const ticker = e.target.dataset.ticker;
            const linha = e.target.closest('tr');
            const quantidade = parseFloat(linha.querySelector('.quantidadeInput').value);
            const precoMedio = parseFloat(linha.querySelector('.precoMedioInput').value);

            if (isNaN(quantidade) || quantidade < 0 || isNaN(precoMedio) || precoMedio < 0) {
                alert('Quantidade e preço médio devem ser números não negativos.');
                carregarCarteira(); 
                return;
            }

            try {
                const res = await fetch(`/api/carteira/${ticker}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantidade, precoMedio }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(err.erro || 'Erro ao atualizar ativo');
                    carregarCarteira(); 
                    return;
                }
                carregarCarteira();
            } catch (e) {
                console.error('Erro ao atualizar ativo:', e);
                alert('Erro ao atualizar ativo. Verifique o console.');
            }
        };
    });
}

function adicionarListenersRemover() {
    document.querySelectorAll('.removerBtn').forEach(btn => {
        btn.onclick = async (e) => {
            const targetButton = e.target.closest('.removerBtn');
            if (!targetButton) return; 

            const ticker = targetButton.dataset.ticker;

            if (!confirm(`Tem certeza que deseja remover ${ticker} da carteira?`)) return;

            try {
                const res = await fetch(`/api/carteira/${ticker}`, { method: 'DELETE' });
                if (!res.ok) {
                    const err = await res.json();
                    alert(err.erro || 'Erro ao remover ativo');
                    return;
                }
                carregarCarteira();
            } catch (e) {
                console.error('Erro ao remover ativo:', e);
                alert('Erro ao remover ativo. Verifique o console.');
            }
        };
    });
}

async function adicionarAtivo() {
    const tickerInput = document.getElementById('novoTicker');
    const qtdInput = document.getElementById('novaQuantidade');
    const precoMedioInput = document.getElementById('novoPrecoMedio');
    const tipoAtivoSelect = document.getElementById('novoTipoAtivo');

    const ticker = tickerInput.value.trim().toUpperCase();
    const quantidade = parseFloat(qtdInput.value);
    const precoMedio = parseFloat(precoMedioInput.value);
    const type = tipoAtivoSelect.value;

    if (!ticker) {
        alert('Por favor, informe o Ticker do ativo.');
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('Quantidade inválida. Deve ser um número positivo.');
        return;
    }
    if (isNaN(precoMedio) || precoMedio <= 0) {
        alert('Preço médio inválido. Deve ser um número positivo.');
        return;
    }
    if (!type || type === '') {
        alert('Por favor, selecione o tipo de ativo.');
        return;
    }

    try {
        const res = await fetch('/api/carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker, quantidade, precoMedio, type }),
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.erro || `Erro desconhecido ao adicionar ativo. Status: ${res.status}`);
            return;
        }

        tickerInput.value = '';
        qtdInput.value = '';
        precoMedioInput.value = '';
        tipoAtivoSelect.value = 'AÇÃO';
        carregarCarteira();
        alert('Ativo adicionado com sucesso!');
    } catch (e) {
        console.error('Erro ao adicionar ativo:', e);
        alert('Erro ao adicionar ativo. Verifique o console para mais detalhes.');
    }
}

function updateToggleButtonIcon(isHidden) {
    const toggleViewModeBtn = document.getElementById('toggleViewModeBtn');
    if (!toggleViewModeBtn) return;

    toggleViewModeBtn.innerHTML = ''; 

    const parser = new DOMParser();
    let svgDoc;

    if (isHidden) {
        svgDoc = parser.parseFromString(eyeClosedSvg, "image/svg+xml");
        toggleViewModeBtn.setAttribute('aria-label', 'Mostrar detalhes da carteira');
    } else {
        svgDoc = parser.parseFromString(eyeOpenSvg, "image/svg+xml");
        toggleViewModeBtn.setAttribute('aria-label', 'Ocultar detalhes da carteira');
    }
    
    toggleViewModeBtn.appendChild(svgDoc.documentElement);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addTickerBtn').addEventListener('click', adicionarAtivo);

    const toggleViewModeBtn = document.getElementById('toggleViewModeBtn');
    if (toggleViewModeBtn) {
        const body = document.body;
        const currentViewMode = localStorage.getItem('carteiraViewMode');

        if (currentViewMode === 'hide-details') {
            body.classList.add('hide-details');
            updateToggleButtonIcon(true);
        } else {
            body.classList.remove('hide-details');
            updateToggleButtonIcon(false);
        }

        toggleViewModeBtn.addEventListener('click', () => {
            body.classList.toggle('hide-details');
            const isHidden = body.classList.contains('hide-details');
            updateToggleButtonIcon(isHidden);
            localStorage.setItem('carteiraViewMode', isHidden ? 'hide-details' : 'show-details');
        });
    }

    carregarCarteira(); 
});

setInterval(carregarCarteira, 60000);