async function buscarCarteira() {
    try {
      const res = await fetch('/api/carteira');
      if (!res.ok) throw new Error('Erro ao buscar carteira');
      const ativos = await res.json();
      return ativos;
    } catch (e) {
      alert('Falha ao carregar carteira');
      return [];
    }
  }
  
  async function buscarCotacao(ticker) {
    try {
      const res = await fetch(`/cotacao/${ticker}`);
      if (!res.ok) throw new Error('Erro na cotação');
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  }
  
  async function carregarCarteira() {
    const tabela = document.querySelector('#tabelaCarteira tbody');
    tabela.innerHTML = '<tr><td colspan="10">Carregando...</td></tr>';
  
    const carteira = await buscarCarteira();
  
    if (carteira.length === 0) {
      tabela.innerHTML = '<tr><td colspan="10">Nenhum ativo na carteira.</td></tr>';
      return;
    }
  
    // Para cada ativo, pegar cotação
    const promessas = carteira.map(async ativo => {
      const data = await buscarCotacao(ativo.ticker);
      return { ativo, cotacao: data };
    });
  
    const resultados = await Promise.all(promessas);
  
    tabela.innerHTML = '';
  
    resultados.forEach(({ ativo, cotacao }) => {
      if (!cotacao) {
        tabela.innerHTML += `
          <tr>
            <td>${ativo.ticker}</td>
            <td colspan="8" style="color: red;">Erro ao buscar cotação</td>
            <td><button class="removerBtn" data-ticker="${ativo.ticker}">Remover</button></td>
          </tr>`;
        return;
      }
  
      const totalInvestido = ativo.quantidade * ativo.precoMedio;
      const diferenca = (cotacao.valor - ativo.precoMedio) * ativo.quantidade;
  
      tabela.innerHTML += `
        <tr>
          <td>${ativo.ticker}</td>
          <td>R$ ${cotacao.valor.toFixed(2)}</td>
          <td>R$ ${typeof cotacao.precoMaximo === 'number' ? cotacao.precoMaximo.toFixed(2) : cotacao.precoMaximo}</td>
          <td>R$ ${typeof cotacao.precoMinimo === 'number' ? cotacao.precoMinimo.toFixed(2) : cotacao.precoMinimo}</td>
          <td>${cotacao.data}</td>
          <td><input type="number" min="0" step="any" class="quantidadeInput" data-ticker="${ativo.ticker}" value="${ativo.quantidade}" /></td>
          <td><input type="number" min="0" step="any" class="precoMedioInput" data-ticker="${ativo.ticker}" value="${ativo.precoMedio}" /></td>
          <td>R$ ${totalInvestido.toFixed(2)}</td>
          <td style="color: ${diferenca >= 0 ? 'green' : 'red'}">R$ ${diferenca.toFixed(2)}</td>
          <td><button class="removerBtn" data-ticker="${ativo.ticker}">Remover</button></td>
        </tr>`;
    });
  
    adicionarListenersInputs();
    adicionarListenersRemover();
  }
  
  function adicionarListenersInputs() {
    document.querySelectorAll('.quantidadeInput, .precoMedioInput').forEach(input => {
      input.onchange = async (e) => {
        const ticker = e.target.dataset.ticker;
        const linha = e.target.closest('tr');
        const quantidade = parseFloat(linha.querySelector('.quantidadeInput').value);
        const precoMedio = parseFloat(linha.querySelector('.precoMedioInput').value);
  
        if (isNaN(quantidade) || quantidade < 0 || isNaN(precoMedio) || precoMedio < 0) {
          alert('Quantidade e preço médio devem ser números positivos');
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
            return;
          }
          carregarCarteira();
        } catch {
          alert('Erro ao atualizar ativo');
        }
      };
    });
  }
  
  function adicionarListenersRemover() {
    document.querySelectorAll('.removerBtn').forEach(btn => {
      btn.onclick = async (e) => {
        const ticker = e.target.dataset.ticker;
        if (!confirm(`Remover ${ticker} da carteira?`)) return;
        try {
          const res = await fetch(`/api/carteira/${ticker}`, { method: 'DELETE' });
          if (!res.ok) {
            const err = await res.json();
            alert(err.erro || 'Erro ao remover ativo');
            return;
          }
          carregarCarteira();
        } catch {
          alert('Erro ao remover ativo');
        }
      };
    });
  }
  
  async function adicionarAtivo() {
    const tickerInput = document.getElementById('novoTicker');
    const qtdInput = document.getElementById('novaQuantidade');
    const precoMedioInput = document.getElementById('novoPrecoMedio');
  
    const ticker = tickerInput.value.trim().toUpperCase();
    const quantidade = parseFloat(qtdInput.value);
    const precoMedio = parseFloat(precoMedioInput.value);
  
    if (!ticker) {
      alert('Informe o ticker');
      return;
    }
    if (isNaN(quantidade) || quantidade < 0) {
      alert('Quantidade inválida');
      return;
    }
    if (isNaN(precoMedio) || precoMedio < 0) {
      alert('Preço médio inválido');
      return;
    }
  
    try {
      const res = await fetch('/api/carteira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, quantidade, precoMedio }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.erro || 'Erro ao adicionar ativo');
        return;
      }
      tickerInput.value = '';
      qtdInput.value = '';
      precoMedioInput.value = '';
      carregarCarteira();
    } catch {
      alert('Erro ao adicionar ativo');
    }
  }
  
  document.getElementById('addTickerBtn').addEventListener('click', adicionarAtivo);
  
  // Atualiza automaticamente a cada 60 segundos
  carregarCarteira();
  setInterval(carregarCarteira, 60000);
  